<?php
// app/Models/OrigenContacto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrigenContacto extends Model
{
    protected $table = 'origenes_contacto';
    
    protected $casts = [
        'es_activo' => 'boolean',
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'origen_id');
    }
}