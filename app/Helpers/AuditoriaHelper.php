<?php
// app/Helpers/AuditoriaHelper.php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AuditoriaHelper
{
    /**
     * Registrar cambio de estado de lead en auditoría
     */
    public static function registrarCambioEstadoLead(
        int $leadId,
        ?int $estadoAnteriorId,
        int $estadoNuevoId,
        int $usuarioId,
        string $razon
    ): void {
        // Obtener nombres de estados
        $estadoAnteriorNombre = DB::table('estados_lead')
            ->where('id', $estadoAnteriorId)
            ->value('nombre') ?? 'Desconocido';
            
        $estadoNuevoNombre = DB::table('estados_lead')
            ->where('id', $estadoNuevoId)
            ->value('nombre') ?? 'Desconocido';
        
        // Registrar en auditoría
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
                'estado_lead_id' => $estadoNuevoId,
                'estado_nuevo_nombre' => $estadoNuevoNombre,
                'razon_cambio' => $razon,
                'cambio_automatico' => true,
                'fecha_cambio' => now()->toDateTimeString(),
            ]),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created' => now(),
        ]);
    }
}