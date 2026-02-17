<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }
    
    public function creadoPor()
    {
        return $this->belongsTo(Usuario::class, 'created_by');
    }
    
    public function eliminadoPor()
    {
        return $this->belongsTo(Usuario::class, 'deleted_by');
    }
    
    public static function prefijosActivosUsuario($usuarioId): array
    {
        return self::where('usuario_id', $usuarioId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->pluck('prefijo_id')
            ->toArray();
    }
}