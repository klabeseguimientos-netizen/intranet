<?php
// app/Models/Empresa.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    protected $table = 'empresas';
    
    protected $casts = [
        'es_activo' => 'boolean',
        'created' => 'datetime',
        'modified' => 'datetime',
    ];

    protected $fillable = [
        'prefijo_id',
        'numeroalfa',
        'nombre_fantasia',
        'razon_social',
        'cuit',
        'direccion_fiscal',
        'codigo_postal_fiscal',
        'localidad_fiscal_id',
        'telefono_fiscal',
        'email_fiscal',
        'rubro_id',
        'cat_fiscal_id',
        'plataforma_id',
        'nombre_flota',
        'es_activo',
        'created_by',
        'modified_by',
    ];

        public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'empresa_id');
    }
    
    public function vehiculosConAbonos()
    {
        return $this->hasMany(Vehiculo::class, 'empresa_id')
                    ->with(['abonosActivos']);
    }

    public function contactos()
    {
        return $this->hasMany(EmpresaContacto::class, 'empresa_id');
    }
    
    public function contactosActivos()
    {
        return $this->hasMany(EmpresaContacto::class, 'empresa_id')
                    ->where('es_activo', 1)
                    ->whereNull('deleted_at');
    }
    
    public function contactoPrincipal()
    {
        return $this->hasOne(EmpresaContacto::class, 'empresa_id')
                    ->where('es_contacto_principal', 1)
                    ->where('es_activo', 1)
                    ->whereNull('deleted_at');
    }
}