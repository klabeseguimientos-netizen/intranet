<?php
// app/Services/Presupuesto/PresupuestoNotificationService.php

namespace App\Services\Presupuesto;

use App\Models\Presupuesto;
use App\Models\Notificacion;
use App\Models\Comercial;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PresupuestoNotificationService
{
    /**
     * Crear notificación cuando se crea un presupuesto
     */
    public function notificarPresupuestoCreado(Presupuesto $presupuesto): void
    {
        $usuarioId = $presupuesto->created_by;
        $referencia = $this->getReferencia($presupuesto);
        $diasValidez = $this->calcularDiasValidez($presupuesto);
        
        Notificacion::create([
            'usuario_id' => $usuarioId,
            'titulo' => '📋 Nuevo presupuesto creado',
            'mensaje' => "Se ha creado el presupuesto {$referencia} para {$presupuesto->lead->nombre_completo}. Vence en {$diasValidez} días.",
            'tipo' => 'presupuesto_por_vencer',
            'entidad_tipo' => 'presupuesto',
            'entidad_id' => $presupuesto->id,
            'leida' => false,
            'fecha_notificacion' => now(),
            'prioridad' => 'normal',
            'created' => now()
        ]);

        Log::info('Notificación de presupuesto creado', [
            'presupuesto_id' => $presupuesto->id,
            'usuario_id' => $usuarioId,
            'referencia' => $referencia
        ]);
    }

    /**
     * Crear notificación para presupuesto que vence mañana
     */
    public function notificarVenceManana(Presupuesto $presupuesto): void
    {
        // Verificar si ya existe una notificación similar no leída
        $existe = Notificacion::where('usuario_id', $presupuesto->created_by)
            ->where('entidad_tipo', 'presupuesto')
            ->where('entidad_id', $presupuesto->id)
            ->where('tipo', 'presupuesto_por_vencer')
            ->where('leida', false)
            ->exists();

        if ($existe) {
            return;
        }

        $referencia = $this->getReferencia($presupuesto);
        
        Notificacion::create([
            'usuario_id' => $presupuesto->created_by,
            'titulo' => '⏰ Presupuesto vence mañana',
            'mensaje' => "El presupuesto {$referencia} para {$presupuesto->lead->nombre_completo} vence mañana. No olvides dar seguimiento.",
            'tipo' => 'presupuesto_por_vencer',
            'entidad_tipo' => 'presupuesto',
            'entidad_id' => $presupuesto->id,
            'leida' => false,
            'fecha_notificacion' => now(),
            'prioridad' => 'alta',
            'created' => now()
        ]);

        Log::info('Notificación de presupuesto que vence mañana', [
            'presupuesto_id' => $presupuesto->id,
            'referencia' => $referencia
        ]);
    }

    /**
     * Crear notificación para presupuesto vencido
     */
    public function notificarVencido(Presupuesto $presupuesto): void
    {
        // Verificar si ya existe una notificación similar no leída
        $existe = Notificacion::where('usuario_id', $presupuesto->created_by)
            ->where('entidad_tipo', 'presupuesto')
            ->where('entidad_id', $presupuesto->id)
            ->where('tipo', 'presupuesto_vencido')
            ->where('leida', false)
            ->exists();

        if ($existe) {
            return;
        }

        $referencia = $this->getReferencia($presupuesto);
        
        Notificacion::create([
            'usuario_id' => $presupuesto->created_by,
            'titulo' => '⚠️ Presupuesto vencido',
            'mensaje' => "El presupuesto {$referencia} para {$presupuesto->lead->nombre_completo} ha vencido. Por favor, actualiza su estado.",
            'tipo' => 'presupuesto_vencido',
            'entidad_tipo' => 'presupuesto',
            'entidad_id' => $presupuesto->id,
            'leida' => false,
            'fecha_notificacion' => now(),
            'prioridad' => 'urgente',
            'created' => now()
        ]);

        Log::info('Notificación de presupuesto vencido', [
            'presupuesto_id' => $presupuesto->id,
            'referencia' => $referencia
        ]);
    }

    /**
     * Verificar presupuestos (simplificado: solo mañana y vencidos)
     */
    public function verificarPresupuestos(): array
    {
        $hoy = Carbon::now()->startOfDay();
        $notificacionesCreadas = 0;
        $presupuestosProcesados = 0;

        // 1. Presupuestos que vencen mañana
        $manana = $hoy->copy()->addDay();
        $presupuestosManana = Presupuesto::whereDate('validez', $manana)
            ->where('estado_id', 1) // Activos
            ->whereNull('deleted_at')
            ->get();

        foreach ($presupuestosManana as $presupuesto) {
            $this->notificarVenceManana($presupuesto);
            $notificacionesCreadas++;
            $presupuestosProcesados++;
        }

        // 2. Presupuestos vencidos (fecha de validez menor a hoy)
        $presupuestosVencidos = Presupuesto::where('validez', '<', $hoy)
            ->where('estado_id', 1) // Activos
            ->whereNull('deleted_at')
            ->get();

        foreach ($presupuestosVencidos as $presupuesto) {
            // Cambiar estado a vencido
            $presupuesto->estado_id = 2; // Vencido
            $presupuesto->save();
            
            // Crear notificación
            $this->notificarVencido($presupuesto);
            $notificacionesCreadas++;
            $presupuestosProcesados++;
        }

        Log::info('Verificación de presupuestos completada', [
            'procesados' => $presupuestosProcesados,
            'notificaciones' => $notificacionesCreadas
        ]);

        return [
            'procesados' => $presupuestosProcesados,
            'notificaciones' => $notificacionesCreadas
        ];
    }

    /**
     * Marcar notificaciones como leídas cuando se ve un presupuesto
     */
    public function marcarNotificacionesComoLeidas(int $presupuestoId, int $usuarioId): int
    {
        return Notificacion::where('entidad_tipo', 'presupuesto')
            ->where('entidad_id', $presupuestoId)
            ->where('usuario_id', $usuarioId)
            ->where('leida', false)
            ->update([
                'leida' => true,
                'fecha_leida' => now()
            ]);
    }

    /**
     * Eliminar notificaciones pendientes de un presupuesto
     */
    public function eliminarNotificacionesPendientes(int $presupuestoId, int $usuarioId): int
    {
        return Notificacion::where('entidad_tipo', 'presupuesto')
            ->where('entidad_id', $presupuestoId)
            ->where('usuario_id', $usuarioId)
            ->where('leida', false)
            ->where('fecha_notificacion', '>', now())
            ->update([
                'deleted_at' => now(),
                'deleted_by' => $usuarioId
            ]);
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private function getReferencia(Presupuesto $presupuesto): string
    {
        if ($presupuesto->prefijo) {
            return $presupuesto->prefijo->codigo . '-' . 
                   date('Y', strtotime($presupuesto->created)) . '-' . 
                   $presupuesto->id;
        }
        return 'LS-' . date('Y', strtotime($presupuesto->created)) . '-' . $presupuesto->id;
    }

    private function calcularDiasValidez(Presupuesto $presupuesto): int
    {
        $fechaCreacion = Carbon::parse($presupuesto->created)->startOfDay();
        $fechaValidez = Carbon::parse($presupuesto->validez)->startOfDay();
        return (int) $fechaCreacion->diffInDays($fechaValidez);
    }
}