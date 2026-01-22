// resources/js/Pages/Config/Tarifas/Tasas.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Tasa {
    id: number;
    nombre: string;
    tipo: string;
    valor: number;
    unidad: string;
    aplicacion: string;
    fecha_vigencia: string;
    estado: string;
}

export default function Tasas() {
    const [tasas] = useState<Tasa[]>([
        { id: 1, nombre: 'IVA', tipo: 'Impuesto', valor: 21, unidad: '%', aplicacion: 'Todos los servicios', fecha_vigencia: '2024-01-01', estado: 'Activa' },
        { id: 2, nombre: 'Tasa Municipal', tipo: 'Municipal', valor: 2.5, unidad: '%', aplicacion: 'Servicios urbanos', fecha_vigencia: '2024-01-01', estado: 'Activa' },
        { id: 3, nombre: 'Seguro Obligatorio', tipo: 'Seguro', valor: 1.8, unidad: '%', aplicacion: 'Transporte de carga', fecha_vigencia: '2024-03-01', estado: 'Activa' },
        { id: 4, nombre: 'Peaje Promedio', tipo: 'Peaje', valor: 850, unidad: '$', aplicacion: 'Rutas nacionales', fecha_vigencia: '2024-02-15', estado: 'Activa' },
        { id: 5, nombre: 'Tasa Ambiental', tipo: 'Ambiental', valor: 0.5, unidad: '%', aplicacion: 'Servicios especiales', fecha_vigencia: '2023-12-01', estado: 'Inactiva' },
    ]);

    const formatValue = (tasa: Tasa) => {
        if (tasa.unidad === '%') {
            return `${tasa.valor}%`;
        }
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(tasa.valor);
    };

    return (
        <AppLayout title="Tasas">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Tasas e Impuestos
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Configuración de tasas, impuestos y cargos adicionales
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Tasas Configuradas
                        </h2>
                        <p className="text-sm text-gray-600">
                            Gestione las tasas aplicables a los servicios
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-local text-white text-sm rounded hover:bg-local-600 transition-colors">
                        + Nueva Tasa
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-medium text-blue-700">Total tasas</div>
                        <div className="text-2xl font-bold text-blue-900">{tasas.length}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-medium text-green-700">Tasas activas</div>
                        <div className="text-2xl font-bold text-green-900">
                            {tasas.filter(t => t.estado === 'Activa').length}
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-100">
                        <div className="text-sm font-medium text-purple-700">Tasa promedio</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {Math.round(tasas.filter(t => t.estado === 'Activa').reduce((sum, t) => sum + t.valor, 0) / tasas.filter(t => t.estado === 'Activa').length * 100) / 100}
                            {tasas[0]?.unidad || '%'}
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-100">
                        <div className="text-sm font-medium text-yellow-700">Tipos diferentes</div>
                        <div className="text-2xl font-bold text-yellow-900">
                            {new Set(tasas.map(t => t.tipo)).size}
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">ID</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Tasa</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Tipo</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Valor</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Unidad</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Aplicación</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Vigencia</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tasas.map((tasa) => (
                                <tr key={tasa.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">{tasa.id}</td>
                                    <td className="py-3 px-4 font-medium">{tasa.nombre}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            tasa.tipo === 'Impuesto' ? 'bg-red-100 text-red-800' :
                                            tasa.tipo === 'Municipal' ? 'bg-blue-100 text-blue-800' :
                                            tasa.tipo === 'Seguro' ? 'bg-green-100 text-green-800' :
                                            tasa.tipo === 'Peaje' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {tasa.tipo}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-bold text-local">
                                        {formatValue(tasa)}
                                    </td>
                                    <td className="py-3 px-4">{tasa.unidad}</td>
                                    <td className="py-3 px-4 text-gray-600">{tasa.aplicacion}</td>
                                    <td className="py-3 px-4">{tasa.fecha_vigencia}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${tasa.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {tasa.estado}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button className="text-sat hover:text-sat-600 text-sm mr-3">
                                            Editar
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900 text-sm">
                                            Historial
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {tasas.map((tasa) => (
                        <div key={tasa.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-medium text-gray-900">{tasa.nombre}</div>
                                    <div className="text-sm text-gray-600">ID: {tasa.id}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        tasa.tipo === 'Impuesto' ? 'bg-red-100 text-red-800' :
                                        tasa.tipo === 'Municipal' ? 'bg-blue-100 text-blue-800' :
                                        tasa.tipo === 'Seguro' ? 'bg-green-100 text-green-800' :
                                        tasa.tipo === 'Peaje' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-purple-100 text-purple-800'
                                    }`}>
                                        {tasa.tipo}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${tasa.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {tasa.estado}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <div className="text-sm text-gray-600">Valor</div>
                                    <div className="font-bold text-local">{formatValue(tasa)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Unidad</div>
                                    <div className="font-medium">{tasa.unidad}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Aplicación</div>
                                    <div className="font-medium text-sm">{tasa.aplicacion}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Vigencia</div>
                                    <div className="font-medium">{tasa.fecha_vigencia}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-1.5 text-sm text-sat border border-sat rounded hover:bg-sat-50 transition-colors">
                                    Editar
                                </button>
                                <button className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                    Historial
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Impact */}
                <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-3">Impacto Total en Tarifas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600 mb-1">Tasas activas</div>
                            <div className="text-lg font-bold text-blue-700">
                                {tasas.filter(t => t.estado === 'Activa').length} tasas
                            </div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600 mb-1">Total porcentual</div>
                            <div className="text-lg font-bold text-green-700">
                                {tasas
                                    .filter(t => t.estado === 'Activa' && t.unidad === '%')
                                    .reduce((sum, t) => sum + t.valor, 0)
                                    .toFixed(1)}%
                            </div>
                        </div>
                        <div className="p-3 bg-white rounded border">
                            <div className="text-sm text-gray-600 mb-1">Cargas fijas</div>
                            <div className="text-lg font-bold text-purple-700">
                                {new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: 'ARS'
                                }).format(
                                    tasas
                                        .filter(t => t.estado === 'Activa' && t.unidad === '$')
                                        .reduce((sum, t) => sum + t.valor, 0)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}