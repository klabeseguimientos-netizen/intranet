<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
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
    
    public function usuarios()
    {
        return $this->hasMany(Usuario::class);
    }
    
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}