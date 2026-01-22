// resources/js/Pages/Config/Tarifas/Convenios.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Convenio {
    id: number;
    nombre: string;
    empresa: string;
    descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
}

export default function Convenios() {
    const [convenios] = useState<Convenio[]>([
        { id: 1, nombre: 'Convenio Logística 2024', empresa: 'Transportes Rápidos S.A.', descuento: 15, fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31', estado: 'Vigente' },
        { id: 2, nombre: 'Acuerdo Estratégico', empresa: 'Distribuidora Norte', descuento: 20, fecha_inicio: '2024-02-01', fecha_fin: '2024-11-30', estado: 'Vigente' },
        { id: 3, nombre: 'Convenio Flota Grande', empresa: 'Logística Integral', descuento: 25, fecha_inicio: '2023-11-01', fecha_fin: '2024-04-30', estado: 'Por Vencer' },
        { id: 4, nombre: 'Acuerdo Corporativo', empresa: 'Grupo Industrial Sur', descuento: 18, fecha_inicio: '2023-07-01', fecha_fin: '2023-12-31', estado: 'Vencido' },
        { id: 5, nombre: 'Convenio Especial', empresa: 'Transportes Unidos', descuento: 12, fecha_inicio: '2024-03-01', fecha_fin: '2024-08-31', estado: 'Vigente' },
    ]);

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'Vigente': return 'bg-green-100 text-green-800';
            case 'Por Vencer': return 'bg-yellow-100 text-yellow-800';
            case 'Vencido': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDaysRemaining = (fechaFin: string) => {
        const endDate = new Date(fechaFin);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <AppLayout title="Convenios">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Convenios
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de acuerdos y convenios especiales
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Acuerdos Comerciales
                        </h2>
                        <p className="text-sm text-gray-600">
                            Gestione los convenios con empresas asociadas
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                        + Nuevo Convenio
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-medium text-green-700">Vigentes</div>
                        <div className="text-2xl font-bold text-green-900">
                            {convenios.filter(c => c.estado === 'Vigente').length}
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-100">
                        <div className="text-sm font-medium text-yellow-700">Por vencer</div>
                        <div className="text-2xl font-bold text-yellow-900">
                            {convenios.filter(c => c.estado === 'Por Vencer').length}
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-medium text-blue-700">Descuento promedio</div>
                        <div className="text-2xl font-bold text-blue-900">
                            {Math.round(convenios.reduce((sum, c) => sum + c.descuento, 0) / convenios.length)}%
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-100">
                        <div className="text-sm font-medium text-purple-700">Empresas</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {new Set(convenios.map(c => c.empresa)).size}
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">ID</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Convenio</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Empresa</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Descuento</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Vigencia</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Días Restantes</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {convenios.map((convenio) => {
                                const diasRestantes = getDaysRemaining(convenio.fecha_fin);
                                return (
                                    <tr key={convenio.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">{convenio.id}</td>
                                        <td className="py-3 px-4 font-medium">{convenio.nombre}</td>
                                        <td className="py-3 px-4">{convenio.empresa}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
                                                {convenio.descuento}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">
                                                <div>Inicio: {convenio.fecha_inicio}</div>
                                                <div>Fin: {convenio.fecha_fin}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {diasRestantes > 0 ? (
                                                <span className="font-medium">{diasRestantes} días</span>
                                            ) : (
                                                <span className="text-red-600">Vencido</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(convenio.estado)}`}>
                                                {convenio.estado}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-sat hover:text-sat-600 text-sm mr-3">
                                                Editar
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-900 text-sm">
                                                Renovar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {convenios.map((convenio) => {
                        const diasRestantes = getDaysRemaining(convenio.fecha_fin);
                        return (
                            <div key={convenio.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium text-gray-900">{convenio.nombre}</div>
                                        <div className="text-sm text-gray-600">ID: {convenio.id}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
                                            {convenio.descuento}% desc.
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(convenio.estado)}`}>
                                            {convenio.estado}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="text-sm font-medium text-gray-700">Empresa</div>
                                    <div className="text-gray-900">{convenio.empresa}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Inicio</div>
                                        <div className="font-medium">{convenio.fecha_inicio}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Fin</div>
                                        <div className="font-medium">{convenio.fecha_fin}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Días restantes</div>
                                        <div className={`font-medium ${diasRestantes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Renovación</div>
                                        <div className="font-medium">Automática</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 px-3 py-1.5 text-sm text-sat border border-sat rounded hover:bg-sat-50 transition-colors">
                                        Editar
                                    </button>
                                    <button className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                        Renovar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}