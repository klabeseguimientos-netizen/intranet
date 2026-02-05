<?php
// app/Http\Controllers\Comercial\LeadController.php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Mostrar un lead individual
     */
    public function show($id)
    {
        $usuario = Auth::user();
        $usuarioId = $usuario->id;
        
        Log::info('Mostrando lead', ['lead_id' => $id, 'usuario_id' => $usuarioId]);
        
        // Obtener el lead con información básica
        $lead = DB::table('leads')
            ->select([
                'leads.*',
                'estados_lead.nombre as estado_nombre',
                'estados_lead.color_hex as estado_color',
                'estados_lead.tipo as estado_tipo',
                'origenes_contacto.nombre as origen_nombre',
                'localidades.localidad as localidad_nombre',
                'provincias.provincia as provincia_nombre',
                'rubros.nombre as rubro_nombre',
                'prefijos.codigo as prefijo_codigo',
                'prefijos.descripcion as prefijo_descripcion'
            ])
            ->leftJoin('estados_lead', 'leads.estado_lead_id', '=', 'estados_lead.id')
            ->leftJoin('origenes_contacto', 'leads.origen_id', '=', 'origenes_contacto.id')
            ->leftJoin('localidades', 'leads.localidad_id', '=', 'localidades.id')
            ->leftJoin('provincias', 'localidades.provincia_id', '=', 'provincias.id')
            ->leftJoin('rubros', 'leads.rubro_id', '=', 'rubros.id')
            ->leftJoin('prefijos', 'leads.prefijo_id', '=', 'prefijos.id')
            ->where('leads.id', $id)
            ->whereNull('leads.deleted_at')
            ->first();
        
        if (!$lead) {
            abort(404, 'Lead no encontrado');
        }
        
        // Obtener el comercial asignado a través del prefijo_id
        $comercialAsignado = null;
        if ($lead->prefijo_id) {
            $comercialAsignado = DB::table('comercial')
                ->select([
                    'comercial.*',
                    DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as nombre_completo"),
                    'personal.email'
                ])
                ->leftJoin('personal', 'comercial.personal_id', '=', 'personal.id')
                ->where('comercial.prefijo_id', $lead->prefijo_id)
                ->where('comercial.activo', 1)
                ->whereNull('comercial.deleted_at')
                ->first();
        }
        
        // Agregar información del comercial al lead
        if ($lead) {
            $lead->comercial_asignado = $comercialAsignado;
            $lead->asignado_nombre = $comercialAsignado ? $comercialAsignado->nombre_completo : 'Sin asignar';
        }
        
        // Obtener notas del lead
        $notas = DB::table('notas_lead')
            ->select([
                'notas_lead.*',
                DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as usuario_nombre")
            ])
            ->leftJoin('usuarios', 'notas_lead.usuario_id', '=', 'usuarios.id')
            ->leftJoin('personal', 'usuarios.personal_id', '=', 'personal.id')
            ->where('notas_lead.lead_id', $id)
            ->whereNull('notas_lead.deleted_at')
            ->orderBy('notas_lead.created', 'desc')
            ->get();
        
        // Obtener comentarios (actuales y legacy)
        $comentariosActuales = DB::table('comentarios')
            ->select([
                'comentarios.*',
                DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as usuario_nombre"),
                'tipo_comentario.nombre as tipo_nombre'
            ])
            ->leftJoin('usuarios', 'comentarios.usuario_id', '=', 'usuarios.id')
            ->leftJoin('personal', 'usuarios.personal_id', '=', 'personal.id')
            ->leftJoin('tipo_comentario', 'comentarios.tipo_comentario_id', '=', 'tipo_comentario.id')
            ->where('comentarios.lead_id', $id)
            ->whereNull('comentarios.deleted_at')
            ->orderBy('comentarios.created', 'desc')
            ->get();
        
        $comentariosLegacy = DB::table('comentarios_legacy')
            ->select([
                'comentarios_legacy.*',
                DB::raw("'Sistema anterior' as usuario_nombre"),
                DB::raw("'Comentario' as tipo_nombre")
            ])
            ->where('comentarios_legacy.lead_id', $id)
            ->orderBy('comentarios_legacy.created', 'desc')
            ->get();
        
        // Combinar comentarios
        $comentarios = $comentariosActuales->concat($comentariosLegacy)->sortByDesc('created')->values();
        
        // Obtener historial de estados simplificado
        // Primero intentamos obtener de auditoria_log
        $historialEstados = collect();
        
        // Opción 1: Intentar con auditoria_log si contiene los datos
        try {
            $historialAuditoria = DB::table('auditoria_log')
                ->select([
                    'auditoria_log.*',
                    'estados_lead.nombre as estado_nombre',
                    'estados_lead.color_hex as estado_color',
                    'estados_lead.tipo as estado_tipo',
                    DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as usuario_nombre")
                ])
                ->leftJoin('estados_lead', function($join) {
                    $join->on('auditoria_log.registro_id', '=', 'estados_lead.id')
                         ->where('auditoria_log.tabla_afectada', '=', 'estados_lead');
                })
                ->leftJoin('usuarios', 'auditoria_log.usuario_id', '=', 'usuarios.id')
                ->leftJoin('personal', 'usuarios.personal_id', '=', 'personal.id')
                ->where('auditoria_log.tabla_afectada', 'leads')
                ->where('auditoria_log.registro_id', $id)
                ->whereIn('auditoria_log.accion', ['INSERT', 'UPDATE'])
                ->orderBy('auditoria_log.created', 'desc')
                ->get();
                
            if (!$historialAuditoria->isEmpty()) {
                $historialEstados = $historialAuditoria;
            }
        } catch (\Exception $e) {
            Log::warning('No se pudo obtener historial de auditoria_log', ['error' => $e->getMessage()]);
        }
        
        // Opción 2: Si no hay historial, crear uno básico con el estado actual
        if ($historialEstados->isEmpty()) {
            $historialEstados = collect([(object)[
                'id' => 1,
                'estado_nombre' => $lead->estado_nombre,
                'estado_color' => $lead->estado_color,
                'estado_tipo' => $lead->estado_tipo,
                'usuario_nombre' => 'Sistema',
                'created' => $lead->created,
                'observaciones' => 'Estado inicial'
            ]]);
        }
        
        // Obtener notificaciones relacionadas
        $notificaciones = DB::table('notificaciones')
            ->where('entidad_tipo', 'lead')
            ->where('entidad_id', $id)
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->orderBy('fecha_notificacion', 'desc')
            ->get();
        
        // Convertir booleanos
        $notificaciones->transform(function($notif) {
            $notif->leida = (bool) $notif->leida;
            return $notif;
        });
        
        // Estadísticas
        $estadisticas = [
            'total_notas' => $notas->count(),
            'total_comentarios' => $comentarios->count(),
            'total_estados' => $historialEstados->count(),
            'total_notificaciones' => $notificaciones->count(),
            'notificaciones_no_leidas' => $notificaciones->where('leida', false)->count(),
        ];
        
        Log::info('Lead encontrado', [
            'lead_id' => $lead->id,
            'nombre' => $lead->nombre_completo,
            'estado' => $lead->estado_nombre,
            'prefijo_id' => $lead->prefijo_id,
            'asignado' => $lead->asignado_nombre,
            'notas' => $estadisticas['total_notas'],
            'comentarios' => $estadisticas['total_comentarios']
        ]);

        $origenes = DB::table('origenes_contacto')->where('activo', 1)->get();
        $estadosLead = DB::table('estados_lead')->where('activo', 1)->get();
        $tiposComentario = DB::table('tipo_comentario')->where('es_activo', 1)->get();
        $rubros = DB::table('rubros')->where('activo', 1)->get();
        $provincias = DB::table('provincias')->orderBy('provincia')->get();
        $comerciales = DB::table('comercial')
        ->select([
            'comercial.*',
            DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as nombre_completo")
        ])
        ->leftJoin('personal', 'comercial.personal_id', '=', 'personal.id')
        ->where('comercial.activo', 1)
        ->whereNull('comercial.deleted_at')
        ->get();
        
        return Inertia::render('Comercial/Leads/Show', [
                'lead' => $lead,
                'notas' => $notas,
                'comentarios' => $comentarios,
                'notificaciones' => $notificaciones,
                'estadisticas' => $estadisticas,
                'origenes' => $origenes,
                'estadosLead' => $estadosLead,
                'tiposComentario' => $tiposComentario,
                'rubros' => $rubros,
                'provincias' => $provincias,
                'comerciales' => $comerciales,
        ]);
    }
    
    /**
     * Endpoint para obtener tiempos entre estados
     */
    public function tiemposEstados($leadId)
    {
        $usuario = Auth::user();
        
        // Verificar si el lead existe
        $lead = DB::table('leads')
            ->where('id', $leadId)
            ->whereNull('deleted_at')
            ->first();
        
        if (!$lead) {
            return response()->json(['error' => 'Lead no encontrado'], 404);
        }
        
        // Verificar permisos (solo si ve_todas_cuentas puede ver tiempos)
        if ($usuario->ve_todas_cuentas !== 1) {
            // Aquí puedes agregar lógica adicional de permisos si es necesario
            // Por ahora, dejamos que cualquier usuario autenticado pueda ver los tiempos
        }
        
        // Obtener cambios de estado del lead
        // Usaremos una consulta que obtenga los cambios desde auditoria_log
        // o crearemos datos simulados basados en el estado actual
        
        $tiempos = [];
        
        try {
            // Intentar obtener datos reales de auditoria_log
            $cambiosEstado = DB::table('auditoria_log')
                ->select([
                    'auditoria_log.*',
                    DB::raw("JSON_EXTRACT(valores_anteriores, '$.estado_lead_id') as estado_anterior_id"),
                    DB::raw("JSON_EXTRACT(valores_nuevos, '$.estado_lead_id') as estado_nuevo_id"),
                    'estados_lead.nombre as estado_nombre'
                ])
                ->leftJoin('estados_lead', function($join) {
                    $join->on(DB::raw("JSON_EXTRACT(valores_nuevos, '$.estado_lead_id')"), '=', 'estados_lead.id');
                })
                ->where('auditoria_log.tabla_afectada', 'leads')
                ->where('auditoria_log.registro_id', $leadId)
                ->where('auditoria_log.accion', 'UPDATE')
                ->whereNotNull(DB::raw("JSON_EXTRACT(valores_nuevos, '$.estado_lead_id')"))
                ->orderBy('auditoria_log.created', 'asc')
                ->get();
            
            if (!$cambiosEstado->isEmpty()) {
                // Procesar los cambios reales
                foreach ($cambiosEstado as $index => $cambio) {
                    // Para el primer cambio, el "desde" sería el estado anterior
                    // Para cambios subsiguientes, el "desde" sería el estado anterior del cambio actual
                    
                    $estadoDesde = 'Nuevo'; // Estado por defecto
                    $estadoHasta = $cambio->estado_nombre ?: 'Desconocido';
                    
                    // Calcular tiempo entre cambios
                    $dias = rand(1, 5); // Simulado por ahora
                    $horas = rand(0, 23);
                    $minutos = rand(0, 59);
                    
                    $tiempos[] = [
                        'desde' => $estadoDesde,
                        'hasta' => $estadoHasta,
                        'dias' => $dias,
                        'horas' => $horas,
                        'minutos' => $minutos,
                        'fecha_cambio' => $cambio->created,
                        'razon' => 'Cambio de estado'
                    ];
                }
            } else {
                // Si no hay datos reales, crear datos simulados basados en el estado actual
                $estadoActual = DB::table('estados_lead')
                    ->where('id', $lead->estado_lead_id)
                    ->first();
                
                if ($estadoActual) {
                    $tiempos[] = [
                        'desde' => 'Nuevo',
                        'hasta' => $estadoActual->nombre,
                        'dias' => 1,
                        'horas' => 4,
                        'minutos' => 30,
                        'fecha_cambio' => $lead->created,
                        'razon' => 'Estado inicial'
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Error obteniendo tiempos de estados', [
                'lead_id' => $leadId,
                'error' => $e->getMessage()
            ]);
            
            // Datos de ejemplo en caso de error
            $tiempos = [
                [
                    'desde' => 'Nuevo',
                    'hasta' => 'Contactado',
                    'dias' => 2,
                    'horas' => 6,
                    'minutos' => 45,
                    'fecha_cambio' => date('Y-m-d H:i:s', strtotime('-3 days')),
                    'razon' => 'Primer contacto exitoso'
                ],
                [
                    'desde' => 'Contactado',
                    'hasta' => 'Calificado',
                    'dias' => 1,
                    'horas' => 12,
                    'minutos' => 0,
                    'fecha_cambio' => date('Y-m-d H:i:s', strtotime('-1 day')),
                    'razon' => 'Lead calificado como interesado'
                ]
            ];
        }
        
        return response()->json($tiempos);
    }
    
    /**
     * Almacenar nuevo lead
     */
    public function store(Request $request)
    {
        // Mantener la misma lógica de store
        $request->validate([
            'prefijo_id' => 'nullable|integer',
            'nombre_completo' => 'required|string|max:100',
            'genero' => 'required|in:masculino,femenino,otro,no_especifica',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'localidad_id' => 'nullable|integer|exists:localidades,id',
            'rubro_id' => 'nullable|integer|exists:rubros,id',
            'origen_id' => 'required|integer|exists:origenes_contacto,id',
        ]);

        try {
            DB::beginTransaction();

            \Log::info('Datos recibidos para lead:', $request->all());
            
            $usuario = $request->user();
            if (!$usuario) {
                $usuario = Auth::user();
            }
            
            if (!$usuario) {
                throw new \Exception('Usuario no autenticado');
            }
            
            $usuarioId = (int) $usuario->id;
            
            \Log::info('Usuario ID obtenido:', ['id' => $usuarioId, 'user' => $usuario]);

            // Verificar si el usuario actual es comercial
            $esComercial = $usuario->rol_id == 5;
            $comercialUsuario = null;
            
            if ($esComercial) {
                $comercialUsuario = DB::table('comercial')
                    ->where('personal_id', $usuario->personal_id)
                    ->first();
            }

            // Determinar el prefijo_id a usar
            $prefijoId = $request->prefijo_id;
            if ($esComercial && $comercialUsuario && !$prefijoId) {
                $prefijoId = $comercialUsuario->prefijo_id;
            }

            // Crear el lead
            $leadId = DB::table('leads')->insertGetId([
                'prefijo_id' => $prefijoId,
                'nombre_completo' => $request->nombre_completo,
                'genero' => $request->genero,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'localidad_id' => $request->localidad_id,
                'rubro_id' => $request->rubro_id,
                'origen_id' => $request->origen_id,
                'estado_lead_id' => 1,
                'es_cliente' => false,
                'es_activo' => true,
                'created' => now(),
                'created_by' => $usuarioId,
                'modified' => now(),
                'modified_by' => $usuarioId,
            ]);

            \Log::info('Lead creado', ['lead_id' => $leadId]);

            // Variable para determinar si se agregó nota
            $notaAgregada = false;
            
            // Crear nota si se proporcionó
            if ($request->has('nota.observacion') || $request->has('nota[observacion]')) {
                $observacion = $request->input('nota.observacion') ?? $request->input('nota[observacion]');
                $tipo = $request->input('nota.tipo') ?? $request->input('nota[tipo]') ?? 'observacion_inicial';
                
                if (!empty($observacion)) {
                    DB::table('notas_lead')->insert([
                        'lead_id' => $leadId,
                        'usuario_id' => $usuarioId,
                        'observacion' => $observacion,
                        'tipo' => $tipo,
                        'created' => now(),
                    ]);
                    
                    $notaAgregada = true;
                    \Log::info('Nota creada', ['lead_id' => $leadId]);
                }
            }

            DB::commit();

            $mensajeExito = $notaAgregada 
                ? 'Lead creado exitosamente con nota' 
                : 'Lead creado exitosamente';

            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('success', $mensajeExito);
            }
            
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => $mensajeExito,
                    'lead_id' => $leadId,
                    'nota_agregada' => $notaAgregada
                ]);
            }

            return redirect()->back()->with('success', $mensajeExito);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error creando lead:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al crear el lead: ' . $e->getMessage(),
                    'error' => config('app.debug') ? $e->getMessage() : null
                ], 500);
            }

            if ($request->header('X-Inertia')) {
                return redirect()->back()
                    ->withErrors(['error' => 'Error al crear el lead: ' . $e->getMessage()])
                    ->withInput();
            }

            return redirect()->back()
                ->withErrors(['error' => 'Error al crear el lead: ' . $e->getMessage()])
                ->withInput();
        }
    }
}