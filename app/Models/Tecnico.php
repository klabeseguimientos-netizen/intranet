<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tecnico extends Model
{
    protected $table = 'tecnicos';
    
    public $timestamps = false;
    
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
    ];
    
    public function personal()
    {
        return $this->belongsTo(Personal::class);
    }
    
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }
    
    public function modificadoPor()
    {
        return $this->belongsTo(Usuario::class, 'modified_by');
    }
    
    public function eliminadoPor()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
}