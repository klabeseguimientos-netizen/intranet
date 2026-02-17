<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comentario extends Model
{
    use SoftDeletes;
    
    protected $table = 'comentarios';
    
    public $timestamps = false;
    
    protected $fillable = [
        'lead_id',
        'usuario_id',
        'tipo_comentario_id',
        'comentario',
        'created',
        'deleted_by'
    ];
    
    protected $casts = [
        'created' => 'datetime',
        'deleted_at' => 'datetime'
    ];
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->created)) {
                $model->created = now();
            }
        });
    }
    
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
    
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }
    
    public function tipoComentario()
    {
        return $this->belongsTo(TipoComentario::class);
    }
    
    public function eliminadoPor()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
}