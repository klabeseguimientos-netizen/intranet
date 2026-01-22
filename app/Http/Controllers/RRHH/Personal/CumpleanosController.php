<?php

namespace App\Http\Controllers\rrhh\Personal;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CumpleanosController extends Controller
{
    public function index()
    {
        return Inertia::render('RRHH/Personal/Cumpleanos');
    }
}