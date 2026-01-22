<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }
    
    public function index(Request $request)
    {
        // Redirigir comerciales (rol_id 5) directamente a actividad
        if ($request->user()->rol_id == 5) {
            return redirect()->route('comercial.actividad');
        }
        
        // Dashboard normal para otros roles
        return Inertia::render('Dashboard');
    }
}