<?php

namespace App\Http\Controllers\CondComerciales;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ReenviosActivosController extends Controller
{
    public function index()
    {
        return Inertia::render('CondComerciales/ReenviosActivos');
    }
}
