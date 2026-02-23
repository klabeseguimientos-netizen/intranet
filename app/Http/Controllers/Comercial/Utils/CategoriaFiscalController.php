<?php
// app/Http/Controllers/Comercial/Utils/CategoriaFiscalController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\CategoriaFiscal;
use Illuminate\Http\JsonResponse;

class CategoriaFiscalController extends Controller
{
    /**
     * Obtener categorías fiscales activas
     */
    public function activas(): JsonResponse
    {
        $categorias = CategoriaFiscal::where('es_activo', true)
            ->orderBy('codigo')
            ->get(['id', 'codigo', 'nombre', 'descripcion']);
        
        return response()->json($categorias);
    }
}