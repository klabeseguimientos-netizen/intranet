<?php

namespace App\Services\Lead;

use App\DTOs\LeadData;
use App\Models\Lead;
use App\Models\NotaLead;
use App\Models\Usuario;
use App\Models\Comercial;
use App\Services\Lead\Notifications\LeadAssignmentNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeadCreationService
{
    public function __construct(
        private LeadAssignmentNotificationService $notificationService
    ) {}

    public function createLead(LeadData $leadData): int
    {
        DB::beginTransaction();

        try {
            // 1. Determinar prefijo_id si es comercial
            $leadData = $this->determinePrefijoForComercial($leadData);
            
            // 2. Crear el lead usando Eloquent
            $lead = Lead::create($leadData->toLeadArray());
            $leadId = $lead->id;

            Log::info('Lead creado', ['lead_id' => $leadId]);

            // 3. Crear nota si existe
            $notaCreada = $this->createInitialNote($leadId, $leadData);

            // 4. Crear notificaciones
            $this->createNotifications($leadId, $leadData);

            DB::commit();

            return $leadId;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creando lead: ' . $e->getMessage(), [
                'lead_data' => $leadData->toLeadArray(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    private function determinePrefijoForComercial(LeadData $leadData): LeadData
    {
        // Si ya tiene prefijo, mantenerlo
        if ($leadData->prefijoId) {
            return $leadData;
        }

        // Verificar si el usuario es comercial usando Eloquent
        $usuario = Usuario::with('personal.comercial')
            ->find($leadData->usuarioId);

        if ($usuario && $usuario->rol_id == 5) { // rol_id 5 = comercial
            $comercial = $usuario->personal->comercial ?? null;

            if ($comercial && $comercial->prefijo_id) {
                // Retornar nuevo DTO con prefijo actualizado
                return new LeadData(
                    prefijoId: $comercial->prefijo_id,
                    nombreCompleto: $leadData->nombreCompleto,
                    genero: $leadData->genero,
                    telefono: $leadData->telefono,
                    email: $leadData->email,
                    localidadId: $leadData->localidadId,
                    rubroId: $leadData->rubroId,
                    origenId: $leadData->origenId,
                    notaObservacion: $leadData->notaObservacion,
                    notaTipo: $leadData->notaTipo,
                    usuarioId: $leadData->usuarioId,
                    fechaCreacion: $leadData->fechaCreacion
                );
            }
        }

        return $leadData;
    }

    private function createInitialNote(int $leadId, LeadData $leadData): bool
    {
        if (!$leadData->shouldCreateNote()) {
            return false;
        }

        NotaLead::create($leadData->getNoteData($leadId));

        Log::info('Nota creada para lead', ['lead_id' => $leadId]);
        return true;
    }

    private function createNotifications(int $leadId, LeadData $leadData): void
    {
        if (!$leadData->prefijoId) {
            Log::warning('Lead creado sin prefijo_id, no se crearán notificaciones', [
                'lead_id' => $leadId
            ]);
            return;
        }

        $this->notificationService->createLeadNotifications($leadId, $leadData);
    }
}