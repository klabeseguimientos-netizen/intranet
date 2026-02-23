<?php
// app/Console/Commands/VerificarNotificaciones.php

namespace App\Console\Commands;

use App\Services\Lead\Notifications\LeadCommentNotificationService;
use App\Services\Lead\Notifications\LeadAssignmentNotificationService;
use App\Services\Presupuesto\PresupuestoNotificationService;
use App\Services\Contrato\ContratoNotificationService; // Nuevo
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class VerificarNotificaciones extends Command
{
    protected $signature = 'notificaciones:verificar';
    protected $description = 'Verifica y genera notificaciones automáticas';
    
    protected $commentNotificationService;
    protected $assignmentNotificationService;
    protected $presupuestoNotificationService;
    protected $contratoNotificationService; // Nuevo

    public function __construct(
        LeadCommentNotificationService $commentNotificationService,
        LeadAssignmentNotificationService $assignmentNotificationService,
        PresupuestoNotificationService $presupuestoNotificationService,
        ContratoNotificationService $contratoNotificationService // Nuevo
    ) {
        parent::__construct();
        $this->commentNotificationService = $commentNotificationService;
        $this->assignmentNotificationService = $assignmentNotificationService;
        $this->presupuestoNotificationService = $presupuestoNotificationService;
        $this->contratoNotificationService = $contratoNotificationService;
    }
    
    public function handle()
    {
        $this->info('[' . now()->format('Y-m-d H:i:s') . '] Iniciando verificación de notificaciones...');
        
        try {
            // ===== LEADS =====
            $this->info('✓ Notificaciones de leads: se manejan al asignar');
            
            // ===== PRESUPUESTOS =====
            $this->info('Verificando presupuestos...');
            $resultadoPresupuestos = $this->presupuestoNotificationService->verificarPresupuestos();
            $this->info("✓ Presupuestos procesados: {$resultadoPresupuestos['procesados']}");
            $this->info("✓ Notificaciones de presupuestos: {$resultadoPresupuestos['notificaciones']}");
            
            // ===== CONTRATOS ===== (nuevo)
            $this->info('Verificando contratos...');
            $resultadoContratos = $this->contratoNotificationService->verificarContratos();
            $this->info("✓ Contratos procesados: {$resultadoContratos['procesados']}");
            $this->info("✓ Notificaciones de contratos: {$resultadoContratos['notificaciones']}");
            
            $this->info('[' . now()->format('Y-m-d H:i:s') . '] Verificación completada exitosamente.');
            
        } catch (\Exception $e) {
            $this->error('Error en la verificación: ' . $e->getMessage());
            Log::error('Error en verificación de notificaciones: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
        
        return 0;
    }
}