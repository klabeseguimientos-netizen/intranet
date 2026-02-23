<?php
// app/Http/Controllers/Comercial/Utils/PlataformaController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\Plataforma;
use Illuminate\Http\JsonResponse;

class PlataformaController extends Controller
{
    /**
     * Obtener plataformas activas
     */
    public function activas(): JsonResponse
    {
        $plataformas = Plataforma::where('es_activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'descripcion']);
        
        return response()->json($plataformas);
    }
}