<?php
// app/Models/TipoDocumento.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoDocumento extends Model
{
    use SoftDeletes;

    protected $table = 'tipos_documento';
    
    public $timestamps = false;
    
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'nombre',
        'abreviatura',
        'es_activo',
        'deleted_by'
    ];
    
    protected $casts = [
        'es_activo' => 'boolean',
        'deleted_at' => 'datetime'
    ];
    
    public function contactos(): HasMany
    {
        return $this->hasMany(EmpresaContacto::class, 'tipo_documento_id');
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