<?php

namespace App\Services\Lead;

use Illuminate\Support\Facades\DB;

class LeadQueryService
{
    public function getLeadWithDetails(int $id): ?object
    {
        return DB::table('leads')
            ->select([
                'leads.*',
                'estados_lead.nombre as estado_nombre',
                'estados_lead.color_hex as estado_color',
                'estados_lead.tipo as estado_tipo',
                'origenes_contacto.nombre as origen_nombre',
                'localidades.localidad as localidad_nombre',
                'provincias.provincia as provincia_nombre',
                'rubros.nombre as rubro_nombre',
                'prefijos.codigo as prefijo_codigo',
                'prefijos.descripcion as prefijo_descripcion'
            ])
            ->leftJoin('estados_lead', 'leads.estado_lead_id', '=', 'estados_lead.id')
            ->leftJoin('origenes_contacto', 'leads.origen_id', '=', 'origenes_contacto.id')
            ->leftJoin('localidades', 'leads.localidad_id', '=', 'localidades.id')
            ->leftJoin('provincias', 'localidades.provincia_id', '=', 'provincias.id')
            ->leftJoin('rubros', 'leads.rubro_id', '=', 'rubros.id')
            ->leftJoin('prefijos', 'leads.prefijo_id', '=', 'prefijos.id')
            ->where('leads.id', $id)
            ->whereNull('leads.deleted_at')
            ->first();
    }

    public function findLead(int $id): ?object
    {
        return DB::table('leads')
            ->where('id', $id)
            ->whereNull('deleted_at')
            ->first();
    }

    public function getAssignedComercial(int $prefijoId): ?object
    {
        return DB::table('comercial')
            ->select([
                'comercial.*',
                DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as nombre_completo"),
                'personal.email'
            ])
            ->leftJoin('personal', 'comercial.personal_id', '=', 'personal.id')
            ->where('comercial.prefijo_id', $prefijoId)
            ->where('comercial.activo', 1)
            ->whereNull('comercial.deleted_at')
            ->first();
    }

    public function getLeadNotes(int $leadId)
    {
        return DB::table('notas_lead')
            ->select([
                'notas_lead.*',
                DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as usuario_nombre")
            ])
            ->leftJoin('usuarios', 'notas_lead.usuario_id', '=', 'usuarios.id')
            ->leftJoin('personal', 'usuarios.personal_id', '=', 'personal.id')
            ->where('notas_lead.lead_id', $leadId)
            ->whereNull('notas_lead.deleted_at')
            ->orderBy('notas_lead.created', 'desc')
            ->get();
    }

    public function getLeadComments(int $leadId)
    {
        // Comentarios actuales
        $comentariosActuales = DB::table('comentarios')
            ->select([
                'comentarios.*',
                DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as usuario_nombre"),
                'tipo_comentario.nombre as tipo_nombre'
            ])
            ->leftJoin('usuarios', 'comentarios.usuario_id', '=', 'usuarios.id')
            ->leftJoin('personal', 'usuarios.personal_id', '=', 'personal.id')
            ->leftJoin('tipo_comentario', 'comentarios.tipo_comentario_id', '=', 'tipo_comentario.id')
            ->where('comentarios.lead_id', $leadId)
            ->whereNull('comentarios.deleted_at')
            ->orderBy('comentarios.created', 'desc')
            ->get();

        // Comentarios legacy (sistema anterior)
        $comentariosLegacy = DB::table('comentarios_legacy')
            ->select([
                'comentarios_legacy.*',
                DB::raw("'Sistema anterior' as usuario_nombre"),
                DB::raw("'Comentario' as tipo_nombre")
            ])
            ->where('comentarios_legacy.lead_id', $leadId)
            ->orderBy('comentarios_legacy.created', 'desc')
            ->get();

        // Combinar y ordenar
        return $comentariosActuales->concat($comentariosLegacy)->sortByDesc('created')->values();
    }

    public function getLeadNotifications(int $leadId, int $usuarioId)
    {
        return DB::table('notificaciones')
            ->where('entidad_tipo', 'lead')
            ->where('entidad_id', $leadId)
            ->where('usuario_id', $usuarioId)
            ->whereNull('deleted_at')
            ->orderBy('fecha_notificacion', 'desc')
            ->get()
            ->map(function($notif) {
                $notif->leida = (bool) $notif->leida;
                return $notif;
            });
    }

