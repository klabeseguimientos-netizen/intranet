<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SeguimientoPerdida extends Model
{
    use SoftDeletes;
    
    protected $table = 'seguimientos_perdida';
    
    public $timestamps = false;
    
    protected $fillable = [
        'lead_id',
        'motivo_perdida_id',
        'notas_adicionales',
        'created',
        'posibilidades_futuras',
        'fecha_posible_recontacto',
        'updated',
        'restaurado',
        'fecha_restauracion',
        'restaurado_por',
        'deleted_at',
        'deleted_by'
    ];
    
    protected $casts = [
        'created' => 'datetime',
        'updated' => 'datetime',
        'fecha_posible_recontacto' => 'date',
        'fecha_restauracion' => 'datetime',
        'restaurado' => 'boolean',
        'deleted_at' => 'datetime',
    ];
    
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
    
    public function motivo()
    {
        return $this->belongsTo(MotivoPerdida::class, 'motivo_perdida_id');
    }
    
    public function usuarioRestauracion()
    {
        return $this->belongsTo(Usuario::class, 'restaurado_por');
    }
}