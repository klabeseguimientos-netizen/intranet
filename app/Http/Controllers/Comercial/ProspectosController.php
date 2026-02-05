<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lead;
use App\Models\EstadoLead;
use App\Models\OrigenContacto;
use App\Models\TipoComentario;
use App\Models\Comentario;
use App\Models\Usuario;
use App\Models\Personal;
use Illuminate\Support\Facades\DB;
use App\Helpers\PermissionHelper; // Importar el helper

class ProspectosController extends Controller
{
    /**
     * Obtener los prefijos permitidos para un usuario
     */
    private function getPrefijosPermitidos($usuarioId)
    {
        return PermissionHelper::getPrefijosPermitidos($usuarioId);
    }
    
    /**
     * Aplicar filtro de prefijos a una query
     */
    private function aplicarFiltroPrefijos($query, $usuario, $campoPrefijo = 'prefijo_id')
    {
        return PermissionHelper::aplicarFiltroPrefijos($query, $usuario, $campoPrefijo);
    }

    public function index(Request $request)
    {
        // Verificar si el usuario está autenticado
        if (!auth()->check()) {
            return redirect('/login');
        }
        
        // Obtener usuario actual
        $usuario = auth()->user();
        
        // Construir query base para leads - FILTRAR POR es_cliente = 0
        $query = Lead::query()
            ->with(['origen', 'estadoLead', 'localidad', 'rubro', 'comercial.personal', 'notas.usuario.personal'])
            ->where('es_cliente', 0); // Solo leads que NO son clientes
        
        // Aplicar filtro de búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre_completo', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%");
            });
        }
         // Aplicar filtro por estado
        if ($request->has('estado_id') && $request->estado_id) {
            $query->where('estado_lead_id', $request->estado_id);
        }
        
        // Aplicar filtro por origen
        if ($request->has('origen_id') && $request->origen_id) {
            $query->where('origen_id', $request->origen_id);
        }
        
        // Aplicar filtro por fecha de creación
        if ($request->has('fecha_inicio') && $request->fecha_inicio) {
            $query->whereDate('created', '>=', $request->fecha_inicio);
        }
        
        if ($request->has('fecha_fin') && $request->fecha_fin) {
            $query->whereDate('created', '<=', $request->fecha_fin);
        }
        
        // Aplicar filtro de permisos
        $this->aplicarFiltroPrefijos($query, $usuario);
        
        // Obtener leads paginados
        $leads = $query->orderBy('created', 'desc')
            ->paginate(15)
            ->withQueryString();
        
        // Calcular estadísticas - SOLO PARA es_cliente = 0
        $estadosCount = DB::table('leads')
            ->select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN estado_lead_id = 1 THEN 1 ELSE 0 END) as nuevo'),
                DB::raw('SUM(CASE WHEN estado_lead_id = 2 THEN 1 ELSE 0 END) as contactado'),
                DB::raw('SUM(CASE WHEN estado_lead_id = 3 THEN 1 ELSE 0 END) as calificado'),
                DB::raw('SUM(CASE WHEN estado_lead_id = 4 THEN 1 ELSE 0 END) as propuesta'),
                DB::raw('SUM(CASE WHEN estado_lead_id = 5 THEN 1 ELSE 0 END) as negociacion')
            )
            ->where('es_cliente', 0) // Solo leads no convertidos en clientes
            ->where('es_activo', 1);
        
        // Aplicar filtro de permisos a la query de estadísticas
        if (!$usuario->ve_todas_cuentas) {
            $prefijosPermitidos = $this->getPrefijosPermitidos($usuario->id);
            if (!empty($prefijosPermitidos)) {
                $estadosCount->whereIn('prefijo_id', $prefijosPermitidos);
            } else {
                $estadosCount->whereRaw('1 = 0');
            }
        }
        
        $estadisticasRow = $estadosCount->first();
        $estadisticas = [
            'total' => $estadisticasRow->total ?? 0,
            'nuevo' => $estadisticasRow->nuevo ?? 0,
            'contactado' => $estadisticasRow->contactado ?? 0,
            'calificado' => $estadisticasRow->calificado ?? 0,
            'propuesta' => $estadisticasRow->propuesta ?? 0,
            'negociacion' => $estadisticasRow->negociacion ?? 0,
        ];
        
        // Obtener datos para filtros
        $origenes = OrigenContacto::where('activo', 1)->get();
        $estadosLead = EstadoLead::where('activo', 1)->get();
        $tiposComentario = TipoComentario::where('es_activo', 1)
            ->where(function($query) {
                $query->where('aplica_a', 'lead')
                      ->orWhere('aplica_a', 'ambos');
            })
            ->get();
        
        // Obtener rubros
        $rubros = DB::table('rubros')->where('activo', 1)->get();
        
        // Obtener comerciales activos - CON FILTRO DE PERMISOS
        $comercialesQuery = DB::table('comercial as c')
            ->join('personal as p', 'c.personal_id', '=', 'p.id')
            ->join('usuarios as u', 'p.id', '=', 'u.personal_id')
            ->where('c.activo', 1)
            ->where('u.activo', 1);
        
        // Aplicar filtro de permisos a comerciales
        if (!$usuario->ve_todas_cuentas) {
            $prefijosPermitidos = $this->getPrefijosPermitidos($usuario->id);
            if (!empty($prefijosPermitidos)) {
                $comercialesQuery->whereIn('c.prefijo_id', $prefijosPermitidos);
            } else {
                $comercialesQuery->whereRaw('1 = 0');
            }
        }
        
        $comerciales = $comercialesQuery
            ->select(
                'c.id',
                'c.prefijo_id',
                DB::raw("CONCAT(p.nombre, ' ', p.apellido) as nombre"),
                'p.email'
            )
            ->get()
            ->map(function ($comercial) {
                return [
                    'id' => $comercial->id,
                    'prefijo_id' => $comercial->prefijo_id,
                    'nombre' => $comercial->nombre,
                    'email' => $comercial->email,
                ];
            });
        
        // Verificar si hay comerciales
        $hay_comerciales = $comerciales->count() > 0;
        
        // Obtener datos del usuario actual con personal
        $usuario->load('personal');
        
        // Obtener los prefijos asignados al usuario
        $prefijosAsignados = [];
        $cantidadPrefijos = 0;
        if (!$usuario->ve_todas_cuentas) {
            $prefijosAsignados = $this->getPrefijosPermitidos($usuario->id);
            $cantidadPrefijos = count($prefijosAsignados);
        }
        
        // Preparar datos del usuario para pasar a la vista
        $usuarioData = [
            've_todas_cuentas' => (bool) $usuario->ve_todas_cuentas,
            'rol_id' => $usuario->rol_id,
            'personal_id' => $usuario->personal_id,
            'prefijos_asignados' => $prefijosAsignados,
            'cantidad_prefijos' => $cantidadPrefijos,
        ];
        
        // Agregar nombre completo del usuario
        if ($usuario->personal) {
            $usuarioData['nombre_completo'] = $usuario->personal->nombre . ' ' . $usuario->personal->apellido;
        } else {
            $usuarioData['nombre_completo'] = $usuario->nombre_usuario;
        }
        
        // Verificar si el usuario es comercial (rol_id = 5)
        if ($usuario->rol_id == 5) {
            // Buscar si tiene comercial asignado
            $comercialUsuario = DB::table('comercial')
                ->where('personal_id', $usuario->personal_id)
                ->where('activo', 1)
                ->first();
                
            if ($comercialUsuario) {
                $usuarioData['comercial'] = [
                    'es_comercial' => true,
                    'prefijo_id' => $comercialUsuario->prefijo_id,
                ];
            }
        }
        
        $provincias = DB::table('provincias')
            ->where('activo', 1)
            ->orderBy('provincia')
            ->get(['id', 'provincia as nombre']);

        $leadIds = $leads->pluck('id')->toArray();

        // Obtener conteo de comentarios por lead
        $comentariosPorLead = DB::table('comentarios')
            ->select('lead_id', DB::raw('COUNT(*) as total'))
            ->whereIn('lead_id', $leadIds)
            ->whereNull('deleted_at')
            ->groupBy('lead_id')
            ->pluck('total', 'lead_id')
            ->toArray();

        // También contar comentarios legacy
        $comentariosLegacyPorLead = DB::table('comentarios_legacy')
            ->select('lead_id', DB::raw('COUNT(*) as total'))
            ->whereIn('lead_id', $leadIds)
            ->groupBy('lead_id')
            ->pluck('total', 'lead_id')
            ->toArray();

        // Combinar ambos conteos
        $totalComentariosPorLead = [];
        foreach ($leadIds as $leadId) {
            $total = ($comentariosPorLead[$leadId] ?? 0) + ($comentariosLegacyPorLead[$leadId] ?? 0);
            $totalComentariosPorLead[$leadId] = $total;
        }

        return Inertia::render('Comercial/Prospectos', [
            'leads' => $leads,
            'estadisticas' => $estadisticas,
            'filters' => $request->only(['search', 'estado_id', 'origen_id', 'fecha_inicio', 'fecha_fin']),
            'usuario' => $usuarioData,
            'origenes' => $origenes,
            'estadosLead' => $estadosLead,
            'tiposComentario' => $tiposComentario,
            'rubros' => $rubros,
            'comerciales' => $comerciales,
            'provincias' => $provincias,
            'hay_comerciales' => $hay_comerciales,
            'comentariosPorLead' => $totalComentariosPorLead,
        ]);
    }
    
    /**
     * Ver comentarios de un lead
     */
    public function comentarios($id)
    {
        $lead = Lead::findOrFail($id);
        
        // Verificar que el lead no sea cliente
        if ($lead->es_cliente == 1) {
            return redirect()->route('comercial.prospectos.index')
                ->with('warning', 'Este lead ya se convirtió en cliente y no se puede editar.');
        }
        
        // Comentarios nuevos
        $comentarios = Comentario::with(['tipoComentario', 'usuario'])
            ->where('lead_id', $id)
            ->whereNull('deleted_at')
            ->orderBy('created', 'desc')
            ->get();
        
        // Comentarios legacy
        $comentariosLegacy = DB::table('comentarios_legacy')
            ->where('lead_id', $id)
            ->orderBy('created', 'desc')
            ->get();
        
        // Si es una petición AJAX (para el modal)
        if (request()->expectsJson()) {
            return response()->json([
                'comentarios' => $comentarios,
                'comentariosLegacy' => $comentariosLegacy,
            ]);
        }
        
        // Si no, renderizar página completa
        $tiposComentario = TipoComentario::where('es_activo', 1)
            ->where(function($query) {
                $query->where('aplica_a', 'lead')
                      ->orWhere('aplica_a', 'ambos');
            })
            ->get();
        
        return Inertia::render('Comercial/LeadComentarios', [
            'lead' => [
                'id' => $lead->id,
                'nombre_completo' => $lead->nombre_completo,
                'email' => $lead->email,
                'telefono' => $lead->telefono,
                'es_cliente' => $lead->es_cliente,
            ],
            'comentarios' => $comentarios,
            'comentariosLegacy' => $comentariosLegacy,
            'tiposComentario' => $tiposComentario,
        ]);
    }
    
