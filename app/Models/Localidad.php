<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Localidad extends Model
{
    protected $table = 'localidades';
    protected $primaryKey = 'id';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = null;
    
    protected $fillable = [
        'provincia_id',
        'localidad',
        'codigo_postal',
        'activo',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'created' => 'datetime'
    ];
    
    protected $appends = ['nombre_completo'];
    
    public function provincia()
    {
        return $this->belongsTo(Provincia::class);
    }
    
    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
    
    public function getNombreCompletoAttribute()
    {
        if ($this->provincia) {
            return "{$this->localidad}, {$this->provincia->provincia}";
        }
        return $this->localidad;
    }
    
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
    
    public function scopeOrdenar($query, $orden = 'asc')
    {
        return $query->orderBy('localidad', $orden);
    }
    
    public function scopePorProvincia($query, $provinciaId)
    {
        if ($provinciaId) {
            return $query->where('provincia_id', $provinciaId);
        }
        return $query;
    }
    
    public function scopeBuscar($query, $termino)
    {
        return $query->where('activo', true)
            ->where(function($q) use ($termino) {
                $q->where('localidad', 'LIKE', "%{$termino}%")
                  ->orWhere('codigo_postal', 'LIKE', "%{$termino}%");
            });
    }
}