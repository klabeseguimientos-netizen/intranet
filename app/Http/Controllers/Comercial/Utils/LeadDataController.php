<?php
// app/Http/Controllers/Comercial/Utils/LeadDataController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;

class LeadDataController extends Controller
{
    /**
     * Obtener datos del lead para el proceso de alta
     */
    public function getDatosAlta(int $leadId): JsonResponse
    {
        $lead = Lead::with(['localidad', 'rubro', 'prefijo.comercial.personal', 'origen'])
            ->find($leadId);
        
        if (!$lead) {
            return response()->json(['error' => 'Lead no encontrado'], 404);
        }

        return response()->json([
            'id' => $lead->id,
            'prefijo_id' => $lead->prefijo_id,
            'nombre_completo' => $lead->nombre_completo,
            'genero' => $lead->genero,
            'telefono' => $lead->telefono,
            'email' => $lead->email,
            'localidad_id' => $lead->localidad_id,
            'localidad' => $lead->localidad ? [
                'id' => $lead->localidad->id,
                'nombre' => $lead->localidad->localidad,
                'provincia_id' => $lead->localidad->provincia_id,
                'provincia' => $lead->localidad->provincia?->nombre,
                'codigo_postal' => $lead->localidad->codigo_postal,
            ] : null,
            'rubro_id' => $lead->rubro_id,
            'rubro' => $lead->rubro ? [
                'id' => $lead->rubro->id,
                'nombre' => $lead->rubro->nombre,
            ] : null,
            'origen_id' => $lead->origen_id,
            'origen' => $lead->origen ? [
                'id' => $lead->origen->id,
                'nombre' => $lead->origen->nombre,
            ] : null,
            'es_cliente' => $lead->es_cliente,
            'prefijo' => $lead->prefijo ? [
                'id' => $lead->prefijo->id,
                'codigo' => $lead->prefijo->codigo,
                'comercial' => $lead->prefijo->comercial?->personal?->nombre_completo,
            ] : null,
        ]);
    }
}