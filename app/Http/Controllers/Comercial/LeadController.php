<?php
// app/Http\Controllers/Comercial\LeadController.php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LeadController extends Controller
{
 public function store(Request $request)
{
    // Las validaciones siguen igual
    $request->validate([
        'prefijo_id' => 'nullable|integer',
        'nombre_completo' => 'required|string|max:100',
        'genero' => 'required|in:masculino,femenino,otro,no_especifica',
        'telefono' => 'nullable|string|max:20',
        'email' => 'nullable|email|max:150',
        'localidad_id' => 'nullable|integer|exists:localidades,id',
        'rubro_id' => 'nullable|integer|exists:rubros,id',
        'origen_id' => 'required|integer|exists:origenes_contacto,id',
    ]);

    try {
        DB::beginTransaction();

        // Debug
        \Log::info('Datos recibidos para lead:', $request->all());
        
        // Obtener ID del usuario - manera más directa
        $usuario = $request->user();
        if (!$usuario) {
            // Intentar con Auth
            $usuario = Auth::user();
        }
        
        if (!$usuario) {
            throw new \Exception('Usuario no autenticado');
        }
        
        $usuarioId = (int) $usuario->id;
        
        \Log::info('Usuario ID obtenido:', ['id' => $usuarioId, 'user' => $usuario]);

        // Verificar si el usuario actual es comercial (rol_id = 5)
        $esComercial = $usuario->rol_id == 5;
        $comercialUsuario = null;
        
        if ($esComercial) {
            $comercialUsuario = DB::table('comercial')
                ->where('personal_id', $usuario->personal_id)
                ->first();
        }

        // Determinar el prefijo_id a usar
        $prefijoId = $request->prefijo_id;
        if ($esComercial && $comercialUsuario && !$prefijoId) {
            $prefijoId = $comercialUsuario->prefijo_id;
        }

        // Crear el lead
        $leadId = DB::table('leads')->insertGetId([
            'prefijo_id' => $prefijoId,
            'nombre_completo' => $request->nombre_completo,
            'genero' => $request->genero,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'localidad_id' => $request->localidad_id,
            'rubro_id' => $request->rubro_id,
            'origen_id' => $request->origen_id,
            'estado_lead_id' => 1,
            'es_cliente' => false,
            'es_activo' => true,
            'created' => now(),
            'created_by' => $usuarioId,
            'modified' => now(),
            'modified_by' => $usuarioId,
        ]);

        \Log::info('Lead creado', ['lead_id' => $leadId]);

        // Variable para determinar si se agregó nota
        $notaAgregada = false;
        
        // Crear nota si se proporcionó (manejar array notation de FormData)
        if ($request->has('nota.observacion') || $request->has('nota[observacion]')) {
            $observacion = $request->input('nota.observacion') ?? $request->input('nota[observacion]');
            $tipo = $request->input('nota.tipo') ?? $request->input('nota[tipo]') ?? 'observacion_inicial';
            
            if (!empty($observacion)) {
                DB::table('notas_lead')->insert([
                    'lead_id' => $leadId,
                    'usuario_id' => $usuarioId,
                    'observacion' => $observacion,
                    'tipo' => $tipo,
                    'created' => now(),
                ]);
                
                $notaAgregada = true;
                \Log::info('Nota creada', ['lead_id' => $leadId]);
            }
        }

        DB::commit();

        // Mensaje personalizado según si se agregó nota
        $mensajeExito = $notaAgregada 
            ? 'Lead creado exitosamente con nota' 
            : 'Lead creado exitosamente';

        // Para Inertia, redirigir con mensaje flash
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', $mensajeExito);
        }
        
        // Para peticiones AJAX/JSON, responder con JSON
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $mensajeExito,
                'lead_id' => $leadId,
                'nota_agregada' => $notaAgregada
            ]);
        }



        // Para peticiones normales, redirigir
        return redirect()->back()->with('success', $mensajeExito);

    } catch (\Exception $e) {
        DB::rollBack();
        
        \Log::error('Error creando lead:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'data' => $request->all()
        ]);

        // Si es una petición AJAX/JSON, responder con JSON de error
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el lead: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }

        // Para Inertia
        if ($request->header('X-Inertia')) {
            return redirect()->back()
                ->withErrors(['error' => 'Error al crear el lead: ' . $e->getMessage()])
                ->withInput();
        }

        return redirect()->back()
            ->withErrors(['error' => 'Error al crear el lead: ' . $e->getMessage()])
            ->withInput();
    }
}
}