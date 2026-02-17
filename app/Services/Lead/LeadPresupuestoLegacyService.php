<?php

namespace App\Services\Lead;

use App\Models\Lead;
use App\Models\PresupuestoLegacy;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LeadPresupuestoLegacyService
{
    /**
     * Verificar si la tabla existe
     */
    private function tablaExiste(): bool
    {
        try {
            DB::table('presupuestos_legacy')->limit(1)->get();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Obtener presupuestos legacy para un lead
     */
    public function getPresupuestosLegacy(Lead $lead): Collection
    {
        if (!$this->tablaExiste()) {
            return collect([]);
        }

        return PresupuestoLegacy::with('prefijo')
            ->where('lead_id', $lead->id)
            ->orderBy('fecha_presupuesto', 'desc')
            ->get()
            ->map(function ($presupuesto) {
                $metadata = $presupuesto->metadata ?? [];
                
                return [
                    'id' => $presupuesto->id,
                    'nombre' => $presupuesto->nombre_presupuesto ?? "Presupuesto #{$presupuesto->id}",
                    'fecha' => $presupuesto->fecha_presupuesto?->format('d/m/Y H:i'),
                    'fecha_original' => $presupuesto->fecha_presupuesto?->toISOString(),
                    'tiene_pdf' => $presupuesto->pdf_path ? true : false,
                    'pdf_url' => $presupuesto->pdf_url,
                    'prefijo_id' => $presupuesto->prefijo_id,
                    'prefijo' => $presupuesto->prefijo ? [
                        'id' => $presupuesto->prefijo->id,
                        'codigo' => $presupuesto->prefijo->codigo,
                        'nombre' => $presupuesto->prefijo->nombre
                    ] : null,
                    'metadata' => [
                        'cantidad_vehiculos' => $metadata['cantidad_vehiculos'] ?? $metadata['cantidad'] ?? null,
                        'descripcion' => $metadata['descripcion'] ?? null,
                    ]
                ];
            });
    }

    /**
     * Obtener estadísticas de presupuestos legacy
     */
    public function getEstadisticas(Lead $lead): array
    {
        if (!$this->tablaExiste()) {
            return [
                'total_presupuestos_legacy' => 0,
                'total_con_pdf' => 0,
                'total_sin_pdf' => 0,
                'total_importe' => 0,
                'total_importe_formateado' => '0.00 €'
            ];
        }

        $stats = PresupuestoLegacy::where('lead_id', $lead->id)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN pdf_path IS NOT NULL THEN 1 ELSE 0 END) as con_pdf,
                SUM(CASE WHEN pdf_path IS NULL THEN 1 ELSE 0 END) as sin_pdf,
                COALESCE(SUM(total), 0) as importe_total
            ')
            ->first();

        return [
            'total_presupuestos_legacy' => (int) ($stats->total ?? 0),
            'total_con_pdf' => (int) ($stats->con_pdf ?? 0),
            'total_sin_pdf' => (int) ($stats->sin_pdf ?? 0),
            'total_importe' => (float) ($stats->importe_total ?? 0),
            'total_importe_formateado' => number_format($stats->importe_total ?? 0, 2) . ' €'
        ];
    }

    /**
     * Verificar si un lead tiene presupuestos legacy
     */
    public function tienePresupuestos(Lead $lead): bool
    {
        if (!$this->tablaExiste()) {
            return false;
        }

        return PresupuestoLegacy::where('lead_id', $lead->id)->exists();
    }
}