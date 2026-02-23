// resources/js/types/presupuestos.ts

export interface ProductoServicio {
    id: number;
    codigopro?: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    tipo_id: number;
    tipo?: {
        id: number;
        nombre_tipo_abono: string;
    };
    compania_id: number;
    es_activo: boolean;
}

export interface PresupuestoAgregado {
    id?: number;
    prd_servicio_id: number;
    productoServicio?: ProductoServicio;
    cantidad: number;
    aplica_a_todos_vehiculos: boolean;
    valor: number;
    bonificacion: number;
    subtotal: number;
}

export interface Presupuesto {
    id: number;
    prefijo_id: number;
    lead_id: number;
    promocion_id?: number | null;
    cantidad_vehiculos: number;
    validez: string;
    tasa_id: number;
    valor_tasa: number;
    tasa_bonificacion: number;
    subtotal_tasa: number;
    tasa_metodo_pago_id: number;
    abono_id: number;
    valor_abono: number;
    abono_bonificacion: number;
    subtotal_abono: number;
    abono_metodo_pago_id: number;
    subtotal_productos_agregados: number;
    total_presupuesto: number;
    estado_id: number;
    created: string;
    modified?: string;
    activo: boolean;
    created_by: number;
    modified_by?: number;
    
    referencia?: string;
    nombre_comercial?: string;
    dias_validez?: number;
    compania?: {
        id: number;
        nombre: string;
        logo: string;
    };
    
    lead?: any;
    prefijo?: any;
    tasa?: ProductoServicio;
    abono?: ProductoServicio;
    agregados?: PresupuestoAgregado[];
    estado?: any;
    promocion?: any;
    
    servicios_mensuales?: any[];
    accesorios_unicos?: any[];
    total_servicios_mensuales?: number;
    total_accesorios?: number;
    inversion_inicial?: number;
    costo_mensual_total?: number;
    total_primer_mes?: number;
}

export interface CreatePresupuestoData {
    prefijo_id: number;
    lead_id: number;
    promocion_id?: number | null;
    cantidad_vehiculos: number;
    validez: string;
    tasa_id: number;
    valor_tasa: number;
    tasa_bonificacion: number;
    tasa_metodo_pago_id: number;
    abono_id: number;
    valor_abono: number;
    abono_bonificacion: number;
    abono_metodo_pago_id: number;
    agregados: Omit<PresupuestoAgregado, 'id' | 'subtotal'>[];
}

export interface LeadDTO {
    id: number;
    nombre_completo: string;
    email: string;
    telefono?: string;
    prefijo_id?: number;
    prefijo?: PrefijoDTO | null;
}

export interface PrefijoDTO {
    id: number;
    codigo: string;
    descripcion: string;
}

export interface ComercialDTO {
    id: number;
    prefijo_id: number;
    nombre: string;
    email: string;
}

export interface UsuarioDTO {
    rol_id: number;
    nombre_completo: string;
    comercial?: ComercialDTO | null;
}

export interface ProductoServicioDTO {
    id: number;
    nombre: string;
    precio: number | string;
    tipo?: {
        id: number;
        nombre_tipo_abono: string;
    };
}

export interface MetodoPagoDTO {
    id: number;
    nombre: string;
    tipo: string;
}

export interface PresupuestoAgregadoDTO {
    prd_servicio_id: number;
    cantidad: number;
    aplica_a_todos_vehiculos: boolean;
    valor: number;
    bonificacion: number;
    subtotal?: number;
}

export interface PresupuestoFormData {
    prefijo_id: number;
    lead_id: number;
    promocion_id?: number | null;
    cantidad_vehiculos: number;
    validez: string;
    tasa_id: number;
    valor_tasa: number;
    tasa_bonificacion: number;
    tasa_metodo_pago_id: number;
    abono_id: number;
    valor_abono: number;
    abono_bonificacion: number;
    abono_metodo_pago_id: number;
    agregados: PresupuestoAgregadoDTO[];
}

export interface PresupuestoFormState {
    prefijoId: number;
    promocionId?: number | null;
    cantidadVehiculos: number;
    diasValidez: string;
    tasaId: number;
    tasaBonificacion: number;
    tasaMetodoPagoId: number;
    abonoId: number;
    abonoBonificacion: number;
    abonoMetodoPagoId: number;
    accesoriosAgregados: PresupuestoAgregadoDTO[];
    serviciosAgregados: PresupuestoAgregadoDTO[];
    bonificacionManual: boolean;
    loading: boolean;
}

export interface PresupuestosCreateProps {
    lead: LeadDTO;
    usuario: UsuarioDTO;
    comerciales: ComercialDTO[];
    prefijos: number[];
    promociones?: PromocionDTO[];
    tasas: ProductoServicioDTO[];
    abonos: ProductoServicioDTO[];
    convenios: ProductoServicioDTO[];
    accesorios: ProductoServicioDTO[];
    servicios: ProductoServicioDTO[];
    metodosPago: MetodoPagoDTO[];
}

// NUEVOS TIPOS PARA PROMOCIONES
export interface PromocionProductoDTO {
    id: number;
    producto_servicio_id: number;
    tipo_promocion: 'porcentaje' | '2x1' | '3x2';
    bonificacion: number;
    cantidad_minima: number | null;
    producto: {
        id: number;
        nombre: string;
        codigopro: string;
        precio: number;
        tipo_id: number;
    };
}

export interface PromocionDTO {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    productos: PromocionProductoDTO[];
}

// Interface para productos en el resumen
export interface ProductoResumenItem {
    id: number;
    nombre: string;
    valor: number;
    cantidad: number;
    tipoPromocion?: '2x1' | '3x2' | 'porcentaje';
    bonificacion?: number;
}

export type PresupuestoTipo = 'nuevo' | 'legacy';

export interface PresupuestoBase {
    id: number;
    tipo: PresupuestoTipo;
    nombre: string;
    fecha: string;
    fecha_original: string;
    tiene_pdf: boolean;
    pdf_url: string | null;
    metadata: {
        cantidad_vehiculos?: number;
        descripcion?: string;
        [key: string]: any;
    };
}

export interface PresupuestoNuevo extends PresupuestoBase {
    tipo: 'nuevo';
    referencia: string;
    estado: string;
    estado_color?: string;
    total: number;
    comercial: string;
    promocion?: string;
    validez_hasta?: string;
}

export interface PresupuestoLegacy extends PresupuestoBase {
    tipo: 'legacy';
    prefijo_id: number | null;
    prefijo?: {
        id: number;
        codigo: string;
        nombre: string;
    } | null;
}

export type PresupuestoUnificado = PresupuestoNuevo | PresupuestoLegacy;