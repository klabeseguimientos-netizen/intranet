<?php
// app/Http\Controllers/Estadisticas\ComercialGrupalController.php

namespace App\Http\Controllers\Estadisticas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComercialGrupalController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'usuario.activo']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        $userId = $user->id;
        $userRole = $user->rol_nombre ?? null;
        
        // Verificar permisos: solo usuarios 3 o 5 con rol Administrador
        if (!in_array($userId, [3, 5]) || $userRole !== 'Administrador') {
            return redirect()
                ->route('dashboard')
                ->with('error', 'No tiene permisos para acceder a esta sección');
        }
        
        return Inertia::render('Estadisticas/ComercialGrupal');
    }
}