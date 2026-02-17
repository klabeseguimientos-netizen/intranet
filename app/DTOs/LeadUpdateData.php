<?php

namespace App\DTOs;

use Carbon\CarbonInterface;

class LeadUpdateData
{
    public function __construct(
        public readonly int $leadId,
        public readonly ?string $nombreCompleto,
        public readonly ?string $genero,
        public readonly ?string $telefono,
        public readonly ?string $email,
        public readonly ?int $localidadId,
        public readonly ?int $rubroId,
        public readonly ?int $origenId,
        public readonly ?int $estadoLeadId,
        public readonly int $usuarioId,
        public readonly CarbonInterface $fechaModificacion
    ) {}

    public static function fromRequest(array $validatedData, int $leadId, int $usuarioId): self
    {
        return new self(
            leadId: $leadId,
            nombreCompleto: $validatedData['nombre_completo'] ?? null,
            genero: $validatedData['genero'] ?? null,
            telefono: $validatedData['telefono'] ?? null,
            email: $validatedData['email'] ?? null,
            localidadId: $validatedData['localidad_id'] ?? null,
            rubroId: $validatedData['rubro_id'] ?? null,
            origenId: $validatedData['origen_id'] ?? null,
            estadoLeadId: $validatedData['estado_lead_id'] ?? null,
            usuarioId: $usuarioId,
            fechaModificacion: now()
        );
    }

    public function hasChanges(): bool
    {
        return !is_null($this->nombreCompleto) ||
               !is_null($this->genero) ||
               !is_null($this->telefono) ||
               !is_null($this->email) ||
               !is_null($this->localidadId) ||
               !is_null($this->rubroId) ||
               !is_null($this->origenId) ||
               !is_null($this->estadoLeadId);
    }

    public function toArray(): array
    {
        $data = array_filter([
            'nombre_completo' => $this->nombreCompleto,
            'genero' => $this->genero,
            'telefono' => $this->telefono,
            'email' => $this->email,
            'localidad_id' => $this->localidadId,
            'rubro_id' => $this->rubroId,
            'origen_id' => $this->origenId,
            'estado_lead_id' => $this->estadoLeadId,
            'modified' => $this->fechaModificacion,
            'modified_by' => $this->usuarioId,
        ], fn($value) => !is_null($value));

        return $data;
    }
}