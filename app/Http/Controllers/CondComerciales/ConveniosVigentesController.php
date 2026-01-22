<?php

namespace App\Http\Controllers\CondComerciales;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ConveniosVigentesController extends Controller
{
    public function index()
    {
        return Inertia::render('CondComerciales/ConveniosVigentes');
    }
}