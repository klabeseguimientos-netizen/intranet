<?php
// app/Services/Promocion/PromocionService.php

namespace App\Services\Promocion;

use App\Models\Promocion;
use App\Models\PromocionProducto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;

class PromocionService
{
    protected $productoService;

    public function __construct(PromocionProductoService $productoService)
    {
        $this->productoService = $productoService;
    }

    public function crearPromocion(array $data)
    {
        return DB::transaction(function () use ($data) {
            $promocion = Promocion::create([
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion'] ?? null,
                'fecha_inicio' => $data['fecha_inicio'],
                'fecha_fin' => $data['fecha_fin'],
                'activo' => $data['activo'] ?? true,
                'created_by' => Auth::id(),
                'modified_by' => Auth::id()
            ]);

            if (!empty($data['productos'])) {
                foreach ($data['productos'] as $producto) {
                    PromocionProducto::create([
                        'promocion_id' => $promocion->id,
                        'producto_servicio_id' => $producto['producto_servicio_id'],
                        'tipo_promocion' => $producto['tipo_promocion'],
                        'bonificacion' => $producto['bonificacion'],
                        'cantidad_minima' => $producto['cantidad_minima'] ?? null
                    ]);
                }
            }

            return $promocion->load('productos.productoServicio');
        });
    }

    public function actualizarPromocion(Promocion $promocion, array $data)
    {
        return DB::transaction(function () use ($promocion, $data) {
            $promocion->update([
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion'] ?? null,
                'fecha_inicio' => $data['fecha_inicio'],
                'fecha_fin' => $data['fecha_fin'],
                'activo' => $data['activo'] ?? true,
                'modified_by' => Auth::id()
            ]);

            $promocion->productos()->delete();

            if (!empty($data['productos'])) {
                foreach ($data['productos'] as $producto) {
                    PromocionProducto::create([
                        'promocion_id' => $promocion->id,
                        'producto_servicio_id' => $producto['producto_servicio_id'],
                        'tipo_promocion' => $producto['tipo_promocion'],
                        'bonificacion' => $producto['bonificacion'],
                        'cantidad_minima' => $producto['cantidad_minima'] ?? null
                    ]);
                }
            }

            return $promocion->load('productos.productoServicio');
        });
    }

    public function obtenerEstadisticas(): array
    {
        $todas = Promocion::withAllRelations()->get();
        
        return [
            'total' => $todas->count(),
            'vigentes' => $todas->filter(fn($p) => $p->estado === 'Vigente')->count(),
            'proximas' => $todas->filter(fn($p) => $p->estado === 'Próxima')->count(),
            'vencidas' => $todas->filter(fn($p) => $p->estado === 'Vencida')->count(),
            'inactivas' => $todas->filter(fn($p) => $p->estado === 'Inactiva')->count(),
        ];
    }

    /**
     * Obtener promociones vigentes para presupuestos
     */
    public function getPromocionesVigentes()
    {
        return Promocion::with(['productos.productoServicio'])
            ->vigente()
            ->orderBy('nombre')
            ->get()
            ->map(function ($promocion) {
                return [
                    'id' => $promocion->id,
                    'nombre' => $promocion->nombre,
                    'descripcion' => $promocion->descripcion,
                    'fecha_inicio' => $promocion->fecha_inicio->format('Y-m-d'),
                    'fecha_fin' => $promocion->fecha_fin->format('Y-m-d'),
                    'productos' => $promocion->productos->map(function ($prod) {
                        return [
                            'id' => $prod->id,
                            'producto_servicio_id' => $prod->producto_servicio_id,
                            'tipo_promocion' => $prod->tipo_promocion,
                            'bonificacion' => (float) $prod->bonificacion,
                            'cantidad_minima' => $prod->cantidad_minima,
                            'producto' => $prod->productoServicio ? [
                                'id' => $prod->productoServicio->id,
                                'nombre' => $prod->productoServicio->nombre,
                                'codigopro' => $prod->productoServicio->codigopro,
                                'precio' => (float) $prod->productoServicio->precio,
                                'tipo_id' => $prod->productoServicio->tipo_id
                            ] : null
                        ];
                    })
                ];
            });
    }

    /**
     * Validar si una promoción aplica para los productos seleccionados
     */
    public function validarPromocionParaProductos(int $promocionId, array $productosSeleccionados, ?int $tasaId = null, ?int $abonoId = null)
    {
        $promocion = Promocion::with('productos.productoServicio')->find($promocionId);
        
        if (!$promocion) {
            return [
                'valida' => false,
                'mensaje' => 'La promoción no existe'
            ];
        }

        foreach ($promocion->productos as $promoProducto) {
            // Verificar que el producto existe
            if (!$promoProducto->productoServicio) {
                \Log::error('Producto no encontrado en promoción', [
                    'promocion_id' => $promocionId,
                    'producto_servicio_id' => $promoProducto->producto_servicio_id
                ]);
                continue;
            }

            $encontrado = false;
            $tipoId = $promoProducto->productoServicio->tipo_id;
            
            switch ($tipoId) {
                case 4: // TASAS
                    if ($tasaId === $promoProducto->producto_servicio_id) {
                        $encontrado = true;
                    }
                    break;
                    
                case 1: // ABONO
                case 2: // CONVENIO
                    if ($abonoId === $promoProducto->producto_servicio_id) {
                        $encontrado = true;
                    }
                    break;
                    
                case 5: // ACCESORIOS
                case 3: // SERVICIOS
                    $productoEnSeleccion = collect($productosSeleccionados)
                        ->firstWhere('prd_servicio_id', $promoProducto->producto_servicio_id);
                    
                    if ($productoEnSeleccion) {
                        $encontrado = true;
                        
                        $cantidad = $productoEnSeleccion['cantidad'] ?? 1;
                        $requerido = $promoProducto->cantidad_minima ?? match($promoProducto->tipo_promocion) {
                            '2x1' => 2,
                            '3x2' => 3,
                            default => 1
                        };

                        if ($cantidad < $requerido) {
                            return [
                                'valida' => false,
                                'mensaje' => "El producto {$promoProducto->productoServicio->nombre} requiere mínimo {$requerido} unidades"
                            ];
                        }
                    }
                    break;
            }
            
            if (!$encontrado) {
                return [
                    'valida' => false,
                    'mensaje' => "La promoción requiere el producto: {$promoProducto->productoServicio->nombre}"
                ];
            }
        }

        return [
            'valida' => true,
            'mensaje' => 'Promoción válida',
            'promocion' => $promocion
        ];
    }

    /**
     * Validar promociones (método legacy para compatibilidad)
     */
    public function validarPromociones($promocionId, $productosSeleccionados)
    {
        $resultado = $this->validarPromocionParaProductos($promocionId, $productosSeleccionados);
        
        if (!$resultado['valida']) {
            throw new \Exception($resultado['mensaje']);
        }
        
        return true;
    }
}