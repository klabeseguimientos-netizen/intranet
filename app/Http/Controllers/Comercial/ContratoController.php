<?php
// app/Http/Controllers/Comercial/ContratoController.php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Presupuesto;
use App\Models\Lead;
use App\Models\Empresa;
use App\Models\EmpresaContacto;
use App\Models\EmpresaResponsable;
use App\Models\Contrato;
use App\Models\ContratoVehiculo;
use App\Models\DebitoCbu;
use App\Models\DebitoTarjeta;
use App\Models\TipoResponsabilidad;
use App\Models\TipoDocumento;
use App\Models\Nacionalidad;
use App\Models\CategoriaFiscal;
use App\Models\Plataforma;
use App\Models\Rubro;
use App\Models\Provincia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Browsershot\Browsershot;
use Inertia\Inertia;

class ContratoController extends Controller
{
    /**
     * Mostrar listado de contratos
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $usuarioEsComercial = $user->rol_id === 5;
        
        $query = Contrato::with(['estado', 'empresa'])
            ->orderBy('created', 'desc');

        // Obtener prefijos del usuario para filtrar
        $prefijosUsuario = [];
        $prefijoUsuario = null;
        
        if ($usuarioEsComercial) {
            $comercial = \App\Models\Comercial::where('personal_id', $user->personal_id)->first();
            if ($comercial) {
                $prefijosUsuario = [$comercial->prefijo_id];
                
                // Obtener datos del prefijo para mostrar
                $prefijo = \App\Models\Prefijo::with('comercial.personal')
                    ->where('id', $comercial->prefijo_id)
                    ->first();
                if ($prefijo) {
                    $comercialPrefijo = $prefijo->comercial->first();
                    $prefijoUsuario = [
                        'id' => (string) $prefijo->id,
                        'codigo' => $prefijo->codigo,
                        'descripcion' => $prefijo->descripcion,
                        'comercial_nombre' => $comercialPrefijo?->personal?->nombre_completo,
                        'display_text' => $prefijo->codigo . ' - ' . ($comercialPrefijo?->personal?->nombre_completo ?? 'Sin comercial')
                    ];
                }
            }
        }

        // Aplicar filtro por prefijo
        if (!empty($prefijosUsuario)) {
            // Para comerciales, filtrar por sus prefijos
            $query->whereHas('presupuesto', function($q) use ($prefijosUsuario) {
                $q->whereIn('prefijo_id', $prefijosUsuario);
            });
        } elseif ($request->filled('prefijo_id') && !$usuarioEsComercial) {
            // Para no comerciales con filtro manual
            $query->whereHas('presupuesto', function($q) use ($request) {
                $q->where('prefijo_id', $request->prefijo_id);
            });
        }

        // Filtro por búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'LIKE', "%{$search}%")
                ->orWhere('cliente_nombre_completo', 'LIKE', "%{$search}%")
                ->orWhere('empresa_nombre_fantasia', 'LIKE', "%{$search}%")
                ->orWhere('presupuesto_referencia', 'LIKE', "%{$search}%");
            });
        }

        // Filtro por estado
        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->estado_id);
        }

        // Filtro por fecha
        if ($request->filled('fecha_inicio')) {
            $query->whereDate('fecha_emision', '>=', $request->fecha_inicio);
        }
        if ($request->filled('fecha_fin')) {
            $query->whereDate('fecha_emision', '<=', $request->fecha_fin);
        }

        $contratos = $query->paginate(15);

        // Obtener datos para filtros (solo para no comerciales)
        $prefijosFiltro = [];
        if (!$usuarioEsComercial) {
            $prefijosFiltro = \App\Models\Prefijo::with('comercial.personal')
                ->where('activo', true)
                ->get()
                ->map(function($prefijo) {
                    $comercial = $prefijo->comercial->first();
                    return [
                        'id' => (string) $prefijo->id,
                        'codigo' => $prefijo->codigo,
                        'descripcion' => $prefijo->descripcion,
                        'comercial_nombre' => $comercial?->personal?->nombre_completo,
                        'display_text' => $prefijo->codigo . ' - ' . ($comercial?->personal?->nombre_completo ?? 'Sin comercial')
                    ];
                })->toArray();
        }

        // Estadísticas filtradas por el mismo criterio
        $statsQuery = Contrato::query();
        
        // Aplicar el mismo filtro de prefijo a las estadísticas
        if (!empty($prefijosUsuario)) {
            $statsQuery->whereHas('presupuesto', function($q) use ($prefijosUsuario) {
                $q->whereIn('prefijo_id', $prefijosUsuario);
            });
        } elseif ($request->filled('prefijo_id') && !$usuarioEsComercial) {
            $statsQuery->whereHas('presupuesto', function($q) use ($request) {
                $q->where('prefijo_id', $request->prefijo_id);
            });
        }

        $estadisticas = [
            'total' => (clone $statsQuery)->count(),
            'activos' => (clone $statsQuery)->where('estado_id', 1)->count(),
            'pendientes' => (clone $statsQuery)->where('estado_id', 5)->count(),
            'instalados' => (clone $statsQuery)->where('estado_id', 6)->count(),
        ];

        $estados = \App\Models\EstadoEntidad::whereIn('id', [1,5,6])->get(['id', 'nombre']);

        return Inertia::render('Comercial/Contratos/Index', [
            'contratos' => $contratos,
            'estadisticas' => $estadisticas,
            'usuario' => [
                've_todas_cuentas' => $user->ve_todas_cuentas ?? false,
                'rol_id' => $user->rol_id,
                'nombre_completo' => $user->nombre_completo,
            ],
            'prefijosFiltro' => $prefijosFiltro,
            'prefijoUsuario' => $prefijoUsuario,
            'estados' => $estados,
        ]);
    }
    /**
     * Mostrar formulario de creación de contrato
     */
    public function create($presupuestoId)
    {
        $presupuesto = Presupuesto::with([
            'lead.localidad.provincia',
            'lead.rubro',
            'lead.origen',
            'prefijo.comercial.personal',
            'promocion.productos',
            'agregados' => function($query) {
                $query->with('productoServicio.tipo');
            },
            'tasa',
            'abono',
            'tasaMetodoPago',
            'abonoMetodoPago'
        ])->findOrFail($presupuestoId);

        $empresa = Empresa::with([
            'rubro',
            'categoriaFiscal',
            'plataforma',
            'localidadFiscal.provincia'
        ])->whereHas('contactos', function($q) use ($presupuesto) {
            $q->where('lead_id', $presupuesto->lead_id);
        })->first();

        $contacto = EmpresaContacto::with([
            'tipoResponsabilidad',
            'tipoDocumento',
            'nacionalidad'
        ])->where('lead_id', $presupuesto->lead_id)
            ->where('es_contacto_principal', true)
            ->first();

        if (!$empresa || !$contacto) {
            return redirect()->back()->with('error', 'Debe completar el alta de empresa primero');
        }

        $responsables = EmpresaResponsable::where('empresa_id', $empresa->id)
            ->where('es_activo', true)
            ->with('tipoResponsabilidad')
            ->get();

        $tiposResponsabilidad = TipoResponsabilidad::where('es_activo', true)->get();
        $tiposDocumento = TipoDocumento::where('es_activo', true)->get();
        $nacionalidades = Nacionalidad::where('activo', true)
            ->orderBy('pais')
            ->get(['id', 'pais', 'gentilicio']);
        $categoriasFiscales = CategoriaFiscal::where('es_activo', true)->get();
        $plataformas = Plataforma::where('es_activo', true)->get();
        $rubros = Rubro::where('activo', true)->get();
        $provincias = Provincia::where('activo', true)
            ->orderBy('provincia')
            ->get(['id', 'provincia']);

        return Inertia::render('Comercial/Contratos/Create', [
            'presupuesto' => $presupuesto,
            'empresa' => $empresa,
            'contacto' => $contacto,
            'responsables' => $responsables,
            'tiposResponsabilidad' => $tiposResponsabilidad,
            'tiposDocumento' => $tiposDocumento,
            'nacionalidades' => $nacionalidades,
            'categoriasFiscales' => $categoriasFiscales,
            'plataformas' => $plataformas,
            'rubros' => $rubros,
            'provincias' => $provincias,
        ]);
    }

