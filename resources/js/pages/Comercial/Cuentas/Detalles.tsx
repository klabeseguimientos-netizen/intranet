// resources/js/Pages/Comercial/Cuentas/Detalles.tsx
import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Define las interfaces de TypeScript
interface Lead {
    id: number;
    nombre_completo: string;
    email: string;
    telefono: string;
}

interface Contacto {
    id: number;
    empresa_id: number;
    es_contacto_principal: boolean;
    es_activo: boolean;
    lead?: Lead;
}

interface Empresa {
    id: number;
    prefijo_id: number;
    nombre_fantasia: string;
    razon_social: string;
    cuit: string;
    direccion_fiscal: string;
    telefono_fiscal: string;
    email_fiscal: string;
    es_activo: boolean;
    created: string;
    contactos: Contacto[];
}

interface Props {
    empresas: Empresa[];
    estadisticas: {
        total: number;
        activas: number;
        nuevas: number;
    };
    usuario: {
        ve_todas_cuentas: boolean;
        prefijos: number[];
    };
}

export default function DetallesCuentas({ empresas, estadisticas, usuario }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

    // Filtrar empresas en el cliente
    const empresasFiltradas = useMemo(() => {
        let resultado = empresas;
        
        // Aplicar filtro de búsqueda
        if (searchTerm.trim()) {
            resultado = resultado.filter(empresa =>
                (empresa.nombre_fantasia?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (empresa.razon_social?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (empresa.cuit || '').includes(searchTerm)
            );
        }
        
        return resultado;
    }, [empresas, searchTerm]);

    // Obtener contactos activos de una empresa
    const contactosActivosDeEmpresa = (empresa: Empresa) => {
        return empresa.contactos.filter(c => c.es_activo);
    };

    // Obtener contacto principal
    const getContactoPrincipal = (empresa: Empresa) => {
        return empresa.contactos.find(c => c.es_contacto_principal && c.es_activo);
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

    return (
        <AppLayout title="Detalles de Cuentas">
            <Head title="Detalles de Cuentas" />
            
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Detalles de Cuentas
                        </h1>
                        <p className="mt-1 text-gray-600 text-base">
                            Información detallada de las cuentas de clientes
                        </p>
                    </div>
                    
                    {/* Indicador de permisos */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            usuario.ve_todas_cuentas 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {usuario.ve_todas_cuentas ? '🔓 Cuentas ilimitadas' : '🔒 Cuentas limitadas'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel izquierdo: Lista de empresas */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Cuentas Registradas {empresas.length > 0 && `(${empresas.length})`}
                                </h2>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, razón social o CUIT..."
                                        className="px-3 py-2 border border-gray-300 rounded text-sm flex-grow sm:flex-grow-0"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-2">Cuentas Totales</h3>
                                <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-2">Cuentas Activas</h3>
                                <p className="text-2xl font-bold text-green-600">{estadisticas.activas}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {estadisticas.total > 0 ? 
                                        `${Math.round((estadisticas.activas / estadisticas.total) * 100)}% del total` : 
                                        'Sin datos'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-2">Últimos 30 días</h3>
                                <p className="text-2xl font-bold text-purple-600">{estadisticas.nuevas}</p>
                            </div>
                        </div>
                        
                        {/* Tabla de empresas */}
                        <div className="overflow-x-auto">
                            {empresas.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No hay cuentas disponibles
                                    </h3>
                                    <p className="text-gray-600 text-sm max-w-md mx-auto">
                                        {usuario.ve_todas_cuentas 
                                            ? 'No se encontraron empresas registradas en el sistema.'
                                            : 'No tienes permisos para ver empresas o no hay empresas asignadas a tus prefijos.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Empresa
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    CUIT
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contacto
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Registro
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {empresasFiltradas.map((empresa) => {
                                                const contactoPrincipal = getContactoPrincipal(empresa);
                                                return (
                                                    <tr 
                                                        key={empresa.id}
                                                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                                            selectedEmpresa?.id === empresa.id ? 'bg-blue-50' : ''
                                                        }`}
                                                        onClick={() => setSelectedEmpresa(empresa)}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {empresa.nombre_fantasia || 'Sin nombre'}
                                                                </p>
                                                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                                                    {empresa.razon_social || 'Sin razón social'}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {empresa.cuit || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {contactoPrincipal ? (
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {contactoPrincipal.lead?.nombre_completo || 'Sin nombre'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {contactoPrincipal.lead?.email || contactoPrincipal.lead?.telefono || 'Sin contacto'}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">Sin contacto</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {formatDate(empresa.created)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    
                                    {empresasFiltradas.length === 0 && searchTerm && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">
                                                No se encontraron empresas con ese criterio de búsqueda
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Panel derecho: Detalle de empresa seleccionada */}
                <div className="lg:col-span-1">
                    {selectedEmpresa ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Detalles de Empresa
                                </h2>
                                <button
                                    onClick={() => setSelectedEmpresa(null)}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-6">                                
                                {/* Información Básica */}
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wider">Información Básica</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block">Nombre Fantasía</label>
                                            <p className="font-medium text-gray-900">{selectedEmpresa.nombre_fantasia || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block">Razón Social</label>
                                            <p className="font-medium text-gray-900">{selectedEmpresa.razon_social || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block">CUIT</label>
                                            <p className="font-medium text-gray-900">{selectedEmpresa.cuit || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Contacto Fiscal */}
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wider">Contacto Fiscal</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block">Teléfono</label>
                                            <p className="font-medium text-gray-900">{selectedEmpresa.telefono_fiscal || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block">Email</label>
                                            <p className="font-medium text-gray-900">{selectedEmpresa.email_fiscal || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block">Dirección</label>
                                            <p className="font-medium text-gray-900">{selectedEmpresa.direccion_fiscal || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Contactos Asociados */}
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wider">Contactos Asociados</h3>
                                    <div className="space-y-3">
                                        {contactosActivosDeEmpresa(selectedEmpresa).map((contacto) => (
                                            <div key={contacto.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r">
                                                <p className="font-medium text-gray-900">
                                                    {contacto.lead?.nombre_completo || 'Sin nombre'}
                                                    {contacto.es_contacto_principal && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded">
                                                            Principal
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {contacto.lead?.email || 'Sin email'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {contacto.lead?.telefono || 'Sin teléfono'}
                                                </p>
                                            </div>
                                        ))}
                                        
                                        {contactosActivosDeEmpresa(selectedEmpresa).length === 0 && (
                                            <p className="text-sm text-gray-400 italic">No hay contactos asociados</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Metadatos */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-500">Estado:</span>
                                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                                            selectedEmpresa.es_activo 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedEmpresa.es_activo ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Registrada:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatDate(selectedEmpresa.created)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Selecciona una empresa
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {empresas.length > 0 
                                    ? 'Haz clic en una empresa de la lista para ver sus detalles completos, contactos asociados y más información.'
                                    : 'No hay empresas disponibles para mostrar.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}