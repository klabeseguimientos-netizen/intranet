// resources/js/components/leads/tabs/PresupuestosLegacyTab.tsx
import React, { useState } from 'react';
import { FileText, Calendar, Truck, Eye } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

interface PresupuestoLegacy {
    id: number;
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
    };
}

interface Props {
    presupuestos: PresupuestoLegacy[];
}

const ITEMS_PER_PAGE = 5;

export default function PresupuestosLegacyTab({ presupuestos }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(presupuestos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedPresupuestos = presupuestos.slice(startIndex, endIndex);

    const handleVerPdf = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        window.open(`/presupuestos-legacy/${id}/pdf`, '_blank');
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        document.getElementById('presupuestos-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (presupuestos.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">No hay presupuestos del sistema anterior</p>
                <p className="text-sm">Este lead no tiene presupuestos legacy asociados</p>
            </div>
        );
    }

    const getVehiculoIcon = (cantidad?: number) => {
        if (!cantidad) return null;
        if (cantidad > 1) {
            return (
                <div className="flex items-center text-gray-600">
                    <Truck className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span>{cantidad} vehículos</span>
                </div>
            );
        }
        return (
            <div className="flex items-center text-gray-600">
                <Truck className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{cantidad} vehículo</span>
            </div>
        );
    };

    return (
        <div id="presupuestos-list" className="divide-y divide-gray-200">
            {paginatedPresupuestos.map((presupuesto) => (
                <div key={presupuesto.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                    {presupuesto.nombre}
                                </h3>
                                {presupuesto.tiene_pdf && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        PDF
                                    </span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{presupuesto.fecha}</span>
                                </div>
                                {presupuesto.metadata.cantidad_vehiculos && getVehiculoIcon(presupuesto.metadata.cantidad_vehiculos)}
                            </div>
                            
                            {presupuesto.metadata.descripcion && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                    {presupuesto.metadata.descripcion}
                                </p>
                            )}
                        </div>
                        
                        {presupuesto.tiene_pdf && presupuesto.pdf_url && (
                            <div className="flex-shrink-0">
                                <button
                                    onClick={(e) => handleVerPdf(presupuesto.id, e)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto justify-center"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {presupuestos.length > ITEMS_PER_PAGE && (
                <div className="px-4 py-3 border-t border-gray-200">
                    <Pagination
                        currentPage={currentPage}
                        lastPage={totalPages}
                        total={presupuestos.length}
                        perPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}