<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'id';
    
    protected $fillable = ['nombre', 'descripcion', 'activo'];
    
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'rol_id');
    }
}
