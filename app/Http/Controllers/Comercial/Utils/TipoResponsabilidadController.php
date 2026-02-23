<?php
// app/Http/Controllers/Comercial/Utils/TipoResponsabilidadController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\TipoResponsabilidad;
use Illuminate\Http\JsonResponse;

class TipoResponsabilidadController extends Controller
{
    /**
     * Obtener tipos de responsabilidad activos
     */
    public function activos(): JsonResponse
    {
        $tipos = TipoResponsabilidad::where('es_activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'descripcion', 'icono']);
        
        return response()->json($tipos);
    }
}