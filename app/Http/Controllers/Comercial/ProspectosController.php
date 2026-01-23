<?php
// app/Http\Controllers/Comercial\ProspectosController.php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lead;
use App\Models\OrigenContacto;
use App\Models\EstadoLead;
use Illuminate\Support\Facades\DB;

class ProspectosController extends Controller
{
    public function index(Request $request)
    {
        $usuario = auth()->user();
        
        // Base query para leads que son prospectos (es_cliente = 0)
        $leadsQuery = Lead::with(['origen', 'estadoLead'])
            ->where('es_cliente', 0)
            ->whereNull('deleted_at');
        
        // Filtrar por prefijos si el usuario no ve todos
        if (!$usuario->ve_todas_cuentas) {
            $prefijosUsuario = DB::table('usuario_prefijos')
                ->where('usuario_id', $usuario->id)
                ->where('activo', 1)
                ->whereNull('deleted_at')
                ->pluck('prefijo_id')
                ->toArray();
            
            if (!empty($prefijosUsuario)) {
                $leadsQuery->whereIn('prefijo_id', $prefijosUsuario);
            } else {
                $leadsQuery->whereRaw('1 = 0');
            }
        }
        
        // Aplicar búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $leadsQuery->where(function ($query) use ($search) {
                $query->where('nombre_completo', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('telefono', 'like', "%{$search}%");
            });
        }
        
        // Ordenar
        $leads = $leadsQuery->orderBy('created', 'desc')
            ->paginate(15)
            ->withQueryString();
        
        // Obtener orígenes y estados para los filtros
        $origenes = OrigenContacto::where('es_activo', 1)
            ->whereNull('deleted_at')
            ->get(['id', 'nombre', 'color', 'icono']);
            
        $estadosLead = EstadoLead::whereNull('deleted_at')
            ->get(['id', 'nombre', 'tipo', 'color_hex']);
        
        // Calcular estadísticas por estado
        $estadisticas = [];
        foreach ($estadosLead as $estado) {
            $countQuery = $leadsQuery->clone();
            $estadisticas[strtolower($estado->nombre)] = $countQuery->where('estado_lead_id', $estado->id)->count();
        }
        
        return Inertia::render('Comercial/Prospectos', [
            'leads' => $leads,
            'estadisticas' => $estadisticas,
            'filters' => $request->only(['search']),
            'usuario' => [
                've_todas_cuentas' => (bool) $usuario->ve_todas_cuentas,
            ],
            'origenes' => $origenes,
            'estadosLead' => $estadosLead,
        ]);
    }
}