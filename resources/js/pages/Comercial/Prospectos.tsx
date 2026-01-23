// resources/js/Pages/Comercial/Prospectos.tsx
import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Origen {
    id: number;
    nombre: string;
    color: string;
    icono: string;
}

interface EstadoLead {
    id: number;
    nombre: string;
    tipo: string;
    color_hex: string;
}

interface Lead {
    id: number;
    nombre_completo: string;
    genero: string;
    telefono: string;
    email: string;
    rubro_id: number;
    origen_id: number;
    estado_lead_id: number;
    es_cliente: boolean;
    es_activo: boolean;
    created: string;
    modified: string;
    origen?: Origen;
    estado_lead?: EstadoLead;
}

interface Props {
    leads: {
        data: Lead[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    estadisticas: {
        total: number;
        nuevo: number;
        contactado: number;
        calificado: number;
        propuesta: number;
        cerrado: number;
    };
    filters: {
        search?: string;
    };
    usuario: {
        ve_todas_cuentas: boolean;
    };
    origenes: Origen[];
    estadosLead: EstadoLead[];
}

export default function Prospectos({ leads, estadisticas, filters, usuario, origenes, estadosLead }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const { data: leadsData, current_page, last_page, total, per_page } = leads;

    // Función para buscar
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/comercial/prospectos', { search }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para limpiar búsqueda
    const clearSearch = () => {
        setSearch('');
        router.get('/comercial/prospectos', {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Formatear fecha
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return 'Fecha inválida';
        }
    };

    // Obtener origen
    const getOrigen = (origenId: number) => {
        return origenes.find(o => o.id === origenId);
    };

    // Obtener estado lead
    const getEstadoLead = (estadoId: number) => {
        return estadosLead.find(e => e.id === estadoId);
    };

    // Obtener color del género
    const getGeneroColor = (genero: string) => {
        const colores: Record<string, string> = {
            masculino: 'bg-blue-100 text-blue-800',
            femenino: 'bg-pink-100 text-pink-800',
            otro: 'bg-purple-100 text-purple-800',
            no_especifica: 'bg-gray-100 text-gray-800',
        };
        return colores[genero] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout title="Prospectos">
            <Head title="Prospectos" />
            
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Prospectos
                        </h1>
                        <p className="mt-1 text-gray-600 text-base">
                            Gestión de leads y prospectos comerciales
                        </p>
                    </div>
                    
                    {/* Indicador de permisos */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            usuario.ve_todas_cuentas 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {usuario.ve_todas_cuentas ? '🔓 Ve todos los prospectos' : '🔒 Prospectos limitados'}
                        </span>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                        >
                            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Pipeline de Prospectos - Versión móvil más compacta */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Pipeline de Prospectos
                    </h2>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors w-full md:w-auto">
                        + Nuevo Prospecto
                    </button>
                </div>
                
                {/* Estadísticas del Pipeline - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Nuevo</h3>
                        <p className="text-xl md:text-2xl font-bold text-gray-900">{estadisticas.nuevo}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Contactado</h3>
                        <p className="text-xl md:text-2xl font-bold text-blue-600">{estadisticas.contactado}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center hover:bg-yellow-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Calificado</h3>
                        <p className="text-xl md:text-2xl font-bold text-yellow-600">{estadisticas.calificado}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center hover:bg-purple-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Propuesta</h3>
                        <p className="text-xl md:text-2xl font-bold text-purple-600">{estadisticas.propuesta}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center hover:bg-green-100 transition-colors cursor-pointer col-span-2 sm:col-span-1 md:col-auto">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Cerrado</h3>
                        <p className="text-xl md:text-2xl font-bold text-green-600">{estadisticas.cerrado}</p>
                    </div>
                </div>
                
                {/* Barra de búsqueda y filtros - Responsive */}
                <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-6`}>
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o teléfono..."
                                className="flex-grow px-3 py-2 border border-gray-300 rounded text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors flex-1"
                                >
                                    Buscar
                                </button>
                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors flex-1"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                    
                    {/* Filtros adicionales (puedes expandir esto) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                            <option value="">Todos los estados</option>
                            {estadosLead.map(estado => (
                                <option key={estado.id} value={estado.id}>
                                    {estado.nombre}
                                </option>
                            ))}
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                            <option value="">Todos los orígenes</option>
                            {origenes.map(origen => (
                                <option key={origen.id} value={origen.id}>
                                    {origen.nombre}
                                </option>
                            ))}
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                            <option value="">Todo el género</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                        </select>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                            Aplicar filtros
                        </button>
                    </div>
                </div>
                
                {/* Tabla de Prospectos - Responsive */}
                {leadsData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay prospectos disponibles
                        </h3>
                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                            {search 
                                ? 'No se encontraron prospectos con ese criterio de búsqueda.'
                                : 'No hay prospectos registrados en el sistema.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Versión móvil - Cards */}
                        <div className="md:hidden space-y-4">
                            {leadsData.map((lead) => {
                                const origen = getOrigen(lead.origen_id);
                                const estado = getEstadoLead(lead.estado_lead_id);
                                return (
                                    <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {lead.nombre_completo || 'Sin nombre'}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    ID: {lead.id} • 
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getGeneroColor(lead.genero)}`}>
                                                {lead.genero === 'masculino' ? '♂' : 
                                                 lead.genero === 'femenino' ? '♀' : 
                                                 lead.genero === 'otro' ? '⚧' : '?'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center text-sm">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-600">{lead.email || 'Sin email'}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-gray-600">{lead.telefono || 'Sin teléfono'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {estado && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" 
                                                      style={{ backgroundColor: `${estado.color_hex}20`, color: estado.color_hex }}>
                                                    {estado.nombre}
                                                </span>
                                            )}
                                            {origen && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" 
                                                      style={{ backgroundColor: `${origen.color}20`, color: origen.color }}>
                                                    {origen.nombre}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">
                                                Registro: {formatDate(lead.created)}
                                            </span>
                                            <div className="flex space-x-2">
                                                <button className="text-xs text-sat hover:text-sat-600 px-2 py-1">
                                                    Editar
                                                </button>
                                                <button className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1">
                                                    Seguir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Versión desktop - Tabla */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prospecto
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Género
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Origen
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registro
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leadsData.map((lead) => {
                                        const origen = getOrigen(lead.origen_id);
                                        const estado = getEstadoLead(lead.estado_lead_id);
                                        return (
                                            <tr key={lead.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {lead.nombre_completo || 'Sin nombre'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ID: {lead.id} • 
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm text-gray-900">{lead.email || 'Sin email'}</p>
                                                        <p className="text-xs text-gray-500">{lead.telefono || 'Sin teléfono'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGeneroColor(lead.genero)}`}>
                                                        {lead.genero === 'masculino' ? '♂ Masculino' : 
                                                         lead.genero === 'femenino' ? '♀ Femenino' : 
                                                         lead.genero === 'otro' ? '⚧ Otro' : 'No especifica'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {estado && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                                              style={{ backgroundColor: `${estado.color_hex}20`, color: estado.color_hex }}>
                                                            {estado.nombre}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {origen && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                                              style={{ backgroundColor: `${origen.color}20`, color: origen.color }}>
                                                            {origen.nombre}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {formatDate(lead.created)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex space-x-2">
                                                        <button className="text-sat hover:text-sat-600 text-sm">
                                                            Editar
                                                        </button>
                                                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                            Seguimiento
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Paginación - Responsive */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                            <div className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{(current_page - 1) * per_page + 1}</span> a{' '}
                                <span className="font-medium">
                                    {Math.min(current_page * per_page, total)}
                                </span>{' '}
                                de <span className="font-medium">{total}</span> prospectos
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => router.get(`/comercial/prospectos?page=${current_page - 1}`)}
                                    disabled={current_page === 1}
                                    className={`px-3 py-1 border rounded text-sm ${current_page === 1 
                                        ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    ← Anterior
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700 hidden sm:inline">
                                    Página {current_page} de {last_page}
                                </span>
                                <div className="flex items-center space-x-1 sm:hidden">
                                    <span className="text-sm text-gray-700">{current_page}</span>
                                    <span className="text-sm text-gray-400">/</span>
                                    <span className="text-sm text-gray-700">{last_page}</span>
                                </div>
                                <button
                                    onClick={() => router.get(`/comercial/prospectos?page=${current_page + 1}`)}
                                    disabled={current_page === last_page}
                                    className={`px-3 py-1 border rounded text-sm ${current_page === last_page 
                                        ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}