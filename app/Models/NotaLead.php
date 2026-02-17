<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotaLead extends Model
{
    use SoftDeletes;
    
    protected $table = 'notas_lead';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'lead_id',
        'usuario_id',
        'observacion',
        'tipo'
    ];
    
    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }
    
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}