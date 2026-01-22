<?php

namespace App\Http\Controllers\Config\Tarifas;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AbonosController extends Controller
{
    public function index()
    {
        return Inertia::render('Config/Tarifas/Abonos');
    }
}