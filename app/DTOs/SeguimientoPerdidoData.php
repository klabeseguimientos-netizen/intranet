<?php

namespace App\DTOs;

class SeguimientoPerdidoData
{
    public function __construct(
        public readonly int $leadId,
        public readonly string $comentario,
        public readonly int $tipoComentarioId,
        public readonly bool $creaRecordatorio,
        public readonly ?string $fechaRecordatorio,
        public readonly bool $cambiarEstadoLead,
        public readonly int $usuarioId,
    ) {}

    public static function fromRequest(array $validatedData, int $leadId, int $usuarioId): self
    {
        return new self(
            leadId: $leadId,
            comentario: $validatedData['comentario'],
            tipoComentarioId: $validatedData['tipo_comentario_id'],
            creaRecordatorio: $validatedData['crea_recordatorio'] ?? false,
            fechaRecordatorio: $validatedData['fecha_recordatorio'] ?? null,
            cambiarEstadoLead: $validatedData['cambiar_estado_lead'] ?? false,
            usuarioId: $usuarioId
        );
    }
}