<?php
// app/Services/Lead/LeadPresupuestoService.php

namespace App\Services\Lead;

use App\Models\Lead;
use App\Models\Presupuesto;
use App\Models\PresupuestoLegacy;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeadPresupuestoService
{
    /**
     * Verificar si la tabla de presupuestos legacy existe
     */
    private function tablaLegacyExiste(): bool
    {
        try {
            DB::table('presupuestos_legacy')->limit(1)->get();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Obtener presupuestos del sistema nuevo
     */
    public function getPresupuestosNuevos(Lead $lead): Collection
    {
        return Presupuesto::where('lead_id', $lead->id)
            ->with(['prefijo.comercial.personal', 'promocion', 'estado']) // Cambiado de 'comercial' a 'prefijo.comercial.personal'
            ->orderBy('created', 'desc')
            ->get()
            ->map(function ($presupuesto) {
                // Obtener el nombre del comercial a través del accessor
                $nombreComercial = $presupuesto->nombre_comercial;
                
                return [
                    'id' => $presupuesto->id,
                    'tipo' => 'nuevo',
                    'nombre' => $presupuesto->referencia,
                    'referencia' => $presupuesto->referencia,
                    'fecha' => $presupuesto->created->format('d/m/Y H:i'),
                    'fecha_original' => $presupuesto->created->toISOString(),
                    'estado' => $presupuesto->estado->nombre ?? 'N/A',
                    'estado_color' => $presupuesto->estado->color ?? null,
                    'total' => (float) $presupuesto->total_presupuesto,
                    'comercial' => $nombreComercial,
                    'comercial_id' => $presupuesto->prefijo_id, // ID del prefijo (comercial)
                    'promocion' => $presupuesto->promocion->nombre ?? null,
                    'promocion_id' => $presupuesto->promocion_id,
                    'tiene_pdf' => true,
                    'pdf_url' => "/comercial/presupuestos/{$presupuesto->id}/pdf",
                    'metadata' => [
                        'cantidad_vehiculos' => $presupuesto->cantidad_vehiculos,
                        'descripcion' => $presupuesto->descripcion ?? null,
                        'validez' => $presupuesto->validez?->format('d/m/Y'),
                        'validez_dias' => $presupuesto->validez_dias ?? null,
                        'subtotal_tasa' => $presupuesto->subtotal_tasa,
                        'subtotal_abono' => $presupuesto->subtotal_abono,
                        'subtotal_productos' => $presupuesto->subtotal_productos_agregados,
                    ]
                ];
            });
    }

    /**
     * Obtener presupuestos legacy (sistema anterior)
     */
    public function getPresupuestosLegacy(Lead $lead): Collection
    {
        if (!$this->tablaLegacyExiste()) {
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
                    'tipo' => 'legacy',
                    'nombre' => $presupuesto->nombre_presupuesto ?? "Presupuesto #{$presupuesto->id}",
                    'fecha' => $presupuesto->fecha_presupuesto?->format('d/m/Y H:i'),
                    'fecha_original' => $presupuesto->fecha_presupuesto?->toISOString(),
                    'tiene_pdf' => !empty($presupuesto->pdf_path),
                    'pdf_url' => $presupuesto->pdf_path ? "/presupuestos-legacy/{$presupuesto->id}/pdf" : null,
                    'prefijo_id' => $presupuesto->prefijo_id,
                    'prefijo' => $presupuesto->prefijo ? [
                        'id' => $presupuesto->prefijo->id,
                        'codigo' => $presupuesto->prefijo->codigo,
                        'nombre' => $presupuesto->prefijo->nombre
                    ] : null,
                    'metadata' => [
                        'cantidad_vehiculos' => $metadata['cantidad_vehiculos'] ?? $metadata['cantidad'] ?? null,
                        'descripcion' => $metadata['descripcion'] ?? null,
                        'importe' => $metadata['importe'] ?? 0,
                    ]
                ];
            });
    }

    /**
     * Obtener todos los presupuestos unificados
     */
    public function getPresupuestosUnificados(Lead $lead): array
    {
        $nuevos = $this->getPresupuestosNuevos($lead);
        $legacy = $this->getPresupuestosLegacy($lead);

        return [
            'nuevos' => $nuevos,
            'legacy' => $legacy,
            'todos' => $nuevos->concat($legacy)->sortByDesc('fecha_original')->values()
        ];
    }

    /**
     * Obtener estadísticas combinadas
     */
    public function getEstadisticas(Lead $lead): array
    {
        $nuevos = $this->getPresupuestosNuevos($lead);
        $legacy = $this->getPresupuestosLegacy($lead);

        $totalNuevos = $nuevos->count();
        $totalLegacy = $legacy->count();
        $total = $totalNuevos + $totalLegacy;

        $totalImporteNuevos = $nuevos->sum('total');
        $totalImporteLegacy = $legacy->sum(function ($item) {
            return $item['metadata']['importe'] ?? 0;
        });

        return [
            'total_presupuestos' => $total,
            'total_nuevos' => $totalNuevos,
            'total_legacy' => $totalLegacy,
            'total_con_pdf' => $nuevos->filter(fn($p) => $p['tiene_pdf'])->count() + 
                               $legacy->filter(fn($p) => $p['tiene_pdf'])->count(),
            'total_importe' => $totalImporteNuevos + $totalImporteLegacy,
            'total_importe_formateado' => '$ ' . number_format($totalImporteNuevos + $totalImporteLegacy, 2, ',', '.'),
        ];
    }

    /**
     * Verificar si un lead tiene presupuestos legacy
     */
    public function tienePresupuestosLegacy(Lead $lead): bool
    {
        if (!$this->tablaLegacyExiste()) {
            return false;
        }

        return PresupuestoLegacy::where('lead_id', $lead->id)->exists();
    }
}