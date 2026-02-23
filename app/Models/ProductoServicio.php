<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoServicio extends Model
{
    use SoftDeletes;

    protected $table = 'productos_servicios';

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'codigopro',
        'nombre',
        'descripcion',
        'precio',
        'tipo_id',
        'compania_id',
        'es_activo',
        'es_presupuestable', // ← AGREGADO
        'modified_by',
        'deleted_by'
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'es_activo' => 'boolean',
        'es_presupuestable' => 'boolean', // ← AGREGADO
        'created' => 'datetime',
        'modified' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $with = ['tipo', 'compania'];

    // Relaciones
    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoPrdSrv::class, 'tipo_id');
    }

    public function compania(): BelongsTo
    {
        return $this->belongsTo(Compania::class);
    }

    // SCOPES
    public function scopeTasas($query)
    {
        return $query->whereHas('tipo', function($q) {
            $q->where('nombre_tipo_abono', 'TASAS');
        });
    }

    public function scopeAbonos($query)
    {
        return $query->whereHas('tipo', function($q) {
            $q->whereIn('nombre_tipo_abono', ['ABONO', 'CONVENIO']);
        });
    }

    public function scopeSoloAbonos($query)
    {
        return $query->whereHas('tipo', function($q) {
            $q->where('nombre_tipo_abono', 'ABONO');
        });
    }

    public function scopeSoloConvenios($query)
    {
        return $query->whereHas('tipo', function($q) {
            $q->where('nombre_tipo_abono', 'CONVENIO');
        });
    }

    public function scopeAccesorios($query)
    {
        return $query->whereHas('tipo', function($q) {
            $q->where('nombre_tipo_abono', 'ACCESORIOS');
        });
    }

    public function scopeServicios($query)
    {
        return $query->whereHas('tipo', function($q) {
            $q->where('nombre_tipo_abono', 'SERVICIO');
        });
    }

    public function scopeActivos($query)
    {
        return $query->where('es_activo', 1);
    }

    // ← NUEVO SCOPE: Solo productos presupuestables
    public function scopePresupuestables($query)
    {
        return $query->where('es_presupuestable', 1);
    }

    // MÉTODOS DE INSTANCIA
    public function esAbono(): bool
    {
        return $this->tipo && $this->tipo->nombre_tipo_abono === 'ABONO';
    }

    public function esConvenio(): bool
    {
        return $this->tipo && $this->tipo->nombre_tipo_abono === 'CONVENIO';
    }

    public function esTasa(): bool
    {
        return $this->tipo && $this->tipo->nombre_tipo_abono === 'TASAS';
    }

    public function esAccesorio(): bool
    {
        return $this->tipo && $this->tipo->nombre_tipo_abono === 'ACCESORIOS';
    }

    public function esServicio(): bool
    {
        return $this->tipo && $this->tipo->nombre_tipo_abono === 'SERVICIO';
    }

    public function getTipoTextoAttribute(): string
    {
        return $this->tipo?->nombre_tipo_abono ?? 'Desconocido';
    }

    // ← NUEVO: Verificar si es presupuestable
    public function esPresupuestable(): bool
    {
        return $this->es_presupuestable && $this->es_activo;
    }
}