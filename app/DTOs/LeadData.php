<?php

namespace App\DTOs;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class LeadData
{
    public function __construct(
        public readonly ?int $prefijoId,
        public readonly string $nombreCompleto,
        public readonly string $genero,
        public readonly ?string $telefono,
        public readonly ?string $email,
        public readonly ?int $localidadId,
        public readonly ?int $rubroId,
        public readonly int $origenId,
        public readonly ?string $notaObservacion,
        public readonly string $notaTipo,
        public readonly int $usuarioId,
        public readonly CarbonInterface $fechaCreacion
    ) {}

    public static function fromRequest(array $validatedData, int $usuarioId): self
    {
        return new self(
            prefijoId: $validatedData['prefijo_id'] ?? null,
            nombreCompleto: $validatedData['nombre_completo'],
            genero: $validatedData['genero'],
            telefono: $validatedData['telefono'] ?? null,
            email: $validatedData['email'] ?? null,
            localidadId: $validatedData['localidad_id'] ?? null,
            rubroId: $validatedData['rubro_id'] ?? null,
            origenId: $validatedData['origen_id'],
            notaObservacion: $validatedData['nota']['observacion'] ?? null,
            notaTipo: $validatedData['nota']['tipo'] ?? 'observacion_inicial',
            usuarioId: $usuarioId,
            fechaCreacion: now()
        );
    }

    public function toLeadArray(): array
    {
        return [
            'prefijo_id' => $this->prefijoId,
            'nombre_completo' => $this->nombreCompleto,
            'genero' => $this->genero,
            'telefono' => $this->telefono,
            'email' => $this->email,
            'localidad_id' => $this->localidadId,
            'rubro_id' => $this->rubroId,
            'origen_id' => $this->origenId,
            'estado_lead_id' => 1,
            'es_cliente' => false,
            'es_activo' => true,
            'created' => $this->fechaCreacion,
            'created_by' => $this->usuarioId,
            'modified' => $this->fechaCreacion,
            'modified_by' => $this->usuarioId,
        ];
    }

    public function shouldCreateNote(): bool
    {
        return !empty($this->notaObservacion);
    }

    public function getNoteData(int $leadId): array
    {
        return [
            'lead_id' => $leadId,
            'usuario_id' => $this->usuarioId,
            'observacion' => $this->notaObservacion,
            'tipo' => $this->notaTipo,
            'created' => $this->fechaCreacion,
        ];
    }
}