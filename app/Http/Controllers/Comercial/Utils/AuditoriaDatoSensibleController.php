<?php
// app/Http/Controllers/Comercial/Utils/AuditoriaDatoSensibleController.php

namespace App\Http\Controllers\Comercial\Utils;

use App\Http\Controllers\Controller;
use App\Models\AuditoriaDatoSensible;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuditoriaDatoSensibleController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'contrato_id' => 'required|integer|exists:contratos,id',
            'tipo_dato' => 'required|in:cbu,tarjeta_numero,tarjeta_codigo,tarjeta_vencimiento'
        ]);

        try {
            AuditoriaDatoSensible::create([
                'usuario_id' => auth()->id(),
                'contrato_id' => $request->contrato_id,
                'tipo_dato' => $request->tipo_dato,
                'fecha_acceso' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created' => now()
            ]);

            Log::info('Acceso a dato sensible registrado', [
                'usuario' => auth()->user()?->nombre_usuario,
                'contrato_id' => $request->contrato_id,
                'tipo_dato' => $request->tipo_dato
            ]);

            // Con Inertia, devolvemos un redirect con flash data
            return redirect()->back()->with('success', 'Acceso registrado');

        } catch (\Exception $e) {
            Log::error('Error registrando acceso a dato sensible:', [
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Error al registrar acceso');
        }
    }
}