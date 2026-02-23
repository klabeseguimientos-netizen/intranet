<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoEntidad extends Model
{
    use SoftDeletes;

    protected $table = 'estados_entidades';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = null;
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'activo',
        'deleted_by'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'created' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function presupuestos(): HasMany
    {
        return $this->hasMany(Presupuesto::class, 'estado_id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', 1);
    }

    // Accessors
    public function getEstadoAttribute(): string
    {
        return $this->activo ? 'Activo' : 'Inactivo';
    }
}