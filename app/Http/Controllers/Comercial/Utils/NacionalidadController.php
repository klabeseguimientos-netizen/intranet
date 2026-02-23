<?php
// app/Http/Controllers/Comercial/Utils/NacionalidadController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\Nacionalidad;
use Illuminate\Http\JsonResponse;

class NacionalidadController extends Controller
{
    /**
     * Obtener todas las nacionalidades activas
     */
    public function index(): JsonResponse
    {
        $nacionalidades = Nacionalidad::where('activo', true)
            ->orderBy('pais')
            ->get(['id', 'pais', 'gentilicio']);
        
        return response()->json($nacionalidades);
    }
}