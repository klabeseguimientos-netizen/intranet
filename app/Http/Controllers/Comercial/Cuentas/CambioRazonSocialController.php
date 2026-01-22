<?php

namespace App\Http\Controllers\Comercial\Cuentas;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CambioRazonSocialController extends Controller
{
    public function index()
    {
        return Inertia::render('Comercial/Cuentas/CambioRazonSocial');
    }
}