    /**
     * Guardar nuevo contrato
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $presupuesto = Presupuesto::with([
                'lead.localidad.provincia',
                'lead.rubro',
                'lead.origen',
                'prefijo.comercial.personal',
                'promocion'
            ])->findOrFail($request->presupuesto_id);

            $empresa = Empresa::with([
                'localidadFiscal.provincia',
                'rubro',
                'categoriaFiscal',
                'plataforma'
            ])->findOrFail($request->empresa_id);

            $contacto = EmpresaContacto::with([
                'tipoResponsabilidad',
                'tipoDocumento',
                'nacionalidad'
            ])->findOrFail($request->contacto_id);

            // Crear el contrato
            $contrato = Contrato::create([
                'presupuesto_id' => $presupuesto->id,
                'lead_id' => $presupuesto->lead_id,
                'empresa_id' => $empresa->id,
                
                'fecha_emision' => now(),
                'estado_id' => 1,
                
                'vendedor_nombre' => optional(optional($presupuesto->prefijo?->comercial?->first())?->personal)->nombre_completo,
                'vendedor_prefijo' => $presupuesto->prefijo?->codigo,
                
                // Datos del cliente
                'cliente_nombre_completo' => $presupuesto->lead->nombre_completo,
                'cliente_genero' => $presupuesto->lead->genero,
                'cliente_telefono' => $presupuesto->lead->telefono,
                'cliente_email' => $presupuesto->lead->email,
                'cliente_localidad' => $presupuesto->lead->localidad?->localidad,
                'cliente_provincia' => $presupuesto->lead->localidad?->provincia?->provincia,
                'cliente_rubro' => $presupuesto->lead->rubro?->nombre,
                'cliente_origen' => $presupuesto->lead->origen?->nombre,
                
                // Datos del contacto
                'contacto_tipo_responsabilidad' => $contacto->tipoResponsabilidad?->nombre,
                'contacto_tipo_documento' => $contacto->tipoDocumento?->nombre,
                'contacto_nro_documento' => $contacto->nro_documento,
                'contacto_nacionalidad' => $contacto->nacionalidad?->pais,
                'contacto_fecha_nacimiento' => $contacto->fecha_nacimiento,
                'contacto_direccion_personal' => $contacto->direccion_personal,
                'contacto_codigo_postal_personal' => $contacto->codigo_postal_personal,
                
                // Datos de la empresa
                'empresa_nombre_fantasia' => $empresa->nombre_fantasia,
                'empresa_razon_social' => $empresa->razon_social,
                'empresa_cuit' => $empresa->cuit,
                'empresa_domicilio_fiscal' => $empresa->direccion_fiscal,
                'empresa_codigo_postal_fiscal' => $empresa->codigo_postal_fiscal,
                'empresa_localidad_fiscal' => $empresa->localidadFiscal?->localidad,
                'empresa_provincia_fiscal' => $empresa->localidadFiscal?->provincia?->provincia,
                'empresa_telefono_fiscal' => $empresa->telefono_fiscal,
                'empresa_email_fiscal' => $empresa->email_fiscal,
                'empresa_actividad' => $empresa->rubro?->nombre,
                'empresa_situacion_afip' => $empresa->categoriaFiscal?->nombre,
                'empresa_plataforma' => $empresa->plataforma?->nombre,
                'empresa_nombre_flota' => $empresa->nombre_flota,
                
                // Datos del presupuesto
                'presupuesto_referencia' => $presupuesto->referencia,
                'presupuesto_cantidad_vehiculos' => $presupuesto->cantidad_vehiculos,
                'presupuesto_total_inversion' => $presupuesto->total_presupuesto,
                'presupuesto_total_mensual' => $presupuesto->subtotal_abono,
                'presupuesto_promocion' => $presupuesto->promocion?->nombre,
                
                'created_by' => auth()->id(),
            ]);

            // Actualizar empresa con número de contrato
            $empresa->update(['numeroalfa' => $contrato->id]);

            // Responsables
            $responsableFlota = EmpresaResponsable::where('empresa_id', $empresa->id)
                ->where('es_activo', true)
                ->whereIn('tipo_responsabilidad_id', [3, 5])
                ->first();

            $responsablePagos = EmpresaResponsable::where('empresa_id', $empresa->id)
                ->where('es_activo', true)
                ->whereIn('tipo_responsabilidad_id', [4, 5])
                ->first();

            $contrato->update([
                'responsable_flota_nombre' => $responsableFlota?->nombre_completo,
                'responsable_flota_telefono' => $responsableFlota?->telefono,
                'responsable_flota_email' => $responsableFlota?->email,
                'responsable_pagos_nombre' => $responsablePagos?->nombre_completo,
                'responsable_pagos_telefono' => $responsablePagos?->telefono,
                'responsable_pagos_email' => $responsablePagos?->email,
            ]);

            // Guardar vehículos
            foreach ($request->vehiculos as $index => $vehiculo) {
                if (!empty($vehiculo['patente'])) {
                    ContratoVehiculo::create([
                        'contrato_id' => $contrato->id,
                        'patente' => $vehiculo['patente'],
                        'marca' => $vehiculo['marca'] ?? null,
                        'modelo' => $vehiculo['modelo'] ?? null,
                        'anio' => $vehiculo['anio'] ?? null,
                        'color' => $vehiculo['color'] ?? null,
                        'identificador' => $vehiculo['identificador'] ?? null,
                        'orden' => $index + 1,
                        'created' => now(),
                    ]);
                }
            }

            // Método de pago
            if ($request->metodo_pago === 'cbu' && $request->datos_cbu) {
                DebitoCbu::create([
                    'contrato_id' => $contrato->id,
                    'nombre_banco' => $request->datos_cbu['nombre_banco'],
                    'cbu' => $request->datos_cbu['cbu'],
                    'alias_cbu' => $request->datos_cbu['alias_cbu'] ?? null,
                    'titular_cuenta' => $request->datos_cbu['titular_cuenta'],
                    'tipo_cuenta' => $request->datos_cbu['tipo_cuenta'],
                    'es_activo' => true,
                    'created_by' => auth()->id(),
                ]);
            } elseif ($request->metodo_pago === 'tarjeta' && $request->datos_tarjeta) {
                DebitoTarjeta::create([
                    'contrato_id' => $contrato->id,
                    'tarjeta_emisor' => $request->datos_tarjeta['tarjeta_emisor'],
                    'tarjeta_expiracion' => $request->datos_tarjeta['tarjeta_expiracion'],
                    'tarjeta_numero' => $request->datos_tarjeta['tarjeta_numero'],
                    'tarjeta_codigo' => $request->datos_tarjeta['tarjeta_codigo'] ?? null,
                    'tarjeta_banco' => $request->datos_tarjeta['tarjeta_banco'],
                    'titular_tarjeta' => $request->datos_tarjeta['titular_tarjeta'],
                    'tipo_tarjeta' => $request->datos_tarjeta['tipo_tarjeta'],
                    'es_activo' => true,
                    'created_by' => auth()->id(),
                ]);
            }

            // Actualizar estado del presupuesto a aprobado
            $presupuesto->update(['estado_id' => 3]);

            DB::commit();

            return redirect()->route('comercial.contratos.show', $contrato->id)
                ->with('success', 'Contrato generado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al generar contrato:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Error al generar contrato: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar un contrato específico
     */
    public function show($id)
    {
        $contrato = Contrato::with([
            'vehiculos',
            'debitoCbu',
            'debitoTarjeta',
            'estado',
            'empresa',
            'presupuesto'
        ])->findOrFail($id);
        $contrato->numero_contrato = str_pad($contrato->id, 8, '0', STR_PAD_LEFT);
        return Inertia::render('Comercial/Contratos/Show', [
            'contrato' => $contrato
        ]);
    }

