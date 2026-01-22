<?php

namespace App\Http\Controllers\rrhh\Equipos;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class EquipoTecnicoController extends Controller
{
    public function index()
    {
        return Inertia::render('RRHH/Equipos/EquipoTecnico');
    }
}