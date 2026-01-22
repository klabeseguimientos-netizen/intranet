<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Authenticatable
{
    use Notifiable, SoftDeletes;

    protected $table = 'usuarios';
    protected $primaryKey = 'id';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'personal_id',
        'nombre_usuario',
        'password',
        'rol_id',
        've_todas_cuentas',
        'activo',
        'ultimo_acceso'
    ];
    
    protected $hidden = [
        'password',
        'remember_token',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        've_todas_cuentas' => 'boolean',
        'ultimo_acceso' => 'datetime',
        'created' => 'datetime',
        'modified' => 'datetime',
        'deleted_at' => 'datetime'
    ];
    
    // Cargar la relación rol automáticamente
    protected $with = ['rol'];
    
    // Agregar accessor para rol_nombre
    protected $appends = ['rol_nombre'];
    
    // Sobrescribir el campo de identificación
    public function getAuthIdentifierName()
    {
        return 'nombre_usuario';
    }
    
    // Relaciones
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
    
    // Accessor para rol_nombre
    public function getRolNombreAttribute()
    {
        return $this->rol ? $this->rol->nombre : 'Sin rol';
    }
    
    // Scope para usuarios activos
    public function scopeActivo($query)
    {
        return $query->where('activo', 1);
    }
}