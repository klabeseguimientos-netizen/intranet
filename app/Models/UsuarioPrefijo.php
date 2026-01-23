<?php
// app/Models/UsuarioPrefijo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsuarioPrefijo extends Model
{
    protected $table = 'usuario_prefijos';
    
    protected $casts = [
        'activo' => 'boolean',
    ];

    protected $fillable = [
        'usuario_id',
        'prefijo_id',
        'activo',
        'created_by',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}