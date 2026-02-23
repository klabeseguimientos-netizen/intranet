<?php
// app/Models/CategoriaFiscal.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaFiscal extends Model
{
    use SoftDeletes;

    protected $table = 'categorias_fiscales';
    
    public $timestamps = false;
    
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'es_activo',
        'deleted_by'
    ];
    
    protected $casts = [
        'es_activo' => 'boolean',
        'created' => 'datetime',
        'deleted_at' => 'datetime'
    ];
    
    public function empresas(): HasMany
    {
        return $this->hasMany(Empresa::class, 'cat_fiscal_id');
    }
    
    public function eliminadoPor()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
    
    public function scopeActivo($query)
    {
        return $query->where('es_activo', true);
    }
}