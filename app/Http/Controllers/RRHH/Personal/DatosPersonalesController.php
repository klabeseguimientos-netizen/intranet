<?php

namespace App\Http\Controllers\rrhh\Personal;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DatosPersonalesController extends Controller
{
    public function index()
    {
        return Inertia::render('RRHH/Personal/DatosPersonales');
    }
}