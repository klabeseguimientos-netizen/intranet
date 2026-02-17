<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rubro extends Model
{
    protected $table = 'rubros';
    protected $primaryKey = 'id';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'activo'
    ];
    
    protected $casts = [
        'activo' => 'boolean'
    ];
    
    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
    
    public function empresas()
    {
        return $this->hasMany(Empresa::class);
    }
    
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}