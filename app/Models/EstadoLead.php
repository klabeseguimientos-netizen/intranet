<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoLead extends Model
{
    protected $table = 'estados_lead';
    
    const CREATED_AT = null;
    const UPDATED_AT = null;
    const DELETED_AT = 'deleted_at';
    
    
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