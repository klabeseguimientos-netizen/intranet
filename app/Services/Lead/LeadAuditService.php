<?php

namespace App\Services\Lead;

use App\Models\Lead;
use App\Models\EstadoLead;
use App\Models\MotivoPerdida;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeadAuditService
{
    /**
     * Registrar cambio de estado en auditoría
     */
    public function registrarCambioEstado(
        int $leadId, 
        ?EstadoLead $estadoAnterior, 
        EstadoLead $nuevoEstado, 
        int $usuarioId,
        string $razon
    ): void {
        try {
            $estadoAnteriorId = $estadoAnterior ? $estadoAnterior->id : null;
            $estadoAnteriorNombre = $estadoAnterior ? $estadoAnterior->nombre : 'Nuevo';
            
            // Verificar si ya existe un log idéntico reciente
            $logExistente = DB::table('auditoria_log')
                ->where('tabla_afectada', 'leads')
                ->where('registro_id', $leadId)
                ->where('accion', 'UPDATE')
                ->whereJsonContains('valores_nuevos', ['estado_lead_id' => $nuevoEstado->id])
                ->where('created', '>=', now()->subMinutes(5))
                ->first();
            
            if ($logExistente) {
                return;
            }
            
            DB::table('auditoria_log')->insert([
                'tabla_afectada' => 'leads',
                'registro_id' => $leadId,
                'accion' => 'UPDATE',
                'usuario_id' => $usuarioId,
                'valores_anteriores' => json_encode([
                    'estado_lead_id' => $estadoAnteriorId,
                    'estado_anterior_nombre' => $estadoAnteriorNombre,
                ]),
                'valores_nuevos' => json_encode([
                    'estado_lead_id' => $nuevoEstado->id,
                    'estado_nuevo_nombre' => $nuevoEstado->nombre,
                    'razon_cambio' => $razon,
                    'cambio_automatico' => true,
                    'fecha_cambio' => now()->toDateTimeString(),
                    'usuario_id' => $usuarioId
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error al registrar auditoría:', [
                'lead_id' => $leadId,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Registrar auditoría de rechazo de lead
     */
    public function registrarRechazoLead(Lead $lead, int $usuarioId, array $data, int $comentarioId): void
    {
        try {
            $estadoPerdido = EstadoLead::where('nombre', 'Perdido')->first();
            if (!$estadoPerdido) {
                Log::error('Estado "Perdido" no encontrado');
                return;
            }
            
            $estadoAnterior = EstadoLead::find($lead->getOriginal('estado_lead_id'));
            $motivo = MotivoPerdida::find($data['motivo_perdida_id']);
            
            DB::table('auditoria_log')->insert([
                'tabla_afectada' => 'leads',
                'registro_id' => $lead->id,
                'accion' => 'UPDATE',
                'usuario_id' => $usuarioId,
                'valores_anteriores' => json_encode([
                    'estado_lead_id' => $lead->getOriginal('estado_lead_id'),
                    'estado_anterior_nombre' => $estadoAnterior->nombre ?? 'Desconocido',
                ]),
                'valores_nuevos' => json_encode([
                    'estado_lead_id' => $estadoPerdido->id,
                    'estado_nuevo_nombre' => $estadoPerdido->nombre,
                    'razon_cambio' => 'Rechazo lead',
                    'cambio_automatico' => true,
                    'motivo_perdida_id' => $data['motivo_perdida_id'],
                    'motivo_perdida_nombre' => $motivo ? $motivo->nombre : 'Desconocido',
                    'posibilidades_futuras' => $data['posibilidades_futuras'] ?? 'no',
                    'fecha_posible_recontacto' => $data['fecha_posible_recontacto'] ?? null,
                    'comentario_id' => $comentarioId,
                    'fecha_rechazo' => now()->toDateTimeString()
                ]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created' => now(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error registrando auditoría de rechazo:', [
                'lead_id' => $lead->id,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Obtener logs de auditoría de un lead
     */
    public function getAuditoriaLead(int $leadId): array
    {
        return DB::table('auditoria_log')
            ->where('tabla_afectada', 'leads')
            ->where('registro_id', $leadId)
            ->orderBy('created', 'desc')
            ->get()
            ->map(function ($log) {
                $log->valores_anteriores = json_decode($log->valores_anteriores, true);
                $log->valores_nuevos = json_decode($log->valores_nuevos, true);
                return $log;
            })
            ->toArray();
    }
}