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

    public function empresaContactos()
    {
        return $this->hasMany(EmpresaContacto::class, 'lead_id');
    }
}