<?php
// app/Models/AbonoVehiculo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbonoVehiculo extends Model
{
    protected $table = 'abonos_vehiculos';
    
    public $timestamps = false;
    
    protected $fillable = [
        'vehiculo_codigo_alfa',
        'abono_codigo',
        'abono_nombre',
        'abono_precio',
        'created_at'
    ];
    
    protected $casts = [
        'abono_precio' => 'decimal:2',
        'created_at' => 'datetime',
    ];
    
    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_codigo_alfa', 'codigo_alfa');
    }
}