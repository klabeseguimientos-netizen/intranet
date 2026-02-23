// resources/js/components/leads/tabs/PresupuestosUnificadosTab.tsx
import React, { useState, useMemo } from 'react';
import { FileText, Calendar, Truck, Eye, Download, Tag, User, Loader, Building } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { Amount } from '@/components/ui/Amount';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/contexts/ToastContext';
import { Lead, Origen, Rubro, Provincia } from '@/types/leads';

// Tipos
interface PresupuestoNuevo {
    id: number;
    tipo: 'nuevo';
    nombre: string;
    referencia: string;
    fecha: string;
    fecha_original: string;
    estado: string;
    estado_color?: string;
    total: number;
    comercial: string;
    promocion?: string;
    tiene_pdf: boolean;
    pdf_url: string | null;
    lead_id?: number;
    metadata: {
        cantidad_vehiculos?: number;
        descripcion?: string;
        validez_hasta?: string;
    };
}

interface PresupuestoLegacy {
    id: number;
    tipo: 'legacy';
    nombre: string;
    fecha: string;
    fecha_original: string;
    tiene_pdf: boolean;
    pdf_url: string | null;
    prefijo_id: number | null;
    prefijo?: {
        id: number;
        codigo: string;
        nombre: string;
    } | null;
    metadata: {
        cantidad_vehiculos?: number;
        descripcion?: string;
        importe?: number;
    };
}

type PresupuestoUnificado = PresupuestoNuevo | PresupuestoLegacy;

interface Props {
    presupuestosNuevos: PresupuestoNuevo[];
    presupuestosLegacy: PresupuestoLegacy[];
    lead: Lead;
    origenes: Origen[];
    rubros: Rubro[];
    provincias: Provincia[];
    onAltaEmpresa: (presupuestoId: number, lead: Lead) => void;
}

const ITEMS_PER_PAGE = 5;

