<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoPrdSrv extends Model
{
    use SoftDeletes;
    
    protected $table = 'tipo_prd_srv';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre_tipo_abono',
        'descripcion',
        'es_activo',
    ];
    
    protected $casts = [
        'es_activo' => 'boolean',
    ];
    
    public function productos()
    {
        return $this->hasMany(ProductoServicio::class, 'tipo_id');
    }
}