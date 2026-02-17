<?php

namespace App\DTOs;

class CommentData
{
    public function __construct(
        public readonly int $leadId,
        public readonly string $comentario,
        public readonly int $tipoComentarioId,
        public readonly int $usuarioId,
        public readonly bool $creaRecordatorio = false,
        public readonly ?int $diasRecordatorio = null,
        public readonly bool $cambiarEstadoLead = false,
        public readonly ?int $motivoPerdidaId = null,
        public readonly ?string $posibilidadesFuturas = null,
        public readonly ?string $fechaPosibleRecontacto = null,
        public readonly ?string $notasAdicionales = null,
    ) {}

    public static function fromRequest(array $validatedData, int $leadId, int $usuarioId): self
    {
        return new self(
            leadId: $leadId,
            comentario: $validatedData['comentario'],
            tipoComentarioId: $validatedData['tipo_comentario_id'],
            usuarioId: $usuarioId,
            creaRecordatorio: $validatedData['crea_recordatorio'] ?? false,
            diasRecordatorio: $validatedData['dias_recordatorio'] ?? null,
            cambiarEstadoLead: $validatedData['cambiar_estado_lead'] ?? false,
            motivoPerdidaId: $validatedData['motivo_perdida_id'] ?? null,
            posibilidadesFuturas: $validatedData['posibilidades_futuras'] ?? null,
            fechaPosibleRecontacto: $validatedData['fecha_posible_recontacto'] ?? null,
            notasAdicionales: $validatedData['notas_adicionales'] ?? null,
        );
    }

    public function esRechazo(): bool
    {
        // Asumiendo que el ID de rechazo es conocido o puedes consultarlo
        return $this->motivoPerdidaId !== null;
    }
}