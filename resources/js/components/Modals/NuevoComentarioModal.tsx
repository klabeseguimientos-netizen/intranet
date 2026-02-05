// resources/js/Components/Modals/NuevoComentarioModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, MessageSquare, Bell, Calendar, Save, XCircle, AlertCircle, Lock } from 'lucide-react';

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
    // Estados para controlar cambios de estado
    const [cambioEstadoInfo, setCambioEstadoInfo] = useState<{
        tipoSeleccionado: string;
        estadoActual: string;
        nuevoEstado: string;
    }>({
        tipoSeleccionado: '',
        estadoActual: 'Nuevo',
        nuevoEstado: '',
    });

    // Determinar el tipo de comentario predeterminado
    const getTipoPredeterminado = () => {
        if (comentariosExistentes === 0) {
            // Si no hay comentarios, es contacto inicial
            const contactoInicial = tiposComentario.find(t => t.nombre === 'Contacto inicial');
            return contactoInicial?.id || '';
        }
        return '';
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        comentario: '',
        tipo_comentario_id: getTipoPredeterminado() as string | number,
        crea_recordatorio: true, // Siempre activo por defecto
        dias_recordatorio: 0,
        cambiar_estado_lead: true, // Siempre activo y no editable
    });

    // Inicializar días de recordatorio según tipo predeterminado
    useEffect(() => {
        if (data.tipo_comentario_id) {
            const tipoSeleccionado = tiposComentario.find(
                t => t.id == data.tipo_comentario_id
            );
            
            if (tipoSeleccionado) {
                // Si es el primer comentario y es contacto inicial, usar 7 días
                if (comentariosExistentes === 0 && tipoSeleccionado.nombre === 'Contacto inicial') {
                    setData('dias_recordatorio', 7);
                }
                // Para otros tipos con recordatorio por defecto
                else if (tipoSeleccionado.dias_recordatorio_default > 0) {
                    setData('dias_recordatorio', tipoSeleccionado.dias_recordatorio_default);
                } else {
                    // Valor por defecto si no tiene
                    setData('dias_recordatorio', 7);
                }
                
                // Activar recordatorio si el tipo lo requiere
                if (tipoSeleccionado.crea_recordatorio) {
                    setData('crea_recordatorio', true);
                }
            }
        }
    }, [data.tipo_comentario_id, comentariosExistentes]);

    // Actualizar información de cambio de estado cuando cambia el tipo de comentario
    useEffect(() => {
        if (data.tipo_comentario_id && lead) {
            const tipoSeleccionado = tiposComentario.find(
                t => t.id == data.tipo_comentario_id
            );
            
            if (tipoSeleccionado) {
                let estadoActualNombre = 'Nuevo';
                if (lead.estado_lead_id && estadosLead.length > 0) {
                    const estadoActual = estadosLead.find(e => e.id === lead.estado_lead_id);
                    estadoActualNombre = estadoActual?.nombre || 'Nuevo';
                }
                
                let nuevoEstadoNombre = '';
                
                // Mapear tipo de comentario a nuevo estado
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
                        nuevoEstadoNombre = 'Rechazado';
                        break;
                    default:
                        nuevoEstadoNombre = estadoActualNombre; // Mantener estado actual
                }
                
                setCambioEstadoInfo({
                    tipoSeleccionado: tipoSeleccionado.nombre,
                    estadoActual: estadoActualNombre,
                    nuevoEstado: nuevoEstadoNombre
                });
            }
        }
    }, [data.tipo_comentario_id, lead]);

    // Controlar scroll del body
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!lead) return;
        
        // Validaciones obligatorias
        const tipoSeleccionado = tiposComentario.find(t => t.id == data.tipo_comentario_id);
        
        if (!tipoSeleccionado) {
            alert('Por favor seleccione un tipo de comentario');
            return;
        }
        
        // Validar días de recordatorio si está activado
        if (data.crea_recordatorio) {
            if (data.dias_recordatorio <= 0) {
                alert('Por favor ingrese un número válido de días para el recordatorio');
                return;
            }
            
            if (data.dias_recordatorio > 90) {
                alert('Los días de recordatorio no pueden ser mayores a 90');
                return;
            }
        }
        
        // Tipos que requieren recordatorio obligatorio
        const tiposConRecordatorioObligatorio = [
            'Contacto inicial', 
            'Seguimiento lead', 
            'Negociación',
            'Propuesta enviada'
        ];
        
        if (tiposConRecordatorioObligatorio.includes(tipoSeleccionado.nombre)) {
            if (!data.crea_recordatorio) {
                alert('Este tipo de comentario requiere un recordatorio obligatorio');
                return;
            }
            
            if (data.dias_recordatorio <= 0) {
                alert('Por favor ingrese los días para el recordatorio');
                return;
            }
        }
        
        // Para rechazo, no debe tener recordatorio
        if (tipoSeleccionado.nombre === 'Rechazo lead') {
            setData('crea_recordatorio', false);
            setData('dias_recordatorio', 0);
        }
        
        // Usar la ruta existente
        post(`/comercial/leads/${lead.id}/comentarios`, {
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
        onClose();
    };

    if (!isOpen || !lead) return null;

    // Filtrar tipos de comentario activos para leads
    const tiposComentarioFiltrados = tiposComentario.filter(tipo => 
        tipo.es_activo && (tipo.aplica_a === 'lead' || tipo.aplica_a === 'ambos')
    );

    const tipoSeleccionado = tiposComentario.find(t => t.id == data.tipo_comentario_id);
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
            {/* Fondo oscuro */}
            <div 
                className="fixed inset-0 bg-black/60 z-[99990]"
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[99999] pointer-events-none">
                <div 
                    className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sat/10 rounded-lg">
                                <MessageSquare className="h-6 w-6 text-sat" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Nuevo Comentario
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

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="space-y-6">
                            {/* Tipo de comentario */}
                            <div className="space-y-2">
                                <label htmlFor="tipo_comentario_id" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Tipo de Comentario *
                                </label>
                                <select
                                    id="tipo_comentario_id"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sat focus:border-sat"
                                    value={data.tipo_comentario_id}
                                    onChange={e => {
                                        const nuevoTipoId = e.target.value;
                                        setData('tipo_comentario_id', nuevoTipoId);
                                        
                                        // Buscar el tipo seleccionado
                                        const tipo = tiposComentario.find(t => t.id == nuevoTipoId);
                                        if (tipo) {
                                            // Si tiene días por defecto, usarlos
                                            if (tipo.dias_recordatorio_default > 0) {
                                                setData('dias_recordatorio', tipo.dias_recordatorio_default);
                                            } else {
                                                setData('dias_recordatorio', 7); // Valor por defecto
                                            }
                                            
                                            // Activar recordatorio si el tipo lo requiere
                                            if (tipo.crea_recordatorio) {
                                                setData('crea_recordatorio', true);
                                            }
                                        }
                                    }}
                                    required
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

                            {/* Comentario */}
                            <div className="space-y-2">
                                <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
                                    Comentario *
                                </label>
                                <textarea
                                    id="comentario"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sat focus:border-sat"
                                    rows={4}
                                    value={data.comentario}
                                    onChange={e => setData('comentario', e.target.value)}
                                    placeholder="Escriba su comentario aquí..."
                                    required
                                />
                                {errors.comentario && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        {errors.comentario}
                                    </p>
                                )}
                            </div>

                            {/* Recordatorio */}
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="crea_recordatorio"
                                        className="h-4 w-4 text-sat border-gray-300 rounded focus:ring-sat"
                                        checked={data.crea_recordatorio}
                                        onChange={e => {
                                            if (!puedeDesactivarRecordatorio) return;
                                            const nuevoValor = e.target.checked;
                                            setData('crea_recordatorio', nuevoValor);
                                            
                                            // Si se activa el recordatorio y no tiene valor, usar 7 por defecto
                                            if (nuevoValor && data.dias_recordatorio === 0) {
                                                setData('dias_recordatorio', 7);
                                            }
                                            
                                            // Si se desactiva, resetear días
                                            if (!nuevoValor) {
                                                setData('dias_recordatorio', 0);
                                            }
                                        }}
                                        disabled={!puedeDesactivarRecordatorio}
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
                                        {esRechazo && (
                                            <span className="text-xs text-gray-600 flex items-center gap-1">
                                                <Lock className="h-3 w-3" />
                                                (No aplica para rechazo)
                                            </span>
                                        )}
                                    </label>
                                </div>

                                {data.crea_recordatorio && (
                                    <div className="space-y-2 ml-6 pl-4 border-l-2 border-sat-200">
                                        <label htmlFor="dias_recordatorio" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Días para recordatorio (máx. 90) *
                                        </label>
                                        <input
                                            type="number"
                                            id="dias_recordatorio"
                                            min="1"
                                            max="90"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sat focus:border-sat"
                                            value={data.dias_recordatorio}
                                            onChange={e => {
                                                let valor = parseInt(e.target.value) || 0;
                                                if (valor > 90) valor = 90;
                                                if (valor < 1) valor = 1;
                                                setData('dias_recordatorio', valor);
                                            }}
                                            placeholder="Ej: 7"
                                            required={data.crea_recordatorio}
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

                            {/* Cambio automático de estado (siempre activo) */}
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="cambiar_estado_lead"
                                        className="h-4 w-4 text-sat border-gray-300 rounded focus:ring-sat"
                                        checked={data.cambiar_estado_lead}
                                        onChange={() => {}} // No permitir cambios
                                        readOnly
                                    />
                                    <label htmlFor="cambiar_estado_lead" className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-gray-500" />
                                        Cambiar estado del lead automáticamente
                                        <span className="text-xs text-gray-500">(Obligatorio)</span>
                                    </label>
                                </div>
                                
                                {data.cambiar_estado_lead && cambioEstadoInfo.nuevoEstado && cambioEstadoInfo.nuevoEstado !== cambioEstadoInfo.estadoActual && (
                                    <div className="ml-6 pl-4 border-l-2 border-green-200 bg-green-50 rounded-md p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1 bg-green-100 rounded">
                                                <AlertCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="text-sm font-medium text-green-800">
                                                Cambio de estado automático
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                            <div className="bg-white p-2 rounded border border-green-200">
                                                <div className="text-xs text-gray-500 mb-1">Estado actual</div>
                                                <div className="font-medium text-gray-700">{cambioEstadoInfo.estadoActual}</div>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className="text-gray-400 text-xl">→</span>
                                            </div>
                                            <div className="bg-green-100 p-2 rounded border border-green-300">
                                                <div className="text-xs text-green-700 mb-1">Nuevo estado</div>
                                                <div className="font-medium text-green-800">{cambioEstadoInfo.nuevoEstado}</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            El estado del lead cambiará automáticamente a "<strong>{cambioEstadoInfo.nuevoEstado}</strong>" 
                                            al agregar un comentario de tipo "<strong>{cambioEstadoInfo.tipoSeleccionado}</strong>".
                                        </p>
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

                            {/* Información del lead */}
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

                            {/* Errores generales */}
                            {errors && Object.keys(errors).length > 0 && (
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

                        {/* Botones */}
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
                                disabled={processing || !data.comentario.trim() || !data.tipo_comentario_id}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sat hover:bg-sat-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sat disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Guardar Comentario
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