<?php

namespace App\Console\Commands;

use App\Models\Presupuesto;
use Illuminate\Console\Command;
use Carbon\Carbon;

class VerificarPresupuestosVencidos extends Command
{
    protected $signature = 'presupuestos:verificar-vencidos';
    protected $description = 'Verifica presupuestos vencidos y cambia su estado a pendiente';

    public function handle()
    {
        $hoy = Carbon::now()->format('Y-m-d');
        
        $presupuestosVencidos = Presupuesto::where('validez', '<', $hoy)
            ->where('estado_id', 1) // Solo los que están activos
            ->whereNull('deleted_at')
            ->get();
        
        $contador = 0;
        foreach ($presupuestosVencidos as $presupuesto) {
            $presupuesto->estado_id = 2; // vencido
            $presupuesto->save();
            $contador++;
        }
        
        $this->info("Se actualizaron {$contador} presupuestos a estado pendiente");
    }
}