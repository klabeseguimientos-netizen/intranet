<?php
// app/Http\Controllers/Comercial\ContactosController.php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\EmpresaContacto;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ContactosController extends Controller
{
    public function index(Request $request)
    {
        $usuario = auth()->user();
        
        // Base query para contactos (empresa_contactos con lead asociado)
        $contactosQuery = EmpresaContacto::with(['lead', 'empresa'])
            ->where('es_activo', 1)
            ->whereNull('deleted_at');
        
        // Filtrar por prefijos si el usuario no ve todos
        if (!$usuario->ve_todas_cuentas) {
            // Obtener prefijos del usuario
            $prefijosUsuario = DB::table('usuario_prefijos')
                ->where('usuario_id', $usuario->id)
                ->where('activo', 1)
                ->whereNull('deleted_at')
                ->pluck('prefijo_id')
                ->toArray();
            
            if (!empty($prefijosUsuario)) {
                // Primero obtener empresas con esos prefijos
                $empresasIds = DB::table('empresas')
                    ->whereIn('prefijo_id', $prefijosUsuario)
                    ->whereNull('deleted_at')
                    ->pluck('id')
                    ->toArray();
                
                // Luego filtrar contactos por esas empresas
                if (!empty($empresasIds)) {
                    $contactosQuery->whereIn('empresa_id', $empresasIds);
                } else {
                    $contactosQuery->whereRaw('1 = 0');
                }
            } else {
                $contactosQuery->whereRaw('1 = 0');
            }
        }
        
        // Aplicar búsqueda si existe
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $contactosQuery->where(function ($query) use ($search) {
                $query->whereHas('lead', function ($q) use ($search) {
                    $q->where('nombre_completo', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('telefono', 'like', "%{$search}%");
                })->orWhereHas('empresa', function ($q) use ($search) {
                    $q->where('nombre_fantasia', 'like', "%{$search}%")
                      ->orWhere('razon_social', 'like', "%{$search}%");
                });
            });
        }
        
        // Ordenar por fecha de creación (más recientes primero)
        $contactos = $contactosQuery->orderBy('created', 'desc')
            ->paginate(15)
            ->withQueryString();
        
        // Contar contactos principales
        $contactosPrincipales = $contactosQuery->clone()->where('es_contacto_principal', 1)->count();
        
        return Inertia::render('Comercial/Contactos', [
            'contactos' => $contactos,
            'estadisticas' => [
                'total' => $contactos->total(),
                'principales' => $contactosPrincipales,
            ],
            'filters' => $request->only(['search']),
            'usuario' => [
                've_todas_cuentas' => (bool) $usuario->ve_todas_cuentas,
            ],
        ]);
    }
}