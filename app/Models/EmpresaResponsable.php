<?php
// app/Models/EmpresaResponsable.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpresaResponsable extends Model
{
    use SoftDeletes;

    protected $table = 'empresa_responsables';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'empresa_id',
        'tipo_responsabilidad_id',
        'nombre',
        'apellido',
        'telefono',
        'email',
        'es_activo',
        'created_by',
        'modified_by',
        'deleted_by'
    ];

    protected $casts = [
        'es_activo' => 'boolean',
        'created' => 'datetime',
        'modified' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Relación con la empresa
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    /**
     * Relación con el tipo de responsabilidad
     */
    public function tipoResponsabilidad(): BelongsTo
    {
        return $this->belongsTo(TipoResponsabilidad::class, 'tipo_responsabilidad_id');
    }

    /**
     * Usuario que creó el registro
     */
    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }

    /**
     * Usuario que modificó el registro
     */
    public function modificadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'modified_by');
    }

    /**
     * Usuario que eliminó el registro
     */
    public function eliminadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }

    /**
     * Scope para responsables activos
     */
    public function scopeActivo($query)
    {
        return $query->where('es_activo', true);
    }

    /**
     * Accessor para nombre completo
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim($this->nombre . ' ' . $this->apellido);
    }
}