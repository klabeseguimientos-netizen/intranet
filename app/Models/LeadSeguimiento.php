<?php
// app/Models/LeadSeguimiento.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadSeguimiento extends Model
{
    protected $table = 'leads_seguimiento';
    
    protected $fillable = [
        'lead_id',
        'fecha_ultimo_contacto',
        'fecha_proximo_contacto',
        'recordatorio_pendiente'
    ];
    
    protected $casts = [
        'fecha_ultimo_contacto' => 'datetime',
        'fecha_proximo_contacto' => 'datetime',
        'recordatorio_pendiente' => 'boolean',
        'notificado_sin_contactar' => 'boolean'
    ];
    
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}