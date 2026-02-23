<?php
// app/Http/Controllers/PresupuestoLegacyController.php

namespace App\Http\Controllers;

use App\Models\PresupuestoLegacy;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Http\Request;

class PresupuestoLegacyController extends Controller
{
    /**
     * Ver PDF en el navegador o descargar según el parámetro download
     */
    public function verPdf(Request $request, $id): BinaryFileResponse
    {
        $presupuesto = PresupuestoLegacy::find($id);
        
        if (!$presupuesto || !$presupuesto->pdf_path) {
            abort(404, 'PDF no encontrado');
        }

        $path = storage_path('app/public/' . $presupuesto->pdf_path);
        
        if (!file_exists($path)) {
            abort(404, 'Archivo no encontrado');
        }

        $nombreArchivo = ($presupuesto->nombre_presupuesto ?? 'presupuesto') . '.pdf';
        
        // Determinar si es descarga o visualización
        $isDownload = $request->has('download') && $request->download == 1;
        
        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => ($isDownload ? 'attachment' : 'inline') . '; filename="' . $nombreArchivo . '"'
        ]);
    }

    /**
     * Método específico para descargar (opcional, más semántico)
     */
    public function descargarPdf($id): BinaryFileResponse
    {
        $presupuesto = PresupuestoLegacy::find($id);
        
        if (!$presupuesto || !$presupuesto->pdf_path) {
            abort(404, 'PDF no encontrado');
        }

        $path = storage_path('app/public/' . $presupuesto->pdf_path);
        
        if (!file_exists($path)) {
            abort(404, 'Archivo no encontrado');
        }

        $nombreArchivo = ($presupuesto->nombre_presupuesto ?? 'presupuesto') . '.pdf';
        
        return response()->download($path, $nombreArchivo, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}