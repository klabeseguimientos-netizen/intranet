// resources/js/hooks/usePresupuestoEditForm.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { useToast } from '@/contexts/ToastContext';
import { 
    PresupuestoFormState, 
    PresupuestoAgregadoDTO,
    ProductoServicioDTO,
    MetodoPagoDTO,
    PromocionDTO,
    ProductoResumenItem
} from '@/types/presupuestos';

interface UsePresupuestoEditFormProps {
    presupuesto: any;
    tasas: ProductoServicioDTO[];
    abonos: ProductoServicioDTO[];
    convenios: ProductoServicioDTO[];
    metodosPago: MetodoPagoDTO[];
    promociones?: PromocionDTO[];
}

// Función para convertir a número de forma segura
const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

export const usePresupuestoEditForm = ({
    presupuesto,
    tasas,
    abonos,
    convenios,
    metodosPago,
    promociones = []
}: UsePresupuestoEditFormProps) => {
    const { errors } = usePage().props;
    const toast = useToast();

    // Transformar agregados del presupuesto al formato del estado
    const transformarAgregados = () => {
        const accesorios: PresupuestoAgregadoDTO[] = [];
        const servicios: PresupuestoAgregadoDTO[] = [];
        
        if (presupuesto.agregados && Array.isArray(presupuesto.agregados)) {
            presupuesto.agregados.forEach((item: any) => {
                const tipoId = item.producto_servicio?.tipo?.id;
                const tipoNombre = item.producto_servicio?.tipo?.nombre_tipo_abono || '';
                
                const agregado = {
                    prd_servicio_id: item.prd_servicio_id,
                    cantidad: toNumber(item.cantidad),
                    aplica_a_todos_vehiculos: !!item.aplica_a_todos_vehiculos,
                    valor: toNumber(item.valor),
                    bonificacion: toNumber(item.bonificacion),
                    subtotal: toNumber(item.subtotal)
                };
                
                if (tipoId === 3 || tipoNombre === 'SERVICIO') {
                    servicios.push(agregado);
                } else {
                    accesorios.push(agregado);
                }
            });
        }
        
        return { accesorios, servicios };
    };

    const { accesorios, servicios } = transformarAgregados();

    const [state, setState] = useState<PresupuestoFormState>({
        prefijoId: toNumber(presupuesto.prefijo_id) || 0,
        promocionId: presupuesto.promocion_id || null,
        cantidadVehiculos: toNumber(presupuesto.cantidad_vehiculos) || 1,
        diasValidez: presupuesto.dias_validez?.toString() || '7',
        tasaId: toNumber(presupuesto.tasa_id) || 0,
        tasaBonificacion: toNumber(presupuesto.tasa_bonificacion) || 0,
        tasaMetodoPagoId: toNumber(presupuesto.tasa_metodo_pago_id) || 0,
        abonoId: toNumber(presupuesto.abono_id) || 0,
        abonoBonificacion: toNumber(presupuesto.abono_bonificacion) || 0,
        abonoMetodoPagoId: toNumber(presupuesto.abono_metodo_pago_id) || 0,
        accesoriosAgregados: accesorios,
        serviciosAgregados: servicios,
        bonificacionManual: true,
        loading: false
    });

    const [valores, setValores] = useState({
        valorTasa: toNumber(presupuesto.valor_tasa) || 0,
        valorAbono: toNumber(presupuesto.valor_abono) || 0
    });

    const [promocionSeleccionada, setPromocionSeleccionada] = useState<PromocionDTO | null>(
        promociones.find(p => p.id === presupuesto.promocion_id) || null
    );
    const [cantidadMinimaPromo, setCantidadMinimaPromo] = useState<number>(1);
    const [productosPromocionIds, setProductosPromocionIds] = useState<Set<number>>(new Set());

    const getProductoValor = useCallback((id: number, lista: ProductoServicioDTO[]) => {
        const producto = lista.find(p => p.id === id);
        return Number(producto?.precio) || 0;
    }, []);

    // Efecto para actualizar la promoción seleccionada
    useEffect(() => {
        if (state.promocionId) {
            const promo = promociones.find(p => p.id === state.promocionId);
            setPromocionSeleccionada(promo || null);
            
            if (promo) {
                let min = 1;
                const ids = new Set<number>();
                
                promo.productos.forEach(prod => {
                    ids.add(prod.producto_servicio_id);
                    if (prod.cantidad_minima && prod.cantidad_minima > min) {
                        min = prod.cantidad_minima;
                    }
                });
                
                setCantidadMinimaPromo(min);
                setProductosPromocionIds(ids);
            }
        } else {
            setPromocionSeleccionada(null);
            setCantidadMinimaPromo(1);
            setProductosPromocionIds(new Set());
        }
    }, [state.promocionId, promociones]);

    // Efecto para validar cantidad de vehículos
    useEffect(() => {
        if (state.promocionId && state.cantidadVehiculos < cantidadMinimaPromo) {
            toast.warning(`La promoción requiere un mínimo de ${cantidadMinimaPromo} vehículos. Se ajustará automáticamente.`);
            updateField('cantidadVehiculos', cantidadMinimaPromo);
        }
    }, [state.cantidadVehiculos, state.promocionId, cantidadMinimaPromo]);

    useEffect(() => {
        setValores(prev => ({ 
            ...prev, 
            valorTasa: getProductoValor(state.tasaId, tasas) || toNumber(presupuesto.valor_tasa)
        }));
    }, [state.tasaId, tasas, getProductoValor]);

    useEffect(() => {
        const todosAbonos = [...abonos, ...convenios];
        setValores(prev => ({ 
            ...prev, 
            valorAbono: getProductoValor(state.abonoId, todosAbonos) || toNumber(presupuesto.valor_abono)
        }));
    }, [state.abonoId, abonos, convenios, getProductoValor]);

    // Efecto para bonificación automática por débito
    useEffect(() => {
        if (!state.promocionId && !state.bonificacionManual && state.abonoMetodoPagoId) {
            const metodo = metodosPago.find(m => m.id === state.abonoMetodoPagoId);
            if (metodo?.tipo === 'debito') {
                setState(prev => ({ ...prev, abonoBonificacion: 7 }));
            }
        }
    }, [state.abonoMetodoPagoId, metodosPago, state.bonificacionManual, state.promocionId]);

    // Resetear bonificación manual al cambiar abono
    useEffect(() => {
        setState(prev => ({ ...prev, bonificacionManual: false }));
    }, [state.abonoId]);

    // Cálculos de subtotales
    const calcularSubtotalAgregados = useCallback((items: PresupuestoAgregadoDTO[]) => {
        return items.reduce((total, item) => total + toNumber(item.subtotal), 0);
    }, []);

    const subtotales = useMemo(() => ({
        accesorios: calcularSubtotalAgregados(state.accesoriosAgregados),
        servicios: calcularSubtotalAgregados(state.serviciosAgregados),
        total: calcularSubtotalAgregados(state.accesoriosAgregados) + 
               calcularSubtotalAgregados(state.serviciosAgregados)
    }), [state.accesoriosAgregados, state.serviciosAgregados, calcularSubtotalAgregados]);

    // Actions
    const updateField = useCallback(<K extends keyof PresupuestoFormState>(
        field: K, 
        value: PresupuestoFormState[K]
    ) => {
        if (field === 'cantidadVehiculos' && state.promocionId) {
            const numValue = value as number;
            if (numValue < cantidadMinimaPromo) {
                toast.error(`No puede seleccionar menos de ${cantidadMinimaPromo} vehículos para esta promoción`);
                return;
            }
        }
        
        setState(prev => ({ ...prev, [field]: value }));
    }, [state.promocionId, cantidadMinimaPromo, toast]);

    // Función para verificar si un producto específico está en promoción
    const productoEstaEnPromocion = useCallback((productoId: number): boolean => {
        if (!state.promocionId || !promocionSeleccionada) return false;
        return promocionSeleccionada.productos.some(p => p.producto_servicio_id === productoId);
    }, [state.promocionId, promocionSeleccionada]);

    // Función para verificar si un campo debe estar deshabilitado
    const isFieldDisabled = useCallback((field: string): boolean => {
        if (!state.promocionId || !promocionSeleccionada) return false;
        
        // Verificar si la tasa está en la promoción
        if (field === 'tasaId' || field === 'tasaBonificacion') {
            const productoTasa = promocionSeleccionada.productos.find(p => p.producto.tipo_id === 4);
            return !!productoTasa;
        }
        
        // Verificar si el abono está en la promoción
        if (field === 'abonoId' || field === 'abonoBonificacion') {
            const productoAbono = promocionSeleccionada.productos.find(p => 
                p.producto.tipo_id === 1 || p.producto.tipo_id === 2
            );
            return !!productoAbono;
        }
        
        return false;
    }, [state.promocionId, promocionSeleccionada]);

    // Función para cargar productos de la promoción (solo para cuando se cambia de promoción)
    const cargarProductosPromocion = useCallback((promocion: PromocionDTO) => {
        let minVehiculos = 1;
        
        const nuevosAccesorios: PresupuestoAgregadoDTO[] = [];
        const nuevosServicios: PresupuestoAgregadoDTO[] = [];
        
        promocion.productos.forEach(prod => {
            if (prod.cantidad_minima && prod.cantidad_minima > minVehiculos) {
                minVehiculos = prod.cantidad_minima;
            }
            
            const productoBase = prod.producto;
            
            switch(productoBase.tipo_id) {
                case 4: // TASAS
                    updateField('tasaId', productoBase.id);
                    updateField('tasaBonificacion', prod.bonificacion);
                    break;
                    
                case 1: // ABONO
                case 2: // CONVENIO
                    updateField('abonoId', productoBase.id);
                    updateField('abonoBonificacion', prod.bonificacion);
                    break;
                    
                case 5: // ACCESORIOS
                    nuevosAccesorios.push({
                        prd_servicio_id: productoBase.id,
                        cantidad: prod.cantidad_minima || 1,
                        aplica_a_todos_vehiculos: false,
                        valor: productoBase.precio,
                        bonificacion: prod.bonificacion,
                        subtotal: 0
                    });
                    break;
                    
                case 3: // SERVICIOS
                    nuevosServicios.push({
                        prd_servicio_id: productoBase.id,
                        cantidad: prod.cantidad_minima || 1,
                        aplica_a_todos_vehiculos: false,
                        valor: productoBase.precio,
                        bonificacion: prod.bonificacion,
                        subtotal: 0
                    });
                    break;
            }
        });

        setState(prev => ({
            ...prev,
            accesoriosAgregados: nuevosAccesorios,
            serviciosAgregados: nuevosServicios
        }));

        if (minVehiculos > 1) {
            updateField('cantidadVehiculos', minVehiculos);
        }
    }, [updateField, setState]);

    // Función para aplicar promoción
    const aplicarPromocion = useCallback((promocionId: number | null) => {
        updateField('promocionId', promocionId);
        
        if (!promocionId) {
            setState(prev => ({
                ...prev,
                tasaId: toNumber(presupuesto.tasa_id) || 0,
                tasaBonificacion: toNumber(presupuesto.tasa_bonificacion) || 0,
                abonoId: toNumber(presupuesto.abono_id) || 0,
                abonoBonificacion: toNumber(presupuesto.abono_bonificacion) || 0,
                accesoriosAgregados: accesorios,
                serviciosAgregados: servicios
            }));
            toast.info('Promoción removida');
            return;
        }

        const promocion = promociones.find(p => p.id === promocionId);
        if (!promocion) {
            toast.error('Promoción no encontrada');
            return;
        }

        cargarProductosPromocion(promocion);
        toast.success(`Promoción "${promocion.nombre}" aplicada`);
    }, [promociones, updateField, cargarProductosPromocion, toast, setState, presupuesto, accesorios, servicios]);

    const validateForm = useCallback((): boolean => {
        if (!state.prefijoId) {
            toast.error('Debe seleccionar un comercial');
            return false;
        }
        if (!state.tasaId) {
            toast.error('Debe seleccionar una tasa de instalación');
            return false;
        }
        if (!state.tasaMetodoPagoId) {
            toast.error('Debe seleccionar un método de pago para la tasa');
            return false;
        }
        if (!state.abonoId) {
            toast.error('Debe seleccionar un abono mensual');
            return false;
        }
        if (!state.abonoMetodoPagoId) {
            toast.error('Debe seleccionar un método de pago para el abono');
            return false;
        }
        
        if (state.promocionId && state.cantidadVehiculos < cantidadMinimaPromo) {
            toast.error(`Esta promoción requiere un mínimo de ${cantidadMinimaPromo} vehículos`);
            return false;
        }
        
        return true;
    }, [state, toast, cantidadMinimaPromo]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setState(prev => ({ ...prev, loading: true }));

        const data = {
            prefijo_id: state.prefijoId,
            promocion_id: state.promocionId,
            cantidad_vehiculos: state.cantidadVehiculos,
            validez: state.diasValidez,
            tasa_id: state.tasaId,
            valor_tasa: valores.valorTasa,
            tasa_bonificacion: state.tasaBonificacion,
            tasa_metodo_pago_id: state.tasaMetodoPagoId,
            abono_id: state.abonoId,
            valor_abono: valores.valorAbono,
            abono_bonificacion: state.abonoBonificacion,
            abono_metodo_pago_id: state.abonoMetodoPagoId,
            agregados: [
                ...state.accesoriosAgregados.map(a => ({
                    prd_servicio_id: a.prd_servicio_id,
                    cantidad: a.cantidad,
                    aplica_a_todos_vehiculos: a.aplica_a_todos_vehiculos,
                    valor: a.valor,
                    bonificacion: a.bonificacion
                })),
                ...state.serviciosAgregados.map(s => ({
                    prd_servicio_id: s.prd_servicio_id,
                    cantidad: s.cantidad,
                    aplica_a_todos_vehiculos: s.aplica_a_todos_vehiculos,
                    valor: s.valor,
                    bonificacion: s.bonificacion
                }))
            ]
        };

        router.put(`/comercial/presupuestos/${presupuesto.id}`, data, {
            onSuccess: () => {
                setState(prev => ({ ...prev, loading: false }));
                toast.success('Presupuesto actualizado correctamente');
            },
            onError: (errors) => {
                setState(prev => ({ ...prev, loading: false }));
                if (Object.keys(errors).length > 0) {
                    if (errors.error) {
                        toast.error(errors.error);
                    } else {
                        const errorMessages = Object.values(errors).join(', ');
                        toast.error(`Error: ${errorMessages}`);
                    }
                }
            }
        });
    }, [state, valores, presupuesto.id, validateForm, toast]);

    const getError = useCallback((field: string) => {
        return errors && (errors as any)[field] ? (errors as any)[field] : null;
    }, [errors]);

    return {
        state,
        valores,
        subtotales,
        promocionSeleccionada,
        cantidadMinimaPromo,
        productosPromocionIds,
        updateField,
        aplicarPromocion,
        isFieldDisabled,
        productoEstaEnPromocion,
        setAccesoriosAgregados: useCallback((items: PresupuestoAgregadoDTO[]) => 
            updateField('accesoriosAgregados', items), [updateField]),
        setServiciosAgregados: useCallback((items: PresupuestoAgregadoDTO[]) => 
            updateField('serviciosAgregados', items), [updateField]),
        handleSubmit,
        getError
    };
};