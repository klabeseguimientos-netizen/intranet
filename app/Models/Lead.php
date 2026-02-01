<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use SoftDeletes;
    
    protected $table = 'leads';
    protected $primaryKey = 'id';
    
    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    const DELETED_AT = 'deleted_at';
    
    protected $fillable = [
        'prefijo_id',
        'nombre_completo',
        'genero',
        'telefono',
        'email',
        'localidad_id',
        'rubro_id',
        'origen_id',
        'estado_lead_id',
        'es_cliente',
        'es_activo',
        'created_by',
        'modified_by',
    ];
    
    protected $casts = [
        'es_cliente' => 'boolean',
        'es_activo' => 'boolean',
        'created' => 'datetime',
        'modified' => 'datetime'
    ];
    
    // Relaciones
    public function origen()
    {
        return $this->belongsTo(OrigenContacto::class, 'origen_id');
    }
    
    public function estadoLead()
    {
        return $this->belongsTo(EstadoLead::class, 'estado_lead_id');
    }
    
    public function localidad()
    {
        return $this->belongsTo(Localidad::class, 'localidad_id')
                    ->with('provincia'); // Cargar provincia automáticamente
    }
    
    public function rubro()
    {
        return $this->belongsTo(Rubro::class, 'rubro_id');
    }
    
    public function comercial()
    {
        return $this->belongsTo(Comercial::class, 'prefijo_id', 'prefijo_id');
    }
    
    // Accessor para la localidad completa
    public function getLocalidadCompletaAttribute()
    {
        if ($this->localidad && $this->localidad->provincia) {
            return "{$this->localidad->localidad}, {$this->localidad->provincia->provincia}";
        }
        return null;
    }

    public function notas()
{
    return $this->hasMany(NotaLead::class, 'lead_id')
        ->whereNull('deleted_at')
        ->orderBy('created', 'desc');
}
}