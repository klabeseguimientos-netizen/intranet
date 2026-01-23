// resources/js/Pages/Comercial/Contactos.tsx
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Lead {
    id: number;
    nombre_completo: string;
    email: string;
    telefono: string;
    genero: string;
}

interface Empresa {
    id: number;
    nombre_fantasia: string;
    razon_social: string;
    cuit: string;
}

interface Contacto {
    id: number;
    empresa_id: number;
    lead_id: number;
    es_contacto_principal: boolean;
    tipo_responsabilidad_id: number;
    tipo_documento_id: number;
    nro_documento: string;
    nacionalidad_id: number;
    fecha_nacimiento: string;
    direccion_personal: string;
    codigo_postal_personal: string;
    es_activo: boolean;
    created: string;
    modified: string;
    lead?: Lead;
    empresa?: Empresa;
}

interface Props {
    contactos: {
        data: Contacto[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    estadisticas: {
        total: number;
        principales: number;
    };
    filters: {
        search?: string;
    };
    usuario: {
        ve_todas_cuentas: boolean;
    };
}

export default function Contactos({ contactos, estadisticas, filters, usuario }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const { data: contactosData, current_page, last_page, total, per_page } = contactos;

    // Función para buscar
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/comercial/contactos', { search }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para limpiar búsqueda
    const clearSearch = () => {
        setSearch('');
        router.get('/comercial/contactos', {}, {
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

    // Formatear fecha de nacimiento
    const formatFechaNacimiento = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const fecha = new Date(dateString);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fecha.getFullYear();
            const mes = hoy.getMonth() - fecha.getMonth();
            
            let edadCalculada = edad;
            if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
                edadCalculada--;
            }
            
            return `${format(fecha, 'dd/MM/yyyy')} (${edadCalculada} años)`;
        } catch {
            return dateString;
        }
    };

    // Obtener iniciales del nombre
    const getIniciales = (nombre: string) => {
        if (!nombre) return '??';
        const partes = nombre.split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    return (
        <AppLayout title="Contactos">
            <Head title="Contactos" />
            
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Contactos
                        </h1>
                        <p className="mt-1 text-gray-600 text-base">
                            Gestión de contactos de clientes
                        </p>
                    </div>
                    
                    {/* Indicador de permisos */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            usuario.ve_todas_cuentas 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {usuario.ve_todas_cuentas ? '🔓 Ve todos los contactos' : '🔒 Contactos limitados'}
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
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Listado de Contactos
                    </h2>
                    <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors w-full md:w-auto">
                        + Nuevo Contacto
                    </button>
                </div>
                
                {/* Estadísticas - Responsive */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                    <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1 md:mb-2">Contactos Totales</h3>
                        <p className="text-xl md:text-2xl font-bold text-blue-600">{estadisticas.total}</p>
                    </div>
                    <div className="p-3 md:p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1 md:mb-2">Contactos Principales</h3>
                        <p className="text-xl md:text-2xl font-bold text-purple-600">{estadisticas.principales}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {estadisticas.total > 0 ? 
                                `${Math.round((estadisticas.principales / estadisticas.total) * 100)}% del total` : 
                                'Sin datos'}
                        </p>
                    </div>
                </div>
                
                {/* Barra de búsqueda y filtros - Responsive */}
                <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-6`}>
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email, teléfono o empresa..."
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
                    
                    {/* Filtros adicionales */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                            <option value="">Todos los tipos</option>
                            <option value="principal">Principal</option>
                            <option value="secundario">Secundario</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                            <option value="">Todas las empresas</option>
                        </select>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors col-span-2 md:col-auto">
                            Aplicar filtros
                        </button>
                    </div>
                </div>
                
                {/* Tabla de Contactos - Responsive */}
                {contactosData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay contactos disponibles
                        </h3>
                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                            {search 
                                ? 'No se encontraron contactos con ese criterio de búsqueda.'
                                : 'No hay contactos registrados en el sistema.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Versión móvil - Cards */}
                        <div className="md:hidden space-y-4">
                            {contactosData.map((contacto) => (
                                <div key={contacto.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {getIniciales(contacto.lead?.nombre_completo || '')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {contacto.lead?.nombre_completo || 'Sin nombre'}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {contacto.es_contacto_principal ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                Principal
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                Secundario
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Información de contacto */}
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center text-sm">
                                                    <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-gray-600 truncate">{contacto.lead?.email || 'Sin email'}</span>
                                                </div>
                                                <div className="flex items-center text-sm">
                                                    <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span className="text-gray-600">{contacto.lead?.telefono || 'Sin teléfono'}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Información de empresa */}
                                            {contacto.empresa && (
                                                <div className="mt-3 p-2 bg-gray-50 rounded">
                                                    <p className="text-xs font-medium text-gray-700 mb-1">Empresa:</p>
                                                    <p className="text-sm text-gray-900">{contacto.empresa.nombre_fantasia || 'Sin nombre'}</p>
                                                    <p className="text-xs text-gray-500 truncate">{contacto.empresa.razon_social}</p>
                                                </div>
                                            )}
                                            
                                            {/* Documento y nacimiento */}
                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-700 mb-1">Documento:</p>
                                                    <p className="text-sm text-gray-900">{contacto.nro_documento || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-700 mb-1">Nacimiento:</p>
                                                    <p className="text-sm text-gray-900">{formatFechaNacimiento(contacto.fecha_nacimiento)}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Acciones */}
                                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                                                <span className="text-xs text-gray-500">
                                                    Registro: {formatDate(contacto.created)}
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button className="text-xs text-sat hover:text-sat-600 px-2 py-1">
                                                        Editar
                                                    </button>
                                                    <button className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1">
                                                        Ver
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Versión desktop - Tabla */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Empresa
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Documento
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nacimiento
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {contactosData.map((contacto) => (
                                        <tr key={contacto.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                        <span className="text-blue-600 font-semibold text-sm">
                                                            {getIniciales(contacto.lead?.nombre_completo || '')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {contacto.lead?.nombre_completo || 'Sin nombre'}
                                                        </p>
                                                        <div className="mt-1 space-y-1">
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                {contacto.lead?.email || 'Sin email'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                                {contacto.lead?.telefono || 'Sin teléfono'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {contacto.empresa ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {contacto.empresa.nombre_fantasia || 'Sin nombre'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {contacto.empresa.razon_social || 'Sin razón social'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Sin empresa asociada</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {contacto.nro_documento || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {formatFechaNacimiento(contacto.fecha_nacimiento)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {contacto.es_contacto_principal ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Principal
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Secundario
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex space-x-2">
                                                    <button className="text-sat hover:text-sat-600 text-sm">
                                                        Editar
                                                    </button>
                                                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                        Ver Empresa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
                                de <span className="font-medium">{total}</span> contactos
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => router.get(`/comercial/contactos?page=${current_page - 1}`)}
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
                                    onClick={() => router.get(`/comercial/contactos?page=${current_page + 1}`)}
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