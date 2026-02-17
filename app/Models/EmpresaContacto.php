<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpresaContacto extends Model
{
    protected $table = 'empresa_contactos';
    
    public $timestamps = false;
    
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
    
    protected $casts = [
        'es_activo' => 'boolean',
        'es_contacto_principal' => 'boolean',
        'fecha_nacimiento' => 'date',
        'created' => 'datetime',
        'modified' => 'datetime',
    ];
    
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
    
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
    
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }
    
    public function modificadoPor()
    {
        return $this->belongsTo(Usuario::class, 'modified_by');
    }
}