// resources/js/Pages/Config/Tarifas/Servicios.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Servicio {
    id: number;
    nombre: string;
    categoria: string;
    precio_base: number;
    precio_km: number;
    precio_hora: number;
    disponibilidad: string;
}

export default function Servicios() {
    const [servicios] = useState<Servicio[]>([
        { id: 1, nombre: 'Transporte Local', categoria: 'Transporte', precio_base: 5000, precio_km: 350, precio_hora: 2500, disponibilidad: '24/7' },
        { id: 2, nombre: 'Distribución Urbana', categoria: 'Distribución', precio_base: 7500, precio_km: 450, precio_hora: 3200, disponibilidad: 'Diurno' },
        { id: 3, nombre: 'Logística Express', categoria: 'Urgente', precio_base: 12000, precio_km: 600, precio_hora: 5000, disponibilidad: '24/7' },
        { id: 4, nombre: 'Transporte Pesado', categoria: 'Especial', precio_base: 20000, precio_km: 850, precio_hora: 7500, disponibilidad: 'Diurno' },
        { id: 5, nombre: 'Servicio Nocturno', categoria: 'Especial', precio_base: 10000, precio_km: 500, precio_hora: 4000, disponibilidad: 'Nocturno' },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AppLayout title="Servicios">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Servicios
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Configuración de servicios y tarifas de transporte
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Catálogo de Servicios
                        </h2>
                        <p className="text-sm text-gray-600">
                            Gestione los servicios disponibles para clientes
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-local text-white text-sm rounded hover:bg-local-600 transition-colors">
                        + Nuevo Servicio
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-medium text-blue-700">Servicios totales</div>
                        <div className="text-2xl font-bold text-blue-900">{servicios.length}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-medium text-green-700">Precio base promedio</div>
                        <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(servicios.reduce((sum, s) => sum + s.precio_base, 0) / servicios.length)}
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-100">
                        <div className="text-sm font-medium text-purple-700">Disponibilidad 24/7</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {servicios.filter(s => s.disponibilidad === '24/7').length}
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">ID</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Servicio</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Categoría</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Precio Base</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Precio por Km</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Precio por Hora</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Disponibilidad</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Ejemplo 50km/2h</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {servicios.map((servicio) => {
                                const ejemploTotal = servicio.precio_base + (servicio.precio_km * 50) + (servicio.precio_hora * 2);
                                return (
                                    <tr key={servicio.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">{servicio.id}</td>
                                        <td className="py-3 px-4 font-medium">{servicio.nombre}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                servicio.categoria === 'Transporte' ? 'bg-blue-100 text-blue-800' :
                                                servicio.categoria === 'Distribución' ? 'bg-green-100 text-green-800' :
                                                servicio.categoria === 'Urgente' ? 'bg-red-100 text-red-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {servicio.categoria}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-local">
                                            {formatCurrency(servicio.precio_base)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {formatCurrency(servicio.precio_km)}/km
                                        </td>
                                        <td className="py-3 px-4">
                                            {formatCurrency(servicio.precio_hora)}/h
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                servicio.disponibilidad === '24/7' ? 'bg-green-100 text-green-800' :
                                                servicio.disponibilidad === 'Diurno' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {servicio.disponibilidad}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-bold">
                                            {formatCurrency(ejemploTotal)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-sat hover:text-sat-600 text-sm mr-3">
                                                Editar
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-900 text-sm">
                                                Calcular
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
                    {servicios.map((servicio) => {
                        const ejemploTotal = servicio.precio_base + (servicio.precio_km * 50) + (servicio.precio_hora * 2);
                        return (
                            <div key={servicio.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium text-gray-900">{servicio.nombre}</div>
                                        <div className="text-sm text-gray-600">ID: {servicio.id}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            servicio.categoria === 'Transporte' ? 'bg-blue-100 text-blue-800' :
                                            servicio.categoria === 'Distribución' ? 'bg-green-100 text-green-800' :
                                            servicio.categoria === 'Urgente' ? 'bg-red-100 text-red-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {servicio.categoria}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            servicio.disponibilidad === '24/7' ? 'bg-green-100 text-green-800' :
                                            servicio.disponibilidad === 'Diurno' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {servicio.disponibilidad}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Precio Base</div>
                                        <div className="font-bold text-local">{formatCurrency(servicio.precio_base)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Por Km</div>
                                        <div className="font-medium">{formatCurrency(servicio.precio_km)}/km</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Por Hora</div>
                                        <div className="font-medium">{formatCurrency(servicio.precio_hora)}/h</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Ejemplo 50km/2h</div>
                                        <div className="font-bold">{formatCurrency(ejemploTotal)}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 px-3 py-1.5 text-sm text-sat border border-sat rounded hover:bg-sat-50 transition-colors">
                                        Editar
                                    </button>
                                    <button className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                        Calcular
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Calculator Section */}
                <div className="mt-8 p-4 bg-gray-50 rounded border">
                    <h3 className="font-medium text-gray-900 mb-3">Calculadora de Tarifas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Servicio
                            </label>
                            <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded">
                                {servicios.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kilómetros
                            </label>
                            <input type="number" className="w-full px-3 py-2 text-sm border border-gray-300 rounded" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Horas estimadas
                            </label>
                            <input type="number" className="w-full px-3 py-2 text-sm border border-gray-300 rounded" placeholder="0" />
                        </div>
                        <div className="flex items-end">
                            <button className="w-full px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                                Calcular Tarifa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}