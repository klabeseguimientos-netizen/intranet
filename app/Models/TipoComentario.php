<?php
// app/Models/Tecnico.php - VERSIÓN SIMPLIFICADA

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoComentario extends Model
{
    protected $table = 'tipo_comentario'; 
    
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
        'dias_recordatorio_default' => 'integer'
    ];
}