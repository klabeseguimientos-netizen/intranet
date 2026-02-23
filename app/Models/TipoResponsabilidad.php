<?php
// app/Models/TipoResponsabilidad.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoResponsabilidad extends Model
{
    use SoftDeletes;

    protected $table = 'tipos_responsabilidad';
    
    public $timestamps = false;
    
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'es_activo',
        'icono',
        'deleted_by'
    ];
    
    protected $casts = [
        'es_activo' => 'boolean',
        'deleted_at' => 'datetime'
    ];
    
    public function contactos(): HasMany
    {
        return $this->hasMany(EmpresaContacto::class, 'tipo_responsabilidad_id');
    }
    
    public function eliminadoPor()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
    
    public function scopeActivo($query)
    {
        return $query->where('es_activo', true);
    }
}