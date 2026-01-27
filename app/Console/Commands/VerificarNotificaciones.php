<?php
// app/Console/Commands/VerificarNotificaciones.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VerificarNotificaciones extends Command
{
    protected $signature = 'notificaciones:verificar';
    protected $description = 'Verifica y genera notificaciones automáticas';
    
    public function handle()
    {
        $this->info('[' . now()->format('Y-m-d H:i:s') . '] Iniciando verificación de notificaciones...');
        
        try {
            // Verificar leads sin contactar (solo leads creados después del sistema nuevo)
            $leadsVerificados = DB::select('
                SELECT COUNT(*) as total FROM leads 
                WHERE created >= CURDATE() - INTERVAL 7 DAY 
                AND es_cliente = 0 
                AND deleted_at IS NULL
            ')[0]->total;
            
            $this->info("Verificando {$leadsVerificados} leads recientes...");
            
            DB::statement('CALL sp_verificar_leads_sin_contactar()');
            $this->info('✓ Leads sin contactar verificados');
            
            // Verificar presupuestos por vencer (solo los nuevos)
            $presupuestosVerificados = DB::select('
                SELECT COUNT(*) as total FROM presupuestos 
                WHERE created >= CURDATE() - INTERVAL 30 DAY 
                AND activo = 1 
                AND deleted_at IS NULL
            ')[0]->total;
            
            $this->info("Verificando {$presupuestosVerificados} presupuestos recientes...");
            
            DB::statement('CALL sp_verificar_presupuestos_vencimiento()');
            $this->info('✓ Presupuestos verificados');
            
            $this->info('[' . now()->format('Y-m-d H:i:s') . '] Verificación completada exitosamente.');
            
        } catch (\Exception $e) {
            $this->error('Error en la verificación: ' . $e->getMessage());
            Log::error('Error en verificación de notificaciones: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return 1;
        }
        
        return 0;
    }
}