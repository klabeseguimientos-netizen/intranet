<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoComentario extends Model
{
    use SoftDeletes;
    
    protected $table = 'tipo_comentario';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'aplica_a',
        'crea_recordatorio',
        'dias_recordatorio_default',
        'es_activo',
        'created',
        'deleted_at',
        'deleted_by'
    ];
    
    protected $casts = [
        'crea_recordatorio' => 'boolean',
        'es_activo' => 'boolean',
        'dias_recordatorio_default' => 'integer',
        'created' => 'datetime',
        'deleted_at' => 'datetime',
    ];
    
    public function comentarios()
    {
        return $this->hasMany(Comentario::class);
    }
    
    public function eliminadoPor()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
}