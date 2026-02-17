<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Provincia extends Model
{
    protected $table = 'provincias';
    protected $primaryKey = 'id';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = null;
    
    protected $fillable = [
        'provincia',
        'activo',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'created' => 'datetime'
    ];
    
    public function localidades()
    {
        return $this->hasMany(Localidad::class)
                    ->where('activo', true)
                    ->orderBy('localidad');
    }
    
    public function localidadesTodas()
    {
        return $this->hasMany(Localidad::class)
                    ->orderBy('localidad');
    }
    
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
    
    public function scopeOrdenar($query, $orden = 'asc')
    {
        return $query->orderBy('provincia', $orden);
    }
}