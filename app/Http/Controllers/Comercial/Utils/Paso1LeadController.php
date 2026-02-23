<?php
// app/Http/Controllers/Comercial/Utils/Paso1LeadController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class Paso1LeadController extends Controller
{
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'lead_id' => 'required|integer|exists:leads,id',
                'nombre_completo' => 'required|string|max:100',
                'genero' => 'required|in:masculino,femenino,otro,no_especifica',
                'telefono' => 'required|string|max:20',
                'email' => 'required|email|max:150',
                'localidad_id' => 'required|integer|exists:localidades,id',
                'rubro_id' => 'required|integer|exists:rubros,id',
                'origen_id' => 'required|integer|exists:origenes_contacto,id',
            ]);

            $lead = Lead::findOrFail($request->lead_id);
            
            $lead->update([
                'nombre_completo' => $request->nombre_completo,
                'genero' => $request->genero,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'localidad_id' => $request->localidad_id,
                'rubro_id' => $request->rubro_id,
                'origen_id' => $request->origen_id,
                'modified_by' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Lead actualizado correctamente');

        } catch (\Exception $e) {
            Log::error('Error paso 1:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error al actualizar lead: ' . $e->getMessage());
        }
    }
}