// resources/js/Pages/Comercial/Contratos/Index.tsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/Pagination';
import { ContratoFilterBar } from '@/components/contratos/ContratoFilterBar';
import { FileText, Calendar, User, Building, Truck, Eye, Download, Edit } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Amount } from '@/components/ui/Amount';
import { formatDate } from '@/utils/formatters';

interface Contrato {
    id: number;
    numero_contrato: string; // Esto viene del accessor del modelo
    cliente_nombre_completo: string;
    empresa_nombre_fantasia: string;
    presupuesto_cantidad_vehiculos: number;
    presupuesto_total_inversion: number;
    presupuesto_total_mensual: number;
    fecha_emision: string;
    estado?: {
        id: number;
        nombre: string;
    };
    created: string;
}

interface Props {
    contratos: {
        data: Contrato[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: any[];
    };
    estadisticas: {
        total: number;
        activos: number;
        pendientes: number;
        instalados: number;
    };
    usuario: {
        ve_todas_cuentas: boolean;
        rol_id: number;
        nombre_completo?: string;
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
}

export default function ContratosIndex({ 
    contratos, 
    estadisticas, 
    usuario,
    prefijosFiltro = [],
    prefijoUsuario = null,
    estados = []
}: Props) {
    const usuarioEsComercial = usuario.rol_id === 5;

    const [filters, setFilters] = useState(() => {
        const initialFilters: any = {
            estado_id: '',
            fecha_inicio: '',
            fecha_fin: '',
            search: ''
        };
        
        if (!usuarioEsComercial) {
            initialFilters.prefijo_id = '';
        }
        
        return initialFilters;
    });

    const getEstadoColor = (estadoId?: number) => {
        switch(estadoId) {
            case 1: return 'green';  // activo
            case 2: return 'yellow'; // vencido
            case 3: return 'blue';   // aprobado
            case 4: return 'red';     // rechazado
            case 5: return 'orange';  // pendiente
            case 6: return 'purple';  // instalado
            default: return 'gray';
        }
    };

    const getEstadoNombre = (estadoId?: number) => {
        switch(estadoId) {
            case 1: return 'Activo';
            case 2: return 'Vencido';
            case 3: return 'Aprobado';
            case 4: return 'Rechazado';
            case 5: return 'Pendiente';
            case 6: return 'Instalado';
            default: return 'Sin estado';
        }
    };

    const handlePageChange = (page: number) => {
        router.get('/comercial/contratos', { 
            page,
            ...filters 
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        if (usuarioEsComercial && key === 'prefijo_id') return;
        
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);
        router.get('/comercial/contratos', newFilters, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/comercial/contratos', { ...filters, page: 1 }, { preserveState: true });
    };

    const clearFilters = () => {
        const newFilters: any = { 
            estado_id: '', 
            fecha_inicio: '', 
            fecha_fin: '',
            search: ''
        };
        
        if (!usuarioEsComercial) {
            newFilters.prefijo_id = '';
        }
        
        setFilters(newFilters);
        router.get('/comercial/contratos', newFilters, { preserveState: true });
    };

    const hayFiltrosActivos = () => {
        if (usuarioEsComercial) {
            return filters.estado_id || filters.fecha_inicio || filters.fecha_fin || filters.search;
        }
        return filters.estado_id || filters.prefijo_id || filters.fecha_inicio || filters.fecha_fin || filters.search;
    };

    const handleVerPDF = (contratoId: number) => {
        window.open(`/comercial/contratos/${contratoId}/pdf`, '_blank');
    };

    const handleDescargarPDF = (contratoId: number) => {
        window.open(`/comercial/contratos/${contratoId}/pdf?download=1`, '_blank');
    };

    const totalPrimerMes = (contrato: Contrato) => {
        return (contrato.presupuesto_total_inversion || 0) + (contrato.presupuesto_total_mensual || 0);
    };

    return (
        <AppLayout title="Contratos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Contratos
                    </h1>
                    <p className="mt-1 text-gray-600 text-base">
                        Gestión y seguimiento de contratos
                    </p>
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
                    <div className="p-4 bg-orange-50 rounded border border-orange-200">
                        <h3 className="font-medium text-gray-700 mb-2">Pendientes</h3>
                        <p className="text-2xl font-bold text-orange-600">{estadisticas.pendientes}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-200">
                        <h3 className="font-medium text-gray-700 mb-2">Instalados</h3>
                        <p className="text-2xl font-bold text-purple-600">{estadisticas.instalados}</p>
                    </div>
                </div>

                {/* Buscador */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                placeholder="Buscar por contrato, cliente, empresa..."
                                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Buscar
                        </button>
                    </form>
                </div>

                {/* Filtros */}
                <ContratoFilterBar
                    estadoValue={filters.estado_id || ''}
                    onEstadoChange={(value) => handleFilterChange('estado_id', value)}
                    prefijoValue={filters.prefijo_id || ''}
                    onPrefijoChange={(value) => handleFilterChange('prefijo_id', value)}
                    fechaInicio={filters.fecha_inicio || ''}
                    fechaFin={filters.fecha_fin || ''}
                    onFechaInicioChange={(value) => handleFilterChange('fecha_inicio', value)}
                    onFechaFinChange={(value) => handleFilterChange('fecha_fin', value)}
                    estados={estados}
                    prefijosFiltro={prefijosFiltro}
                    onClearFilters={clearFilters}
                    hayFiltrosActivos={hayFiltrosActivos()}
                    usuarioEsComercial={usuarioEsComercial}
                    prefijoUsuario={prefijoUsuario}
                />
                
                {/* Listado de contratos */}
                {contratos.data.length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contrato
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Empresa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vehículos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {contratos.data.map((contrato) => (
                                        <tr key={contrato.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{contrato.numero_contrato}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {contrato.cliente_nombre_completo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {contrato.empresa_nombre_fantasia}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {contrato.presupuesto_cantidad_vehiculos}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(contrato.fecha_emision)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                <Amount value={totalPrimerMes(contrato)} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge 
                                                    status={getEstadoNombre(contrato.estado?.id)} 
                                                    color={getEstadoColor(contrato.estado?.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <Link
                                                    href={`/comercial/contratos/${contrato.id}`}
                                                    className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center gap-1"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Ver</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleVerPDF(contrato.id)}
                                                    className="text-orange-600 hover:text-orange-900 mr-3 inline-flex items-center gap-1"
                                                    title="Ver PDF"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span className="sr-only">PDF</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDescargarPDF(contrato.id)}
                                                    className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                                                    title="Descargar PDF"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Descargar</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Paginación */}
                        {contratos.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <Pagination
                                    currentPage={contratos.current_page}
                                    lastPage={contratos.last_page}
                                    total={contratos.total}
                                    perPage={contratos.per_page}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium">No hay contratos</p>
                        <p className="text-sm">Los contratos generados aparecerán aquí</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}