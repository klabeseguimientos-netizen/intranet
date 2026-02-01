<?php
// app/Models/Comercial.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comercial extends Model
{
    use SoftDeletes;
    
    protected $table = 'comercial';
    protected $primaryKey = 'id';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'personal_id',
        'prefijo_id',
        'firma',
        'img_comercial',
        'compania_id',
        'activo',
        'created_by',
        'modified_by',
        'deleted_by'
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'compania_id' => 'integer',
        'created' => 'datetime',
        'modified' => 'datetime'
    ];
    
    // Relación con personal
    public function personal()
    {
        return $this->belongsTo(Personal::class, 'personal_id');
    }
    
    // Relación con leads (usando prefijo_id)
    public function leads()
    {
        return $this->hasMany(Lead::class, 'prefijo_id', 'prefijo_id');
    }
    
    // Scope para activos
    public function scopeActivo($query)
    {
        return $query->where('activo', 1);
    }
    
    // Accessor para nombre completo del comercial
    public function getNombreCompletoAttribute()
    {
        if ($this->personal) {
            return $this->personal->nombre . ' ' . $this->personal->apellido;
        }
        return 'Comercial #' . $this->id;
    }
}