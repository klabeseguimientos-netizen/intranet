<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personal extends Model
{
    protected $table = 'personal';
    
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'telefono',
        'fecha_nacimiento',
        'tipo_personal_id',
        'activo',
        'created_by',
        'modified_by',
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'fecha_nacimiento' => 'date',
        'created' => 'datetime',
        'modified' => 'datetime',
    ];
    
    protected $appends = ['nombre_completo'];
    
    public function tipoPersonal()
    {
        return $this->belongsTo(TipoPersonal::class);
    }
    
    public function tecnico()
    {
        return $this->hasOne(Tecnico::class);
    }
    
    public function usuario()
    {
        return $this->hasOne(Usuario::class);
    }
    
    public function comercial()
    {
        return $this->hasOne(Comercial::class);
    }
    
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }
    
    public function modificadoPor()
    {
        return $this->belongsTo(Usuario::class, 'modified_by');
    }
    
    public function getNombreCompletoAttribute()
    {
        return $this->nombre . ' ' . $this->apellido;
    }
    
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}