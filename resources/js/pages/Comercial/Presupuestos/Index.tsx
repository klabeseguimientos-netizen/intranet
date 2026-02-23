// resources/js/Pages/Comercial/Presupuestos/Index.tsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import { PresupuestoFilterBar } from '@/components/presupuestos/PresupuestoFilterBar';
import { Gift } from 'lucide-react';

interface Presupuesto {
    id: number;
    referencia: string;
    cantidad_vehiculos: number;
    total_presupuesto: number;
    created: string;
    validez: string;
    lead: {
        id: number;
        nombre_completo: string;
        email: string;
        telefono?: string;
    };
    prefijo?: {
        id: number;
        codigo: string;
        descripcion: string;
    };
    estado?: {
        id: number;
        nombre: string;
    };
    promocion?: {
        id: number;
        nombre: string;
    } | null;
}

interface Props {
    presupuestos: {
        data: Presupuesto[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: any[];
    };
    estadisticas: {
        total: number;
        activos: number;
        vencidos: number; 
        aprobados: number;
        rechazados: number;
    };
    usuario: {
        ve_todas_cuentas: boolean;
        rol_id: number;
        nombre_completo?: string;
        prefijos_asignados?: number[];
    };
    prefijosFiltro: Array<{ 
        id: string; 
        codigo: string; 
        descripcion: string; 
        comercial_nombre?: string;
        display_text: string;
    }>;
    prefijoUsuario?: {
        id: string;
        codigo: string;
        descripcion: string;
        comercial_nombre?: string;
        display_text: string;
    } | null;
    estados: Array<{ id: number; nombre: string }>;
    promociones: Array<{ id: number; nombre: string }>;
}

export default function PresupuestosIndex({ 
    presupuestos, 
    estadisticas, 
    usuario,
    prefijosFiltro = [],
    prefijoUsuario = null,
    estados = [],
    promociones = []
}: Props) {
    const usuarioEsComercial = usuario.rol_id === 5;
    
    const [filters, setFilters] = useState(() => {
        const initialFilters: any = {
            estado_id: '',
            promocion_id: '',
            fecha_inicio: '',
            fecha_fin: ''
        };
        
        // Solo agregar prefijo_id si NO es comercial
        if (!usuarioEsComercial) {
            initialFilters.prefijo_id = '';
        }
        
        return initialFilters;
    });

    const formatMoney = (value: any) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '$ 0,00';
        return '$ ' + num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getEstadoColor = (estadoId?: number) => {
        switch(estadoId) {
            case 1: return 'bg-green-100 text-green-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-blue-100 text-blue-800';
            case 4: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePageChange = (page: number) => {
        router.get('/comercial/presupuestos', { 
            page,
            ...filters 
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        // Si es comercial, ignorar cambios en prefijo_id
        if (usuarioEsComercial && key === 'prefijo_id') {
            return;
        }
        
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);
        router.get('/comercial/presupuestos', newFilters, { preserveState: true });
    };

    const clearFilters = () => {
        const newFilters: any = { 
            estado_id: '', 
            promocion_id: '', 
            fecha_inicio: '', 
            fecha_fin: '' 
        };
        
        // Solo incluir prefijo_id si NO es comercial
        if (!usuarioEsComercial) {
            newFilters.prefijo_id = '';
        }
        
        setFilters(newFilters);
        router.get('/comercial/presupuestos', newFilters, { preserveState: true });
    };

    const hayFiltrosActivos = () => {
        if (usuarioEsComercial) {
            return filters.estado_id || filters.promocion_id || filters.fecha_inicio || filters.fecha_fin;
        }
        return filters.estado_id || filters.prefijo_id || filters.promocion_id || filters.fecha_inicio || filters.fecha_fin;
    };

    const handleVerPDF = (presupuestoId: number) => {
        window.open(`/comercial/presupuestos/${presupuestoId}/pdf`, '_blank');
    };

    return (
        <AppLayout title="Presupuestos">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Presupuestos
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión y seguimiento de presupuestos
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Presupuestos Generados
                    </h2>
                    <Link
                        href="/comercial/prospectos"
                        className="px-4 py-2 bg-local text-white text-sm rounded hover:bg-local-600 transition-colors"
                    >
                       ir a Prospectos
                    </Link>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-700 mb-2">Total</h3>
                        <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                        <h3 className="font-medium text-gray-700 mb-2">Activos</h3>
                        <p className="text-2xl font-bold text-green-600">{estadisticas.activos}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                        <h3 className="font-medium text-gray-700 mb-2">Vencidos</h3>
                        <p className="text-2xl font-bold text-yellow-600">{estadisticas.vencidos}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-gray-700 mb-2">Aprobados</h3>
                        <p className="text-2xl font-bold text-blue-600">{estadisticas.aprobados}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded border border-red-200">
                        <h3 className="font-medium text-gray-700 mb-2">Rechazados</h3>
                        <p className="text-2xl font-bold text-red-600">{estadisticas.rechazados}</p>
                    </div>
                </div>

                {/* Filtros */}
                <PresupuestoFilterBar
                    estadoValue={filters.estado_id || ''}
                    onEstadoChange={(value) => handleFilterChange('estado_id', value)}
                    prefijoValue={filters.prefijo_id || ''}
                    onPrefijoChange={(value) => handleFilterChange('prefijo_id', value)}
                    promocionValue={filters.promocion_id || ''}
                    onPromocionChange={(value) => handleFilterChange('promocion_id', value)}
                    fechaInicio={filters.fecha_inicio || ''}
                    fechaFin={filters.fecha_fin || ''}
                    onFechaInicioChange={(value) => handleFilterChange('fecha_inicio', value)}
                    onFechaFinChange={(value) => handleFilterChange('fecha_fin', value)}
                    estados={estados}
                    prefijosFiltro={prefijosFiltro}
                    promociones={promociones}
                    onClearFilters={clearFilters}
                    hayFiltrosActivos={hayFiltrosActivos()}
                    usuarioEsComercial={usuarioEsComercial}
                    prefijoUsuario={prefijoUsuario}
                />
                
                {/* Listado de presupuestos */}
                {presupuestos.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Referencia
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehículos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Validez
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Promoción
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {presupuestos.data.map((presupuesto) => (
                                    <tr key={presupuesto.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {presupuesto.referencia}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {presupuesto.lead.nombre_completo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {presupuesto.cantidad_vehiculos}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(presupuesto.created)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(presupuesto.validez)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {formatMoney(presupuesto.total_presupuesto)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(presupuesto.estado?.id)}`}>
                                                {presupuesto.estado?.nombre || 'Sin estado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {presupuesto.promocion ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                    <Gift className="h-3 w-3" />
                                                    {presupuesto.promocion.nombre}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Link
                                                href={`/comercial/presupuestos/${presupuesto.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                Ver
                                            </Link>
                                            <Link
                                                href={`/comercial/presupuestos/${presupuesto.id}/edit`}
                                                className="text-green-600 hover:text-green-900 mr-3"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleVerPDF(presupuesto.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Paginación */}
                        {presupuestos.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination
                                    currentPage={presupuestos.current_page}
                                    lastPage={presupuestos.last_page}
                                    total={presupuestos.total}
                                    perPage={presupuestos.per_page}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-600 text-center py-8">
                        <p>No hay presupuestos cargados</p>
                        <p className="text-sm mt-2">
                            <Link href="/comercial/prospectos" className="text-local hover:underline">
                                Ir a leads para crear un presupuesto
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}