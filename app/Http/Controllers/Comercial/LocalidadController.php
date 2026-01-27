<?php
// app/Http/Controllers/Comercial/LocalidadController.php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LocalidadController extends Controller
{
    public function buscar(Request $request)
    {
        try {
            $request->validate([
                'search' => 'required|string|min:3',
                'provincia_id' => 'nullable|integer|exists:provincias,id',
            ]);
            
            Log::info('Buscando localidades', [
                'search' => $request->search,
                'provincia_id' => $request->provincia_id
            ]);
            
            $query = DB::table('localidades')
                ->join('provincias', 'localidades.provincia_id', '=', 'provincias.id')
                ->where('localidades.activo', 1)
                ->where('provincias.activo', 1)
                ->where(function($q) use ($request) {
                    $q->where('localidades.localidad', 'LIKE', '%' . $request->search . '%')
                      ->orWhere('localidades.codigo_postal', 'LIKE', '%' . $request->search . '%');
                });
            
            if ($request->provincia_id) {
                $query->where('localidades.provincia_id', $request->provincia_id);
            }
            
            $localidades = $query->select(
                    'localidades.id',
                    'localidades.localidad as nombre',
                    'localidades.provincia_id',
                    'localidades.codigo_postal',
                    'provincias.provincia'
                )
                ->orderBy('localidades.localidad')
                ->limit(20)
                ->get();
            
            Log::info('Resultados encontrados', ['count' => count($localidades)]);
            
            return response()->json([
                'success' => true,
                'data' => $localidades
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en LocalidadController::buscar', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar localidades',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}