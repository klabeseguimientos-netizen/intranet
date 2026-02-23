<?php
// app/Http/Controllers/Comercial/Utils/RubroController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\Rubro;
use Illuminate\Http\JsonResponse;

class RubroController extends Controller
{
    /**
     * Obtener rubros activos
     */
    public function activos(): JsonResponse
    {
        $rubros = Rubro::where('activo', 1)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);
        
        return response()->json($rubros);
    }
}