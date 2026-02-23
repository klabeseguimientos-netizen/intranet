<?php
// app/Http/Controllers/Comercial/Utils/TipoDocumentoController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\TipoDocumento;
use Illuminate\Http\JsonResponse;

class TipoDocumentoController extends Controller
{
    /**
     * Obtener tipos de documento activos
     */
    public function activos(): JsonResponse
    {
        $tipos = TipoDocumento::where('es_activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'abreviatura']);
        
        return response()->json($tipos);
    }
}