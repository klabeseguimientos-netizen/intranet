// resources/js/Pages/Config/Parametros/EstadosLead.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';

// Define el tipo para el estado del formulario
interface EstadoLeadForm {
    nombre: string;
    tipo: 'nuevo' | 'activo' | 'final_positivo' | 'final_negativo';
    orden_en_proceso: number;
    descripcion: string;
    color_hex: string;
}

interface EstadoLead extends EstadoLeadForm {
    id: number;
    activo: boolean;
}

interface Props {
    estados: EstadoLead[];
}

export default function EstadosLead({ estados = [] }: Props) {
    console.log('DEBUG: Estados recibidos en componente:', estados); // Debug
    
    const [showModal, setShowModal] = useState(false);
    const [editingEstado, setEditingEstado] = useState<EstadoLead | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    
    // Estado para toast simple
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    } | null>(null);
    
    // Función para mostrar toast
    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };
    
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm<EstadoLeadForm>({
        nombre: '',
        tipo: 'nuevo',
        orden_en_proceso: 0,
        descripcion: '',
        color_hex: '#3B82F6',
    });
    
    // Configurar datos para edición
    useEffect(() => {
        if (editingEstado) {
            setData({
                nombre: editingEstado.nombre,
                tipo: editingEstado.tipo,
                orden_en_proceso: editingEstado.orden_en_proceso,
                descripcion: editingEstado.descripcion || '',
                color_hex: editingEstado.color_hex,
            });
        }
    }, [editingEstado, setData]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingEstado) {
            put(`/config/parametros/estados-lead/${editingEstado.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingEstado(null);
                    reset();
                    showToast('Estado actualizado exitosamente', 'success');
                },
                onError: () => {
                    showToast('Error al actualizar el estado', 'error');
                },
                preserveScroll: true,
            });
        } else {
            post('/config/parametros/estados-lead', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                    showToast('Estado creado exitosamente', 'success');
                },
                onError: () => {
                    showToast('Error al crear el estado', 'error');
                },
                preserveScroll: true,
            });
        }
    };
    
    const handleDelete = (id: number) => {
        destroy(`/config/parametros/estados-lead/${id}`, {
            onSuccess: () => {
                setConfirmDelete(null);
                showToast('Estado eliminado exitosamente', 'success');
            },
            onError: () => {
                showToast('Error al eliminar el estado', 'error');
            },
            preserveScroll: true,
        });
    };
    
    const handleToggleActivo = (id: number) => {
        router.post(`/config/parametros/estados-lead/${id}/toggle-activo`, {}, {
            onSuccess: () => {
                showToast('Estado actualizado', 'success');
            },
            onError: () => {
                showToast('Error al actualizar el estado', 'error');
            },
            preserveScroll: true,
        });
    };
    
    const tipoLabels = {
        nuevo: 'Nuevo',
        activo: 'Activo',
        final_positivo: 'Final Positivo',
        final_negativo: 'Final Negativo',
    };
    
    const tipoColors = {
        nuevo: 'bg-blue-100 text-blue-800',
        activo: 'bg-yellow-100 text-yellow-800',
        final_positivo: 'bg-green-100 text-green-800',
        final_negativo: 'bg-red-100 text-red-800',
    };

    return (
        <AppLayout title="Estados de Lead">
            {/* Toast simple */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300 ${
                    toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                    toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                    toast.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                    'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                    <div className="flex items-center gap-2">
                        {toast.type === 'success' && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {toast.type === 'error' && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Estados de Lead
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de estados para leads comerciales
                </p>
            </div>

            {/* Botón para agregar nuevo */}
            <div className="mb-6 flex justify-end">
                <button 
                    onClick={() => {
                        setEditingEstado(null);
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Estado
                </button>
            </div>

            {/* CONTENIDO PRINCIPAL - Esto debería verse siempre */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                {estados.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-gray-500">No hay estados de lead registrados</p>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                            Crear primer estado
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table - Esto debería verse */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-medium text-gray-700">ID</th>
                                        <th className="py-3 px-4 text-left font-medium text-gray-700">Nombre</th>
                                        <th className="py-3 px-4 text-left font-medium text-gray-700">Tipo</th>
                                        <th className="py-3 px-4 text-left font-medium text-gray-700">Orden</th>
                                        <th className="py-3 px-4 text-left font-medium text-gray-700">Color</th>
                                        <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                        <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {estados.map((estado) => (
                                        <tr key={estado.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">{estado.id}</td>
                                            <td className="py-3 px-4 font-medium">{estado.nombre}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${tipoColors[estado.tipo]}`}>
                                                    {tipoLabels[estado.tipo]}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{estado.orden_en_proceso}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div 
                                                        className="h-4 w-4 rounded-full mr-2 border border-gray-300"
                                                        style={{ backgroundColor: estado.color_hex }}
                                                    ></div>
                                                    <span className="font-mono text-xs">{estado.color_hex}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleToggleActivo(estado.id)}
                                                    className={`px-2 py-1 text-xs rounded-full ${estado.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                >
                                                    {estado.activo ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingEstado(estado);
                                                            setShowModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirmDelete(estado.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                            Total: {estados.length} estados
                        </div>
                    </>
                )}
            </div>

            {/* MODAL para crear/editar - Solo se muestra cuando showModal es true */}
            {showModal && (
                <div className="fixed inset-0 z-40">
                    {/* Overlay ligero */}
                    <div 
                        className="fixed inset-0 bg-black/30"
                        onClick={() => {
                            setShowModal(false);
                            setEditingEstado(null);
                            reset();
                        }}
                    />
                    
                    {/* Modal centrado */}
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
                                </h2>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.nombre && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo *
                                            </label>
                                            <select
                                                value={data.tipo}
                                                onChange={(e) => setData('tipo', e.target.value as EstadoLeadForm['tipo'])}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="nuevo">Nuevo</option>
                                                <option value="activo">Activo</option>
                                                <option value="final_positivo">Final Positivo</option>
                                                <option value="final_negativo">Final Negativo</option>
                                            </select>
                                            {errors.tipo && (
                                                <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Orden en Proceso *
                                            </label>
                                            <input
                                                type="number"
                                                value={data.orden_en_proceso}
                                                onChange={(e) => setData('orden_en_proceso', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="0"
                                                required
                                            />
                                            {errors.orden_en_proceso && (
                                                <p className="mt-1 text-sm text-red-600">{errors.orden_en_proceso}</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={data.descripcion}
                                                onChange={(e) => setData('descripcion', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows={2}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color *
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="color"
                                                    value={data.color_hex}
                                                    onChange={(e) => setData('color_hex', e.target.value)}
                                                    className="h-10 w-16 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.color_hex}
                                                    onChange={(e) => setData('color_hex', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                                    placeholder="#3B82F6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                setEditingEstado(null);
                                                reset();
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Guardando...' : (editingEstado ? 'Actualizar' : 'Crear')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de confirmación de eliminación */}
            {confirmDelete && (
                <div className="fixed inset-0 z-40">
                    <div 
                        className="fixed inset-0 bg-black/30"
                        onClick={() => setConfirmDelete(null)}
                    />
                    
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Confirmar Eliminación
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    ¿Estás seguro de que deseas eliminar este estado?
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(confirmDelete)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}