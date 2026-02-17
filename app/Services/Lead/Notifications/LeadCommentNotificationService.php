<?php

namespace App\Services\Lead\Notifications;

use App\Models\Comentario;
use App\Models\TipoComentario;
use App\Models\Lead;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LeadCommentNotificationService
{
    public function crearNotificacionRecordatorio(Comentario $comentario, TipoComentario $tipoComentario, int $diasRecordatorio, int $usuarioId): bool
    {
        try {
            // 1. Eliminar recordatorios futuros anteriores
            $this->eliminarRecordatoriosFuturos($comentario->lead_id, $usuarioId);
            
            $fechaNotificacion = now()->addDays($diasRecordatorio);
            $titulo = $tipoComentario ? 'Recordatorio: ' . $tipoComentario->nombre : 'Recordatorio de comentario';
            $mensaje = substr($comentario->comentario, 0, 150) . '...';
            
            // Determinar prioridad
            $prioridad = $this->determinarPrioridad($diasRecordatorio);
            
            // 2. Crear nuevo recordatorio
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
            
            Log::info('Recordatorio creado:', [
                'comentario_id' => $comentario->id,
                'lead_id' => $comentario->lead_id,
                'fecha_notificacion' => $fechaNotificacion
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Error al crear notificación:', [
                'comentario_id' => $comentario->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    public function crearNotificacionRecontacto(Lead $lead, string $fechaRecontacto, int $usuarioId, int $seguimientoId): bool
    {
        try {
            $fechaRecontactoObj = Carbon::parse($fechaRecontacto);
            $diasFaltantes = now()->diffInDays($fechaRecontactoObj, false);
            $prioridad = $this->determinarPrioridad($diasFaltantes);
            
            DB::table('notificaciones')->insert([
                'usuario_id' => $usuarioId,
                'titulo' => 'Posible recontacto de lead perdido',
                'mensaje' => "Lead: {$lead->nombre_completo} - Fecha sugerida para recontacto: {$fechaRecontactoObj->format('d/m/Y')}",
                'tipo' => 'lead_posible_recontacto',
                'entidad_tipo' => 'seguimiento_perdida',
                'entidad_id' => $seguimientoId,
                'leida' => false,
                'fecha_notificacion' => $fechaRecontactoObj,
                'prioridad' => $prioridad,
                'created' => now()
            ]);
            
            Log::info('Notificación de recontacto creada:', [
                'lead_id' => $lead->id,
                'seguimiento_id' => $seguimientoId,
                'fecha_recontacto' => $fechaRecontacto,
                'dias_faltantes' => $diasFaltantes
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Error al crear notificación de recontacto:', [
                'lead_id' => $lead->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    public function eliminarNotificacionesPendientes(int $leadId, int $usuarioId): int
    {
        try {
            $eliminadas = DB::table('notificaciones')
                ->where('usuario_id', $usuarioId)
                ->whereIn('tipo', ['comentario_recordatorio', 'lead_sin_contactar'])
                ->where('entidad_id', $leadId)
                ->where('leida', false)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'deleted_by' => $usuarioId
                ]);
            
            Log::info('Notificaciones eliminadas por rechazo:', [
                'lead_id' => $leadId,
                'eliminadas' => $eliminadas
            ]);
            
            return $eliminadas;
            
        } catch (\Exception $e) {
            Log::error('Error eliminando notificaciones por rechazo:', [
                'lead_id' => $leadId,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
    
    private function eliminarRecordatoriosFuturos(int $leadId, int $usuarioId): int
    {
        try {
            // Buscar todos los comentarios del lead
            $comentariosIds = DB::table('comentarios')
                ->where('lead_id', $leadId)
                ->whereNull('deleted_at')
                ->pluck('id')
                ->toArray();
            
            $eliminados = 0;
            
            // 1. Eliminar recordatorios de comentarios futuros
            if (!empty($comentariosIds)) {
                $eliminadosComentarios = DB::table('notificaciones')
                    ->where('usuario_id', $usuarioId)
                    ->where('tipo', 'comentario_recordatorio')
                    ->whereIn('entidad_id', $comentariosIds)
                    ->where('entidad_tipo', 'comentario')
                    ->where('fecha_notificacion', '>', now())
                    ->whereNull('deleted_at')
                    ->update([
                        'deleted_at' => now(),
                        'deleted_by' => $usuarioId
                    ]);
                
                $eliminados += $eliminadosComentarios;
            }
            
            // 2. Eliminar notificación de lead_sin_contactar futura
            $eliminadosLeadSinContactar = DB::table('notificaciones')
                ->where('usuario_id', $usuarioId)
                ->where('tipo', 'lead_sin_contactar')
                ->where('entidad_id', $leadId)
                ->where('entidad_tipo', 'lead')
                ->where('fecha_notificacion', '>', now())
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'deleted_by' => $usuarioId
                ]);
            
            $eliminados += $eliminadosLeadSinContactar;
            
            Log::info('Recordatorios futuros eliminados', [
                'lead_id' => $leadId,
                'usuario_id' => $usuarioId,
                'total_eliminados' => $eliminados
            ]);
            
            return $eliminados;
            
        } catch (\Exception $e) {
            Log::error('Error al eliminar recordatorios futuros:', [
                'lead_id' => $leadId,
                'usuario_id' => $usuarioId,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
    
    private function determinarPrioridad(int $dias): string
    {
        if ($dias <= 2) {
            return 'urgente';
        } elseif ($dias <= 7) {
            return 'alta';
        } else {
            return 'normal';
        }
    }
}