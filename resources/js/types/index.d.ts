import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { Usuario } from './models';

export interface AuthUser {
    id: number;
    nombre_usuario: string;
    rol_id: number;
    ve_todas_cuentas: boolean;
    ultimo_acceso: string;
    iniciales: string;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

// Interface para datos comerciales
export interface ComercialData {
    id: number;
    compania_id: number | null;
    prefijo_id: number | null;
    activo: boolean;
}

// Interface principal para User
export interface User {
    id: number;
    nombre_usuario: string;
    rol_id: number;
    rol_nombre: string;
    ve_todas_cuentas: boolean;
    ultimo_acceso: string;
    iniciales: string;
    
    // Nuevos campos agregados
    personal_id: number;
    nombre_completo: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    
    comercial: ComercialData | null;
}


export interface MenuItem {
    name: string;
    href?: string;
    children?: MenuItem[];
}

export interface PageProps {
    [key: string]: any;
    auth?: {
        user: User | null;
    };
}

declare module '@inertiajs/react' {
    export interface PageProps {
        auth?: {
            user: User | null;
        };
        flash?: {
            success: string | null;
            error: string | null;
        };
        url: string;
        [key: string]: any;
    }
}