// resources/js/Pages/Comercial/Cuentas/Detalles.tsx
import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Definir nuevas interfaces para vehículos y abonos
interface AbonoVehiculo {
    id: number;
    abono_codigo: string;
    abono_nombre: string;
    abono_precio: number;
    created_at: string | null;
}

interface Vehiculo {
    id: number;
    codigo_alfa: string;
    nombre_mix: string;
    ab_alta: string | null;
    avl_anio: number | null;
    avl_color: string;
    avl_identificador: string;
    avl_marca: string;
    avl_modelo: string;
    avl_patente: string;
    categoria: string;
    empresa_id: number;
    abonos: AbonoVehiculo[];
}

interface LocalidadFiscal {
    localidad: string;
    provincia: string;
    codigo_postal: string;
}

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
    numeroalfa: number;
    codigo_alfa_empresa: string;
    nombre_fantasia: string;
    razon_social: string;
    cuit: string;
    direccion_fiscal: string;
    codigo_postal_fiscal: string;
    localidad_fiscal_id: number;
    localidad_fiscal: LocalidadFiscal | null;
    telefono_fiscal: string;
    email_fiscal: string;
    es_activo: boolean;
    created: string;
    contactos: Contacto[];
    vehiculos: Vehiculo[];
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
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [vehiculosPerPage, setVehiculosPerPage] = useState(10);
    const [vehiculosCurrentPage, setVehiculosCurrentPage] = useState(1);

    // Filtrar empresas en el cliente
    const empresasFiltradas = useMemo(() => {
        let resultado = empresas;
        
        // Aplicar filtro de búsqueda
        if (searchTerm.trim()) {
            resultado = resultado.filter(empresa =>
                (empresa.nombre_fantasia?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (empresa.razon_social?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (empresa.cuit || '').includes(searchTerm) ||
                (empresa.codigo_alfa_empresa?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        }
        
        return resultado;
    }, [empresas, searchTerm]);

    // Calcular paginación de empresas
    const totalItems = empresasFiltradas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const empresasPaginated = empresasFiltradas.slice(startIndex, endIndex);

    // Calcular paginación de vehículos (si hay empresa seleccionada)
    const vehiculosOrdenados = useMemo(() => {
        if (!selectedEmpresa) return [];
        
        return [...selectedEmpresa.vehiculos].sort((a, b) => {
            // Primero por código alfa
            if (a.codigo_alfa && b.codigo_alfa) {
                const compareCodigo = a.codigo_alfa.localeCompare(b.codigo_alfa);
                if (compareCodigo !== 0) return compareCodigo;
            }
            
            // Luego por patente
            if (a.avl_patente && b.avl_patente) {
                return a.avl_patente.localeCompare(b.avl_patente);
            }
            
            return 0;
        });
    }, [selectedEmpresa]);

    const totalVehiculos = vehiculosOrdenados.length;
    const totalVehiculosPages = Math.ceil(totalVehiculos / vehiculosPerPage);
    const vehiculosStartIndex = (vehiculosCurrentPage - 1) * vehiculosPerPage;
    const vehiculosEndIndex = vehiculosStartIndex + vehiculosPerPage;
    const vehiculosPaginated = vehiculosOrdenados.slice(vehiculosStartIndex, vehiculosEndIndex);

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

    // Formatear precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(price);
    };

    // Determinar color del abono basado en su nombre
    const getAbonoColor = (abonoNombre: string) => {
        const nombre = abonoNombre.toLowerCase();
        
        if (nombre.includes('abono') || nombre.includes('verde')) {
            return 'green';
        } else if (nombre.includes('suspendido') || nombre.includes('suspension')) {
            return 'red';
        } else if (nombre.includes('servicio') || nombre.includes('serv')) {
            return 'blue';
        } else {
            return 'yellow';
        }
    };

    // Obtener clases CSS para el color del abono
    const getAbonoColorClasses = (abonoNombre: string) => {
        const color = getAbonoColor(abonoNombre);
        
        switch(color) {
            case 'green':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'red':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'blue':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'yellow':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    // Cambiar página de empresas
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    // Cambiar página de vehículos
    const goToVehiculosPage = (page: number) => {
        setVehiculosCurrentPage(page);
    };

    // Limpiar búsqueda y volver a página 1
    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Cambiar empresa seleccionada
    const selectEmpresa = (empresa: Empresa) => {
        setSelectedEmpresa(empresa);
        setCurrentPage(1);
        setVehiculosCurrentPage(1);
    };

    // Obtener dirección fiscal completa formateada
    const getDireccionCompleta = (empresa: Empresa) => {
        const partes = [];
        
        if (empresa.direccion_fiscal) partes.push(empresa.direccion_fiscal);
        
        if (empresa.localidad_fiscal) {
            const localidadInfo = [];
            if (empresa.localidad_fiscal.localidad) localidadInfo.push(empresa.localidad_fiscal.localidad);
            if (empresa.localidad_fiscal.provincia) localidadInfo.push(empresa.localidad_fiscal.provincia);
            
            if (localidadInfo.length > 0) {
                partes.push(localidadInfo.join(', '));
            }
        }
        
        if (empresa.codigo_postal_fiscal) {
            partes.push(`CP: ${empresa.codigo_postal_fiscal}`);
        }
        
        return partes.join(' - ') || 'N/A';
    };

    return (
        <AppLayout title="Detalles de Cuentas">
            <Head title="Detalles de Cuentas" />
            
            {/* Header - Versión simplificada para móvil */}
            <div className="mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                            Detalles de Cuentas
                        </h1>
                        <p className="mt-1 text-gray-600 text-sm">
                            Información detallada de clientes
                        </p>
                    </div>
                    
                    <div className="mt-2 md:mt-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            usuario.ve_todas_cuentas 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {usuario.ve_todas_cuentas ? '🔓 Cuentas ilimitadas' : '🔒 Cuentas limitadas'}
                        </span>
                    </div>
                </div>
                
                {/* Estadísticas - Grid como tu dashboard */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 text-xs mb-1">Total</h3>
                        <p className="text-xl font-bold text-blue-600">{estadisticas.total}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 text-xs mb-1">Activas</h3>
                        <p className="text-xl font-bold text-green-600">{estadisticas.activas}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 text-xs mb-1">Últimos 30d</h3>
                        <p className="text-xl font-bold text-purple-600">{estadisticas.nuevas}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium text-gray-700 text-xs mb-1">Vehículos</h3>
                        <p className="text-xl font-bold text-orange-600">
                            {empresas.reduce((acc, emp) => acc + emp.vehiculos.length, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Buscador - Más compacto */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Buscar Empresas
                    </h2>
                    
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Buscar empresa..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        {searchTerm && (
                            <button 
                                onClick={clearSearch}
                                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>
                
                {searchTerm && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                        <p className="text-xs text-blue-700">
                            {empresasFiltradas.length} resultado(s) para: "{searchTerm}"
                        </p>
                    </div>
                )}
            </div>

            {/* Lista de empresas - Tarjetas en móvil, tabla en desktop */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Empresas {empresas.length > 0 && `(${empresas.length})`}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
                        </span>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                        >
                            <option value="5">5/página</option>
                            <option value="10">10/página</option>
                            <option value="20">20/página</option>
                        </select>
                    </div>
                </div>
                
                {empresasPaginated.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <div className="text-gray-300 mb-3">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                            No hay empresas encontradas
                        </h3>
                        {searchTerm && (
                            <button 
                                onClick={clearSearch}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                                Ver todas
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Vista móvil: tarjetas */}
                        <div className="sm:hidden space-y-3">
                            {empresasPaginated.map((empresa) => {
                                const contactoPrincipal = getContactoPrincipal(empresa);
                                return (
                                    <div 
                                        key={empresa.id}
                                        className={`bg-white rounded-lg border p-4 cursor-pointer transition-colors ${
                                            selectedEmpresa?.id === empresa.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        onClick={() => selectEmpresa(empresa)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                                    {empresa.codigo_alfa_empresa}
                                                </span>
                                                <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${
                                                    empresa.es_activo 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {empresa.es_activo ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {empresa.vehiculos.length} veh
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                            {empresa.nombre_fantasia || 'Sin nombre'}
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-2 truncate">
                                            {empresa.razon_social || 'Sin razón social'}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                            <div>
                                                <span className="font-medium">CUIT:</span> {empresa.cuit || 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Creada:</span> {formatDate(empresa.created)}
                                            </div>
                                        </div>
                                        
                                        {contactoPrincipal && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-700">
                                                    <span className="font-medium">Contacto:</span> {contactoPrincipal.lead?.nombre_completo || 'Sin nombre'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Vista desktop: tabla */}
                        <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Código / Empresa
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                CUIT
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Contacto
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Vehículos
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {empresasPaginated.map((empresa) => {
                                            const contactoPrincipal = getContactoPrincipal(empresa);
                                            return (
                                                <tr 
                                                    key={empresa.id}
                                                    className={`hover:bg-gray-50 cursor-pointer ${
                                                        selectedEmpresa?.id === empresa.id ? 'bg-blue-50' : ''
                                                    }`}
                                                    onClick={() => selectEmpresa(empresa)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-mono text-sm font-bold text-blue-700">
                                                                    {empresa.codigo_alfa_empresa}
                                                                </span>
                                                            </div>
                                                            <p className="font-semibold text-gray-900">
                                                                {empresa.nombre_fantasia || 'Sin nombre'}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {empresa.razon_social || 'Sin razón social'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-900">
                                                            {empresa.cuit || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {contactoPrincipal ? (
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {contactoPrincipal.lead?.nombre_completo || 'Sin nombre'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {contactoPrincipal.lead?.email || contactoPrincipal.lead?.telefono || ''}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Sin contacto</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {empresa.vehiculos.length} vehículos
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            empresa.es_activo 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {empresa.es_activo ? 'Activa' : 'Inactiva'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-sm text-gray-700">
                                    Página {currentPage} de {totalPages}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1.5 rounded text-sm ${
                                            currentPage === 1
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        ←
                                    </button>
                                    
                                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage === 1) {
                                            pageNum = i + 1;
                                        } else if (currentPage === totalPages) {
                                            pageNum = totalPages - 2 + i;
                                        } else {
                                            pageNum = currentPage - 1 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`px-3 py-1.5 rounded text-sm ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1.5 rounded text-sm ${
                                            currentPage === totalPages
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detalle de empresa seleccionada - Diseño móvil primero */}
            {selectedEmpresa && (
                <div className="bg-white rounded-lg border border-gray-200 mb-6">
                    {/* Header */}
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-mono text-sm font-bold text-blue-800 bg-white px-2 py-1 rounded">
                                        {selectedEmpresa.codigo_alfa_empresa}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                        selectedEmpresa.es_activo 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {selectedEmpresa.es_activo ? 'ACTIVA' : 'INACTIVA'}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 truncate">
                                    {selectedEmpresa.nombre_fantasia || 'Empresa sin nombre'}
                                </h2>
                                <p className="text-sm text-gray-600 truncate">
                                    {selectedEmpresa.razon_social || 'Sin razón social'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedEmpresa(null)}
                                className="text-gray-500 hover:text-gray-700 ml-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Información de la empresa - Acordeón simple en móvil */}
                    <div className="p-4">
                        {/* Información básica */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase">Información Básica</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Código Alfa</span>
                                    <span className="text-sm font-bold text-blue-700">{selectedEmpresa.codigo_alfa_empresa}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">CUIT</span>
                                    <span className="text-sm font-medium">{selectedEmpresa.cuit || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-sm text-gray-500">Teléfono</span>
                                    <span className="text-sm font-medium">{selectedEmpresa.telefono_fiscal || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Dirección */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase">Dirección</h3>
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                    {getDireccionCompleta(selectedEmpresa)}
                                </p>
                                {selectedEmpresa.localidad_fiscal && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="font-medium text-gray-600">Localidad:</span>
                                            <span className="ml-1">{selectedEmpresa.localidad_fiscal.localidad}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Provincia:</span>
                                            <span className="ml-1">{selectedEmpresa.localidad_fiscal.provincia}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">CP:</span>
                                            <span className="ml-1">{selectedEmpresa.codigo_postal_fiscal || selectedEmpresa.localidad_fiscal.codigo_postal || 'N/A'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Contactos */}
                        {contactosActivosDeEmpresa(selectedEmpresa).length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 text-sm mb-3 uppercase">
                                    Contactos ({contactosActivosDeEmpresa(selectedEmpresa).length})
                                </h3>
                                <div className="space-y-2">
                                    {contactosActivosDeEmpresa(selectedEmpresa).map((contacto) => (
                                        <div key={contacto.id} className="border border-gray-200 rounded p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {contacto.lead?.nombre_completo || 'Sin nombre'}
                                                </span>
                                                {contacto.es_contacto_principal && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                {contacto.lead?.email && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">📧</span>
                                                        <span className="text-gray-700">{contacto.lead.email}</span>
                                                    </div>
                                                )}
                                                {contacto.lead?.telefono && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">📱</span>
                                                        <span className="text-gray-700">{contacto.lead.telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Vehículos con paginación */}
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1 uppercase">
                                        Vehículos ({selectedEmpresa.vehiculos.length})
                                    </h3>
                                </div>
                                
                                {totalVehiculos > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 hidden sm:inline">
                                            {vehiculosStartIndex + 1}-{Math.min(vehiculosEndIndex, totalVehiculos)} de {totalVehiculos}
                                        </span>
                                        <select 
                                            value={vehiculosPerPage}
                                            onChange={(e) => {
                                                setVehiculosPerPage(Number(e.target.value));
                                                setVehiculosCurrentPage(1);
                                            }}
                                            className="text-xs border border-gray-300 rounded px-2 py-1"
                                        >
                                            <option value="10">10/pág</option>
                                            <option value="20">20/pág</option>
                                            <option value="30">30/pág</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            
                            {totalVehiculos > 0 ? (
                                <>
                                    {/* Móvil: lista simple */}
                                    <div className="sm:hidden space-y-3">
                                        {vehiculosPaginated.map((vehiculo) => (
                                            <div key={vehiculo.id} className="border border-gray-200 rounded p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-mono text-sm font-bold text-blue-700">
                                                            {vehiculo.codigo_alfa}
                                                        </span>
                                                        {vehiculo.avl_patente && (
                                                            <span className="ml-2 text-sm font-bold text-gray-900">
                                                                {vehiculo.avl_patente}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(vehiculo.ab_alta)}
                                                    </span>
                                                </div>
                                                
                                                <p className="font-medium text-gray-900 text-sm mb-1">
                                                    {vehiculo.avl_marca} {vehiculo.avl_modelo} {vehiculo.avl_anio}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {vehiculo.avl_color && (
                                                        <span className="text-xs text-gray-600 flex items-center gap-1">
                                                            <span 
                                                                className="w-3 h-3 rounded-full border"
                                                                style={{ backgroundColor: vehiculo.avl_color.toLowerCase() }}
                                                            ></span>
                                                            {vehiculo.avl_color}
                                                        </span>
                                                    )}
                                                    {vehiculo.categoria && (
                                                        <span className="text-xs text-gray-600">
                                                            {vehiculo.categoria}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {vehiculo.abonos.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                                        <span className="text-xs font-medium text-gray-700 mb-1 block">
                                                            Abonos ({vehiculo.abonos.length})
                                                        </span>
                                                        <div className="space-y-1">
                                                            {vehiculo.abonos.map((abono) => (
                                                                <div 
                                                                    key={abono.id} 
                                                                    className={`text-xs p-2 rounded ${getAbonoColorClasses(abono.abono_nombre)}`}
                                                                >
                                                                    <div className="flex justify-between">
                                                                        <span className="font-medium">{abono.abono_nombre}</span>
                                                                        <span className="font-bold">{formatPrice(abono.abono_precio)}</span>
                                                                    </div>
                                                                    <div className="text-xs mt-0.5">{abono.abono_codigo}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Desktop: tabla */}
                                    <div className="hidden sm:block">
                                        <div className="overflow-x-auto border border-gray-200 rounded">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Código</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Patente</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Marca/Modelo</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Año/Color</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Abonos</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {vehiculosPaginated.map((vehiculo) => (
                                                        <tr key={vehiculo.id} className="hover:bg-gray-50">
                                                            <td className="px-3 py-2">
                                                                <span className="font-mono text-sm font-bold text-blue-700">
                                                                    {vehiculo.codigo_alfa}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {vehiculo.avl_patente ? (
                                                                    <span className="font-bold text-gray-900 text-sm">
                                                                        {vehiculo.avl_patente}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400">Sin patente</span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {vehiculo.avl_marca} {vehiculo.avl_modelo}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">{vehiculo.avl_anio}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    {vehiculo.avl_color && (
                                                                        <div className="flex items-center gap-1">
                                                                            <span 
                                                                                className="w-3 h-3 rounded-full border"
                                                                                style={{ backgroundColor: vehiculo.avl_color.toLowerCase() }}
                                                                            ></span>
                                                                            <span className="text-sm">{vehiculo.avl_color}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {vehiculo.abonos.length > 0 ? (
                                                                    <div className="space-y-1">
                                                                        {vehiculo.abonos.map((abono) => (
                                                                            <div 
                                                                                key={abono.id} 
                                                                                className={`text-xs p-1.5 rounded ${getAbonoColorClasses(abono.abono_nombre)}`}
                                                                            >
                                                                                <div className="flex justify-between">
                                                                                    <span className="font-medium truncate">{abono.abono_nombre}</span>
                                                                                    <span className="font-bold">{formatPrice(abono.abono_precio)}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400 italic">Sin abonos</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    {/* Paginación de vehículos */}
                                    {totalVehiculosPages > 1 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                                <div className="text-sm text-gray-700">
                                                    Página {vehiculosCurrentPage} de {totalVehiculosPages}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => goToVehiculosPage(vehiculosCurrentPage - 1)}
                                                        disabled={vehiculosCurrentPage === 1}
                                                        className={`px-3 py-1.5 rounded text-sm ${
                                                            vehiculosCurrentPage === 1
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        ←
                                                    </button>
                                                    
                                                    {Array.from({ length: Math.min(3, totalVehiculosPages) }, (_, i) => {
                                                        let pageNum;
                                                        if (totalVehiculosPages <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (vehiculosCurrentPage === 1) {
                                                            pageNum = i + 1;
                                                        } else if (vehiculosCurrentPage === totalVehiculosPages) {
                                                            pageNum = totalVehiculosPages - 2 + i;
                                                        } else {
                                                            pageNum = vehiculosCurrentPage - 1 + i;
                                                        }
                                                        
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => goToVehiculosPage(pageNum)}
                                                                className={`px-3 py-1.5 rounded text-sm ${
                                                                    vehiculosCurrentPage === pageNum
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'text-gray-700 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                    
                                                    <button
                                                        onClick={() => goToVehiculosPage(vehiculosCurrentPage + 1)}
                                                        disabled={vehiculosCurrentPage === totalVehiculosPages}
                                                        className={`px-3 py-1.5 rounded text-sm ${
                                                            vehiculosCurrentPage === totalVehiculosPages
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-400">No hay vehículos registrados</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-500">
                            <div>
                                Registrada: {formatDate(selectedEmpresa.created)} • ID: {selectedEmpresa.id}
                            </div>
                            <div>
                                Prefijo: {selectedEmpresa.prefijo_id} • Número: {selectedEmpresa.numeroalfa}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}