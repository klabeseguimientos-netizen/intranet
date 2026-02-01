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
    protected $with = ['rol', 'personal'];
    
    // Agregar accessor para rol_nombre
    protected $appends = ['rol_nombre', 'nombre_completo', 'es_comercial'];
    
    // Relaciones
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
    
    public function personal()
    {
        return $this->belongsTo(Personal::class, 'personal_id');
    }
    
    public function comercial()
    {
        return $this->hasOne(Comercial::class, 'personal_id', 'personal_id');
    }
    
    // Accessor para rol_nombre
    public function getRolNombreAttribute()
    {
        return $this->rol ? $this->rol->nombre : 'Sin rol';
    }
    
    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        if ($this->personal) {
            return $this->personal->nombre . ' ' . $this->personal->apellido;
        }
        return $this->nombre_usuario;
    }
    
    // Accessor para verificar si es comercial (rol_id = 5)
    public function getEsComercialAttribute()
    {
        return $this->rol_id == 5;
    }
    
    // Scope para usuarios activos
    public function scopeActivo($query)
    {
        return $query->where('activo', 1);
    }
        /**
     * Obtener los prefijos asignados al usuario
     */
    public function prefijosAsignados()
    {
        return $this->hasMany(UsuarioPrefijo::class, 'usuario_id')
            ->where('activo', true)
            ->whereNull('deleted_at');
    }
    
    /**
     * Obtener los IDs de prefijos asignados al usuario
     */
    public function getPrefijosIdsAttribute()
    {
        return $this->prefijosAsignados()->pluck('prefijo_id')->toArray();
    }
    
    /**
     * Verificar si el usuario puede ver un prefijo específico
     */
    public function puedeVerPrefijo($prefijoId)
    {
        if ($this->ve_todas_cuentas) {
            return true;
        }
        
        return in_array($prefijoId, $this->prefijos_ids);
    }

}