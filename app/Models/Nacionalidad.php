<?php
// app/Models/Nacionalidad.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Nacionalidad extends Model
{
    protected $table = 'nacionalidades';
    
    public $timestamps = false;
    
    protected $fillable = [
        'pais',
        'gentilicio',
        'codigo_iso2',
        'codigo_iso3',
        'activo',
        'created'
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'created' => 'datetime'
    ];
    
    /**
     * Relación con los contactos de empresa
     */
    public function contactos(): HasMany
    {
        return $this->hasMany(EmpresaContacto::class, 'nacionalidad_id');
    }
    
    /**
     * Scope para registros activos
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}