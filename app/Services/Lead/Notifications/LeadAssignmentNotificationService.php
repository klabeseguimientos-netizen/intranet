<?php

namespace App\Services\Lead\Notifications;

use App\DTOs\LeadData;
use App\Models\Notificacion;
use App\Models\Comercial;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LeadAssignmentNotificationService
{
    public function createLeadNotifications(int $leadId, LeadData $leadData): void
    {
        $comercialUsuarioId = $this->getComercialUserId($leadData->prefijoId);

        if (!$comercialUsuarioId) {
            Log::warning('No se encontró comercial asignado', [
                'prefijo_id' => $leadData->prefijoId,
                'lead_id' => $leadId
            ]);
            return;
        }

        // Notificación de asignación (si no es auto-asignación)
        if ($leadData->usuarioId != $comercialUsuarioId) {
            $this->createAssignmentNotification($comercialUsuarioId, $leadId, $leadData->nombreCompleto);
        }

        // Notificación programada para 3 días
        $this->createScheduledNotification($comercialUsuarioId, $leadId, $leadData->nombreCompleto);
    }

    private function getComercialUserId(int $prefijoId): ?int
    {
        $comercial = Comercial::with('personal.usuario')
            ->where('prefijo_id', $prefijoId)
            ->where('activo', 1)
            ->first();

        return $comercial->personal->usuario->id ?? null;
    }

    private function createAssignmentNotification(int $usuarioId, int $leadId, string $leadName): void
    {
        Notificacion::create([
            'usuario_id' => $usuarioId,
            'titulo' => 'Nuevo lead asignado',
            'mensaje' => 'Se te ha asignado un nuevo lead: ' . $leadName,
            'tipo' => 'asignacion_lead',
            'entidad_tipo' => 'lead',
            'entidad_id' => $leadId,
            'leida' => false,
            'fecha_notificacion' => now(),
            'prioridad' => 'alta',
        ]);

        Log::info('Notificación de asignación creada', [
            'usuario_id' => $usuarioId,
            'lead_id' => $leadId
        ]);
    }

    private function createScheduledNotification(int $usuarioId, int $leadId, string $leadName): void
    {
        Notificacion::create([
            'usuario_id' => $usuarioId,
            'titulo' => 'Lead sin contactar',
            'mensaje' => 'El lead "' . $leadName . '" fue asignado hace 3 días y aún no ha sido contactado.',
            'tipo' => 'lead_sin_contactar',
            'entidad_tipo' => 'lead',
            'entidad_id' => $leadId,
            'leida' => false,
            'fecha_notificacion' => Carbon::now()->addDays(3),
            'prioridad' => 'urgente',
        ]);

        Log::info('Notificación programada creada', [
            'usuario_id' => $usuarioId,
            'lead_id' => $leadId,
            'fecha_programada' => Carbon::now()->addDays(3)
        ]);
    }
}