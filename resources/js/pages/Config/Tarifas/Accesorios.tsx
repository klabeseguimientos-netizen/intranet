// resources/js/Pages/Config/Tarifas/Accesorios.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Accesorio {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
    stock_minimo: number;
    estado: string;
}

export default function Accesorios() {
    const [accesorios] = useState<Accesorio[]>([
        { id: 1, nombre: 'GPS Tracker Pro', categoria: 'Seguimiento', precio: 15000, stock: 45, stock_minimo: 10, estado: 'Disponible' },
        { id: 2, nombre: 'Sensor Temperatura', categoria: 'Monitoreo', precio: 8500, stock: 32, stock_minimo: 15, estado: 'Disponible' },
        { id: 3, nombre: 'Antena Exterior', categoria: 'Comunicación', precio: 12500, stock: 8, stock_minimo: 5, estado: 'Bajo Stock' },
        { id: 4, nombre: 'Cable Alimentación', categoria: 'Conexión', precio: 3500, stock: 0, stock_minimo: 20, estado: 'Sin Stock' },
        { id: 5, nombre: 'Soporte Vehicular', categoria: 'Montaje', precio: 6000, stock: 25, stock_minimo: 10, estado: 'Disponible' },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStockStatus = (stock: number, stock_minimo: number) => {
        if (stock === 0) return { text: 'Sin Stock', color: 'bg-red-100 text-red-800' };
        if (stock <= stock_minimo) return { text: 'Bajo Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Disponible', color: 'bg-green-100 text-green-800' };
    };

    return (
        <AppLayout title="Accesorios">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Accesorios
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de accesorios y componentes para servicios
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Inventario de Accesorios
                        </h2>
                        <p className="text-sm text-gray-600">
                            Gestione el stock de accesorios disponibles
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-local text-white text-sm rounded hover:bg-local-600 transition-colors">
                        + Nuevo Accesorio
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-medium text-blue-700">Total items</div>
                        <div className="text-2xl font-bold text-blue-900">{accesorios.length}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-medium text-green-700">Valor total</div>
                        <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(accesorios.reduce((sum, a) => sum + (a.precio * a.stock), 0))}
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-100">
                        <div className="text-sm font-medium text-yellow-700">Bajo stock</div>
                        <div className="text-2xl font-bold text-yellow-900">
                            {accesorios.filter(a => a.stock <= a.stock_minimo && a.stock > 0).length}
                        </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded border border-red-100">
                        <div className="text-sm font-medium text-red-700">Sin stock</div>
                        <div className="text-2xl font-bold text-red-900">
                            {accesorios.filter(a => a.stock === 0).length}
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">ID</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Accesorio</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Categoría</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Precio Unitario</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Stock Actual</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Stock Mínimo</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Valor Total</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {accesorios.map((accesorio) => {
                                const stockStatus = getStockStatus(accesorio.stock, accesorio.stock_minimo);
                                return (
                                    <tr key={accesorio.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">{accesorio.id}</td>
                                        <td className="py-3 px-4 font-medium">{accesorio.nombre}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                accesorio.categoria === 'Seguimiento' ? 'bg-blue-100 text-blue-800' :
                                                accesorio.categoria === 'Monitoreo' ? 'bg-green-100 text-green-800' :
                                                accesorio.categoria === 'Comunicación' ? 'bg-purple-100 text-purple-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {accesorio.categoria}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-local">
                                            {formatCurrency(accesorio.precio)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <span className={`font-medium ${accesorio.stock <= accesorio.stock_minimo ? 'text-yellow-600' : 'text-gray-900'}`}>
                                                    {accesorio.stock} unidades
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {accesorio.stock_minimo} unidades
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                                                {stockStatus.text}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-bold">
                                            {formatCurrency(accesorio.precio * accesorio.stock)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-sat hover:text-sat-600 text-sm mr-3">
                                                Editar
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-900 text-sm">
                                                Reponer
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
                    {accesorios.map((accesorio) => {
                        const stockStatus = getStockStatus(accesorio.stock, accesorio.stock_minimo);
                        return (
                            <div key={accesorio.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium text-gray-900">{accesorio.nombre}</div>
                                        <div className="text-sm text-gray-600">ID: {accesorio.id}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            accesorio.categoria === 'Seguimiento' ? 'bg-blue-100 text-blue-800' :
                                            accesorio.categoria === 'Monitoreo' ? 'bg-green-100 text-green-800' :
                                            accesorio.categoria === 'Comunicación' ? 'bg-purple-100 text-purple-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {accesorio.categoria}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                                            {stockStatus.text}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Precio Unit.</div>
                                        <div className="font-bold text-local">{formatCurrency(accesorio.precio)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Stock</div>
                                        <div className={`font-medium ${accesorio.stock <= accesorio.stock_minimo ? 'text-yellow-600' : 'text-gray-900'}`}>
                                            {accesorio.stock} / {accesorio.stock_minimo}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Valor Total</div>
                                        <div className="font-bold">{formatCurrency(accesorio.precio * accesorio.stock)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Disponibilidad</div>
                                        <div className="font-medium">{accesorio.stock > 0 ? 'En stock' : 'Agotado'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 px-3 py-1.5 text-sm text-sat border border-sat rounded hover:bg-sat-50 transition-colors">
                                        Editar
                                    </button>
                                    <button className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                        Reponer
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