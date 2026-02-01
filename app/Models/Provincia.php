<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Provincia extends Model
{
    
    protected $table = 'provincias';
    protected $primaryKey = 'id';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = null; // No hay campo modified
    
    protected $fillable = [
        'provincia',
        'activo',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'created' => 'datetime'
    ];
    
    // Relación con localidades
    public function localidades()
    {
        return $this->hasMany(Localidad::class, 'provincia_id')
                    ->where('activo', 1)
                    ->orderBy('localidad');
    }
    
    public function localidadesTodas()
    {
        return $this->hasMany(Localidad::class, 'provincia_id')
                    ->orderBy('localidad');
    }
    
    // Scope para provincias activas
    public function scopeActivo($query)
    {
        return $query->where('activo', 1);
    }
    
    // Scope para ordenar por nombre
    public function scopeOrdenar($query, $orden = 'asc')
    {
        return $query->orderBy('provincia', $orden);
    }
}