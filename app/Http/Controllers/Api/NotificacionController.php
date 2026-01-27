<?php
// app/Http/Controllers/Api/NotificacionController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    /**
     * Obtener notificaciones del usuario autenticado
     */
    public function index(Request $request)
    {
        $usuarioId = Auth::id();
        
        if (!$usuarioId) {
            return response()->json([
                'success' => false,
                'error' => 'No autenticado'
            ], 401);
        }
        
        $query = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->orderBy('fecha_notificacion', 'desc');
        
        // Filtros
        if ($request->has('no_leidas') && $request->boolean('no_leidas')) {
            $query->where('leida', false);
        }
        
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        if ($request->has('prioridad')) {
            $query->where('prioridad', $request->prioridad);
        }
        
        // Obtener resultados
        if ($request->has('limit')) {
            $notificaciones = $query->limit($request->limit)->get();
        } else {
            $notificaciones = $query->paginate($request->get('per_page', 20));
        }
        
        // Convertir booleanos (MySQL devuelve 0/1)
        $notificaciones = $notificaciones->map(function($notificacion) {
            $notificacion->leida = (bool) $notificacion->leida;
            return $notificacion;
        });
        
        // Contar no leídas
        $sinLeer = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->where('leida', false)
            ->whereNull('deleted_at')
            ->count();
        
        return response()->json([
            'success' => true,
            'data' => $notificaciones,
            'meta' => [
                'total_no_leidas' => $sinLeer,
                'total' => is_array($notificaciones) ? count($notificaciones) : $notificaciones->count()
            ]
        ]);
    }
    
    /**
     * Obtener contador de notificaciones no leídas
     */
    public function contador()
    {
        $usuarioId = Auth::id();
        
        if (!$usuarioId) {
            return response()->json([
                'success' => false,
                'error' => 'No autenticado'
            ], 401);
        }
        
        $total = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->where('leida', false)
            ->whereNull('deleted_at') 
            ->count();
        
        // Contar por prioridad
        $porPrioridad = DB::table('notificaciones')
            ->where('usuario_id', $usuarioId)
            ->where('leida', false)
            ->whereNull('deleted_at') 
            ->select('prioridad', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('prioridad')
            ->get()
            ->pluck('cantidad', 'prioridad')
            ->toArray();
        
        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'por_prioridad' => $porPrioridad
            ]
        ]);
    }
    
    /**
     * Marcar notificación como leída
     */
    public function marcarLeida($id)
    {
        $usuarioId = Auth::id();
        
        if (!$usuarioId) {
            return response()->json([
                'success' => false,
                'error' => 'No autenticado'
            ], 401);
        }
        
        try {
            // Primero verificar que la notificación existe y pertenece al usuario
            $notificacion = DB::table('notificaciones')
                ->where('id', $id)
                ->where('usuario_id', $usuarioId)
                ->whereNull('deleted_at')
                ->first();
            
            if (!$notificacion) {
                return response()->json([
                    'success' => false,
                    'error' => 'Notificación no encontrada o no autorizada'
                ], 404);
            }
            
            // Actualizar la notificación
            $actualizado = DB::table('notificaciones')
                ->where('id', $id)
                ->where('usuario_id', $usuarioId)
                ->whereNull('deleted_at')
                ->update([
                    'leida' => 1, // Usar 1 para MySQL
                    'fecha_leida' => now()
                ]);
            
            if ($actualizado) {
                // Devolver datos actualizados
                $notificacionActualizada = DB::table('notificaciones')
                    ->where('id', $id)
                    ->first();
                
                // Contar notificaciones no leídas actualizadas
                $sinLeer = DB::table('notificaciones')
                    ->where('usuario_id', $usuarioId)
                    ->where('leida', false)
                    ->whereNull('deleted_at')
                    ->count();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Notificación marcada como leída',
                    'data' => [
                        'id' => $id,
                        'leida' => true,
                        'fecha_leida' => now()->toDateTimeString()
                    ],
                    'meta' => [
                        'total_no_leidas' => $sinLeer
                    ]
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'No se pudo actualizar la notificación'
            ], 500);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error del servidor: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Marcar todas las notificaciones como leídas
     */
    public function marcarTodasLeidas()
    {
        $usuarioId = Auth::id();
        
        if (!$usuarioId) {
            return response()->json([
                'success' => false,
                'error' => 'No autenticado'
            ], 401);
        }
        
        try {
            // Contar cuántas se van a actualizar
            $porActualizar = DB::table('notificaciones')
                ->where('usuario_id', $usuarioId)
                ->where('leida', false)
                ->whereNull('deleted_at')
                ->count();
            
            if ($porActualizar === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'No hay notificaciones por marcar como leídas',
                    'actualizadas' => 0
                ]);
            }
            
            // Actualizar todas
            $actualizadas = DB::table('notificaciones')
                ->where('usuario_id', $usuarioId)
                ->where('leida', false)
                ->whereNull('deleted_at')
                ->update([
                    'leida' => 1,
                    'fecha_leida' => now()
                ]);
            
            if ($actualizadas) {
                return response()->json([
                    'success' => true,
                    'message' => "{$actualizadas} notificaciones marcadas como leídas",
                    'actualizadas' => $actualizadas,
                    'meta' => [
                        'total_no_leidas' => 0
                    ]
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'No se pudieron actualizar las notificaciones'
            ], 500);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error del servidor: ' . $e->getMessage()
            ], 500);
        }
    }
    public function destroy($id)
    {
        $usuarioId = Auth::id();
        
        if (!$usuarioId) {
            return response()->json([
                'success' => false,
                'error' => 'No autenticado'
            ], 401);
        }
        
        try {
            // Primero verificar que la notificación existe y pertenece al usuario
            $notificacion = DB::table('notificaciones')
                ->where('id', $id)
                ->where('usuario_id', $usuarioId)
                ->first();
            
            if (!$notificacion) {
                return response()->json([
                    'success' => false,
                    'error' => 'Notificación no encontrada o no autorizada'
                ], 404);
            }
            
            // Eliminar la notificación (soft delete si tienes deleted_at)
            $eliminada = DB::table('notificaciones')
                ->where('id', $id)
                ->where('usuario_id', $usuarioId)
                ->update([
                    'deleted_at' => now(),
                    'deleted_by' => $usuarioId
                ]);
            
            // O si no tienes soft delete, eliminar permanentemente:
            // $eliminada = DB::table('notificaciones')
            //     ->where('id', $id)
            //     ->where('usuario_id', $usuarioId)
            //     ->delete();
            
            if ($eliminada) {
                // Contar notificaciones no leídas actualizadas
                $sinLeer = DB::table('notificaciones')
                    ->where('usuario_id', $usuarioId)
                    ->where('leida', false)
                    ->whereNull('deleted_at') // Solo las no eliminadas
                    ->count();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Notificación eliminada',
                    'meta' => [
                        'total_no_leidas' => $sinLeer
                    ]
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'No se pudo eliminar la notificación'
            ], 500);
            
        } catch (\Exception $e) {
            \Log::error('Error eliminando notificación', [
                'id' => $id,
                'usuario_id' => $usuarioId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Error del servidor: ' . $e->getMessage()
            ], 500);
        }
    }
}