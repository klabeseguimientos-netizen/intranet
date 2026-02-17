<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductoServicio extends Model
{
    use SoftDeletes;
    
    protected $table = 'productos_servicios';
    
    public $timestamps = false;
    
    protected $fillable = [
        'codigopro',      // Agregado
        'nombre',
        'descripcion',
        'precio',         // Cambiado de 'valor' a 'precio'
        'tipo_id',
        'compania_id',
        'es_activo',
    ];
    
    protected $casts = [
        'es_activo' => 'boolean',
        'precio' => 'decimal:2',    // Cambiado de 'valor' a 'precio'
    ];
    
    protected $dates = [
        'created',
        'modified',
        'deleted_at'
    ];
    
    public function tipo()
    {
        return $this->belongsTo(TipoPrdSrv::class, 'tipo_id');
    }
    
    public function compania()
    {
        return $this->belongsTo(Compania::class, 'compania_id');
    }
    
    public function scopeActivo($query)
    {
        return $query->where('es_activo', true);
    }
    
    public function scopePorTipo($query, $tipoId)
    {
        return $query->where('tipo_id', $tipoId);
    }
    
    public function scopePorCompania($query, $companiaId)
    {
        return $query->where('compania_id', $companiaId);
    }
}