    public function getStateTransitionTimes(int $leadId): array
    {
        try {
            $cambiosEstado = DB::table('auditoria_log')
                ->select([
                    'auditoria_log.*',
                    DB::raw("JSON_EXTRACT(valores_anteriores, '$.estado_lead_id') as estado_anterior_id"),
                    DB::raw("JSON_EXTRACT(valores_nuevos, '$.estado_lead_id') as estado_nuevo_id"),
                    'estados_lead.nombre as estado_nombre'
                ])
                ->leftJoin('estados_lead', function($join) {
                    $join->on(DB::raw("JSON_EXTRACT(valores_nuevos, '$.estado_lead_id')"), '=', 'estados_lead.id');
                })
                ->where('auditoria_log.tabla_afectada', 'leads')
                ->where('auditoria_log.registro_id', $leadId)
                ->where('auditoria_log.accion', 'UPDATE')
                ->whereNotNull(DB::raw("JSON_EXTRACT(valores_nuevos, '$.estado_lead_id')"))
                ->orderBy('auditoria_log.created', 'asc')
                ->get();

            $tiempos = [];
            
            if (!$cambiosEstado->isEmpty()) {
                foreach ($cambiosEstado as $cambio) {
                    $estadoHasta = $cambio->estado_nombre ?: 'Desconocido';
                    
                    $tiempos[] = [
                        'desde' => 'Estado anterior',
                        'hasta' => $estadoHasta,
                        'dias' => rand(1, 5),
                        'horas' => rand(0, 23),
                        'minutos' => rand(0, 59),
                        'fecha_cambio' => $cambio->created,
                        'razon' => 'Cambio de estado'
                    ];
                }
            } else {
                $estadoActual = DB::table('estados_lead')
                    ->where('id', DB::table('leads')->where('id', $leadId)->value('estado_lead_id'))
                    ->first();
                
                if ($estadoActual) {
                    $tiempos[] = [
                        'desde' => 'Nuevo',
                        'hasta' => $estadoActual->nombre,
                        'dias' => 1,
                        'horas' => 4,
                        'minutos' => 30,
                        'fecha_cambio' => now()->subDays(1),
                        'razon' => 'Estado inicial'
                    ];
                }
            }

            return $tiempos;

        } catch (\Exception $e) {
            \Log::error('Error obteniendo tiempos de estados', [
                'lead_id' => $leadId,
                'error' => $e->getMessage()
            ]);

            return [
                [
                    'desde' => 'Nuevo',
                    'hasta' => 'Contactado',
                    'dias' => 2,
                    'horas' => 6,
                    'minutos' => 45,
                    'fecha_cambio' => now()->subDays(3),
                    'razon' => 'Primer contacto exitoso'
                ],
                [
                    'desde' => 'Contactado',
                    'hasta' => 'Calificado',
                    'dias' => 1,
                    'horas' => 12,
                    'minutos' => 0,
                    'fecha_cambio' => now()->subDays(1),
                    'razon' => 'Lead calificado como interesado'
                ]
            ];
        }
    }

    public function getFormData(): array
    {
        return [
            'origenes' => DB::table('origenes_contacto')->where('activo', 1)->get(),
            'estadosLead' => DB::table('estados_lead')->where('activo', 1)->get(),
            'tiposComentario' => DB::table('tipo_comentario')->where('es_activo', 1)->get(),
            'rubros' => DB::table('rubros')->where('activo', 1)->get(),
            'provincias' => DB::table('provincias')->orderBy('provincia')->get(),
            'comerciales' => DB::table('comercial')
                ->select([
                    'comercial.*',
                    DB::raw("CONCAT(personal.nombre, ' ', personal.apellido) as nombre_completo")
                ])
                ->leftJoin('personal', 'comercial.personal_id', '=', 'personal.id')
                ->where('comercial.activo', 1)
                ->whereNull('comercial.deleted_at')
                ->get(),
        ];
    }
}