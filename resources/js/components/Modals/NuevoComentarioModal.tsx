import React, { useEffect, useState } from 'react';
import { useForm,router } from '@inertiajs/react';
import { X, MessageSquare, Bell, Calendar, Save, XCircle, AlertCircle, Lock, FileText, CalendarDays, ThumbsDown } from 'lucide-react';


interface TipoComentario {
    id: number;
    nombre: string;
    descripcion: string;
    aplica_a: string;
    crea_recordatorio: boolean;
    dias_recordatorio_default: number;
    es_activo: boolean;
}

interface EstadoLead {
    id: number;
    nombre: string;
    tipo: string;
    color_hex?: string;
}

interface Lead {
    id: number;
    nombre_completo: string;
    estado_lead_id?: number;
}

interface MotivoPerdida {
    id: number;
    nombre: string;
    descripcion: string;
    es_activo: number;
}

interface NuevoComentarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    tiposComentario: TipoComentario[];
    estadosLead?: EstadoLead[];
    comentariosExistentes?: number;
    onSuccess?: () => void;
}

export default function NuevoComentarioModal({ 
    isOpen, 
    onClose, 
    lead, 
    tiposComentario, 
    estadosLead = [],
    comentariosExistentes = 0,
    onSuccess 
}: NuevoComentarioModalProps) {
    const [cambioEstadoInfo, setCambioEstadoInfo] = useState<{
        tipoSeleccionado: string;
        estadoActual: string;
        nuevoEstado: string;
    }>({
        tipoSeleccionado: '',
        estadoActual: 'Nuevo',
        nuevoEstado: '',
    });

    const [motivosPerdida, setMotivosPerdida] = useState<MotivoPerdida[]>([]);
    const [loadingMotivos, setLoadingMotivos] = useState(false);
    const [fechaInputRef, setFechaInputRef] = useState<HTMLInputElement | null>(null);

    const getTipoPredeterminado = () => {
        if (comentariosExistentes === 0) {
            const contactoInicial = tiposComentario.find(t => t.nombre === 'Contacto inicial');
            return contactoInicial?.id || '';
        }
        return '';
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        // Datos generales del comentario
        comentario: '',
        tipo_comentario_id: getTipoPredeterminado() as string | number,
        crea_recordatorio: true,
        dias_recordatorio: 0,
        cambiar_estado_lead: true,
        
        // Datos específicos para rechazo
        motivo_perdida_id: '',
        notas_adicionales: '',
        posibilidades_futuras: 'no',
        fecha_posible_recontacto: '',
    });

    // Cargar motivos de pérdida cuando se abre el modal y es necesario
    useEffect(() => {
        if (isOpen && lead) {
            const tipoSeleccionado = tiposComentario.find(
                t => t.id.toString() === data.tipo_comentario_id.toString()
            );
            
            if (tipoSeleccionado && tipoSeleccionado.nombre === 'Rechazo lead') {
                cargarMotivosPerdida();
            }
        }
    }, [isOpen, lead, data.tipo_comentario_id]);

    const cargarMotivosPerdida = () => {
        if (motivosPerdida.length > 0) return; // Ya cargados
        
        setLoadingMotivos(true);
        
        // Usa la misma ruta que funciona en el segundo script
        fetch('/comercial/motivos-perdida-activos')
            .then(response => {
                if (!response.ok) throw new Error('Error cargando motivos');
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setMotivosPerdida(data);
                }
            })
            .catch(error => {
                console.error('Error cargando motivos de pérdida:', error);
                // Datos de ejemplo como fallback (opcional)
                const motivosEjemplo = [
                    { id: 1, nombre: 'Precio muy elevado', descripcion: 'El cliente consideró que el precio no se ajustaba a su presupuesto', es_activo: 1 },
                    { id: 2, nombre: 'No necesita el producto/servicio', descripcion: 'El cliente determinó que no tiene necesidad actual', es_activo: 1 },
                    { id: 3, nombre: 'Decidió por la competencia', descripcion: 'El cliente eligió una propuesta de la competencia', es_activo: 1 },
                    { id: 4, nombre: 'Sin respuesta después de seguimientos', descripcion: 'El cliente dejó de responder', es_activo: 1 },
                    { id: 5, nombre: 'Proyecto cancelado o pospuesto', descripcion: 'El cliente canceló o pospuso el proyecto', es_activo: 1 },
                    { id: 6, nombre: 'Falta de presupuesto', descripcion: 'El cliente no cuenta con el presupuesto necesario', es_activo: 1 },
                    { id: 7, nombre: 'No cumple requisitos mínimos', descripcion: 'El lead no cumple con los requisitos mínimos', es_activo: 1 },
                    { id: 8, nombre: 'Otro', descripcion: 'Otro motivo no especificado', es_activo: 1 },
                ];
                setMotivosPerdida(motivosEjemplo);
            })
            .finally(() => {
                setLoadingMotivos(false);
            });
    };

    useEffect(() => {
        if (data.tipo_comentario_id) {
            const tipoSeleccionado = tiposComentario.find(
                t => t.id.toString() === data.tipo_comentario_id.toString()
            );
            
            if (tipoSeleccionado) {
                if (comentariosExistentes === 0 && tipoSeleccionado.nombre === 'Contacto inicial') {
                    setData('dias_recordatorio', 7);
                } else if (tipoSeleccionado.dias_recordatorio_default > 0) {
                    setData('dias_recordatorio', tipoSeleccionado.dias_recordatorio_default);
                } else {
                    setData('dias_recordatorio', 7);
                }
                
                if (tipoSeleccionado.crea_recordatorio) {
                    setData('crea_recordatorio', true);
                }
                
                // Si es rechazo, desactivar recordatorio
                if (tipoSeleccionado.nombre === 'Rechazo lead') {
                    setData('crea_recordatorio', false);
                    setData('dias_recordatorio', 0);
                    cargarMotivosPerdida();
                }
            }
        }
    }, [data.tipo_comentario_id, comentariosExistentes]);

    useEffect(() => {
        if (data.tipo_comentario_id && lead) {
            const tipoSeleccionado = tiposComentario.find(
                t => t.id.toString() === data.tipo_comentario_id.toString()
            );
            
            if (tipoSeleccionado) {
                let estadoActualNombre = 'Nuevo';
                if (lead.estado_lead_id && estadosLead.length > 0) {
                    const estadoActual = estadosLead.find(e => e.id === lead.estado_lead_id);
                    estadoActualNombre = estadoActual?.nombre || 'Nuevo';
                }
                
                let nuevoEstadoNombre = '';
                
                switch(tipoSeleccionado.nombre.toLowerCase()) {
                    case 'contacto inicial':
                    case 'contacto_inicial':
                        nuevoEstadoNombre = 'Contactado';
                        break;
                    case 'seguimiento lead':
                    case 'seguimiento_lead':
                        nuevoEstadoNombre = 'Calificado';
                        break;
                    case 'negociación':
                    case 'negociacion':
                        nuevoEstadoNombre = 'Negociación';
                        break;
                    case 'propuesta enviada':
                    case 'propuesta_enviada':
                        nuevoEstadoNombre = 'Propuesta Enviada';
                        break;
                    case 'rechazo lead':
                    case 'rechazo_lead':
                        nuevoEstadoNombre = 'Perdido';
                        break;
                    default:
                        nuevoEstadoNombre = estadoActualNombre;
                }
                
                setCambioEstadoInfo({
                    tipoSeleccionado: tipoSeleccionado.nombre,
                    estadoActual: estadoActualNombre,
                    nuevoEstado: nuevoEstadoNombre
                });
            }
        }
    }, [data.tipo_comentario_id, lead]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

// En NuevoComentarioModal.tsx, modifica el handleSubmit:

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead) return;
    
    const tipoSeleccionado = tiposComentario.find(
        t => t.id.toString() === data.tipo_comentario_id.toString()
    );
    
    if (!tipoSeleccionado) {
        alert('Por favor seleccione un tipo de comentario');
        return;
    }
    
    const esRechazo = tipoSeleccionado.nombre === 'Rechazo lead';
    
    // Validaciones (igual que antes)
    if (esRechazo) {
        if (!data.motivo_perdida_id) {
            alert('Para rechazar un lead, por favor seleccione un motivo de pérdida');
            return;
        }
    } else {
        if (!data.comentario.trim()) {
            alert('Por favor escriba un comentario');
            return;
        }
        
        // ... resto de validaciones
    }
    
    // Preparar datos para enviar
    const formData = {
        comentario: data.comentario,
        tipo_comentario_id: data.tipo_comentario_id,
        crea_recordatorio: esRechazo ? false : data.crea_recordatorio,
        dias_recordatorio: esRechazo ? 0 : data.dias_recordatorio,
        cambiar_estado_lead: data.cambiar_estado_lead,
        
        // Datos específicos para rechazo (si aplica)
        ...(esRechazo && {
            motivo_perdida_id: data.motivo_perdida_id,
            notas_adicionales: data.notas_adicionales,
            posibilidades_futuras: data.posibilidades_futuras,
            fecha_posible_recontacto: data.fecha_posible_recontacto || null,
        })
    };
    
    // Usar router directamente
    router.post(`/comercial/leads/${lead.id}/comentarios`, formData, {
        onSuccess: () => {
            reset();
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (errors) => {
            console.error('Error al guardar comentario:', errors);
        },
        preserveScroll: true
    });
};

    const handleClose = () => {
        reset();
        setMotivosPerdida([]);
        onClose();
    };

    const openDatePicker = () => {
        if (fechaInputRef) {
            fechaInputRef.showPicker();
        }
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return dateString;
        }
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const calcularDiferenciaMeses = (fechaString: string) => {
        if (!fechaString) return '';
        
        try {
            const fecha = new Date(fechaString);
            const hoy = new Date();
            
            const diffMeses = (fecha.getFullYear() - hoy.getFullYear()) * 12 + 
                             (fecha.getMonth() - hoy.getMonth());
            
            if (diffMeses === 1) return '1 mes';
            if (diffMeses > 1) return `${diffMeses} meses`;
            
            const diffDias = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDias === 1) return '1 día';
            if (diffDias > 1) return `${diffDias} días`;
            
            return 'Hoy';
        } catch {
            return '';
        }
    };

    if (!isOpen || !lead) return null;

    const tiposComentarioFiltrados = tiposComentario.filter(tipo => 
        tipo.es_activo && (tipo.aplica_a === 'lead' || tipo.aplica_a === 'ambos')
    );

    const tipoSeleccionado = tiposComentario.find(
        t => t.id.toString() === data.tipo_comentario_id.toString()
    );
    const tiposConRecordatorioObligatorio = [
        'Contacto inicial', 
        'Seguimiento lead', 
        'Negociación',
        'Propuesta enviada'
    ];
    const esRecordatorioObligatorio = tipoSeleccionado && 
        tiposConRecordatorioObligatorio.includes(tipoSeleccionado.nombre);
    const esRechazo = tipoSeleccionado && tipoSeleccionado.nombre === 'Rechazo lead';
    const puedeDesactivarRecordatorio = !esRecordatorioObligatorio && !esRechazo;

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/60 z-[99990]"
                onClick={handleClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[99999] pointer-events-none">
                <div 
                    className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${esRechazo ? 'bg-red-100' : 'bg-blue-100'}`}>
                                {esRechazo ? (
                                    <ThumbsDown className="h-6 w-6 text-red-600" />
                                ) : (
                                    <MessageSquare className="h-6 w-6 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {esRechazo ? 'Rechazar Lead' : 'Nuevo Comentario'}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {lead.nombre_completo} • ID: {lead.id}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            type="button"
                            disabled={processing}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="tipo_comentario_id" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Tipo de Comentario *
                                </label>
                                <select
                                    id="tipo_comentario_id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={data.tipo_comentario_id}
                                    onChange={e => {
                                        const nuevoTipoId = e.target.value;
                                        setData('tipo_comentario_id', nuevoTipoId);
                                        
                                        const tipo = tiposComentario.find(
                                            t => t.id.toString() === nuevoTipoId.toString()
                                        );
                                        if (tipo) {
                                            if (tipo.nombre === 'Rechazo lead') {
                                                setData('crea_recordatorio', false);
                                                setData('dias_recordatorio', 0);
                                                setMotivosPerdida([]); // Limpiar motivos anteriores
                                                cargarMotivosPerdida();
                                            } else {
                                                if (tipo.dias_recordatorio_default > 0) {
                                                    setData('dias_recordatorio', tipo.dias_recordatorio_default);
                                                } else {
                                                    setData('dias_recordatorio', 7);
                                                }
                                                
                                                if (tipo.crea_recordatorio) {
                                                    setData('crea_recordatorio', true);
                                                }
                                            }
                                        }
                                    }}
                                    required
                                    disabled={processing}
                                >
                                    <option value="">Seleccionar tipo</option>
                                    {tiposComentarioFiltrados.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.tipo_comentario_id && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {errors.tipo_comentario_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
                                    Comentario {!esRechazo && '*'}
                                </label>
                                <textarea
                                    id="comentario"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    rows={4}
                                    value={data.comentario}
                                    onChange={e => setData('comentario', e.target.value)}
                                    placeholder={esRechazo ? "Comentario (opcional) - Puede agregar detalles adicionales sobre el rechazo..." : "Escriba su comentario aquí..."}
                                    required={!esRechazo}
                                    disabled={processing}
                                />
                                {esRechazo && (
                                    <div className="mt-1">
                                        <p className="text-sm text-gray-600">
                                            El comentario es opcional para el rechazo. Puede usarlo para agregar detalles adicionales.
                                        </p>
                                    </div>
                                )}
                                {errors.comentario && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {errors.comentario}
                                    </p>
                                )}
                            </div>

                            {/* SECCIÓN ESPECÍFICA PARA RECHAZO - Adaptada del segundo script */}
                            {esRechazo && (
                                <div className="space-y-6 border-t pt-6 border-gray-200">
                                    <div className="space-y-2">
                                        <label htmlFor="motivo_perdida_id" className="block text-sm font-medium text-gray-700">
                                            Motivo de la pérdida *
                                        </label>
                                        {loadingMotivos ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                <span className="text-sm text-gray-600">Cargando motivos...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <select
                                                    id="motivo_perdida_id"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                                    value={data.motivo_perdida_id}
                                                    onChange={e => setData('motivo_perdida_id', e.target.value)}
                                                    required
                                                    disabled={processing || loadingMotivos}
                                                >
                                                    <option value="">Seleccionar motivo</option>
                                                    {motivosPerdida.map(motivo => (
                                                        <option key={motivo.id} value={motivo.id.toString()}>
                                                            {motivo.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                {data.motivo_perdida_id && (
                                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                        <p className="text-xs text-blue-800">
                                                            <span className="font-medium">Descripción:</span>{' '}
                                                            {motivosPerdida.find(m => m.id.toString() === data.motivo_perdida_id)?.descripcion || 'Sin descripción'}
                                                        </p>
                                                    </div>
                                                )}
                                                {motivosPerdida.length === 0 && !loadingMotivos && (
                                                    <p className="text-sm text-red-600 mt-1">No hay motivos de pérdida configurados</p>
                                                )}
                                            </>
                                        )}
                                        {errors.motivo_perdida_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.motivo_perdida_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="posibilidades_futuras" className="block text-sm font-medium text-gray-700">
                                            ¿Existen posibilidades futuras?
                                        </label>
                                        <select
                                            id="posibilidades_futuras"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                            value={data.posibilidades_futuras}
                                            onChange={e => {
                                                setData('posibilidades_futuras', e.target.value);
                                                if (e.target.value === 'no') {
                                                    setData('fecha_posible_recontacto', '');
                                                }
                                            }}
                                            disabled={processing}
                                        >
                                            <option value="no">No, definitivamente no</option>
                                            <option value="tal_vez">Tal vez, en otro momento</option>
                                            <option value="si">Sí, hay posibilidades</option>
                                        </select>
                                    </div>

                                    {data.posibilidades_futuras !== 'no' && (
                                        <div className="space-y-2">
                                            <label htmlFor="fecha_posible_recontacto" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Fecha posible para recontacto
                                            </label>
                                            
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const fecha = new Date();
                                                        fecha.setMonth(fecha.getMonth() + 1);
                                                        setData('fecha_posible_recontacto', fecha.toISOString().split('T')[0]);
                                                    }}
                                                    className={`text-xs px-3 py-1 rounded ${data.fecha_posible_recontacto && new Date(data.fecha_posible_recontacto).getMonth() === new Date().getMonth() + 1 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                    disabled={processing}
                                                >
                                                    En 1 mes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const fecha = new Date();
                                                        fecha.setMonth(fecha.getMonth() + 3);
                                                        setData('fecha_posible_recontacto', fecha.toISOString().split('T')[0]);
                                                    }}
                                                    className={`text-xs px-3 py-1 rounded ${data.fecha_posible_recontacto && new Date(data.fecha_posible_recontacto).getMonth() === new Date().getMonth() + 3 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                    disabled={processing}
                                                >
                                                    En 3 meses
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const fecha = new Date();
                                                        fecha.setMonth(fecha.getMonth() + 6);
                                                        setData('fecha_posible_recontacto', fecha.toISOString().split('T')[0]);
                                                    }}
                                                    className={`text-xs px-3 py-1 rounded ${data.fecha_posible_recontacto && new Date(data.fecha_posible_recontacto).getMonth() === new Date().getMonth() + 6 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                    disabled={processing}
                                                >
                                                    En 6 meses
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('fecha_posible_recontacto', '')}
                                                    className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                    disabled={processing}
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                            
                                            <div className="relative">
                                                <input
                                                    ref={(el) => setFechaInputRef(el)}
                                                    type="date"
                                                    id="fecha_posible_recontacto"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 pr-10"
                                                    value={formatDateForInput(data.fecha_posible_recontacto)}
                                                    onChange={e => setData('fecha_posible_recontacto', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    disabled={processing}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={openDatePicker}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    disabled={processing}
                                                >
                                                    <CalendarDays className="h-5 w-5" />
                                                </button>
                                            </div>
                                            
                                            {data.fecha_posible_recontacto && (
                                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                    <p className="text-sm text-blue-800">
                                                        <span className="font-medium">Fecha seleccionada:</span> {formatDateDisplay(data.fecha_posible_recontacto)}
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {calcularDiferenciaMeses(data.fecha_posible_recontacto)}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <p className="text-xs text-gray-500 mt-2">
                                                Seleccione una fecha para posible recontacto futuro.
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label htmlFor="notas_adicionales" className="block text-sm font-medium text-gray-700">
                                            Notas adicionales
                                        </label>
                                        <textarea
                                            id="notas_adicionales"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                            rows={2}
                                            value={data.notas_adicionales}
                                            onChange={e => setData('notas_adicionales', e.target.value)}
                                            placeholder="Otras observaciones relevantes (lecciones aprendidas, detalles del proceso, etc.)..."
                                            disabled={processing}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SECCIÓN DE RECORDATORIO (solo si NO es rechazo) */}
                            {!esRechazo && (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="crea_recordatorio"
                                            className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                            checked={data.crea_recordatorio}
                                            onChange={e => {
                                                if (!puedeDesactivarRecordatorio) return;
                                                const nuevoValor = e.target.checked;
                                                setData('crea_recordatorio', nuevoValor);
                                                
                                                if (nuevoValor && data.dias_recordatorio === 0) {
                                                    setData('dias_recordatorio', 7);
                                                }
                                                
                                                if (!nuevoValor) {
                                                    setData('dias_recordatorio', 0);
                                                }
                                            }}
                                            disabled={!puedeDesactivarRecordatorio || processing}
                                        />
                                        <label htmlFor="crea_recordatorio" className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                            <Bell className="h-4 w-4" />
                                            Crear recordatorio
                                            {esRecordatorioObligatorio && (
                                                <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    (Obligatorio para este tipo)
                                                </span>
                                            )}
                                        </label>
                                    </div>

                                    {data.crea_recordatorio && (
                                        <div className="space-y-2 ml-6 pl-4 border-l-2 border-blue-200">
                                            <label htmlFor="dias_recordatorio" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Días para recordatorio (máx. 90) *
                                            </label>
                                            <input
                                                type="number"
                                                id="dias_recordatorio"
                                                min="1"
                                                max="90"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                value={data.dias_recordatorio}
                                                onChange={e => {
                                                    let valor = parseInt(e.target.value) || 0;
                                                    if (valor > 90) valor = 90;
                                                    if (valor < 1) valor = 1;
                                                    setData('dias_recordatorio', valor);
                                                }}
                                                placeholder="Ej: 7"
                                                required={data.crea_recordatorio}
                                                disabled={processing}
                                            />
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-500 flex-1">
                                                    El recordatorio se creará para la fecha actual más los días especificados. Máximo 90 días (3 meses).
                                                </p>
                                                {data.dias_recordatorio > 0 && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {data.dias_recordatorio} día{data.dias_recordatorio !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            {data.dias_recordatorio > 90 && (
                                                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    El valor máximo permitido es 90 días.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="cambiar_estado_lead"
                                        className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                        checked={data.cambiar_estado_lead}
                                        onChange={() => {}}
                                        readOnly
                                        disabled={processing}
                                    />
                                    <label htmlFor="cambiar_estado_lead" className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-500" />
                                        Cambiar estado del lead automáticamente
                                        <span className="text-xs text-gray-500">(Obligatorio)</span>
                                    </label>
                                </div>
                                
                                {data.cambiar_estado_lead && cambioEstadoInfo.nuevoEstado && cambioEstadoInfo.nuevoEstado !== cambioEstadoInfo.estadoActual && (
                                    <div className={`ml-6 pl-4 border-l-2 rounded-md p-3 ${
                                        esRechazo 
                                            ? 'border-red-200 bg-red-50' 
                                            : 'border-green-200 bg-green-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-1 rounded ${
                                                esRechazo ? 'bg-red-100' : 'bg-green-100'
                                            }`}>
                                                <AlertCircle className={`h-4 w-4 ${
                                                    esRechazo ? 'text-red-600' : 'text-green-600'
                                                }`} />
                                            </div>
                                            <span className={`text-sm font-medium ${
                                                esRechazo ? 'text-red-800' : 'text-green-800'
                                            }`}>
                                                Cambio de estado automático
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                            <div className="bg-white p-2 rounded border border-gray-200">
                                                <div className="text-xs text-gray-500 mb-1">Estado actual</div>
                                                <div className="font-medium text-gray-700">{cambioEstadoInfo.estadoActual}</div>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className="text-gray-400 text-xl">→</span>
                                            </div>
                                            <div className={`p-2 rounded border ${
                                                esRechazo 
                                                    ? 'bg-red-100 border-red-300' 
                                                    : 'bg-green-100 border-green-300'
                                            }`}>
                                                <div className={`text-xs mb-1 ${
                                                    esRechazo ? 'text-red-700' : 'text-green-700'
                                                }`}>
                                                    Nuevo estado
                                                </div>
                                                <div className={`font-medium ${
                                                    esRechazo ? 'text-red-800' : 'text-green-800'
                                                }`}>
                                                    {cambioEstadoInfo.nuevoEstado}
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`text-xs mt-2 ${
                                            esRechazo ? 'text-red-700' : 'text-gray-600'
                                        }`}>
                                            {esRechazo ? (
                                                <>
                                                    El estado del lead cambiará automáticamente a "<strong>Perdido</strong>".
                                                </>
                                            ) : (
                                                <>
                                                    El estado del lead cambiará automáticamente a "<strong>{cambioEstadoInfo.nuevoEstado}</strong>" 
                                                    al agregar un comentario de tipo "<strong>{cambioEstadoInfo.tipoSeleccionado}</strong>".
                                                </>
                                            )}
                                        </p>
                                        {esRechazo && (
                                            <ul className="mt-2 text-xs text-red-700 space-y-1 list-disc list-inside">
                                                <li>Todas las notificaciones pendientes serán eliminadas</li>
                                                <li>No se generarán nuevas notificaciones de recordatorio</li>
                                                <li>Se registrará el motivo del rechazo en el historial</li>
                                            </ul>
                                        )}
                                    </div>
                                )}
                                
                                {data.cambiar_estado_lead && cambioEstadoInfo.nuevoEstado && cambioEstadoInfo.nuevoEstado === cambioEstadoInfo.estadoActual && (
                                    <div className="ml-6 pl-4 border-l-2 border-gray-200 bg-gray-50 rounded-md p-3">
                                        <p className="text-sm text-gray-600">
                                            El estado del lead se mantendrá como "<strong>{cambioEstadoInfo.estadoActual}</strong>" 
                                            porque ya está en ese estado.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Información del lead</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Comentarios existentes:</span>
                                        <span className="ml-2 font-medium">{comentariosExistentes}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Estado actual:</span>
                                        <span className="ml-2 font-medium">{cambioEstadoInfo.estadoActual}</span>
                                    </div>
                                </div>
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-800 flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Por favor, corrija los errores antes de enviar.
                                    </p>
                                    <ul className="mt-2 text-xs text-red-700 list-disc list-inside">
                                        {Object.entries(errors).map(([key, value]) => (
                                            <li key={key}>{value}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={processing}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing || 
                                    (esRechazo ? (!data.motivo_perdida_id || !data.tipo_comentario_id) : 
                                    (!data.comentario.trim() || !data.tipo_comentario_id))}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center gap-2 ${
                                    esRechazo 
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {esRechazo ? 'Confirmar Rechazo' : 'Guardar Comentario'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}