export default function PresupuestosUnificadosTab({ 
    presupuestosNuevos, 
    presupuestosLegacy,
    lead,
    onAltaEmpresa // Recibimos la prop
}: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const [orden, setOrden] = useState<'reciente' | 'antiguo'>('reciente');
    const [generandoPDF, setGenerandoPDF] = useState<number | null>(null);
    const toast = useToast();

    // Asegurarnos de que los arrays existan
    const nuevos = Array.isArray(presupuestosNuevos) ? presupuestosNuevos : [];
    const legacy = Array.isArray(presupuestosLegacy) ? presupuestosLegacy : [];

    // Combinar y ordenar presupuestos
    const todosLosPresupuestos = useMemo(() => {
        const nuevosConTipo = nuevos.map(p => ({ ...p, tipo: 'nuevo' as const }));
        const legacyConTipo = legacy.map(p => ({ ...p, tipo: 'legacy' as const }));
        
        const presupuestos = [...nuevosConTipo, ...legacyConTipo];

        // Ordenar
        presupuestos.sort((a, b) => {
            const fechaA = new Date(a.fecha_original).getTime();
            const fechaB = new Date(b.fecha_original).getTime();
            return orden === 'reciente' ? fechaB - fechaA : fechaA - fechaB;
        });

        return presupuestos;
    }, [nuevos, legacy, orden]);

    const totalPages = Math.ceil(todosLosPresupuestos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedPresupuestos = todosLosPresupuestos.slice(startIndex, endIndex);

    // Resetear página cuando cambia el orden
    React.useEffect(() => {
        setCurrentPage(1);
    }, [orden]);

    const handleVerPdf = (presupuesto: PresupuestoUnificado, e: React.MouseEvent) => {
        e.preventDefault();
        if (presupuesto.tipo === 'nuevo') {
            window.open(`/comercial/presupuestos/${presupuesto.id}/pdf`, '_blank');
        } else {
            window.open(`/presupuestos-legacy/${presupuesto.id}/pdf`, '_blank');
        }
    };

    const handleDescargarPdf = async (presupuesto: PresupuestoUnificado, e: React.MouseEvent) => {
        e.preventDefault();
        
        if (presupuesto.tipo === 'nuevo') {
            setGenerandoPDF(presupuesto.id);
            toast.info('Generando PDF...');
            
            try {
                const pdfWindow = window.open(`/comercial/presupuestos/${presupuesto.id}/pdf?download=1`, '_blank');
                
                if (!pdfWindow) {
                    toast.error('Por favor, permita ventanas emergentes para generar el PDF');
                    setGenerandoPDF(null);
                    return;
                }
                
                const handleMessage = (event: MessageEvent) => {
                    if (event.data.type === 'PDF_GENERADO') {
                        const blob = event.data.pdfBlob;
                        const url = window.URL.createObjectURL(blob);
                        
                        toast.success('PDF generado correctamente');
                        
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `Presupuesto_${presupuesto.nombre}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        window.URL.revokeObjectURL(url);
                        setGenerandoPDF(null);
                        window.removeEventListener('message', handleMessage);
                    } else if (event.data.type === 'PDF_ERROR') {
                        toast.error(event.data.error || 'Error al generar el PDF');
                        setGenerandoPDF(null);
                        window.removeEventListener('message', handleMessage);
                    }
                };

                window.addEventListener('message', handleMessage);
                
            } catch (error) {
                console.error('Error generando PDF:', error);
                toast.error('Error al generar el PDF');
                setGenerandoPDF(null);
            }
        } else {
            window.open(`/presupuestos-legacy/${presupuesto.id}/pdf?download=1`, '_blank');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        document.getElementById('presupuestos-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    const getBadgeColor = (estado?: string) => {
        const colores: Record<string, string> = {
            'Aprobado': 'bg-green-100 text-green-800',
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'Rechazado': 'bg-red-100 text-red-800',
            'Enviado': 'bg-blue-100 text-blue-800',
            'Vencido': 'bg-gray-100 text-gray-800'
        };
        return colores[estado || ''] || 'bg-gray-100 text-gray-800';
    };

    if (todosLosPresupuestos.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">No hay presupuestos</p>
                <p className="text-sm">Este lead no tiene presupuestos asociados</p>
            </div>
        );
    }

    return (
        <>
            <div id="presupuestos-list" className="divide-y divide-gray-200">
                {/* Cabecera informativa y ordenamiento */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Texto informativo con cantidades */}
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium text-gray-700">Presupuestos:</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                Nuevos: {nuevos.length}
                            </span>
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                                Anteriores: {legacy.length}
                            </span>
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
                                Total: {todosLosPresupuestos.length}
                            </span>
                        </div>
                        
                        {/* Ordenamiento */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Ordenar:</span>
                            <button
                                onClick={() => setOrden('reciente')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    orden === 'reciente' 
                                        ? 'bg-local text-white' 
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Más reciente
                            </button>
                            <button
                                onClick={() => setOrden('antiguo')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    orden === 'antiguo' 
                                        ? 'bg-local text-white' 
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Más antiguo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de presupuestos */}
                {paginatedPresupuestos.map((presupuesto) => (
                    <div key={`${presupuesto.tipo}-${presupuesto.id}`} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {/* Header con tipo y badge */}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    {presupuesto.tipo === 'nuevo' ? (
                                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    ) : (
                                        <FileText className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                    )}
                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                        {presupuesto.nombre}
                                    </h3>
                                    <Badge variant="outline" className={
                                        presupuesto.tipo === 'nuevo' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }>
                                        {presupuesto.tipo === 'nuevo' ? 'Nuevo Sistema' : 'Sistema Anterior'}
                                    </Badge>
                                    {presupuesto.tipo === 'nuevo' && (presupuesto as PresupuestoNuevo).estado && (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor((presupuesto as PresupuestoNuevo).estado)}`}>
                                            {(presupuesto as PresupuestoNuevo).estado}
                                        </span>
                                    )}
                                    {presupuesto.tiene_pdf && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            PDF
                                        </span>
                                    )}
                                </div>
                                
                                {/* Detalles en grid responsivo */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{presupuesto.fecha}</span>
                                    </div>
                                    
                                    {presupuesto.metadata.cantidad_vehiculos && (
                                        <div className="flex items-center text-gray-600">
                                            <Truck className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span>{presupuesto.metadata.cantidad_vehiculos} vehículo(s)</span>
                                        </div>
                                    )}

                                    {presupuesto.tipo === 'nuevo' && (presupuesto as PresupuestoNuevo).comercial && (
                                        <div className="flex items-center text-gray-600">
                                            <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{(presupuesto as PresupuestoNuevo).comercial}</span>
                                        </div>
                                    )}

                                    {presupuesto.tipo === 'nuevo' && (presupuesto as PresupuestoNuevo).total > 0 && (
                                        <div className="flex items-center text-gray-900 font-medium">
                                            <Tag className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <Amount value={(presupuesto as PresupuestoNuevo).total} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Descripción si existe */}
                                {presupuesto.metadata.descripcion && (
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                        {presupuesto.metadata.descripcion}
                                    </p>
                                )}

                                {/* Promoción si existe (solo nuevos) */}
                                {presupuesto.tipo === 'nuevo' && (presupuesto as PresupuestoNuevo).promocion && (
                                    <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                            Promo: {(presupuesto as PresupuestoNuevo).promocion}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Acciones */}
                            {presupuesto.tiene_pdf && presupuesto.pdf_url && (
                                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                    <button
                                        onClick={(e) => handleVerPdf(presupuesto, e)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 justify-center"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ver
                                    </button>
                                    <button
                                        onClick={(e) => handleDescargarPdf(presupuesto, e)}
                                        disabled={generandoPDF === presupuesto.id}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {generandoPDF === presupuesto.id ? (
                                            <>
                                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                                <span>Generando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                <span>Descargar</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    {/* Botón Alta Empresa - Solo para presupuestos nuevos */}
                                    {presupuesto.tipo === 'nuevo' && (
                                        <button
                                            onClick={() => onAltaEmpresa(presupuesto.id, lead)}
                                            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm leading-4 font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 justify-center transition-colors"
                                        >
                                            <Building className="h-4 w-4 mr-2" />
                                            <span>Alta Empresa</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Paginación */}
                {todosLosPresupuestos.length > ITEMS_PER_PAGE && (
                    <div className="px-4 py-3 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            lastPage={totalPages}
                            total={todosLosPresupuestos.length}
                            perPage={ITEMS_PER_PAGE}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Eliminamos el modal de aquí porque ahora se maneja en el padre */}
        </>
    );
}