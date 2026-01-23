<?php
// app/Models/ProductoServicio.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductoServicio extends Model
{
    use SoftDeletes;

    protected $table = 'productos_servicios';
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'valor',
        'tipo_id',
        'compania_id',
        'es_activo',
    ];

    protected $casts = [
        'es_activo' => 'boolean',
        'valor' => 'decimal:2',
    ];

    public function tipo()
    {
        return $this->belongsTo(TipoPrdSrv::class, 'tipo_id');
    }
}