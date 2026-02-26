<?php
// app/Services/Lead/Notifications/LeadExpiredNotificationService.php

namespace App\Services\Lead\Notifications;

use App\Models\Lead;
use App\Models\EstadoLead;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class LeadExpiredNotificationService
{
    private ?array $estadosExcluirIds = null;
    private bool $estadosCargados = false;
    
    /**
     * Constructor - SIN CONSULTAS A DB
     */
    public function __construct()
    {
        // No hacer consultas aquí
        // Los estados se cargarán bajo demanda con getEstadosExcluirIds()
    }
    
    /**
     * Obtener IDs de estados que deben excluirse (carga lazy)
     */
    private function getEstadosExcluirIds(): array
    {
        // Si ya están cargados, devolverlos
        if ($this->estadosCargados) {
            return $this->estadosExcluirIds ?? [];
        }

        // Si estamos en consola/build, evitar consultas a DB
        if ($this->shouldSkipDatabase()) {
            Log::info('Saltando consulta de estados excluir en entorno de build/consola');
            $this->estadosExcluirIds = [];
            $this->estadosCargados = true;
            return [];
        }

        try {
            // Usar cache para reducir consultas repetitivas
            $this->estadosExcluirIds = Cache::remember('estados_excluir_ids', 3600, function () {
                return EstadoLead::whereIn('tipo', ['final_negativo', 'final_positivo', 'recontacto'])
                    ->where('activo', 1)
                    ->pluck('id')
                    ->toArray();
            });

        } catch (\Exception $e) {
            // Si hay error (ej: DB no disponible), loguear y devolver array vacío
            Log::warning('No se pudieron cargar estados a excluir: ' . $e->getMessage());
            $this->estadosExcluirIds = [];
        }

        $this->estadosCargados = true;
        return $this->estadosExcluirIds ?? [];
    }

    /**
     * Determina si debemos evitar consultas a DB
     */
    private function shouldSkipDatabase(): bool
    {
        return app()->runningInConsole() || 
               app()->environment('production') && !$this->databaseAvailable();
    }

    /**
     * Verifica si la base de datos está disponible
     */
    private function databaseAvailable(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Verifica leads que llevan 30 días sin cambiar de estado
     * Los marca como vencidos (estado_lead_id = 9) y crea notificaciones
     */
    public function verificarLeadsVencidos(): array
    {
        $procesados = 0;
        $notificaciones = 0;
        $estadoVencido = 9; // ID del estado "Vencido"

        try {
            // Obtener estados excluir (ahora seguro, carga lazy)
            $estadosExcluirBase = $this->getEstadosExcluirIds();
            
            // Agregar el estado vencido a la lista de exclusión temporal para la consulta
            $estadosExcluir = array_merge($estadosExcluirBase, [$estadoVencido]);
            
            // Buscar leads activos que no sean clientes y tengan más de 30 días sin cambio
            $leadsVencidos = Lead::where('es_cliente', 0)
                ->where('es_activo', 1)
                ->whereNotIn('estado_lead_id', $estadosExcluir) // Excluir estados finales y vencidos
                ->where(function($query) {
                    // Si tiene modified, usar esa fecha; si no, usar created
                    $query->where(function($q) {
                        $q->whereNotNull('modified')
                          ->where('modified', '<=', Carbon::now()->subDays(30));
                    })->orWhere(function($q) {
                        $q->whereNull('modified')
                          ->where('created', '<=', Carbon::now()->subDays(30));
                    });
                })
                ->get();

            foreach ($leadsVencidos as $lead) {
                DB::beginTransaction();
                
                try {
                    // Guardar estado anterior para auditoría
                    $estadoAnterior = $lead->estado_lead_id;
                    $estadoAnteriorObj = EstadoLead::find($estadoAnterior);
                    
                    // Cambiar estado a vencido
                    $lead->estado_lead_id = $estadoVencido;
                    $lead->modified = now();
                    $lead->save();
                    
                    // Buscar el comercial asignado
                    $comercialUsuarioId = $this->getComercialUsuarioId($lead->prefijo_id);
                    
                    if ($comercialUsuarioId) {
                        // Crear notificación
                        $this->crearNotificacionVencido($comercialUsuarioId, $lead, $estadoAnteriorObj);
                        $notificaciones++;
                    }
                    
                    DB::commit();
                    $procesados++;
                    
                    Log::info('Lead marcado como vencido', [
                        'lead_id' => $lead->id,
                        'nombre' => $lead->nombre_completo,
                        'estado_anterior' => $estadoAnteriorObj?->nombre,
                        'dias_sin_cambio' => Carbon::parse($lead->modified ?? $lead->created)->diffInDays(now())
                    ]);
                    
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Error procesando lead vencido', [
                        'lead_id' => $lead->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return [
                'procesados' => $procesados,
                'notificaciones' => $notificaciones
            ];

        } catch (\Exception $e) {
            Log::error('Error en verificación de leads vencidos', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'procesados' => 0,
                'notificaciones' => 0,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtener ID de usuario del comercial asignado al prefijo
     */
    private function getComercialUsuarioId(int $prefijoId): ?int
    {
        // Esta consulta está bien aquí porque se ejecuta bajo demanda
        return DB::table('comercial as c')
            ->join('personal as p', 'c.personal_id', '=', 'p.id')
            ->join('usuarios as u', 'p.id', '=', 'u.personal_id')
            ->where('c.prefijo_id', $prefijoId)
            ->where('c.activo', 1)
            ->value('u.id');
    }

    /**
     * Crear notificación de lead vencido
     */
    private function crearNotificacionVencido(int $usuarioId, Lead $lead, ?EstadoLead $estadoAnterior): void
    {
        $dias = Carbon::parse($lead->modified ?? $lead->created)->diffInDays(now());
        $nombreEstadoAnterior = $estadoAnterior?->nombre ?? 'desconocido';
        
        DB::table('notificaciones')->insert([
            'usuario_id' => $usuarioId,
            'titulo' => 'Lead vencido por inactividad',
            'mensaje' => "El lead {$lead->nombre_completo} lleva {$dias} días en estado '{$nombreEstadoAnterior}' sin actividad y ha sido marcado como vencido automáticamente.",
            'tipo' => 'lead_vencido',
            'entidad_tipo' => 'lead',
            'entidad_id' => $lead->id,
            'leida' => false,
            'fecha_notificacion' => now(),
            'prioridad' => 'alta',
            'created' => now()
        ]);
        
        Log::info('Notificación de lead vencido creada', [
            'usuario_id' => $usuarioId,
            'lead_id' => $lead->id
        ]);
    }

    /**
     * Método público para obtener estados excluir (si se necesita desde afuera)
     */
    public function obtenerEstadosExcluir(): array
    {
        return $this->getEstadosExcluirIds();
    }
}