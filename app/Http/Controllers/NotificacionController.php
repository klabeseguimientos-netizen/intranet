<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class NotificacionController extends Controller
{
    /**
     * Vista principal de notificaciones (página completa)
     */
    public function index(Request $request)
    {
        $usuarioId = Auth::id();
        
        // Query base - SOLO NOTIFICACIONES ACTIVAS
        $query = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->where('fecha_notificacion', '<=', Carbon::now())
            ->orderBy('fecha_notificacion', 'desc');
        
        // Aplicar filtros
        if ($request->filled('leida')) {
            $query->where('leida', $request->leida === 'true' ? 1 : 0);
        }
        
        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        if ($request->filled('prioridad')) {
            $query->where('prioridad', $request->prioridad);
        }
        
        // Paginación
        $notificaciones = $query->paginate(20);
        
        // Convertir booleanos
        $notificaciones->getCollection()->transform(function($notificacion) {
            $notificacion->leida = (bool) $notificacion->leida;
            return $notificacion;
        });
        
        // Contar no leídas ACTIVAS
        $totalNoLeidas = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->where('leida', false)
            ->whereNull('deleted_at')
            ->where('fecha_notificacion', '<=', Carbon::now())
            ->count();
        
        return Inertia::render('Notificaciones/Index', [
            'notificaciones' => $notificaciones,
            'filtros' => $request->only(['tipo', 'leida', 'prioridad']),
            'totalNoLeidas' => $totalNoLeidas,
        ]);
    }
    
    /**
     * API para dropdown - solo notificaciones NO LEÍDAS
     */
    public function ajaxIndex(Request $request)
    {
        $usuarioId = Auth::id();
        
        // Query base - SOLO NO LEÍDAS ACTIVAS
        $query = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->where('fecha_notificacion', '<=', Carbon::now())
            ->where('leida', false)  // ← SOLO NO LEÍDAS
            ->orderBy('fecha_notificacion', 'desc');
        
        // Si se solicita todas (incluyendo leídas) para vista completa
        if ($request->get('todas', false) === true) {
            $query = DB::table('notificaciones')
                ->where('usuario_id', $usuarioId)
                ->whereNull('deleted_at')
                ->where('fecha_notificacion', '<=', Carbon::now())
                ->orderBy('fecha_notificacion', 'desc');
        }
        
        // Limitar para dropdown
        $limit = $request->get('limit', 10);
        $notificaciones = $query->limit($limit)->get();
        
        // Convertir booleanos
        $notificaciones->transform(function($notif) {
            $notif->leida = (bool) $notif->leida;
            return $notif;
        });
        
        // Contar total no leídas ACTIVAS
        $totalNoLeidas = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->where('fecha_notificacion', '<=', Carbon::now())
            ->where('leida', false)
            ->count();
        
        return response()->json([
            'success' => true,
            'data' => $notificaciones,
            'meta' => [
                'total_no_leidas' => $totalNoLeidas
            ]
        ]);
    }
    
    /**
     * Marcar una notificación como leída
     */
    public function marcarLeida($id)
    {
        $usuarioId = Auth::id();
        
        $actualizado = DB::table('notificaciones')
            ->where('id', $id)
            ->where('usuario_id', $usuarioId)
            ->update([
                'leida' => true,
                'fecha_leida' => Carbon::now()
            ]);
        
        if ($actualizado) {
            return response()->json([
                'success' => true,
                'message' => 'Notificación marcada como leída',
                'meta' => [
                    'total_no_leidas' => DB::table('notificaciones')
                        ->where('usuario_id', $usuarioId)
                        ->whereNull('deleted_at')
                        ->where('fecha_notificacion', '<=', Carbon::now())
                        ->where('leida', false)
                        ->count()
                ]
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'No se pudo marcar la notificación como leída'
        ], 400);
    }
    
    /**
     * Marcar todas las notificaciones como leídas
     */
    public function marcarTodasLeidas()
    {
        $usuarioId = Auth::id();
        
        DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->where('fecha_notificacion', '<=', Carbon::now())
            ->where('leida', false)
            ->update([
                'leida' => true,
                'fecha_leida' => Carbon::now()
            ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Todas las notificaciones marcadas como leídas'
        ]);
    }
    
    /**
     * Eliminar una notificación
     */
    public function destroy($id)
    {
        $usuarioId = Auth::id();
        
        $actualizado = DB::table('notificaciones')
            ->where('id', $id)
            ->where('usuario_id', $usuarioId)
            ->update([
                'deleted_at' => Carbon::now(),
                'deleted_by' => $usuarioId
            ]);
        
        if ($actualizado) {
            return response()->json([
                'success' => true,
                'message' => 'Notificación eliminada',
                'meta' => [
                    'total_no_leidas' => DB::table('notificaciones')
                        ->where('usuario_id', $usuarioId)
                        ->whereNull('deleted_at')
                        ->where('fecha_notificacion', '<=', Carbon::now())
                        ->where('leida', false)
                        ->count()
                ]
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'No se pudo eliminar la notificación'
        ], 400);
    }
    
    /**
     * Obtener contador de notificaciones no leídas
     */
    public function contador()
    {
        $usuarioId = Auth::id();
        
        $totalNoLeidas = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->where('fecha_notificacion', '<=', Carbon::now())
            ->where('leida', false)
            ->count();
        
        return response()->json([
            'success' => true,
            'total_no_leidas' => $totalNoLeidas
        ]);
    }
    
    /**
     * Vista de notificaciones programadas
     */

    public function programadas(Request $request)
{
    $usuarioId = Auth::id();
    
    // Query para notificaciones programadas (futuras)
    $query = DB::table('notificaciones')
        ->where('usuario_id', $usuarioId)
        ->whereNull('deleted_at')
        ->where('fecha_notificacion', '>', Carbon::now()) // ← FUTURAS
        ->orderBy('fecha_notificacion', 'asc'); // Ordenar por fecha ascendente
    
    // Aplicar filtros si los hay
    if ($request->filled('tipo')) {
        $query->where('tipo', $request->tipo);
    }
    
    if ($request->filled('prioridad')) {
        $query->where('prioridad', $request->prioridad);
    }
    
    // Búsqueda
    if ($request->filled('busqueda')) {
        $busqueda = $request->busqueda;
        $query->where(function($q) use ($busqueda) {
            $q->where('titulo', 'like', "%{$busqueda}%")
              ->orWhere('mensaje', 'like', "%{$busqueda}%");
        });
    }
    
    // Paginación
    $programadas = $query->paginate(20);
    
    // Convertir booleanos
    $programadas->getCollection()->transform(function($notificacion) {
        $notificacion->leida = (bool) $notificacion->leida;
        $notificacion->fecha_programada = Carbon::parse($notificacion->fecha_notificacion);
        $notificacion->dias_faltantes = Carbon::now()->diffInDays($notificacion->fecha_programada, false);
        return $notificacion;
    });
    
    // Estadísticas
    $estadisticas = [
        'total' => DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->where('fecha_notificacion', '>', Carbon::now())
            ->count(),
        'hoy' => DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->whereDate('fecha_notificacion', Carbon::today())
            ->count(),
        'semana' => DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->whereBetween('fecha_notificacion', [Carbon::now(), Carbon::now()->addDays(7)])
            ->count(),
        'mes' => DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->whereBetween('fecha_notificacion', [Carbon::now(), Carbon::now()->addDays(30)])
            ->count(),
    ];
    
    return Inertia::render('Notificaciones/Programadas', [
        'programadas' => $programadas,
        'estadisticas' => $estadisticas,
        'filtros' => $request->only(['tipo', 'prioridad', 'busqueda']),
        'tipos' => $this->getTiposNotificaciones(),
    ]);
}

/**
 * Obtener lista de tipos de notificaciones
 */
private function getTiposNotificaciones()
{
    return [
        'lead_sin_contactar' => 'Lead sin contactar',
        'lead_proximo_contacto' => 'Próximo contacto',
        'presupuesto_por_vencer' => 'Presupuesto por vencer',
        'presupuesto_vencido' => 'Presupuesto vencido',
        'contrato_por_vencer' => 'Contrato por vencer',
        'recordatorio_seguimiento' => 'Recordatorio seguimiento',
        'asignacion_lead' => 'Asignación lead',
        'comentario_recordatorio' => 'Recordatorio comentario',
    ];
}



}