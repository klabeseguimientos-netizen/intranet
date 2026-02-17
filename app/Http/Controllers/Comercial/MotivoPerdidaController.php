<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\MotivoPerdida;

class MotivoPerdidaController extends Controller
{
    /**
     * Obtener motivos de pérdida activos para el modal
     */
    public function getMotivosActivos()
    {
        try {
            \Log::info('Solicitando motivos de pérdida activos');
            
            $motivos = MotivoPerdida::where('es_activo', 1)
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'descripcion', 'es_activo']);
            
            \Log::info('Motivos encontrados:', ['count' => $motivos->count()]);
            
            return response()->json($motivos);
            
        } catch (\Exception $e) {
            \Log::error('Error al cargar motivos de pérdida:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Error al cargar motivos de pérdida',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}