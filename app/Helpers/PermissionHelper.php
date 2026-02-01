<?php
// app/Helpers/PermissionHelper.php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class PermissionHelper
{
    /**
     * Obtener los prefijos permitidos para un usuario
     */
    public static function getPrefijosPermitidos($usuarioId)
    {
        return DB::table('usuario_prefijos')
            ->where('usuario_id', $usuarioId)
            ->where('activo', 1)
            ->whereNull('deleted_at')
            ->pluck('prefijo_id')
            ->toArray();
    }
    
    /**
     * Aplicar filtro de permisos a una query
     */
    public static function aplicarFiltroPrefijos($query, $usuario)
    {
        if (!$usuario->ve_todas_cuentas) {
            $prefijosPermitidos = self::getPrefijosPermitidos($usuario->id);
            
            if (!empty($prefijosPermitidos)) {
                $query->whereIn('prefijo_id', $prefijosPermitidos);
            } else {
                $query->whereRaw('1 = 0');
            }
        }
        
        return $query;
    }
}