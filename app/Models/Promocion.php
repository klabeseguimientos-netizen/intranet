<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promocion extends Model
{
    use HasFactory;

    protected $table = 'promociones';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'created_by',
        'modified_by'
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'activo' => 'boolean',
        'created' => 'datetime',
        'modified' => 'datetime'
    ];


    // Relaciones
    public function productos()
    {
        return $this->hasMany(PromocionProducto::class, 'promocion_id');
    }

    public function creador()
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }

    public function modificador()
    {
        return $this->belongsTo(Usuario::class, 'modified_by');
    }

    // Scopes
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function scopeVigente($query)
    {
        return $query->where('fecha_inicio', '<=', now())
                     ->where('fecha_fin', '>=', now())
                     ->where('activo', true);
    }

    // Accessors
    public function getEstadoAttribute()
    {
        if (!$this->activo) return 'Inactiva';
        
        $hoy = now();
        
        if ($hoy < $this->fecha_inicio) return 'Próxima';
        if ($hoy > $this->fecha_fin) return 'Vencida';
        
        return 'Vigente';
    }

    public function scopeWithAllRelations($query)
    {
    return $query->with([
        'productos.productoServicio.compania',
        'creador.personal'
        ]);
    }
}