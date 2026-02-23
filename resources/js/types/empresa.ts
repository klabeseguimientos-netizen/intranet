// resources/js/types/empresa.ts

export interface TipoResponsabilidad {
    id: number;
    nombre: string;
    descripcion?: string;
    icono?: string;
    es_activo: boolean;
}

export interface TipoDocumento {
    id: number;
    nombre: string;
    abreviatura: string;
    es_activo: boolean;
}

export interface Nacionalidad {
    id: number;
    pais: string;
    gentilicio: string;
}

export interface CategoriaFiscal {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    es_activo: boolean;
}

export interface Plataforma {
    id: number;
    nombre: string;
    descripcion?: string;
    es_activo: boolean;
}

export interface DatosLeadForm {
    nombre_completo: string;
    genero: 'masculino' | 'femenino' | 'otro' | 'no_especifica';
    telefono: string;
    email: string;
    localidad_id: number | '';
    rubro_id: number | '';
    origen_id: number | '';
}

export interface DatosContactoForm {
    tipo_responsabilidad_id: number | '';
    tipo_documento_id: number | '';
    nro_documento: string;
    nacionalidad_id: number | '';
    fecha_nacimiento: string;
    direccion_personal: string;
    codigo_postal_personal: string;
}

export interface DatosEmpresaForm {
    nombre_fantasia: string;
    razon_social: string;
    cuit: string;
    direccion_fiscal: string;
    codigo_postal_fiscal: string;
    localidad_fiscal_id: number | '';
    telefono_fiscal: string;
    email_fiscal: string;
    rubro_id: number | '';
    cat_fiscal_id: number | '';
    plataforma_id: number | '';
    nombre_flota: string;
}

export interface AltaEmpresaData {
    lead: DatosLeadForm;
    contacto: DatosContactoForm;
    empresa: DatosEmpresaForm;
}

export interface Paso1Response {
    success: boolean;
    message: string;
    lead_id: number;
    errors?: Record<string, string>;
}

export interface Paso2Response {
    success: boolean;
    message: string;
    contacto_id: number;
    errors?: Record<string, string>;
}

export interface Paso3Response {
    success: boolean;
    message: string;
    empresa_id: number;
    contacto_id: number;
    lead_id: number;
    errors?: Record<string, string>;
}