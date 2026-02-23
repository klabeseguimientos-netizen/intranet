<?php

namespace App\Services\Promocion;

use App\Models\ProductoServicio;
use App\Models\Promocion;
use Illuminate\Support\Collection;

class PromocionProductoService
{
    /**
     * Obtener productos por tipo para promociones (solo compañía 1)
     */
    public function getProductosPorTipo(?string $tipo = null): Collection
    {
        $query = ProductoServicio::with(['tipo', 'compania'])
            ->where('compania_id', 1)
            ->where('es_activo', true)
            ->where('es_presupuestable', true);

        if ($tipo && $tipo !== 'todos') {
            switch($tipo) {
                case 'tasa':
                case 'tasas':
                    $query->tasas();
                    break;
                case 'abono':
                case 'abonos':
                    $query->abonos();
                    break;
                case 'abono_solo':
                    $query->soloAbonos();
                    break;
                case 'convenio':
                    $query->soloConvenios();
                    break;
                case 'accesorio':
                case 'accesorios':
                    $query->accesorios();
                    break;
                case 'servicio':
                case 'servicios':
                    $query->servicios();
                    break;
            }
        }

        return $query->orderBy('nombre')->get();
    }

    /**
     * Obtener productos de la compañía 1 agrupados por tipo
     */
    public function getProductosCompania1(): array
    {
        $tipos = [
            'tasas' => 'tasa',
            'abonos' => 'abono',
            'convenios' => 'convenio',
            'accesorios' => 'accesorio',
            'servicios' => 'servicio'
        ];
        
        $resultado = [];
        
        foreach ($tipos as $key => $tipo) {
            $productos = $this->getProductosPorTipo($tipo);
            
            $resultado[$key] = $productos->map(function($p) {
                return [
                    'id' => $p->id,
                    'codigopro' => $p->codigopro,
                    'nombre' => $p->nombre,
                    'precio' => (float) $p->precio,
                    'tipo_id' => $p->tipo_id,
                    'tipo_nombre' => $p->tipo?->nombre_tipo_abono,
                    'compania_id' => $p->compania_id,
                    'compania_nombre' => $p->compania?->nombre ?? 'Sin compañía'
                ];
            })->toArray();
        }
        
        return $resultado;
    }

    /**
     * Validar si una promoción aplica para una cantidad dada
     */
    public function validarCantidad(Promocion $promocion, int $productoId, int $cantidad): bool
    {
        $promoProducto = $promocion->productos()
            ->where('producto_servicio_id', $productoId)
            ->first();

        if (!$promoProducto) return false;

        $requerido = $promoProducto->cantidad_requerida;
        return $cantidad >= $requerido;
    }

    /**
     * Calcular el precio con promoción aplicada
     */
    public function calcularPrecioConPromocion(Promocion $promocion, int $productoId, float $precioUnitario, int $cantidad): float
    {
        $promoProducto = $promocion->productos()
            ->where('producto_servicio_id', $productoId)
            ->first();

        if (!$promoProducto) return $precioUnitario * $cantidad;

        switch ($promoProducto->tipo_promocion) {
            case 'porcentaje':
                $subtotal = $precioUnitario * $cantidad;
                return $subtotal * (1 - $promoProducto->bonificacion / 100);

            case '2x1':
            case '3x2':
                $requerido = $promoProducto->cantidad_requerida; // 2 para 2x1, 3 para 3x2
                
                if ($cantidad < $requerido) {
                    return $precioUnitario * $cantidad;
                }

                $packs = intdiv($cantidad, $requerido);
                $unidadesPagasPorPack = $requerido - 1; // 2x1 -> 1 paga, 3x2 -> 2 pagan
                $unidadesBase = $packs * $unidadesPagasPorPack;
                $unidadesExtra = $cantidad % $requerido;
                $unidadesAPagar = $unidadesBase + $unidadesExtra;

                return $precioUnitario * $unidadesAPagar;

            default:
                return $precioUnitario * $cantidad;
        }
    }
}