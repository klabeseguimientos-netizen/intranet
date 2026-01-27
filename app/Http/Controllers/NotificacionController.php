<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificacionController extends Controller
{
public function index(Request $request)
{
    $usuarioId = Auth::id();
    
    // Query base con filtro de no eliminadas
    $query = DB::table('notificaciones')
        ->where('usuario_id', $usuarioId)
        ->whereNull('deleted_at') // <- FILTRAR NO ELIMINADAS
        ->orderBy('fecha_notificacion', 'desc');
    
    // Aplicar filtros...
    if ($request->filled('leida')) {
        $query->where('leida', $request->leida === 'true' ? 1 : 0);
    }
    
    if ($request->filled('tipo')) {
        $query->where('tipo', $request->tipo);
    }
    
    if ($request->filled('prioridad')) {
        $query->where('prioridad', $request->prioridad);
    }
    
    // Paginación
    $notificaciones = $query->paginate(20);
    
    // Convertir booleanos
    $notificaciones->getCollection()->transform(function($notificacion) {
        $notificacion->leida = (bool) $notificacion->leida;
        return $notificacion;
    });
    
    // Contar no leídas (también filtrar eliminadas)
    $totalNoLeidas = DB::table('notificaciones')
        ->where('usuario_id', $usuarioId)
        ->where('leida', false)
        ->whereNull('deleted_at') // <- FILTRAR NO ELIMINADAS
        ->count();
    
    return Inertia::render('Notificaciones/Index', [
        'notificaciones' => $notificaciones,
        'filtros' => $request->only(['tipo', 'leida', 'prioridad']),
        'totalNoLeidas' => $totalNoLeidas,
    ]);
}
}