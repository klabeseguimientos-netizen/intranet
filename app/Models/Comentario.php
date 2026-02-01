<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comentario extends Model
{
    use SoftDeletes;
    
    protected $table = 'comentarios';
    
    // Deshabilitar timestamps automáticos de Laravel
    public $timestamps = false;
    
    protected $fillable = [
        'lead_id',
        'usuario_id',
        'tipo_comentario_id',
        'comentario',
        'created',
        'deleted_by'
    ];
    
    protected $dates = [
        'created',
        'deleted_at'
    ];
    
    protected $casts = [
        'created' => 'datetime',
        'deleted_at' => 'datetime'
    ];
    
    /**
     * Sobreescribir el método create para manejar el campo 'created'
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->created)) {
                $model->created = now();
            }
        });
    }
    
    /**
     * Relación con el lead
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }
    
    /**
     * Relación con el usuario que creó el comentario
     */
    public function usuario()
    {
        return $this->belongsTo(usuario::class, 'usuario_id');
    }
    
    /**
     * Relación con el tipo de comentario
     */
    public function tipoComentario()
    {
        return $this->belongsTo(TipoComentario::class, 'tipo_comentario_id');
    }
}