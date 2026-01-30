<?php
// app/Models/Vehiculo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $table = 'vehiculos';
    
    protected $fillable = [
        'codigo_alfa',
        'nombre_mix',
        'ab_alta',
        'avl_anio',
        'avl_color',
        'avl_identificador',
        'avl_marca',
        'avl_modelo',
        'avl_patente',
        'categoria',
        'empresa_id'
    ];
    
    protected $casts = [
        'ab_alta' => 'date',
        'avl_anio' => 'integer',
        'empresa_id' => 'integer',
    ];
    
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
    
    public function abonos()
    {
        return $this->hasMany(AbonoVehiculo::class, 'vehiculo_codigo_alfa', 'codigo_alfa');
    }
    
    public function abonosActivos()
    {
        return $this->hasMany(AbonoVehiculo::class, 'vehiculo_codigo_alfa', 'codigo_alfa')
                    ->orderBy('created_at', 'desc');
    }
}