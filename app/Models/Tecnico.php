<?php
// app/Models/Tecnico.php - VERSIÓN SIMPLIFICADA

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tecnico extends Model
{
    protected $table = 'tecnicos';
    
    // IMPORTANTE: Desactivar timestamps automáticos de Laravel
    public $timestamps = false;
    
    // Especificar nombres personalizados para las columnas de fecha
    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    
    protected $fillable = [
        'personal_id',
        'direccion',
        'latitud',
        'longitud',
        'activo',
        'created_by',
        'modified_by',
        'deleted_by',
        'created',
        'modified',
        'deleted_at',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'latitud' => 'float',
        'longitud' => 'float',
        'created' => 'datetime',
        'modified' => 'datetime',
        'deleted_at' => 'datetime',
        'created_by' => 'integer',
        'modified_by' => 'integer',
        'deleted_by' => 'integer',
    ];

    public function personal()
    {
        return $this->belongsTo(Personal::class, 'personal_id');
    }
}