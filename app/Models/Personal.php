<?php
// app/Models/Personal.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personal extends Model
{
    protected $table = 'personal';
    
    protected $casts = [
        'activo' => 'boolean',
        'fecha_nacimiento' => 'date',
        'created' => 'datetime',
        'modified' => 'datetime',
    ];

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

    public function tipoPersonal()
    {
        return $this->belongsTo(TipoPersonal::class, 'tipo_personal_id');
    }
        public function tecnico()
    {
        return $this->hasOne(Tecnico::class, 'personal_id');
    }
        /**
     * Obtener el usuario asociado
     */
    public function usuario()
    {
        return $this->hasOne(Usuario::class, 'personal_id');
    }
    
    /**
     * Obtener el nombre completo
     */
    public function getNombreCompletoAttribute()
    {
        return $this->nombre . ' ' . $this->apellido;
    }

}