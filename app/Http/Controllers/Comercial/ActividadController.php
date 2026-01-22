<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ActividadController extends Controller
{
    public function index()
    {
        return Inertia::render('Comercial/Actividad');
    }
}