// En ProspectosController.php, modificar el método guardarComentario:

public function guardarComentario(Request $request, $id)
{
    $request->validate([
        'comentario' => 'required|string',
        'tipo_comentario_id' => 'nullable|exists:tipo_comentario,id',
        'crea_recordatorio' => 'boolean',
        'dias_recordatorio' => 'nullable|integer|min:0',
        'cambiar_estado_lead' => 'boolean', // Nuevo campo
    ]);
    
    // Verificar que el lead exista y no sea cliente
    $lead = Lead::findOrFail($id);
    if ($lead->es_cliente == 1) {
        return redirect()->back()->with('error', 'No se puede agregar comentarios a un lead convertido en cliente.');
    }
    
    DB::beginTransaction();
    
    try {
        // Obtener usuario actual
        $usuarioId = auth()->id();
        
        // 1. Obtener el tipo de comentario
        $tipoComentario = null;
        if ($request->tipo_comentario_id) {
            $tipoComentario = TipoComentario::find($request->tipo_comentario_id);
        }
        
        // 2. Crear el comentario
        $comentario = Comentario::create([
            'lead_id' => $id,
            'usuario_id' => $usuarioId,
            'tipo_comentario_id' => $request->tipo_comentario_id,
            'comentario' => $request->comentario,
            'created' => now()
        ]);
        
        $mensaje = 'Comentario guardado exitosamente';
        
        // 3. Crear notificación si corresponde
        if ($request->crea_recordatorio && $request->dias_recordatorio > 0) {
            $this->crearNotificacionRecordatorio($comentario, $tipoComentario, $request->dias_recordatorio, $usuarioId);
            $mensaje .= ' con recordatorio';
        }
        
        // 4. Cambiar estado del lead si corresponde
        if ($request->cambiar_estado_lead && $tipoComentario) {
            $estadoCambiado = $this->cambiarEstadoLeadAutomaticamente($lead, $tipoComentario, $usuarioId);
            if ($estadoCambiado) {
                $mensaje .= ' y estado actualizado';
            }
        }
        
        DB::commit();
        
        return redirect()->back()->with('success', $mensaje);
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        \Log::error('Error al guardar comentario:', [
            'lead_id' => $id,
            'usuario_id' => auth()->id(),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return redirect()->back()->with('error', 'Error al guardar el comentario: ' . $e->getMessage());
    }
}

/**
 * Crear notificación de recordatorio
 */
private function crearNotificacionRecordatorio($comentario, $tipoComentario, $diasRecordatorio, $usuarioId)
{
    try {
        $fechaNotificacion = now()->addDays($diasRecordatorio);
        
        $titulo = $tipoComentario ? 'Recordatorio: ' . $tipoComentario->nombre : 'Recordatorio de comentario';
        $mensaje = substr($comentario->comentario, 0, 150) . '...';
        
        // Determinar prioridad
        $prioridad = 'normal';
        if ($diasRecordatorio <= 2) {
            $prioridad = 'urgente';
        } elseif ($diasRecordatorio <= 7) {
            $prioridad = 'alta';
        }
        
        DB::table('notificaciones')->insert([
            'usuario_id' => $usuarioId,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'tipo' => 'comentario_recordatorio',
            'entidad_tipo' => 'comentario',
            'entidad_id' => $comentario->id,
            'leida' => false,
            'fecha_notificacion' => $fechaNotificacion,
            'prioridad' => $prioridad,
            'created' => now()
        ]);
        
        return true;
        
    } catch (\Exception $e) {
        \Log::error('Error al crear notificación:', [
            'comentario_id' => $comentario->id,
            'error' => $e->getMessage()
        ]);
        return false;
    }
}

/**
 * Cambiar estado del lead automáticamente según tipo de comentario
 */
private function cambiarEstadoLeadAutomaticamente($lead, $tipoComentario, $usuarioId)
{
    // Mapear tipo de comentario a estado de lead
    $estadoMap = [
        'Contacto inicial' => 'Contactado',
        'Seguimiento lead' => 'Calificado',
        'Negociación' => 'Negociación',
        'Propuesta enviada' => 'Propuesta Enviada',
    ];
    
    $nuevoEstadoNombre = $estadoMap[$tipoComentario->nombre] ?? null;
    
    if (!$nuevoEstadoNombre) {
        return false;
    }
    
    // Buscar el estado
    $nuevoEstado = EstadoLead::where('nombre', $nuevoEstadoNombre)->first();
    
    if (!$nuevoEstado) {
        \Log::warning('Estado no encontrado:', ['nombre' => $nuevoEstadoNombre]);
        return false;
    }
    
    // Verificar si ya está en ese estado
    if ($lead->estado_lead_id == $nuevoEstado->id) {
        return false;
    }
    
    // Guardar estado anterior para auditoría
    $estadoAnterior = EstadoLead::find($lead->estado_lead_id);
    
    // Actualizar estado del lead
    $lead->estado_lead_id = $nuevoEstado->id;
    $lead->modified = now();
    $lead->modified_by = $usuarioId;
    $lead->save();
    
    // Registrar en auditoría
    $this->registrarCambioEstadoAuditoria($lead->id, $estadoAnterior, $nuevoEstado, $usuarioId, $tipoComentario->nombre);
    
    return true;
}

/**
 * Registrar cambio de estado en auditoría
 */
private function registrarCambioEstadoAuditoria($leadId, $estadoAnterior, $nuevoEstado, $usuarioId, $razon)
{
    try {
        // Si no hay estado anterior, asumimos que es "Nuevo"
        $estadoAnteriorId = $estadoAnterior ? $estadoAnterior->id : null;
        $estadoAnteriorNombre = $estadoAnterior ? $estadoAnterior->nombre : 'Nuevo';
        
        // Asegurarnos de que el estado nuevo existe
        if (!$nuevoEstado) {
            \Log::error('Estado nuevo no encontrado en auditoría:', [
                'lead_id' => $leadId,
                'estado_anterior' => $estadoAnteriorNombre
            ]);
            return;
        }
        
        // Verificar si ya existe un log idéntico reciente (evitar duplicados)
        $logExistente = DB::table('auditoria_log')
            ->where('tabla_afectada', 'leads')
            ->where('registro_id', $leadId)
            ->where('accion', 'UPDATE')
            ->whereJsonContains('valores_nuevos', ['estado_lead_id' => $nuevoEstado->id])
            ->where('created', '>=', now()->subMinutes(5))
            ->first();
        
        if ($logExistente) {
            \Log::info('Log de auditoría duplicado detectado, omitiendo:', [
                'lead_id' => $leadId,
                'log_existente_id' => $logExistente->id
            ]);
            return;
        }
        
        // Preparar datos para auditoría
        $valoresAnteriores = [
            'estado_lead_id' => $estadoAnteriorId,
            'estado_anterior_nombre' => $estadoAnteriorNombre,
        ];
        
        $valoresNuevos = [
            'estado_lead_id' => $nuevoEstado->id,
            'estado_nuevo_nombre' => $nuevoEstado->nombre,
            'razon_cambio' => $razon,
            'cambio_automatico' => true,
            'fecha_cambio' => now()->toDateTimeString(),
            'usuario_id' => $usuarioId
        ];
        
        // Insertar en auditoría
        DB::table('auditoria_log')->insert([
            'tabla_afectada' => 'leads',
            'registro_id' => $leadId,
            'accion' => 'UPDATE',
            'usuario_id' => $usuarioId,
            'valores_anteriores' => json_encode($valoresAnteriores),
            'valores_nuevos' => json_encode($valoresNuevos),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created' => now(),
        ]);
        
        \Log::info('Auditoría registrada exitosamente:', [
            'lead_id' => $leadId,
            'desde' => $estadoAnteriorNombre,
            'hasta' => $nuevoEstado->nombre,
            'razon' => $razon
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Error al registrar auditoría:', [
            'lead_id' => $leadId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
}

/**
 * Método para obtener tiempos entre estados (nuevo)
 */
public function tiemposEntreEstados($id)
{
    try {
        $lead = Lead::findOrFail($id);
        
        \Log::info('Consultando tiempos para lead:', [
            'lead_id' => $lead->id,
            'estado_actual' => $lead->estado_lead_id,
            'fecha_creacion' => $lead->created
        ]);
        
        // Obtener logs de auditoría para cambios de estado de este lead
        $logs = DB::table('auditoria_log')
            ->where('tabla_afectada', 'leads')
            ->where('registro_id', $lead->id)
            ->where('accion', 'UPDATE')
            ->orderBy('created', 'asc')
            ->get();
        
        \Log::info('Logs encontrados:', ['count' => $logs->count(), 'logs' => $logs->toArray()]);
        
        $tiempos = [];
        $estadoAnterior = null;
        $fechaAnterior = null;
        $estadoAnteriorNombre = 'Nuevo';
        
        // Si hay logs, procesarlos
        if ($logs->count() > 0) {
            foreach ($logs as $index => $log) {
                try {
                    $valoresNuevos = json_decode($log->valores_nuevos, true);
                    $valoresAnteriores = json_decode($log->valores_anteriores, true);
                    
                    \Log::info("Procesando log {$index}:", [
                        'valores_nuevos' => $valoresNuevos,
                        'valores_anteriores' => $valoresAnteriores
                    ]);
                    
                    // Verificar si es cambio de estado
                    if (isset($valoresNuevos['estado_lead_id']) || 
                        (isset($valoresNuevos['estado_nuevo_nombre']) && 
                         isset($valoresAnteriores['estado_anterior_nombre']))) {
                        
                        $estadoActualNombre = $valoresNuevos['estado_nuevo_nombre'] ?? 'Desconocido';
                        $estadoAnteriorNombreLog = $valoresAnteriores['estado_anterior_nombre'] ?? 'Nuevo';
                        
                        // Si es el primer registro y hay fecha anterior (creación del lead)
                        if ($index === 0 && $estadoAnterior === null) {
                            $estadoAnterior = 'Nuevo';
                            $fechaAnterior = $lead->created;
                            $estadoAnteriorNombre = 'Nuevo';
                            
                            // Calcular tiempo desde creación hasta primer cambio
                            $diferencia = \Carbon\Carbon::parse($fechaAnterior)
                                ->diff(\Carbon\Carbon::parse($log->created));
                            
                            $tiempos[] = [
                                'desde' => 'Nuevo',
                                'hasta' => $estadoActualNombre,
                                'dias' => $diferencia->days,
                                'horas' => $diferencia->h,
                                'minutos' => $diferencia->i,
                                'fecha_cambio' => $log->created,
                                'razon' => $valoresNuevos['razon_cambio'] ?? 'Cambio automático desde creación',
                            ];
                        } 
                        // Si no es el primer registro
                        elseif ($estadoAnterior !== null && $fechaAnterior !== null) {
                            $diferencia = \Carbon\Carbon::parse($fechaAnterior)
                                ->diff(\Carbon\Carbon::parse($log->created));
                            
                            $tiempos[] = [
                                'desde' => $estadoAnteriorNombreLog,
                                'hasta' => $estadoActualNombre,
                                'dias' => $diferencia->days,
                                'horas' => $diferencia->h,
                                'minutos' => $diferencia->i,
                                'fecha_cambio' => $log->created,
                                'razon' => $valoresNuevos['razon_cambio'] ?? 'Cambio automático',
                            ];
                        }
                        
                        $estadoAnterior = $estadoActualNombre;
                        $fechaAnterior = $log->created;
                        $estadoAnteriorNombre = $estadoAnteriorNombreLog;
                    }
                    
                } catch (\Exception $e) {
                    \Log::error('Error procesando log individual:', [
                        'log_id' => $log->id,
                        'error' => $e->getMessage()
                    ]);
                    continue;
                }
            }
        }
        
        // Si no hay logs de auditoría pero el lead tiene un estado diferente a "Nuevo"
        if (empty($tiempos) && $lead->estado_lead_id) {
            $estadoActual = EstadoLead::find($lead->estado_lead_id);
            if ($estadoActual && $estadoActual->nombre !== 'Nuevo') {
                $diferencia = \Carbon\Carbon::parse($lead->created)->diff(now());
                
                $tiempos[] = [
                    'desde' => 'Nuevo',
                    'hasta' => $estadoActual->nombre,
                    'dias' => $diferencia->days,
                    'horas' => $diferencia->h,
                    'minutos' => $diferencia->i,
                    'fecha_cambio' => $lead->created,
                    'razon' => 'Creación del lead',
                ];
            }
        }
        
        // Agregar tiempo desde el último cambio hasta ahora (si aplica)
        if (!empty($tiempos) && $fechaAnterior) {
            $ultimoCambio = end($tiempos);
            $diferenciaActual = \Carbon\Carbon::parse($fechaAnterior)->diff(now());
            
            // Solo agregar si ha pasado al menos 1 minuto desde el último cambio
            if ($diferenciaActual->days > 0 || $diferenciaActual->h > 0 || $diferenciaActual->i > 0) {
                $estadoActualLead = EstadoLead::find($lead->estado_lead_id);
                if ($estadoActualLead) {
                    $tiempos[] = [
                        'desde' => $ultimoCambio['hasta'],
                        'hasta' => $estadoActualLead->nombre . ' (Actual)',
                        'dias' => $diferenciaActual->days,
                        'horas' => $diferenciaActual->h,
                        'minutos' => $diferenciaActual->i,
                        'fecha_cambio' => now()->toDateTimeString(),
                        'razon' => 'Estado actual',
                    ];
                }
            }
        }
        
        \Log::info('Tiempos calculados:', ['tiempos' => $tiempos]);
        
        return response()->json($tiempos);
        
    } catch (\Exception $e) {
        \Log::error('Error en tiemposEntreEstados:', [
            'lead_id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Error al calcular tiempos',
            'message' => $e->getMessage()
        ], 500);
    }
}
    
    public function edit($id)
    {
        $lead = Lead::findOrFail($id);
        
        // Verificar que el lead no sea cliente
        if ($lead->es_cliente == 1) {
            return redirect()->route('comercial.prospectos.index')
                ->with('warning', 'Este lead ya se convirtió en cliente y no se puede editar.');
        }
        
        return Inertia::render('Comercial/LeadEdit', [
            'lead' => $lead,
        ]);
    }
    
    /**
     * Actualizar un lead (para el modal de edición)
     */
    public function update(Request $request, $id)
    {
        // Buscar el lead primero para verificar si es cliente
        $lead = Lead::find($id);
        
        if (!$lead) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'lead' => 'Lead no encontrado'
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Lead no encontrado'
            ], 404);
        }
        
        // Verificar que no sea cliente
        if ($lead->es_cliente == 1) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'lead' => 'No se puede editar un lead convertido en cliente'
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'No se puede editar un lead convertido en cliente'
            ], 403);
        }
        
        // Validar los datos
        $validated = $request->validate([
            'prefijo_id' => 'nullable|integer',
            'nombre_completo' => 'required|string|max:100',
            'genero' => 'required|in:masculino,femenino,otro,no_especifica',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'localidad_id' => 'nullable|integer|exists:localidades,id',
            'rubro_id' => 'nullable|integer|exists:rubros,id',
            'origen_id' => 'nullable|integer|exists:origenes_contacto,id',
        ]);
        
        try {
            // Convertir strings vacíos a null
            $validated['prefijo_id'] = !empty($validated['prefijo_id']) ? $validated['prefijo_id'] : null;
            $validated['localidad_id'] = !empty($validated['localidad_id']) ? $validated['localidad_id'] : null;
            $validated['rubro_id'] = !empty($validated['rubro_id']) ? $validated['rubro_id'] : null;
            $validated['origen_id'] = !empty($validated['origen_id']) ? $validated['origen_id'] : null;
            
            // Obtener usuario actual
            $usuarioId = auth()->id();
            
            // Actualizar el lead
            $lead->update([
                'prefijo_id' => $validated['prefijo_id'],
                'nombre_completo' => $validated['nombre_completo'],
                'genero' => $validated['genero'],
                'telefono' => $validated['telefono'],
                'email' => $validated['email'],
                'localidad_id' => $validated['localidad_id'],
                'rubro_id' => $validated['rubro_id'],
                'origen_id' => $validated['origen_id'],
                'modified' => now(),
                'modified_by' => $usuarioId,
            ]);
            
            // Para peticiones Inertia, redirigir con mensaje de éxito
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with([
                    'success' => 'Lead actualizado exitosamente',
                    'updatedLeadId' => $id
                ]);
            }
            
            // Para peticiones AJAX tradicionales, mantener JSON
            return response()->json([
                'success' => true,
                'message' => 'Lead actualizado exitosamente'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error actualizando lead:', [
                'error' => $e->getMessage(),
                'lead_id' => $id,
                'data' => $request->all()
            ]);
            
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'lead_update' => 'Error al actualizar el lead: ' . $e->getMessage()
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el lead: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
    
    /**
     * Convertir lead en cliente
     */
    public function convertirEnCliente($id)
    {
        try {
            $lead = Lead::findOrFail($id);
            
            // Verificar que no sea ya cliente
            if ($lead->es_cliente == 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'El lead ya es cliente'
                ], 400);
            }
            
            // Actualizar a cliente
            $lead->update([
                'es_cliente' => 1,
                'modified' => now(),
                'modified_by' => auth()->id(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Lead convertido en cliente exitosamente'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error convirtiendo lead en cliente:', [
                'error' => $e->getMessage(),
                'lead_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al convertir lead en cliente'
            ], 500);
        }
    }

    public function showComentarioModal($id)
{
    $lead = Lead::findOrFail($id);
    
    // Contar comentarios existentes para determinar si es primer comentario
    $comentariosExistentes = Comentario::where('lead_id', $id)
        ->whereNull('deleted_at')
        ->count();
    
    $tiposComentario = TipoComentario::where('es_activo', 1)
        ->where(function($query) {
            $query->where('aplica_a', 'lead')
                  ->orWhere('aplica_a', 'ambos');
        })
        ->get();
    
    $estadosLead = EstadoLead::where('activo', 1)->get();
    
    return response()->json([
        'lead' => [
            'id' => $lead->id,
            'nombre_completo' => $lead->nombre_completo,
            'estado_lead_id' => $lead->estado_lead_id,
        ],
        'tiposComentario' => $tiposComentario,
        'estadosLead' => $estadosLead,
        'comentariosExistentes' => $comentariosExistentes,
    ]);
}

public function comentariosModalData($id)
{
    $lead = Lead::findOrFail($id);
    
    // Contar comentarios existentes
    $comentariosExistentes = Comentario::where('lead_id', $id)
        ->whereNull('deleted_at')
        ->count();
    
    // Obtener estados lead
    $estadosLead = EstadoLead::where('activo', 1)->get();
    
    return response()->json([
        'lead' => [
            'id' => $lead->id,
            'nombre_completo' => $lead->nombre_completo,
            'estado_lead_id' => $lead->estado_lead_id,
        ],
        'comentariosExistentes' => $comentariosExistentes,
        'estadosLead' => $estadosLead,
    ]);
}
}