    /**
     * Generar PDF del contrato
     */

    public function generarPdf(Request $request, $id)
    {
        $contrato = Contrato::with([
            'vehiculos',
            'debitoCbu',
            'debitoTarjeta',
            'estado',
            'empresa',
            'presupuesto' => function($query) {
                $query->with([
                    'tasa',
                    'abono',
                    'promocion.productos',
                    'agregados' => function($q) {
                        $q->with('productoServicio.tipo');
                    }
                ]);
            }
        ])->findOrFail($id);


        // Determinar la compañía (código existente)
        $compania = [
            'id' => 1,
            'nombre' => 'LOCALSAT',
            'logo' => '/images/logos/logo.png'
        ];
        
        if ($contrato->presupuesto && $contrato->presupuesto->prefijo) {
            $comercial = $contrato->presupuesto->prefijo->comercial;
            if ($comercial instanceof \Illuminate\Database\Eloquent\Collection) {
                $comercial = $comercial->first();
            }
            if ($comercial && $comercial->compania_id) {
                $companiaId = $comercial->compania_id;
                $compania = [
                    'id' => $companiaId,
                    'nombre' => match($companiaId) {
                        1 => 'LOCALSAT',
                        2 => 'SMARTSAT',
                        3 => '360 SAT',
                        default => 'LOCALSAT'
                    },
                    'logo' => match($companiaId) {
                        1 => '/images/logos/logo.png',
                        2 => '/images/logos/logosmart.png',
                        3 => '/images/logos/360-logo.webp',
                        default => '/images/logos/logo.png'
                    }
                ];
            }
        }
        if ($request->has('download') && $request->download == 1) {
            return $this->descargarPdf($id);
        }
        return Inertia::render('Comercial/Contratos/ContratoHTML', [
            'contrato' => $contrato,
            'compania' => $compania
        ]);
    }

    
public function descargarPdf($id)
{
    $contrato = Contrato::with([
        'vehiculos',
        'debitoCbu',
        'debitoTarjeta',
        'estado',
        'empresa',
        'presupuesto' => function($query) {
            $query->with([
                'tasa',
                'abono',
                'promocion.productos',
                'agregados' => function($q) {
                    $q->with('productoServicio.tipo');
                }
            ]);
        }
    ])->findOrFail($id);

    // Determinar la compañía
    $compania = [
        'id' => 1,
        'nombre' => 'LOCALSAT',
        'logo' => public_path('images/logos/logo.png')
    ];
    
    if ($contrato->presupuesto && $contrato->presupuesto->prefijo) {
        $comercial = $contrato->presupuesto->prefijo->comercial;
        if ($comercial instanceof \Illuminate\Database\Eloquent\Collection) {
            $comercial = $comercial->first();
        }
        if ($comercial && $comercial->compania_id) {
            $companiaId = $comercial->compania_id;
            $compania = [
                'id' => $companiaId,
                'nombre' => match($companiaId) {
                    1 => 'LOCALSAT',
                    2 => 'SMARTSAT',
                    3 => '360 SAT',
                    default => 'LOCALSAT'
                },
                'logo' => public_path(match($companiaId) {
                    1 => 'images/logos/logo.png',
                    2 => 'images/logos/logosmart.png',
                    3 => 'images/logos/360-logo.webp',
                    default => 'images/logos/logo.png'
                })
            ];
        }
    }

    // Renderizar la vista Blade
    $html = view('pdf.contrato', [
        'contrato' => $contrato,
        'compania' => $compania
    ])->render();

    try {
        // Generar PDF con Browsershot
        $pdf = Browsershot::html($html)
            ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
            ->setOption('disable-gpu', true)
            ->format('A4')
            ->margins(10, 10, 10, 10)
            ->showBackground()
            ->pdf();

        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="contrato-' . $contrato->numero_contrato . '.pdf"');

    } catch (\Exception $e) {
        \Log::error('Error generando PDF:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json(['error' => 'Error al generar PDF: ' . $e->getMessage()], 500);
    }
}

}