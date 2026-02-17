<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    protected $table = 'empresas';
    
    public $timestamps = false;
    
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
    
    protected $casts = [
        'es_activo' => 'boolean',
        'created' => 'datetime',
        'modified' => 'datetime',
    ];
    
    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class);
    }
    
    public function vehiculosConAbonos()
    {
        return $this->hasMany(Vehiculo::class)->with(['abonosActivos']);
    }
    
    public function contactos()
    {
        return $this->hasMany(EmpresaContacto::class);
    }
    
    public function contactosActivos()
    {
        return $this->hasMany(EmpresaContacto::class)
                    ->where('es_activo', true)
                    ->whereNull('deleted_at');
    }
    
    public function contactoPrincipal()
    {
        return $this->hasOne(EmpresaContacto::class)
                    ->where('es_contacto_principal', true)
                    ->where('es_activo', true)
                    ->whereNull('deleted_at');
    }
    
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }
    
    public function modificadoPor()
    {
        return $this->belongsTo(Usuario::class, 'modified_by');
    }
}