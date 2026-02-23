<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromocionProducto extends Model
{
    use HasFactory;

    protected $table = 'promociones_productos';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = null;
    
    protected $fillable = [
        'promocion_id',
        'producto_servicio_id',
        'tipo_promocion',
        'cantidad_minima',
        'bonificacion'
    ];

    protected $casts = [
        'bonificacion' => 'decimal:2',
        'created' => 'datetime'
    ];

    // Relaciones
    public function promocion()
    {
        return $this->belongsTo(Promocion::class, 'promocion_id');
    }

    public function productoServicio()
    {
        return $this->belongsTo(ProductoServicio::class, 'producto_servicio_id');
    }

    // Métodos de ayuda
    public function getCantidadRequeridaAttribute(): int
    {
        return $this->cantidad_minima ?? match($this->tipo_promocion) {
            '2x1' => 2,
            '3x2' => 3,
            default => 1
        };
    }

    public function getDescripcionPromocionAttribute(): string
    {
        return match($this->tipo_promocion) {
            'porcentaje' => "{$this->bonificacion}% de descuento",
            '2x1' => "2x1 ({$this->bonificacion}% efectivo)",
            '3x2' => "3x2 ({$this->bonificacion}% efectivo)",
        };
    }
}