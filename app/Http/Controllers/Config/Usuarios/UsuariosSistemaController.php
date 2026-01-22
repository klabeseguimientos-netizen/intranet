<?php

namespace App\Http\Controllers\Config\Usuarios;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class UsuariosSistemaController extends Controller
{
    public function index()
    {
        return Inertia::render('Config/Usuarios/UsuariosSistema');
    }
}