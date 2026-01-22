<?php

namespace App\Http\Controllers\Config\Parametros;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TerminosCondicionesController extends Controller
{
    public function index()
    {
        return Inertia::render('Config/Parametros/TerminosCondiciones');
    }
}
