<?php

namespace App\Http\Controllers\Config\Parametros;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class MediosPagoController extends Controller
{
    public function index()
    {
        return Inertia::render('Config/Parametros/MediosPago');
    }
}
