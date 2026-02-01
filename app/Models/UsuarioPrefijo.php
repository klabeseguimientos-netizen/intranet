<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UsuarioPrefijo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'usuario_prefijos';
    
    protected $primaryKey = 'id';
    
    public $timestamps = false;
    
    protected $fillable = [
        'usuario_id',
        'prefijo_id',
        'activo',
        'created',
        'created_by',
        'deleted_at',
        'deleted_by'
    ];
    
    protected $casts = [
        'activo' => 'boolean',
        'created' => 'datetime',
        'deleted_at' => 'datetime'
    ];
    
    /**
     * Obtener el usuario asociado
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
    
    /**
     * Obtener los prefijos activos de un usuario
     */
    public static function prefijosActivosUsuario($usuarioId)
    {
        return self::where('usuario_id', $usuarioId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->pluck('prefijo_id')
            ->toArray();
    }
}