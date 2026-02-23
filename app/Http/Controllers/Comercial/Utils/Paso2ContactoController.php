<?php
// app/Http/Controllers/Comercial/Utils/Paso2ContactoController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\EmpresaContacto;
use App\Models\EmpresaResponsable;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class Paso2ContactoController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'lead_id' => 'required|integer|exists:leads,id',
                'tipo_responsabilidad_id' => 'required|integer|exists:tipos_responsabilidad,id',
                'tipo_documento_id' => 'required|integer|exists:tipos_documento,id',
                'nro_documento' => 'required|string|max:20',
                'nacionalidad_id' => 'required|integer|exists:nacionalidades,id',
                'fecha_nacimiento' => 'required|date',
                'direccion_personal' => 'required|string|max:255',
                'codigo_postal_personal' => 'required|string|max:10',
            ]);

            $lead = Lead::findOrFail($request->lead_id);

            // Crear contacto (sin empresa_id)
            $contacto = EmpresaContacto::create([
                'lead_id' => $lead->id,
                'empresa_id' => null,
                'es_contacto_principal' => true,
                'tipo_responsabilidad_id' => $request->tipo_responsabilidad_id,
                'tipo_documento_id' => $request->tipo_documento_id,
                'nro_documento' => $request->nro_documento,
                'nacionalidad_id' => $request->nacionalidad_id,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'direccion_personal' => $request->direccion_personal,
                'codigo_postal_personal' => $request->codigo_postal_personal,
                'es_activo' => true,
                'created_by' => auth()->id(),
            ]);

            // Guardar ID en sesión para el paso 3
            session(['contacto_id' => $contacto->id]);

            // ===== CREAR RESPONSABLE AUTOMÁTICAMENTE =====
            $tipoResponsabilidad = $request->tipo_responsabilidad_id;
            $nombreCompleto = $lead->nombre_completo;
            $nombrePartes = explode(' ', $nombreCompleto, 2);
            $nombre = $nombrePartes[0];
            $apellido = isset($nombrePartes[1]) ? $nombrePartes[1] : '';

            // Determinar qué responsables crear según el tipo
            $responsablesACrear = [];

            if ($tipoResponsabilidad == 5) {
                // Tipo 5: crear un responsable que cubre ambos
                $responsablesACrear[] = [
                    'tipo_id' => 5,
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'telefono' => $lead->telefono,
                    'email' => $lead->email
                ];
            } elseif ($tipoResponsabilidad == 4) {
                // Tipo 4: crear responsable de pagos
                $responsablesACrear[] = [
                    'tipo_id' => 4,
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'telefono' => $lead->telefono,
                    'email' => $lead->email
                ];
            } elseif ($tipoResponsabilidad == 3) {
                // Tipo 3: crear responsable de flota
                $responsablesACrear[] = [
                    'tipo_id' => 3,
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'telefono' => $lead->telefono,
                    'email' => $lead->email
                ];
            }

            // Guardar los responsables (sin empresa_id por ahora)
            foreach ($responsablesACrear as $resp) {
                $responsable = EmpresaResponsable::create([
                    'empresa_id' => null,
                    'tipo_responsabilidad_id' => $resp['tipo_id'],
                    'nombre' => $resp['nombre'],
                    'apellido' => $resp['apellido'],
                    'telefono' => $resp['telefono'],
                    'email' => $resp['email'],
                    'es_activo' => true,
                    'created_by' => auth()->id(),
                ]);
                
                // Guardar IDs de responsables en sesión
                session(["responsable_{$resp['tipo_id']}_id" => $responsable->id]);
            }

            return redirect()->back()->with('success', 'Datos personales guardados correctamente');

        } catch (\Exception $e) {
            Log::error('Error paso 2:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Error al guardar datos personales: ' . $e->getMessage());
        }
    }
}