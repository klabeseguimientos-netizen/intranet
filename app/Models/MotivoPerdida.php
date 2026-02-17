<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MotivoPerdida extends Model
{
    use SoftDeletes;
    
    protected $table = 'motivos_perdida';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'es_activo'
    ];
    
    protected $casts = [
        'es_activo' => 'boolean'
    ];
    
    public function seguimientos()
    {
        return $this->hasMany(SeguimientoPerdida::class);
    }
    
    public function scopeActivo($query)
    {
        return $query->where('es_activo', true);
    }
}