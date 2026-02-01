<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotaLead extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notas_lead';
    
    protected $primaryKey = 'id';
    
    public $timestamps = false;
    
    protected $fillable = [
        'lead_id',
        'usuario_id',
        'observacion',
        'tipo',
        'created',
        'deleted_at',
        'deleted_by'
    ];
    
    protected $casts = [
        'created' => 'datetime',
        'deleted_at' => 'datetime'
    ];
    
    /**
     * Obtener el lead asociado
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }
    
    /**
     * Obtener el usuario que creó la nota
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id')
            ->with('personal'); // Cargar la relación con personal
    }
    
    /**
     * Scope para notas activas (no eliminadas)
     */
    public function scopeActivas($query)
    {
        return $query->whereNull('deleted_at');
    }
    
    /**
     * Obtener el tipo de nota en formato legible
     */
    public function getTipoTextoAttribute()
    {
        $tipos = [
            'informacion_cliente' => 'Información del Cliente',
            'detalle_contacto' => 'Detalle del Contacto',
            'observacion_inicial' => 'Nota Inicial'
        ];
        
        return $tipos[$this->tipo] ?? $this->tipo;
    }
    
    /**
     * Obtener el nombre completo del usuario
     */
    public function getNombreUsuarioAttribute()
    {
        if ($this->usuario && $this->usuario->personal) {
            return $this->usuario->personal->nombre . ' ' . $this->usuario->personal->apellido;
        }
        
        return 'Usuario #' . $this->usuario_id;
    }
}