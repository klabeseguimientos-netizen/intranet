<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoLead extends Model
{
    protected $table = 'estados_lead';
    
    protected $fillable = [
        'nombre',
        'color_hex',
        'tipo',
        'activo'
    ];
    
    protected $casts = [
        'activo' => 'boolean'
    ];
    
    public function leads()
    {
        return $this->hasMany(Lead::class, 'estado_lead_id');
    }
}