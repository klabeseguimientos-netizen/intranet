<?php
// app/Models/Lead.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $table = 'leads';
    
    protected $casts = [
        'es_cliente' => 'boolean',
        'es_activo' => 'boolean',
        'created' => 'datetime',
        'modified' => 'datetime',
    ];

    protected $fillable = [
        'prefijo_id',
        'nombre_completo',
        'genero',
        'telefono',
        'email',
        'localidad_id',
        'rubro_id',
        'origen_id',
        'estado_lead_id',
        'es_cliente',
        'es_activo',
        'created_by',
        'modified_by',
    ];

    public function origen()
    {
        return $this->belongsTo(OrigenContacto::class, 'origen_id');
    }

    public function estadoLead()
    {
        return $this->belongsTo(EstadoLead::class, 'estado_lead_id');
    }

    public function empresaContactos()
    {
        return $this->hasMany(EmpresaContacto::class, 'lead_id');
    }
}