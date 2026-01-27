<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notificacion extends Model
{
    use SoftDeletes;
    
    protected $table = 'notificaciones';
    
    protected $fillable = [
        'usuario_id',
        'titulo',
        'mensaje',
        'tipo',
        'entidad_tipo',
        'entidad_id',
        'leida',
        'fecha_leida',
        'fecha_notificacion',
        'prioridad',
    ];
    
    protected $casts = [
        'leida' => 'boolean',
        'fecha_notificacion' => 'datetime',
        'fecha_leida' => 'datetime',
    ];
    
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}