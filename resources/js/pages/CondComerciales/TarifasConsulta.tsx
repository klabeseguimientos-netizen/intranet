// resources/js/Pages/CondComerciales/TarifasConsulta.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Tarifa {
    id: number;
    servicio: string;
    categoria: string;
    precio_base: number;
    precio_km: number;
    precio_hora: number;
    disponibilidad: string;
    aplica_convenio: boolean;
    ultima_actualizacion: string;
}

interface Abono {
    id: number;
    nombre: string;
    tipo: string;
    precio: number;
    duracion_dias: number;
    vehiculos_incluidos: number;
    descuento: number;
}

export default function TarifasConsulta() {
    const [tarifas] = useState<Tarifa[]>([
        { id: 1, servicio: 'Transporte Local', categoria: 'Básico', precio_base: 5000, precio_km: 350, precio_hora: 2500, disponibilidad: '24/7', aplica_convenio: true, ultima_actualizacion: '2024-01-10' },
        { id: 2, servicio: 'Distribución Urbana', categoria: 'Standard', precio_base: 7500, precio_km: 450, precio_hora: 3200, disponibilidad: 'Diurno', aplica_convenio: true, ultima_actualizacion: '2024-01-15' },
        { id: 3, servicio: 'Logística Express', categoria: 'Premium', precio_base: 12000, precio_km: 600, precio_hora: 5000, disponibilidad: '24/7', aplica_convenio: false, ultima_actualizacion: '2024-01-05' },
        { id: 4, servicio: 'Transporte Pesado', categoria: 'Especial', precio_base: 20000, precio_km: 850, precio_hora: 7500, disponibilidad: 'Diurno', aplica_convenio: true, ultima_actualizacion: '2024-01-12' },
        { id: 5, servicio: 'Servicio Nocturno', categoria: 'Especial', precio_base: 10000, precio_km: 500, precio_hora: 4000, disponibilidad: 'Nocturno', aplica_convenio: true, ultima_actualizacion: '2024-01-08' },
    ]);

    const [abonos] = useState<Abono[]>([
        { id: 1, nombre: 'Abono Básico', tipo: 'Mensual', precio: 15000, duracion_dias: 30, vehiculos_incluidos: 5, descuento: 10 },
        { id: 2, nombre: 'Abono Profesional', tipo: 'Mensual', precio: 28000, duracion_dias: 30, vehiculos_incluidos: 15, descuento: 15 },
        { id: 3, nombre: 'Abono Empresarial', tipo: 'Trimestral', precio: 75000, duracion_dias: 90, vehiculos_incluidos: 30, descuento: 20 },
        { id: 4, nombre: 'Abono Anual', tipo: 'Anual', precio: 250000, duracion_dias: 365, vehiculos_incluidos: 50, descuento: 25 },
    ]);

    const [activeTab, setActiveTab] = useState<'servicios' | 'abonos'>('servicios');
    const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const calcularEjemplo = (tarifa: Tarifa) => {
        return tarifa.precio_base + (tarifa.precio_km * 50) + (tarifa.precio_hora * 2);
    };

    return (
        <AppLayout title="Tarifas (Consulta)">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Tarifas (Consulta)
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Consulta de tarifas y precios vigentes
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('servicios')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 ${
                                activeTab === 'servicios'
                                    ? 'border-sat text-sat'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Servicios ({tarifas.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('abonos')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 ${
                                activeTab === 'abonos'
                                    ? 'border-sat text-sat'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Abonos ({abonos.length})
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'servicios' ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                Tarifas de Servicios
                            </h2>
                            <p className="text-sm text-gray-600">
                                Precios vigentes para todos los servicios
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={filtroCategoria}
                                onChange={(e) => setFiltroCategoria(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-sat focus:border-sat"
                            >
                                <option value="todas">Todas las categorías</option>
                                <option value="Básico">Básico</option>
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="Especial">Especial</option>
                            </select>
                            <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                                Descargar Tarifario
                            </button>
                        </div>
                    </div>

                    {/* Calculator Info */}
                    <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <h3 className="font-medium text-blue-800 mb-1">Calculadora de tarifas</h3>
                                <p className="text-sm text-blue-700">
                                    Los ejemplos muestran cálculo para 50km y 2 horas
                                </p>
                            </div>
                            <div className="text-sm text-blue-800">
                                Actualizado al 15/01/2024
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Servicio</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Categoría</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Precio Base</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Por Km</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Por Hora</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Disponibilidad</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Aplica Convenio</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Ejemplo 50km/2h</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tarifas
                                    .filter(t => filtroCategoria === 'todas' || t.categoria === filtroCategoria)
                                    .map((tarifa) => (
                                        <tr key={tarifa.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">{tarifa.servicio}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    tarifa.categoria === 'Básico' ? 'bg-green-100 text-green-800' :
                                                    tarifa.categoria === 'Standard' ? 'bg-blue-100 text-blue-800' :
                                                    tarifa.categoria === 'Premium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {tarifa.categoria}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-local">
                                                {formatCurrency(tarifa.precio_base)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {formatCurrency(tarifa.precio_km)}/km
                                            </td>
                                            <td className="py-3 px-4">
                                                {formatCurrency(tarifa.precio_hora)}/h
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    tarifa.disponibilidad === '24/7' ? 'bg-green-100 text-green-800' :
                                                    tarifa.disponibilidad === 'Diurno' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {tarifa.disponibilidad}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {tarifa.aplica_convenio ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Sí</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">No</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-bold">
                                                {formatCurrency(calcularEjemplo(tarifa))}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {tarifas
                            .filter(t => filtroCategoria === 'todas' || t.categoria === filtroCategoria)
                            .map((tarifa) => (
                                <div key={tarifa.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-gray-900">{tarifa.servicio}</div>
                                            <div className="text-sm text-gray-600">ID: {tarifa.id}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                tarifa.categoria === 'Básico' ? 'bg-green-100 text-green-800' :
                                                tarifa.categoria === 'Standard' ? 'bg-blue-100 text-blue-800' :
                                                tarifa.categoria === 'Premium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {tarifa.categoria}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                tarifa.disponibilidad === '24/7' ? 'bg-green-100 text-green-800' :
                                                tarifa.disponibilidad === 'Diurno' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {tarifa.disponibilidad}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Precio Base</div>
                                            <div className="font-bold text-local">{formatCurrency(tarifa.precio_base)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Por Km</div>
                                            <div className="font-medium">{formatCurrency(tarifa.precio_km)}/km</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Por Hora</div>
                                            <div className="font-medium">{formatCurrency(tarifa.precio_hora)}/h</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Convenio</div>
                                            <div className="font-medium">
                                                {tarifa.aplica_convenio ? (
                                                    <span className="text-green-600">Aplica</span>
                                                ) : (
                                                    <span className="text-gray-600">No aplica</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded border">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm font-medium text-gray-700">
                                                Ejemplo (50km, 2h):
                                            </div>
                                            <div className="font-bold text-lg">
                                                {formatCurrency(calcularEjemplo(tarifa))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Planes de Abono
                        </h2>
                        <p className="text-sm text-gray-600">
                            Suscripciones mensuales y planes especiales
                        </p>
                    </div>

                    {/* Abonos Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {abonos.map((abono) => (
                            <div key={abono.id} className="border border-gray-200 rounded-lg hover:border-sat transition-colors overflow-hidden">
                                <div className={`p-4 ${
                                    abono.tipo === 'Anual' ? 'bg-purple-50 border-b border-purple-100' :
                                    abono.tipo === 'Trimestral' ? 'bg-green-50 border-b border-green-100' :
                                    'bg-blue-50 border-b border-blue-100'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{abono.nombre}</h3>
                                            <p className="text-sm text-gray-600">{abono.tipo}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">
                                            -{abono.descuento}%
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-center mb-4">
                                        <div className="text-2xl font-bold text-local mb-1">
                                            {formatCurrency(abono.precio)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            por {abono.duracion_dias} días
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Vehículos incluidos:</span>
                                            <span className="font-medium">{abono.vehiculos_incluidos}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Ahorro estimado:</span>
                                            <span className="font-medium text-green-600">{abono.descuento}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Periodicidad:</span>
                                            <span className="font-medium">Renovable</span>
                                        </div>
                                    </div>
                                    <button className="w-full px-3 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                                        Seleccionar Plan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comparison */}
                    <div className="mt-8 p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-900 mb-3">Comparativa de Planes</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="py-2 px-3 text-left font-medium text-gray-700">Plan</th>
                                        <th className="py-2 px-3 text-left font-medium text-gray-700">Precio/Día</th>
                                        <th className="py-2 px-3 text-left font-medium text-gray-700">Costo por Vehículo</th>
                                        <th className="py-2 px-3 text-left font-medium text-gray-700">Ahorro vs Individual</th>
                                        <th className="py-2 px-3 text-left font-medium text-gray-700">Recomendado para</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {abonos.map((abono) => {
                                        const precioPorDia = abono.precio / abono.duracion_dias;
                                        const costoPorVehiculo = abono.precio / abono.vehiculos_incluidos;
                                        return (
                                            <tr key={abono.id} className="bg-white hover:bg-gray-50">
                                                <td className="py-2 px-3 font-medium">{abono.nombre}</td>
                                                <td className="py-2 px-3">{formatCurrency(Math.round(precioPorDia))}/día</td>
                                                <td className="py-2 px-3">{formatCurrency(Math.round(costoPorVehiculo))}/vehículo</td>
                                                <td className="py-2 px-3">
                                                    <span className="font-medium text-green-600">{abono.descuento}%</span>
                                                </td>
                                                <td className="py-2 px-3">
                                                    {abono.vehiculos_incluidos <= 5 ? 'Pequeñas flotas' :
                                                     abono.vehiculos_incluidos <= 15 ? 'Flotas medianas' :
                                                     abono.vehiculos_incluidos <= 30 ? 'Empresas' : 'Corporaciones'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="font-medium text-gray-900 mb-3">Información Importante</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded border border-blue-100">
                        <div className="font-medium text-blue-800 mb-1">Precios sin IVA</div>
                        <div className="text-sm text-blue-700">
                            Todos los precios mostrados no incluyen IVA (21%)
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-100">
                        <div className="font-medium text-green-800 mb-1">Convenios activos</div>
                        <div className="text-sm text-green-700">
                            Algunos servicios aplican descuentos por convenio
                        </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded border border-purple-100">
                        <div className="font-medium text-purple-800 mb-1">Actualización mensual</div>
                        <div className="text-sm text-purple-700">
                            Las tarifas se revisan y actualizan mensualmente
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}