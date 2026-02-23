<?php
// app/Http/Controllers/Comercial/Utils/PaisController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\Pais;
use Illuminate\Http\JsonResponse;

class PaisController extends Controller
{
    /**
     * Obtener todos los países
     */
    public function index(): JsonResponse
    {
        $paises = Pais::orderBy('nombre')
            ->get(['id', 'nombre', 'nacionalidad']);
        
        return response()->json($paises);
    }
}