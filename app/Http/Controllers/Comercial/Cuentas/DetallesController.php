<?php
// app/Http/Controllers/Comercial/Cuentas/DetallesController.php

namespace App\Http\Controllers\Comercial\Cuentas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Empresa;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DetallesController extends Controller
{
    public function index(Request $request)
    {
        $usuario = Auth::user();
        
        // Consulta base de empresas CON vehículos y abonos
        $empresasQuery = Empresa::with([
            'contactos' => function ($query) {
                $query->where('es_activo', 1)
                      ->whereNull('deleted_at')
                      ->with('lead');
            },
            'vehiculosConAbonos' // Nueva relación
        ])->whereNull('deleted_at');
        
        // Si el usuario NO ve todas las cuentas, filtrar por sus prefijos
        if (!$usuario->ve_todas_cuentas) {
            // Obtener los prefijos del usuario
            $prefijosUsuario = DB::table('usuario_prefijos')
                ->where('usuario_id', $usuario->id)
                ->where('activo', 1)
                ->whereNull('deleted_at')
                ->pluck('prefijo_id')
                ->toArray();
            
            // Si el usuario tiene prefijos asignados, filtrar empresas por esos prefijos
            if (!empty($prefijosUsuario)) {
                $empresasQuery->whereIn('prefijo_id', $prefijosUsuario);
            } else {
                // Si no tiene prefijos asignados, no mostrar ninguna empresa
                $empresasQuery->whereRaw('1 = 0');
            }
        }
        
        // Aplicar ordenamiento
        $empresas = $empresasQuery->orderBy('created', 'desc')->get();
        
        // Obtener información adicional: prefijos y localidades
        $prefijos = DB::table('prefijos')
            ->where('activo', 1)
            ->pluck('codigo', 'id')
            ->toArray();
            
        $localidades = DB::table('localidades')
            ->join('provincias', 'localidades.provincia_id', '=', 'provincias.id')
            ->where('localidades.activo', 1)
            ->where('provincias.activo', 1)
            ->select(
                'localidades.id',
                'localidades.localidad',
                'localidades.codigo_postal',
                'provincias.provincia'
            )
            ->get()
            ->keyBy('id');
        
        // Calcular estadísticas
        $total = $empresas->count();
        $activas = $empresas->where('es_activo', true)->count();
        
        // Empresas creadas en los últimos 30 días
        $fechaLimite = Carbon::now()->subDays(30);
        $nuevas = $empresas->filter(function ($empresa) use ($fechaLimite) {
            return $empresa->created && $empresa->created->gte($fechaLimite);
        })->count();
        
        // Obtener información del usuario para el frontend
        $infoUsuario = [
            've_todas_cuentas' => (bool) $usuario->ve_todas_cuentas,
            'prefijos' => $usuario->ve_todas_cuentas ? [] : $prefijosUsuario ?? [],
        ];
        
        // Transformar datos para Inertia (incluyendo vehículos)
        $empresasData = $empresas->map(function ($empresa) use ($prefijos, $localidades) {
            // Obtener código del prefijo
            $codigoPrefijo = isset($prefijos[$empresa->prefijo_id]) ? $prefijos[$empresa->prefijo_id] : 'N/A';
            $codigoAlfaEmpresa = $codigoPrefijo . '-' . $empresa->numeroalfa;
            
            // Obtener información de localidad fiscal
            $localidadFiscal = null;
            if ($empresa->localidad_fiscal_id && isset($localidades[$empresa->localidad_fiscal_id])) {
                $loc = $localidades[$empresa->localidad_fiscal_id];
                $localidadFiscal = [
                    'localidad' => $loc->localidad,
                    'provincia' => $loc->provincia,
                    'codigo_postal' => $loc->codigo_postal,
                ];
            }
            
            return [
                'id' => $empresa->id,
                'prefijo_id' => $empresa->prefijo_id,
                'numeroalfa' => $empresa->numeroalfa,
                'codigo_alfa_empresa' => $codigoAlfaEmpresa,
                'nombre_fantasia' => $empresa->nombre_fantasia,
                'razon_social' => $empresa->razon_social,
                'cuit' => $empresa->cuit,
                'direccion_fiscal' => $empresa->direccion_fiscal,
                'codigo_postal_fiscal' => $empresa->codigo_postal_fiscal,
                'localidad_fiscal_id' => $empresa->localidad_fiscal_id,
                'localidad_fiscal' => $localidadFiscal,
                'telefono_fiscal' => $empresa->telefono_fiscal,
                'email_fiscal' => $empresa->email_fiscal,
                'es_activo' => (bool) $empresa->es_activo,
                'created' => $empresa->created ? $empresa->created->toDateTimeString() : null,
                'contactos' => $empresa->contactos->map(function ($contacto) {
                    return [
                        'id' => $contacto->id,
                        'empresa_id' => $contacto->empresa_id,
                        'es_contacto_principal' => (bool) $contacto->es_contacto_principal,
                        'es_activo' => (bool) $contacto->es_activo,
                        'lead' => $contacto->lead ? [
                            'id' => $contacto->lead->id,
                            'nombre_completo' => $contacto->lead->nombre_completo,
                            'email' => $contacto->lead->email,
                            'telefono' => $contacto->lead->telefono,
                        ] : null,
                    ];
                }),
                // Datos de vehículos
                'vehiculos' => $empresa->vehiculosConAbonos->map(function ($vehiculo) {
                    return [
                        'id' => $vehiculo->id,
                        'codigo_alfa' => $vehiculo->codigo_alfa,
                        'nombre_mix' => $vehiculo->nombre_mix,
                        'ab_alta' => $vehiculo->ab_alta ? $vehiculo->ab_alta->toDateString() : null,
                        'avl_anio' => $vehiculo->avl_anio,
                        'avl_color' => $vehiculo->avl_color,
                        'avl_identificador' => $vehiculo->avl_identificador,
                        'avl_marca' => $vehiculo->avl_marca,
                        'avl_modelo' => $vehiculo->avl_modelo,
                        'avl_patente' => $vehiculo->avl_patente,
                        'categoria' => $vehiculo->categoria,
                        'empresa_id' => $vehiculo->empresa_id,
                        'abonos' => $vehiculo->abonosActivos->map(function ($abono) {
                            return [
                                'id' => $abono->id,
                                'abono_codigo' => $abono->abono_codigo,
                                'abono_nombre' => $abono->abono_nombre,
                                'abono_precio' => (float) $abono->abono_precio,
                                'created_at' => $abono->created_at ? $abono->created_at->toDateTimeString() : null,
                            ];
                        }),
                    ];
                }),
            ];
        });
        
        return Inertia::render('Comercial/Cuentas/Detalles', [
            'empresas' => $empresasData,
            'estadisticas' => [
                'total' => $total,
                'activas' => $activas,
                'nuevas' => $nuevas,
            ],
            'usuario' => $infoUsuario,
        ]);
    }
}