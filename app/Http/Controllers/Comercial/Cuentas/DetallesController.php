<?php

namespace App\Http\Controllers\Comercial\Cuentas;;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DetallesController extends Controller
{
    public function index()
    {
        return Inertia::render('Comercial/Cuentas/Detalles');
    }
}