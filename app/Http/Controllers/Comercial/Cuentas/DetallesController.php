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
        
        // Consulta base de empresas
        $empresasQuery = Empresa::with([
            'contactos' => function ($query) {
                $query->where('es_activo', 1)
                      ->whereNull('deleted_at')
                      ->with('lead');
            }
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
        
        // Transformar datos para Inertia
        $empresasData = $empresas->map(function ($empresa) {
            return [
                'id' => $empresa->id,
                'prefijo_id' => $empresa->prefijo_id,
                'nombre_fantasia' => $empresa->nombre_fantasia,
                'razon_social' => $empresa->razon_social,
                'cuit' => $empresa->cuit,
                'direccion_fiscal' => $empresa->direccion_fiscal,
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
            'filters' => $request->only(['search']),
        ]);
    }
}