<?php
// app/Models/Compania.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Compania extends Model
{
    use SoftDeletes;
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'companias';
    
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'descripcion',
        'es_activo',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'es_activo' => 'boolean',
    ];
    
    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'created',
        'deleted_at',
    ];
    
    /**
     * Boot method to set default values
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($compania) {
            $compania->created = $compania->created ?? now();
        });
    }
    
    /**
     * Get the products/services for this company.
     */
    public function productosServicios()
    {
        return $this->hasMany(ProductoServicio::class, 'compania_id');
    }
    
    /**
     * Get the users for this company (through comercial table).
     */
    public function usuarios()
    {
        return $this->hasManyThrough(
            Usuario::class,
            Comercial::class,
            'compania_id', // Foreign key on comercial table
            'personal_id', // Foreign key on usuarios table
            'id',          // Local key on companias table
            'personal_id'  // Local key on comercial table
        );
    }
    
    /**
     * Scope a query to only include active companies.
     */
    public function scopeActivo($query)
    {
        return $query->where('es_activo', true);
    }
    
    /**
     * Scope a query to only include companies with products.
     */
    public function scopeConProductos($query)
    {
        return $query->whereHas('productosServicios', function ($q) {
            $q->where('es_activo', true);
        });
    }
    
    /**
     * Get the commercial records for this company.
     */
    public function comerciales()
    {
        return $this->hasMany(Comercial::class, 'compania_id');
    }
    
    /**
     * Get the user who deleted this record.
     */
    public function deletedBy()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
}