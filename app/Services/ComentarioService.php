<?php
// app/Services/ComentarioService.php

namespace App\Services;

use App\Models\Comentario;
use App\Models\Lead;
use App\Models\Notificacion;
use App\Models\TipoComentario;
use App\Models\EstadoLead;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ComentarioService
{
    /**
     * Crear un comentario con sus respectivas notificaciones y cambios de estado
     */
    public function crearComentarioConNotificaciones(array $data, int $leadId, int $usuarioId): array
    {
        return DB::transaction(function () use ($data, $leadId, $usuarioId) {
            // 1. Obtener el tipo de comentario
            $tipoComentario = TipoComentario::find($data['tipo_comentario_id']);
            
            // 2. Crear el comentario
            $comentario = Comentario::create([
                'lead_id' => $leadId,
                'usuario_id' => $usuarioId,
                'tipo_comentario_id' => $data['tipo_comentario_id'],
                'comentario' => $data['comentario'],
                'created' => now(),
            ]);
            
            $resultados = [
                'comentario' => $comentario,
                'notificaciones_creadas' => [],
                'estado_cambiado' => false,
            ];
            
            // 3. Crear notificación si corresponde
            if (isset($data['crea_recordatorio']) && $data['crea_recordatorio'] && 
                $data['dias_recordatorio'] > 0 && $data['dias_recordatorio'] <= 90) {
                
                $fechaRecordatorio = now()->addDays($data['dias_recordatorio']);
                
                $notificacion = Notificacion::create([
                    'usuario_id' => $usuarioId,
                    'titulo' => 'Recordatorio: ' . $tipoComentario->nombre,
                    'mensaje' => 'Recordatorio para el comentario: ' . substr($data['comentario'], 0, 100) . '...',
                    'tipo' => 'comentario_recordatorio',
                    'entidad_tipo' => 'comentario',
                    'entidad_id' => $comentario->id,
                    'leida' => false,
                    'fecha_notificacion' => $fechaRecordatorio,
                    'prioridad' => $this->determinarPrioridad($data['dias_recordatorio']),
                    'created' => now(),
                ]);
                
                $resultados['notificaciones_creadas'][] = $notificacion;
            }
            
            // 4. Cambiar estado del lead si corresponde
            if (isset($data['cambiar_estado_lead']) && $data['cambiar_estado_lead']) {
                $estadoCambiado = $this->cambiarEstadoLeadAutomaticamente(
                    $leadId, 
                    $tipoComentario,
                    $usuarioId
                );
                
                if ($estadoCambiado) {
                    $resultados['estado_cambiado'] = true;
                    $resultados['nuevo_estado'] = $estadoCambiado;
                }
            }
            
            return $resultados;
        });
    }
    
    /**
     * Determinar prioridad según días para recordatorio
     */
    private function determinarPrioridad(int $dias): string
    {
        if ($dias <= 2) return 'normal';
        if ($dias <= 7) return 'normal';
        if ($dias <= 30) return 'normal';
        return 'normal';
    }
    
    /**
     * Cambiar estado del lead automáticamente según el tipo de comentario
     */
    private function cambiarEstadoLeadAutomaticamente(int $leadId, TipoComentario $tipoComentario, int $usuarioId): ?EstadoLead
    {
        $lead = Lead::find($leadId);
        if (!$lead) return null;
        
        $estadoId = null;
        
        // Mapear tipo de comentario a estado de lead
        switch ($tipoComentario->nombre) {
            case 'Contacto inicial':
                $estadoId = 2; // Contactado
                break;
            case 'Seguimiento lead':
                $estadoId = 3; // Calificado
                break;
            case 'Negociación':
                $estadoId = 5; // Negociación
                break;
            case 'Propuesta enviada':
                $estadoId = 4; // Propuesta Enviada
                break;
        }
        
        if ($estadoId && $lead->estado_lead_id !== $estadoId) {
            // Guardar estado anterior para auditoría
            $estadoAnterior = $lead->estado_lead_id;
            
            // Actualizar estado
            $lead->estado_lead_id = $estadoId;
            $lead->save();
            
            // Registrar en auditoría
            $this->registrarCambioEstadoAuditoria(
                $leadId,
                $estadoAnterior,
                $estadoId,
                $usuarioId,
                $tipoComentario->nombre
            );
            
            return EstadoLead::find($estadoId);
        }
        
        return null;
    }
    
    /**
     * Registrar cambio de estado en auditoría
     */
    private function registrarCambioEstadoAuditoria(
        int $leadId, 
        int $estadoAnteriorId, 
        int $estadoNuevoId, 
        int $usuarioId,
        string $razon
    ): void {
        DB::table('auditoria_log')->insert([
            'tabla_afectada' => 'leads',
            'registro_id' => $leadId,
            'accion' => 'UPDATE',
            'usuario_id' => $usuarioId,
            'valores_anteriores' => json_encode([
                'estado_lead_id' => $estadoAnteriorId,
                'estado_anterior_nombre' => EstadoLead::find($estadoAnteriorId)->nombre ?? 'Desconocido',
            ]),
            'valores_nuevos' => json_encode([
                'estado_lead_id' => $estadoNuevoId,
                'estado_nuevo_nombre' => EstadoLead::find($estadoNuevoId)->nombre ?? 'Desconocido',
                'razon_cambio' => $razon,
                'cambio_automatico' => true,
            ]),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created' => now(),
        ]);
    }
    
    /**
     * Calcular tiempos entre estados
     */
    public function calcularTiemposEntreEstados(int $leadId): array
    {
        $logs = DB::table('auditoria_log')
            ->where('tabla_afectada', 'leads')
            ->where('registro_id', $leadId)
            ->where('accion', 'UPDATE')
            ->whereNotNull('valores_nuevos->estado_lead_id')
            ->orderBy('created')
            ->get();
        
        $tiempos = [];
        $estadoAnterior = null;
        $fechaAnterior = null;
        
        foreach ($logs as $log) {
            $valoresNuevos = json_decode($log->valores_nuevos, true);
            $estadoActual = $valoresNuevos['estado_nuevo_nombre'] ?? 'Desconocido';
            
            if ($estadoAnterior !== null && $fechaAnterior !== null) {
                $diferencia = Carbon::parse($fechaAnterior)->diff(Carbon::parse($log->created));
                
                $tiempos[] = [
                    'desde' => $estadoAnterior,
                    'hasta' => $estadoActual,
                    'dias' => $diferencia->days,
                    'horas' => $diferencia->h,
                    'minutos' => $diferencia->i,
                    'fecha_cambio' => $log->created,
                ];
            }
            
            $estadoAnterior = $estadoActual;
            $fechaAnterior = $log->created;
        }
        
        return $tiempos;
    }
}