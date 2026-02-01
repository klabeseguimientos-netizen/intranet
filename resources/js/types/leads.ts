// resources/js/types/leads.ts
export interface Origen {
    id: number;
    nombre: string;
    color: string;
    icono?: string; // Opcional porque EditarLeadModal no lo usa
}

export interface EstadoLead {
    id: number;
    nombre: string;
    tipo?: string; // Opcional
    color_hex?: string; // Opcional
}

export interface Localidad {
    id: number;
    localidad: string;
    provincia: string;
    codigo_postal: string;
    provincia_id?: number; // Para el formulario de edición
}

export interface Rubro {
    id: number;
    nombre: string;
}

export interface Provincia {
    id: number;
    nombre: string;
}

export interface Comercial {
    id: number;
    prefijo_id: number;
    nombre: string;
    email: string;
}

export interface Lead {
    id: number;
    prefijo_id?: number;
    nombre_completo: string;
    genero: string;
    telefono?: string;
    email?: string;
    localidad_id?: number;
    rubro_id?: number;
    origen_id?: number;
    estado_lead_id: number;
    es_cliente: boolean;
    es_activo: boolean;
    created: string;
    created_by?: number;
    modified?: string;
    modified_by?: number;
    deleted_at?: string;
    deleted_by?: number;
    localidad?: {
        id: number;
        localidad: string;
        provincia_id: number;
        provincia?: string;
    };
    rubro?: {
        id: number;
        nombre: string;
    };
    origen?: {
        id: number;
        nombre: string;
    };
    estadoLead?: {
        id: number;
        nombre: string;
        color_hex: string;
    };
    notas?: NotaLead[]; // Añadir esta línea
}

// Añade esta interfaz para las notas
export interface NotaLead {
    id: number;
    lead_id: number;
    usuario_id: number;
    observacion: string;
    tipo: 'informacion_cliente' | 'detalle_contacto' | 'observacion_inicial';
    created: string;
    deleted_at?: string;
    deleted_by?: number;
    usuario?: {
        id: number;
        nombre_usuario: string;
        personal?: {
            id: number;
            nombre: string;
            apellido: string;
            email?: string;
            telefono?: string;
        };
    };
}

export interface TipoComentario {
    id: number;
    nombre: string;
    descripcion: string;
    aplica_a: string;
    crea_recordatorio: boolean;
    dias_recordatorio_default: number;
    es_activo: boolean;
}
export interface UsuarioData {
    ve_todas_cuentas: boolean;
    rol_id: number;
    personal_id: number;
    nombre_completo?: string;
    cantidad_prefijos?: number;
    prefijos_asignados?: number[];
    comercial?: {
        es_comercial: boolean;
        prefijo_id?: number;
    } | null;
}

export interface Comentario {
    id: number;
    lead_id: number;
    usuario_id: number;
    tipo_comentario_id: number;
    comentario: string;
    created: string;
    deleted_at: string | null;
    tipo_comentario?: TipoComentario;
    usuario?: {
        id: number;
        nombre: string;
        email: string;
    };
}

export interface ComentarioLegacy {
    id: number;
    lead_id: number;
    comentario: string;
    created: string;
}