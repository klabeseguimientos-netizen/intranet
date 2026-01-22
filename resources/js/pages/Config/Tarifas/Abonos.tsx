// resources/js/Pages/Config/Tarifas/Abonos.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Abono {
    id: number;
    nombre: string;
    tipo: string;
    precio: number;
    duracion_dias: number;
    vehiculos_incluidos: number;
    estado: string;
}

export default function Abonos() {
    const [abonos] = useState<Abono[]>([
        { id: 1, nombre: 'Abono Básico', tipo: 'Mensual', precio: 15000, duracion_dias: 30, vehiculos_incluidos: 5, estado: 'Activo' },
        { id: 2, nombre: 'Abono Profesional', tipo: 'Mensual', precio: 28000, duracion_dias: 30, vehiculos_incluidos: 15, estado: 'Activo' },
        { id: 3, nombre: 'Abono Empresarial', tipo: 'Trimestral', precio: 75000, duracion_dias: 90, vehiculos_incluidos: 30, estado: 'Activo' },
        { id: 4, nombre: 'Abono Anual', tipo: 'Anual', precio: 250000, duracion_dias: 365, vehiculos_incluidos: 50, estado: 'Activo' },
        { id: 5, nombre: 'Abono Prueba', tipo: 'Semanal', precio: 5000, duracion_dias: 7, vehiculos_incluidos: 3, estado: 'Inactivo' },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AppLayout title="Abonos">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Abonos
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de planes de abono para clientes
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Planes de Abono
                        </h2>
                        <p className="text-sm text-gray-600">
                            Configure los diferentes planes de suscripción
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                        + Nuevo Abono
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-medium text-blue-700">Total abonos</div>
                        <div className="text-2xl font-bold text-blue-900">{abonos.length}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-medium text-green-700">Abonos activos</div>
                        <div className="text-2xl font-bold text-green-900">
                            {abonos.filter(a => a.estado === 'Activo').length}
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-100">
                        <div className="text-sm font-medium text-purple-700">Ingreso mensual</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {formatCurrency(abonos.filter(a => a.estado === 'Activo').reduce((sum, a) => sum + a.precio, 0))}
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">ID</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Nombre</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Tipo</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Precio</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Duración</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Vehículos</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {abonos.map((abono) => (
                                <tr key={abono.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">{abono.id}</td>
                                    <td className="py-3 px-4 font-medium">{abono.nombre}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            abono.tipo === 'Mensual' ? 'bg-blue-100 text-blue-800' :
                                            abono.tipo === 'Trimestral' ? 'bg-green-100 text-green-800' :
                                            abono.tipo === 'Anual' ? 'bg-purple-100 text-purple-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {abono.tipo}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-bold text-local">
                                        {formatCurrency(abono.precio)}
                                    </td>
                                    <td className="py-3 px-4">
                                        {abono.duracion_dias} días
                                    </td>
                                    <td className="py-3 px-4">
                                        {abono.vehiculos_incluidos} vehículos
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${abono.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {abono.estado}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button className="text-sat hover:text-sat-600 text-sm mr-3">
                                            Editar
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900 text-sm">
                                            Ver Clientes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {abonos.map((abono) => (
                        <div key={abono.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-medium text-gray-900">{abono.nombre}</div>
                                    <div className="text-sm text-gray-600">ID: {abono.id}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        abono.tipo === 'Mensual' ? 'bg-blue-100 text-blue-800' :
                                        abono.tipo === 'Trimestral' ? 'bg-green-100 text-green-800' :
                                        abono.tipo === 'Anual' ? 'bg-purple-100 text-purple-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {abono.tipo}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${abono.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {abono.estado}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <div className="text-sm text-gray-600">Precio</div>
                                    <div className="font-bold text-local">{formatCurrency(abono.precio)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Duración</div>
                                    <div className="font-medium">{abono.duracion_dias} días</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Vehículos</div>
                                    <div className="font-medium">{abono.vehiculos_incluidos}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Periodicidad</div>
                                    <div className="font-medium">Renovable</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-1.5 text-sm text-sat border border-sat rounded hover:bg-sat-50 transition-colors">
                                    Editar
                                </button>
                                <button className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                    Ver Clientes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}