<?php
// app/Http/Controllers/CondComerciales/TarifasConsultaController.php

namespace App\Http\Controllers\CondComerciales;

use App\Http\Controllers\Controller;
use App\Models\ProductoServicio;
use App\Models\TipoPrdSrv;
use Inertia\Inertia;

class TarifasConsultaController extends Controller
{
    public function index()
    {
        // Obtener productos y servicios activos con sus tipos
        $productosServicios = ProductoServicio::where('es_activo', 1)
            ->with('tipo') // Asegúrate de tener esta relación en el modelo
            ->orderBy('nombre')
            ->get();

        // Obtener tipos activos
        $tiposPrdSrv = TipoPrdSrv::where('es_activo', 1)
            ->orderBy('nombre_tipo_abono')
            ->get();

        return Inertia::render('CondComerciales/TarifasConsulta', [
            'productos_servicios' => $productosServicios,
            'tipos_prd_srv' => $tiposPrdSrv,
        ]);
    }
}