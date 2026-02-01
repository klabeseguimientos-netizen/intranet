<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Localidad extends Model
{
    
    protected $table = 'localidades';
    protected $primaryKey = 'id';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = null; // No hay campo modified
    
    protected $fillable = [
        'provincia_id',
        'localidad',
        'codigo_postal',
        'activo',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'provincia_id' => 'integer',
        'created' => 'datetime'
    ];
    
    // Relación con provincia
    public function provincia()
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }
    
    // Relación con leads (si existe)
    public function leads()
    {
        return $this->hasMany(Lead::class, 'localidad_id');
    }
    
    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        if ($this->provincia) {
            return "{$this->localidad}, {$this->provincia->provincia}";
        }
        return $this->localidad;
    }
    
    // Scope para localidades activas
    public function scopeActivo($query)
    {
        return $query->where('activo', 1);
    }
    
    // Scope para ordenar por nombre
    public function scopeOrdenar($query, $orden = 'asc')
    {
        return $query->orderBy('localidad', $orden);
    }
    
    // Scope para buscar por término
    public function scopeBuscar($query, $termino)
    {
        return $query = Localidad::with('provincia')
            ->where('activo', 1) // Usar where directamente en lugar de scope
            ->where(function($q) use ($request) {
                $q->where('localidad', 'LIKE', "%{$request->search}%")
                  ->orWhere('codigo_postal', 'LIKE', "%{$request->search}%");
        });
    }
    
    // Scope para filtrar por provincia
    public function scopePorProvincia($query, $provinciaId)
    {
        if ($provinciaId) {
            return $query->where('provincia_id', $provinciaId);
        }
        return $query;
    }
}