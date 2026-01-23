<?php
// app/Models/TipoPersonal.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoPersonal extends Model
{
    protected $table = 'tipo_personal';
    
    protected $casts = [
        'activo' => 'boolean',
    ];

    protected $fillable = [
        'nombre',
        'activo',
    ];

    public function personal()
    {
        return $this->hasMany(Personal::class, 'tipo_personal_id');
    }
}