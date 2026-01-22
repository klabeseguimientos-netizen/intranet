<?php

namespace App\Http\Controllers\Config\Usuarios;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class RolesPermisosController extends Controller
{
    public function index()
    {
        return Inertia::render('Config/Usuarios/RolesPermisos');
    }
}