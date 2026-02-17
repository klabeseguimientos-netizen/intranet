<?php

namespace App\Services\Lead;

use App\Models\Lead;
use App\Models\EstadoLead;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LeadStateTransitionService
{
    /**
     * Calcular tiempos entre estados de un lead (DATOS REALES de DB)
     */
    public function calcularTiemposEntreEstados(int $leadId): array
    {
        try {
            // Obtener logs de auditoría reales
            $logs = $this->getLogsAuditoriaEstados($leadId);
            
            // Si no hay logs, ver si podemos calcular desde la fecha de creación
            if (empty($logs)) {
                return $this->getTiempoDesdeCreacion($leadId);
            }
            
            // Procesar logs para calcular tiempos
            return $this->procesarLogsParaTiempos($logs, $leadId);
            
        } catch (\Exception $e) {
            Log::error('Error calculando tiempos entre estados:', [
                'lead_id' => $leadId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return []; // Retornar array vacío en lugar de datos hardcodeados
        }
    }
    
    /**
     * Obtener logs de auditoría específicos para cambios de estado
     */
    private function getLogsAuditoriaEstados(int $leadId): array
    {
        return DB::table('auditoria_log')
            ->select([
                'id',
                'created',
                'valores_anteriores',
                'valores_nuevos',
                'usuario_id'
            ])
            ->where('tabla_afectada', 'leads')
            ->where('registro_id', $leadId)
            ->where('accion', 'UPDATE')
            ->where(function ($query) {
                // Buscar cambios que contengan estado_lead_id en valores_nuevos
                $query->where('valores_nuevos', 'like', '%estado_lead_id%')
                      ->orWhere('valores_nuevos', 'like', '%estado_nuevo_nombre%');
            })
            ->orderBy('created', 'asc')
            ->get()
            ->toArray();
    }
    
    /**
     * Procesar logs para extraer tiempos entre estados
     */
    private function procesarLogsParaTiempos(array $logs, int $leadId): array
    {
        $tiempos = [];
        $estadoAnterior = null;
        $fechaAnterior = null;
        $contador = 0;
        
        foreach ($logs as $log) {
            try {
                // Decodificar JSON
                $valoresAnteriores = json_decode($log->valores_anteriores ?? '{}', true);
                $valoresNuevos = json_decode($log->valores_nuevos ?? '{}', true);
                
                // Obtener nombres de estados
                $estadoActualNombre = $this->extraerNombreEstado($valoresNuevos, $log->created);
                $estadoAnteriorNombre = $this->extraerNombreEstadoAnterior($valoresAnteriores);
                
                // Si no podemos determinar los estados, saltar
                if (!$estadoActualNombre) {
                    continue;
                }
                
                // Para el primer log, usar fecha de creación del lead como inicio
                if ($contador === 0) {
                    $fechaCreacion = $this->getFechaCreacionLead($leadId);
                    if ($fechaCreacion) {
                        $this->agregarPrimerTiempo($tiempos, $fechaCreacion, $log, $estadoActualNombre);
                        $fechaAnterior = $log->created;
                        $estadoAnterior = $estadoActualNombre;
                        $contador++;
                        continue;
                    }
                }
                
                // Calcular tiempo entre cambios
                if ($estadoAnterior !== null && $fechaAnterior !== null && $estadoActualNombre !== $estadoAnterior) {
                    $diferencia = Carbon::parse($fechaAnterior)->diff(Carbon::parse($log->created));
                    
                    $tiempos[] = [
                        'desde' => $estadoAnterior,
                        'hasta' => $estadoActualNombre,
                        'dias' => $diferencia->days,
                        'horas' => $diferencia->h,
                        'minutos' => $diferencia->i,
                        'fecha_cambio' => $log->created,
                        'razon' => $valoresNuevos['razon_cambio'] ?? 'Cambio de estado',
                        'usuario_id' => $log->usuario_id,
                    ];
                }
                
                $estadoAnterior = $estadoActualNombre;
                $fechaAnterior = $log->created;
                $contador++;
                
            } catch (\Exception $e) {
                Log::warning('Error procesando log de auditoría:', [
                    'log_id' => $log->id,
                    'lead_id' => $leadId,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
        
        // Agregar tiempo desde el último cambio hasta ahora
        if (!empty($tiempos) && $fechaAnterior) {
            $this->agregarTiempoActual($tiempos, $leadId, $estadoAnterior, $fechaAnterior);
        }
        
        return $tiempos;
    }
    
    /**
     * Extraer nombre del estado de los valores nuevos
     */
    private function extraerNombreEstado(array $valoresNuevos, string $fechaLog): string
    {
        // Prioridad 1: estado_nuevo_nombre
        if (!empty($valoresNuevos['estado_nuevo_nombre'])) {
            return $valoresNuevos['estado_nuevo_nombre'];
        }
        
        // Prioridad 2: buscar por estado_lead_id
        if (!empty($valoresNuevos['estado_lead_id'])) {
            $estado = EstadoLead::find($valoresNuevos['estado_lead_id']);
            if ($estado) {
                return $estado->nombre;
            }
        }
        
        // Prioridad 3: buscar en JSON string
        if (isset($valoresNuevos['estado_nuevo_nombre'])) {
            return $valoresNuevos['estado_nuevo_nombre'];
        }
        
        Log::warning('No se pudo determinar estado en log', [
            'valores_nuevos' => $valoresNuevos,
            'fecha_log' => $fechaLog
        ]);
        
        return 'Desconocido';
    }
    
    /**
     * Extraer nombre del estado anterior
     */
    private function extraerNombreEstadoAnterior(array $valoresAnteriores): ?string
    {
        if (!empty($valoresAnteriores['estado_anterior_nombre'])) {
            return $valoresAnteriores['estado_anterior_nombre'];
        }
        
        if (!empty($valoresAnteriores['estado_lead_id'])) {
            $estado = EstadoLead::find($valoresAnteriores['estado_lead_id']);
            return $estado ? $estado->nombre : null;
        }
        
        return null;
    }
    
    /**
     * Obtener fecha de creación del lead
     */
    private function getFechaCreacionLead(int $leadId): ?Carbon
    {
        $lead = Lead::select('created')->find($leadId);
        return $lead ? Carbon::parse($lead->created) : null;
    }
    
    /**
     * Agregar primer tiempo (desde creación hasta primer cambio)
     */
    private function agregarPrimerTiempo(array &$tiempos, Carbon $fechaCreacion, object $log, string $estadoActualNombre): void
    {
        $diferencia = $fechaCreacion->diff(Carbon::parse($log->created));
        
        $tiempos[] = [
            'desde' => 'Nuevo',
            'hasta' => $estadoActualNombre,
            'dias' => $diferencia->days,
            'horas' => $diferencia->h,
            'minutos' => $diferencia->i,
            'fecha_cambio' => $log->created,
            'razon' => 'Creación del lead',
            'usuario_id' => null,
        ];
    }
    
    /**
     * Agregar tiempo actual (desde último cambio hasta ahora)
     */
    private function agregarTiempoActual(array &$tiempos, int $leadId, string $estadoAnterior, string $fechaAnterior): void
    {
        $lead = Lead::with('estadoLead')->find($leadId);
        
        if (!$lead || !$lead->estadoLead) {
            return;
        }
        
        $diferenciaActual = Carbon::parse($fechaAnterior)->diff(now());
        
        // Solo agregar si ha pasado al menos 1 minuto
        if ($diferenciaActual->days > 0 || $diferenciaActual->h > 0 || $diferenciaActual->i > 0) {
            $tiempos[] = [
                'desde' => $estadoAnterior,
                'hasta' => $lead->estadoLead->nombre . ' (Actual)',
                'dias' => $diferenciaActual->days,
                'horas' => $diferenciaActual->h,
                'minutos' => $diferenciaActual->i,
                'fecha_cambio' => now()->toDateTimeString(),
                'razon' => 'Estado actual',
                'usuario_id' => null,
            ];
        }
    }
    
    /**
     * Si no hay logs, calcular tiempo desde creación hasta estado actual
     */
    private function getTiempoDesdeCreacion(int $leadId): array
    {
        $lead = Lead::with('estadoLead')->find($leadId);
        
        if (!$lead || !$lead->estadoLead) {
            return [];
        }
        
        // Si el estado es "Nuevo" o similar, no mostrar tiempo
        if (in_array(strtolower($lead->estadoLead->nombre), ['nuevo', 'nuevo lead', 'pendiente'])) {
            return [];
        }
        
        $diferencia = Carbon::parse($lead->created)->diff(now());
        
        return [
            [
                'desde' => 'Nuevo',
                'hasta' => $lead->estadoLead->nombre,
                'dias' => $diferencia->days,
                'horas' => $diferencia->h,
                'minutos' => $diferencia->i,
                'fecha_cambio' => $lead->created,
                'razon' => 'Creación del lead',
                'usuario_id' => null,
            ]
        ];
    }
    
    /**
     * Obtener resumen estadístico
     */
    public function getResumenTiempos(int $leadId): array
    {
        $tiempos = $this->calcularTiemposEntreEstados($leadId);
        
        if (empty($tiempos)) {
            return [
                'total_transiciones' => 0,
                'tiempo_promedio_por_estado' => null,
                'estado_mas_largo' => null,
                'estado_mas_corto' => null,
                'detalles' => []
            ];
        }
        
        $resumen = [
            'total_transiciones' => count($tiempos),
            'tiempo_total_dias' => 0,
            'tiempo_total_horas' => 0,
            'tiempo_total_minutos' => 0,
            'estados' => [],
            'detalles' => $tiempos
        ];
        
        foreach ($tiempos as $tiempo) {
            // Sumar tiempos totales
            $resumen['tiempo_total_dias'] += $tiempo['dias'];
            $resumen['tiempo_total_horas'] += $tiempo['horas'];
            $resumen['tiempo_total_minutos'] += $tiempo['minutos'];
            
            // Agrupar por estado destino
            $estado = $tiempo['hasta'];
            if (!isset($resumen['estados'][$estado])) {
                $resumen['estados'][$estado] = [
                    'dias' => 0,
                    'horas' => 0,
                    'minutos' => 0,
                    'veces' => 0
                ];
            }
            
            $resumen['estados'][$estado]['dias'] += $tiempo['dias'];
            $resumen['estados'][$estado]['horas'] += $tiempo['horas'];
            $resumen['estados'][$estado]['minutos'] += $tiempo['minutos'];
            $resumen['estados'][$estado]['veces']++;
        }
        
        // Normalizar minutos/horas
        $minutosTotales = $resumen['tiempo_total_minutos'];
        $horasExtra = floor($minutosTotales / 60);
        $resumen['tiempo_total_horas'] += $horasExtra;
        $resumen['tiempo_total_minutos'] = $minutosTotales % 60;
        
        $horasTotales = $resumen['tiempo_total_horas'];
        $diasExtra = floor($horasTotales / 24);
        $resumen['tiempo_total_dias'] += $diasExtra;
        $resumen['tiempo_total_horas'] = $horasTotales % 24;
        
        return $resumen;
    }
}