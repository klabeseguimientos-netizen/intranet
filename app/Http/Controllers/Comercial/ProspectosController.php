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
                DB::raw('SUM(CASE WHEN estado_lead_id = 5 THEN 1 ELSE 0 END) as cerrado')
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
            'cerrado' => $estadisticasRow->cerrado ?? 0,
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
    
    public function guardarComentario(Request $request, $id)
    {
        $request->validate([
            'comentario' => 'required|string',
            'tipo_comentario_id' => 'nullable|exists:tipo_comentario,id',
            'crea_recordatorio' => 'boolean',
            'dias_recordatorio' => 'nullable|integer|min:0'
        ]);
        
        // Verificar que el lead exista y no sea cliente
        $lead = Lead::findOrFail($id);
        if ($lead->es_cliente == 1) {
            return redirect()->back()->with('error', 'No se puede agregar comentarios a un lead convertido en cliente.');
        }
        
        Comentario::create([
            'lead_id' => $id,
            'usuario_id' => auth()->id(),
            'tipo_comentario_id' => $request->tipo_comentario_id,
            'comentario' => $request->comentario,
            'created' => now()
        ]);
        
        // Redirigir de vuelta a la misma página
        return redirect()->back()->with('success', 'Comentario guardado exitosamente');
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
}