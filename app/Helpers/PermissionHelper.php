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
     * Obtener la compañía del usuario logueado
     */
    public static function getCompaniaUsuario()
    {
        $usuario = auth()->user();
        
        if (!$usuario) {
            return null;
        }
        
        $comercial = DB::table('comercial')
            ->where('personal_id', $usuario->personal_id)
            ->first();
        
        return $comercial ? $comercial->compania_id : null;
    }
    
    /**
     * Verificar si el usuario puede ver todos los registros
     */
    public static function puedeVerTodos()
    {
        $usuario = auth()->user();
        return $usuario && $usuario->ve_todas_cuentas;
    }
    
    /**
     * Aplicar filtro de compañía a una query
     */
    public static function aplicarFiltroCompania($query, $campoCompania = 'compania_id')
    {
        $usuario = auth()->user();
        
        if (!$usuario) {
            return $query->whereRaw('1 = 0'); // Usuario no autenticado
        }
        
        // Si puede ver todas las cuentas, no filtramos
        if ($usuario->ve_todas_cuentas) {
            return $query;
        }
        
        // Obtener compañía del usuario
        $companiaId = self::getCompaniaUsuario();
        
        if ($companiaId) {
            return $query->where($campoCompania, $companiaId);
        }
        
        // Si no tiene compañía asignada, no ve nada
        return $query->whereRaw('1 = 0');
    }
    
    /**
     * Aplicar filtro de prefijos a una query
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
    
    /**
     * Obtener los IDs de compañía permitidos para el usuario
     */
    public static function getCompaniasPermitidas()
    {
        $usuario = auth()->user();
        
        if (!$usuario) {
            return [];
        }
        
        if ($usuario->ve_todas_cuentas) {
            // Si ve todas, podríamos devolver todas las compañías activas
            return DB::table('companias')
                ->where('es_activo', 1)
                ->pluck('id')
                ->toArray();
        }
        
        $companiaId = self::getCompaniaUsuario();
        
        return $companiaId ? [$companiaId] : [];
    }
}