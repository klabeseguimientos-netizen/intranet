// resources/js/types/promociones.ts

export interface ProductoDTO {
    id: number;
    codigopro: string;
    nombre: string;
    precio: number;
    tipo_id: number;
    tipo_nombre?: string;
    compania_id: number;
    compania_nombre: string;
}

export interface ProductosAgrupados {
    tasas: ProductoDTO[];
    abonos: ProductoDTO[];
    convenios: ProductoDTO[];
    accesorios: ProductoDTO[];
    servicios: ProductoDTO[];
}

export interface PromocionProductoDetalle {
    id: number;
    bonificacion: number;
    tipo_promocion?: 'porcentaje' | '2x1' | '3x2';
    cantidad_minima?: number | null;
    productoServicio: {
        id: number;
        nombre: string;
        codigopro: string;
        tipo_id: number;
    };
}

export interface Promocion {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
    estado: string;
    created: string;
    productos: PromocionProductoDetalle[];
    creador: {
        id: number;
        name: string;
    } | null;
}

export interface EstadisticasPromociones {
    total: number;
    vigentes: number;
    proximas: number;
    vencidas: number;
    inactivas: number;
}

export interface PromocionProductoItem {
    producto_servicio_id: number | '';
    bonificacion: number;
    tipo_promocion?: 'porcentaje' | '2x1' | '3x2';  // ← NUEVO
    cantidad_minima?: number | null;                 // ← NUEVO
    nombre_producto?: string;
    codigo_producto?: string;
    tipo_id?: number;
    compania_nombre?: string;
}

export interface PromocionFormData {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
    productos: PromocionProductoItem[];
}