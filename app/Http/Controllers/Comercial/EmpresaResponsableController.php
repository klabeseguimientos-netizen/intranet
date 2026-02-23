<?php
// app/Http/Controllers/Comercial/EmpresaResponsableController.php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\EmpresaResponsable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmpresaResponsableController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'empresa_id' => 'required|integer|exists:empresas,id',
                'tipo_responsabilidad_id' => 'required|integer|exists:tipos_responsabilidad,id',
                'nombre' => 'required|string|max:100',
                'apellido' => 'required|string|max:100',
                'telefono' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:150',
            ]);

            $responsable = EmpresaResponsable::create([
                'empresa_id' => $request->empresa_id,
                'tipo_responsabilidad_id' => $request->tipo_responsabilidad_id,
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'es_activo' => true,
                'created_by' => auth()->id(),
            ]);

            $responsable->load('tipoResponsabilidad');

            // 👈 CAMBIO IMPORTANTE: Devolver los datos en una estructura específica
            return redirect()->back()->with([
                'success' => 'Responsable guardado correctamente',
                'data' => [
                    'responsable' => $responsable
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error guardando responsable:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error al guardar responsable: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $responsable = EmpresaResponsable::findOrFail($id);
            $responsable->es_activo = false;
            $responsable->deleted_by = auth()->id();
            $responsable->save();

            return redirect()->back()->with('success', 'Responsable eliminado correctamente');

        } catch (\Exception $e) {
            Log::error('Error eliminando responsable:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error al eliminar responsable: ' . $e->getMessage());
        }
    }
}