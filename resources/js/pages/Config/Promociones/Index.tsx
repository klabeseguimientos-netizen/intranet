// resources/js/Pages/Config/Promociones/Index.tsx
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Tag, Calendar, Edit2, Trash2, Plus, 
    AlertCircle, Gift, Percent, 
    CheckCircle, XCircle, Clock
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import CrearPromocionModal from '@/components/Modals/CrearPromocionModal';
import { Promocion, EstadisticasPromociones, ProductosAgrupados } from '@/types/promociones';

interface Props {
    promociones: {
        data: Promocion[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: any[];
    };
    estadisticas: EstadisticasPromociones;
    productos: ProductosAgrupados;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function PromocionesIndex({ promociones, estadisticas, productos, flash }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPromocion, setSelectedPromocion] = useState<Promocion | null>(null);
    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
    const [editingPromocion, setEditingPromocion] = useState<Promocion | null>(null);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoColor = (estado: string) => {
        switch(estado) {
            case 'Vigente':
                return 'bg-green-100 text-green-800';
            case 'Próxima':
                return 'bg-blue-100 text-blue-800';
            case 'Vencida':
                return 'bg-gray-100 text-gray-800';
            case 'Inactiva':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch(estado) {
            case 'Vigente':
                return <CheckCircle className="h-4 w-4" />;
            case 'Próxima':
                return <Clock className="h-4 w-4" />;
            case 'Vencida':
                return <AlertCircle className="h-4 w-4" />;
            case 'Inactiva':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Tag className="h-4 w-4" />;
        }
    };

    const handlePageChange = (page: number) => {
        router.get('/config/promociones', { page }, { preserveState: true });
    };

    const handleDelete = (promocion: Promocion) => {
        setSelectedPromocion(promocion);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedPromocion) {
            router.delete(`/config/promociones/${selectedPromocion.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedPromocion(null);
                },
                preserveScroll: true
            });
        }
    };

    const handleEdit = (promocion: Promocion) => {
        setEditingPromocion(promocion);
        setIsCrearModalOpen(true);
    };

    const handleModalClose = () => {
        setIsCrearModalOpen(false);
        setEditingPromocion(null);
    };

    const handleModalSuccess = () => {
        router.reload({ only: ['promociones', 'estadisticas'] });
    };

    return (
        <AppLayout title="Promociones">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
                <p className="mt-1 text-gray-600 text-base">Gestión de promociones y bonificaciones</p>
            </div>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {flash.error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Promociones</h2>
                    <button
                        onClick={() => setIsCrearModalOpen(true)}
                        className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Promoción
                    </button>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-700 mb-2">Total</h3>
                        <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                        <h3 className="font-medium text-gray-700 mb-2">Vigentes</h3>
                        <p className="text-2xl font-bold text-green-600">{estadisticas.vigentes}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-gray-700 mb-2">Próximas</h3>
                        <p className="text-2xl font-bold text-blue-600">{estadisticas.proximas}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-2">Vencidas</h3>
                        <p className="text-2xl font-bold text-gray-600">{estadisticas.vencidas}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded border border-red-200">
                        <h3 className="font-medium text-gray-700 mb-2">Inactivas</h3>
                        <p className="text-2xl font-bold text-red-600">{estadisticas.inactivas}</p>
                    </div>
                </div>
                
                {/* Listado de promociones */}
                {promociones.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado por</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {promociones.data.map((promocion) => (
                                    <tr key={promocion.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <Gift className="h-5 w-5 text-sat flex-shrink-0 mt-1" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{promocion.nombre}</div>
                                                    {promocion.descripcion && (
                                                        <div className="text-xs text-gray-500 line-clamp-1">{promocion.descripcion}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(promocion.fecha_inicio)} - {formatDate(promocion.fecha_fin)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {promocion.productos.slice(0, 2).map((prod) => (
                                                    <div key={prod.id} className="flex items-center gap-2 text-xs">
                                                        <Percent className="h-3 w-3 text-sat" />
                                                        <span className="text-gray-600">{prod.productoServicio.nombre}</span>
                                                        <span className="font-medium text-sat">{prod.bonificacion}%</span>
                                                    </div>
                                                ))}
                                                {promocion.productos.length > 2 && (
                                                    <div className="text-xs text-gray-400">+{promocion.productos.length - 2} más</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(promocion.estado)}`}>
                                                {getEstadoIcon(promocion.estado)}
                                                {promocion.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {promocion.creador?.name || 'Sistema'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button onClick={() => handleEdit(promocion)} className="text-blue-600 hover:text-blue-900 mr-3" title="Editar">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(promocion)} className="text-red-600 hover:text-red-900" title="Eliminar">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Paginación */}
                        {promociones.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination
                                    currentPage={promociones.current_page}
                                    lastPage={promociones.last_page}
                                    total={promociones.total}
                                    perPage={promociones.per_page}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-600 text-center py-8">
                        <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p>No hay promociones cargadas</p>
                        <p className="text-sm mt-2">
                            <button onClick={() => setIsCrearModalOpen(true)} className="text-sat hover:underline">
                                Crear la primera promoción
                            </button>
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de creación/edición */}
            <CrearPromocionModal
                isOpen={isCrearModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                promocion={editingPromocion}
                productos={productos}
            />

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && selectedPromocion && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999] p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-fadeIn">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas eliminar la promoción "{selectedPromocion.nombre}"?
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}