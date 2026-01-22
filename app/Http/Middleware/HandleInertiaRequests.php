<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\DB;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $shared = [];
        
        $user = $request->user();
        
        if ($user) {
            // Obtener datos del personal
            $personal = \DB::table('personal')
                ->where('id', $user->personal_id)
                ->first();
            
            // Obtener datos del comercial (si existe)
            $comercial = \DB::table('comercial')
                ->where('personal_id', $user->personal_id)
                ->first();
                
            // Obtener rol
            $rol = \DB::table('roles')->where('id', $user->rol_id)->first();
            
            // Obtener datos de la compañía
            $companiaData = $this->getCompaniaData($comercial);
            
            // Construir datos del usuario
            $userData = [
                // Datos básicos del usuario
                'id' => (int) $user->id,
                'nombre_usuario' => (string) $user->nombre_usuario,
                'rol_id' => (int) $user->rol_id,
                'rol_nombre' => (string) ($rol ? $rol->nombre : 'Sin rol'),
                've_todas_cuentas' => (bool) $user->ve_todas_cuentas,
                'ultimo_acceso' => $user->ultimo_acceso ? $user->ultimo_acceso->toDateTimeString() : null,
                
                // Datos del personal
                'personal_id' => (int) $user->personal_id,
                'nombre_completo' => $personal ? trim($personal->nombre . ' ' . $personal->apellido) : $user->nombre_usuario,
                'nombre' => $personal ? (string) $personal->nombre : $user->nombre_usuario,
                'apellido' => $personal ? (string) $personal->apellido : '',
                'email' => $personal ? (string) $personal->email : null,
                'telefono' => $personal ? (string) $personal->telefono : null,
                
                // Datos comerciales (si aplica)
                'comercial' => $comercial ? [
                    'id' => (int) $comercial->id,
                    'compania_id' => $comercial->compania_id ? (int) $comercial->compania_id : null,
                    'prefijo_id' => $comercial->prefijo_id ? (int) $comercial->prefijo_id : null,
                    'activo' => (bool) $comercial->activo,
                ] : null,
                
                // Datos de la compañía
                'compania_data' => $companiaData,
                
                // Iniciales para avatar
                'iniciales' => $this->getIniciales($personal, $user),
            ];
            
            $shared['auth'] = [
                'user' => $userData
            ];
            
            // Compartir datos de la compañía globalmente
            $shared['compania'] = $companiaData;
        } else {
            $shared['auth'] = ['user' => null];
            $shared['compania'] = $this->getDefaultCompaniaData();
        }
        
        if ($request->route() && $request->route()->named('login')) {
            $shared['login_compania'] = $request->session()->get('login_compania');
            $shared['login_nombre'] = $request->session()->get('login_nombre');
            
            if ($request->route() && $request->route()->named('login')) {
                $shared['errors'] = $request->session()->get('errors')?->getBag('default')?->getMessages();
            }
            
            // Limpiar después de usar
            $request->session()->forget(['login_compania', 'login_nombre']);
        }
        
        $shared['flash'] = [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
        ];
        
        return $shared;
    }

    /**
     * Obtener datos de la compañía
     */
    private function getCompaniaData($comercial)
    {
        if (!$comercial || !$comercial->compania_id) {
            return $this->getDefaultCompaniaData();
        }
        
        // Definir información por compañía (misma que en LoginController)
        $companias = [
            1 => [ // LocalSat
                'nombre' => 'LocalSat',
                'logo' => 'logo.webp',
                'short_name' => 'LS',
                'colores' => [
                    'primary' => '#fa6400',
                    'secondary' => '#3b3b3d',
                ]
            ],
            2 => [ // SmartSat
                'nombre' => 'SmartSat',
                'logo' => 'logosmart.png',
                'short_name' => 'SS',
                'colores' => [
                    'primary' => '#eb9b11',
                    'secondary' => '#3b3b3d',
                ]
            ],
            3 => [ // 360
                'nombre' => '360',
                'logo' => '360-logo.webp',
                'short_name' => '360',
                'colores' => [
                    'primary' => '#fa6400',
                    'secondary' => '#3b3b3d',
                ]
            ],
        ];
        
        return $companias[$comercial->compania_id] ?? $this->getDefaultCompaniaData();
    }
    
    /**
     * Datos por defecto de compañía
     */
    private function getDefaultCompaniaData()
    {
        return [
            'nombre' => 'Intranet 2026',
            'logo' => 'logo.webp',
            'short_name' => 'LS',
            'colores' => [
                'primary' => '#fa6400',
                'secondary' => '#3b3b3d',
            ]
        ];
    }
    
    /**
     * Obtener iniciales para el avatar
     */
    private function getIniciales($personal, $user)
    {
        if ($personal) {
            $nombre = $personal->nombre ?? '';
            $apellido = $personal->apellido ?? '';
            
            if ($nombre && $apellido) {
                return strtoupper(substr($nombre, 0, 1) . substr($apellido, 0, 1));
            } elseif ($nombre) {
                return strtoupper(substr($nombre, 0, 2));
            }
        }
        
        // Fallback al nombre de usuario
        return strtoupper(substr($user->nombre_usuario, 0, 2));
    }
}