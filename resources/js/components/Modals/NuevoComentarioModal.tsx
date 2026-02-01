// resources/js/Components/Modals/NuevoComentarioModal.tsx
import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, MessageSquare, Bell, Calendar, Save, XCircle } from 'lucide-react';

interface TipoComentario {
    id: number;
    nombre: string;
    descripcion: string;
    aplica_a: string;
    crea_recordatorio: boolean;
    dias_recordatorio_default: number;
    es_activo: boolean;
}

interface Lead {
    id: number;
    nombre_completo: string;
}

interface NuevoComentarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    tiposComentario: TipoComentario[];
    onSuccess?: () => void;
}

export default function NuevoComentarioModal({ isOpen, onClose, lead, tiposComentario, onSuccess }: NuevoComentarioModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        comentario: '',
        tipo_comentario_id: '' as string | number,
        crea_recordatorio: false,
        dias_recordatorio: 0
    });

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
        
        post(`/comercial/leads/${lead.id}/comentarios`, {
            onSuccess: () => {
                reset();
                if (onSuccess) onSuccess();
                onClose();
            },
            preserveScroll: true
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen || !lead) return null;

    const tiposComentarioFiltrados = tiposComentario.filter(tipo => 
        tipo.es_activo && (tipo.aplica_a === 'lead' || tipo.aplica_a === 'ambos')
    );

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
                                Tipo de Comentario
                            </label>
                            <select
                                id="tipo_comentario_id"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sat focus:border-sat"
                                value={data.tipo_comentario_id}
                                onChange={e => setData('tipo_comentario_id', e.target.value)}
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
                                    onChange={e => setData('crea_recordatorio', e.target.checked)}
                                />
                                <label htmlFor="crea_recordatorio" className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                                    <Bell className="h-4 w-4" />
                                    Crear recordatorio
                                </label>
                            </div>

                            {data.crea_recordatorio && (
                                <div className="space-y-2 ml-6 pl-4 border-l-2 border-sat-200">
                                    <label htmlFor="dias_recordatorio" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Días para recordatorio
                                    </label>
                                    <input
                                        type="number"
                                        id="dias_recordatorio"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sat focus:border-sat"
                                        value={data.dias_recordatorio}
                                        onChange={e => setData('dias_recordatorio', parseInt(e.target.value) || 0)}
                                        placeholder="Ej: 7"
                                    />
                                    <p className="text-xs text-gray-500">
                                        El recordatorio se creará para la fecha actual más los días especificados.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Errores generales */}
                        {errors && Object.keys(errors).length > 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-800 flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Por favor, corrija los errores antes de enviar.
                                </p>
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
                            disabled={processing || !data.comentario.trim()}
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
    </>);
}