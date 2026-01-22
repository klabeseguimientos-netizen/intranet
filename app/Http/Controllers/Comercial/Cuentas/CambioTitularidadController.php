<?php

namespace App\Http\Controllers\Comercial\Cuentas;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CambioTitularidadController extends Controller
{
    public function index()
    {
        return Inertia::render('Comercial/Cuentas/CambioTitularidad');
    }
}