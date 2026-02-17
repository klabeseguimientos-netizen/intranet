<?php

namespace App\Services\LeadPerdido;

use App\Models\Lead;
use App\Models\EstadoLead;
use App\Models\TipoComentario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeadPerdidoStateService
{
    protected LeadPerdidoNotificationService $notificationService;

    public function __construct(LeadPerdidoNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Mapa de tipos de comentario a estados
     */
    protected array $estadoMap = [
        'Recontacto exitoso' => 'Recontactando',
        'Nueva información enviada' => 'Info Enviada',
        'Reagendado' => 'Reagendado',
        'Rechazo definitivo' => 'Perdido',
    ];

    /**
     * Cambiar estado del lead según tipo de comentario
     */
    public function cambiarEstadoPorComentario(
        Lead $lead,
        TipoComentario $tipoComentario,
        int $usuarioId
    ): bool {
        $nuevoEstadoNombre = $this->estadoMap[$tipoComentario->nombre] ?? null;

        if (!$nuevoEstadoNombre) {
            return false;
        }

        $nuevoEstado = EstadoLead::where('nombre', $nuevoEstadoNombre)->first();

        if (!$nuevoEstado || $lead->estado_lead_id == $nuevoEstado->id) {
            return false;
        }

        $estadoAnterior = EstadoLead::find($lead->estado_lead_id);

        DB::beginTransaction();
        try {
            $lead->cambiarEstado($nuevoEstado->id, $usuarioId);

            if ($tipoComentario->nombre === 'Rechazo definitivo') {
                $this->notificationService->eliminarNotificacionesPendientes($lead->id, $usuarioId);
            }

            $this->registrarCambioAuditoria(
                $lead->id,
                $estadoAnterior,
                $nuevoEstado,
                $usuarioId,
                'Seguimiento: ' . $tipoComentario->nombre
            );

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al cambiar estado por comentario:', [
                'lead_id' => $lead->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Registrar cambio de estado en auditoría
     */
    public function registrarCambioAuditoria(
        int $leadId,
        ?EstadoLead $estadoAnterior,
        EstadoLead $nuevoEstado,
        int $usuarioId,
        string $razon
    ): void {
        try {
            $valoresAnteriores = [
                'estado_lead_id' => $estadoAnterior?->id,
                'estado_anterior_nombre' => $estadoAnterior?->nombre ?? 'Nuevo',
            ];

            $valoresNuevos = [
                'estado_lead_id' => $nuevoEstado->id,
                'estado_nuevo_nombre' => $nuevoEstado->nombre,
                'razon_cambio' => $razon,
                'cambio_automatico' => true,
                'fecha_cambio' => now()->toDateTimeString(),
                'usuario_id' => $usuarioId
            ];

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

        } catch (\Exception $e) {
            Log::error('Error al registrar auditoría:', [
                'lead_id' => $leadId,
                'error' => $e->getMessage()
            ]);
        }
    }
}