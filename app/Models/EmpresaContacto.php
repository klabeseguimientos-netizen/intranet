<?php
// app/Models/EmpresaContacto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpresaContacto extends Model
{
    protected $table = 'empresa_contactos';
    
    protected $casts = [
        'es_activo' => 'boolean',
        'es_contacto_principal' => 'boolean',
        'fecha_nacimiento' => 'date',
        'created' => 'datetime',
        'modified' => 'datetime',
    ];

    protected $fillable = [
        'empresa_id',
        'lead_id',
        'es_contacto_principal',
        'tipo_responsabilidad_id',
        'tipo_documento_id',
        'nro_documento',
        'nacionalidad_id',
        'fecha_nacimiento',
        'direccion_personal',
        'codigo_postal_personal',
        'es_activo',
        'created_by',
        'modified_by',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}