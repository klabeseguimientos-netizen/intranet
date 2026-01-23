<?php
// app/Models/EstadoLead.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoLead extends Model
{
    protected $table = 'estados_lead';
    
    public function leads()
    {
        return $this->hasMany(Lead::class, 'estado_lead_id');
    }
}