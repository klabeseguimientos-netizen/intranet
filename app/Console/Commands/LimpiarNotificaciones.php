<?php
// app/Console/Commands/LimpiarNotificaciones.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class LimpiarNotificaciones extends Command
{
    protected $signature = 'notificaciones:limpiar';
    protected $description = 'Limpia notificaciones antiguas';
    
    public function handle()
    {
        $this->info('[' . now()->format('Y-m-d H:i:s') . '] Iniciando limpieza de notificaciones...');
        
        $eliminadas = DB::table('notificaciones')
            ->where('leida', true)
            ->where('created_at', '<', now()->subDays(30))
            ->delete();
            
        $this->info("✓ {$eliminadas} notificaciones antiguas eliminadas");
        
        // Limpiar log de notificaciones (más de 90 días)
        $logEliminadas = DB::table('notificaciones_log')
            ->where('created_at', '<', now()->subDays(90))
            ->delete();
            
        $this->info("✓ {$logEliminadas} registros de log eliminados");
        
        $this->info('[' . now()->format('Y-m-d H:i:s') . '] Limpieza completada');
        
        return 0;
    }
}