<?php

namespace App\Http\Controllers;

use App\Models\PresupuestoLegacy;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PresupuestoLegacyController extends Controller
{
    public function verPdf($id): BinaryFileResponse
    {
        $presupuesto = PresupuestoLegacy::find($id);
        
        if (!$presupuesto || !$presupuesto->pdf_path) {
            abort(404, 'PDF no encontrado');
        }

        $path = storage_path('app/public/' . $presupuesto->pdf_path);
        
        if (!file_exists($path)) {
            abort(404, 'Archivo no encontrado');
        }

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . ($presupuesto->nombre_presupuesto ?? 'presupuesto') . '.pdf"'
        ]);
    }
}