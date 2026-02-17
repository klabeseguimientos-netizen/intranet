<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
    
    protected $with = ['rol', 'personal'];
    
    protected $appends = ['rol_nombre', 'nombre_completo', 'es_comercial'];
    
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class);
    }
    
    public function personal(): BelongsTo
    {
        return $this->belongsTo(Personal::class);
    }
    
    public function comercial(): HasOne
    {
        return $this->hasOne(Comercial::class, 'personal_id', 'personal_id');
    }
    
    public function prefijosAsignados(): HasMany
    {
        return $this->hasMany(UsuarioPrefijo::class)
            ->where('activo', true)
            ->whereNull('deleted_at');
    }
    
    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class);
    }
    
    public function notas(): HasMany
    {
        return $this->hasMany(NotaLead::class);
    }
    
    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }
    
    public function getRolNombreAttribute(): string
    {
        return $this->rol ? $this->rol->nombre : 'Sin rol';
    }
    
    public function getNombreCompletoAttribute(): string
    {
        if ($this->personal) {
            return $this->personal->nombre . ' ' . $this->personal->apellido;
        }
        return $this->nombre_usuario;
    }
    
    public function getEsComercialAttribute(): bool
    {
        return $this->rol_id == 5;
    }
    
    public function getPrefijosIdsAttribute(): array
    {
        return $this->prefijosAsignados()->pluck('prefijo_id')->toArray();
    }
    
    public function puedeVerPrefijo($prefijoId): bool
    {
        if ($this->ve_todas_cuentas) {
            return true;
        }
        
        return in_array($prefijoId, $this->prefijos_ids);
    }
    
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}