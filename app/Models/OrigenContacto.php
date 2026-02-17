<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrigenContacto extends Model
{
    use SoftDeletes;
    
    protected $table = 'origenes_contacto';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'color',
        'icono',
        'activo',
        'deleted_by'
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'deleted_at' => 'datetime',
    ];
    
    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
    
    public function eliminadoPor()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
    
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
    
    public function scopeInactivo($query)
    {
        return $query->where('activo', false);
    }
}