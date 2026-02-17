<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoPersonal extends Model
{
    protected $table = 'tipo_personal';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'activo',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
    ];
    
    public function personal()
    {
        return $this->hasMany(Personal::class);
    }
}