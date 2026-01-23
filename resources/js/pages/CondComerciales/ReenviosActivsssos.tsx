// resources/js/Pages/Comercial/ReenviosActivos.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Reenvio {
    id: number;
    origen: string;
    destino: string;
    cliente: string;
    referencia: string;
    fecha_salida: string;
    fecha_estimada_llegada: string;
    estado: string;
    vehiculo: string;
    chofer: string;
    tracking: string;
}

export default function ReenviosActivos() {
    const [reenvios] = useState<Reenvio[]>([
        { 
            id: 1, 
            origen: 'Buenos Aires', 
            destino: 'Córdoba', 
            cliente: 'Transportes Rápidos S.A.', 
            referencia: 'REENV-2024-001', 
            fecha_salida: '2024-01-15 08:00', 
            fecha_estimada_llegada: '2024-01-16 18:00', 
            estado: 'En tránsito', 
            vehiculo: 'ABC-123', 
            chofer: 'Juan Pérez', 
            tracking: 'TRK-001'
        },
        { 
            id: 2, 
            origen: 'Rosario', 
            destino: 'Mendoza', 
            cliente: 'Distribuidora Norte', 
            referencia: 'REENV-2024-002', 
            fecha_salida: '2024-01-14 14:30', 
            fecha_estimada_llegada: '2024-01-15 20:00', 
            estado: 'En tránsito', 
            vehiculo: 'DEF-456', 
            chofer: 'Carlos Gómez', 
            tracking: 'TRK-002'
        },
        { 
            id: 3, 
            origen: 'La Plata', 
            destino: 'Mar del Plata', 
            cliente: 'Logística Integral', 
            referencia: 'REENV-2024-003', 
            fecha_salida: '2024-01-15 10:00', 
            fecha_estimada_llegada: '2024-01-15 16:00', 
            estado: 'En preparación', 
            vehiculo: 'GHI-789', 
            chofer: 'Luis Martínez', 
            tracking: 'TRK-003'
        },
        { 
            id: 4, 
            origen: 'San Juan', 
            destino: 'San Luis', 
            cliente: 'Transportes Unidos', 
            referencia: 'REENV-2024-004', 
            fecha_salida: '2024-01-13 09:00', 
            fecha_estimada_llegada: '2024-01-13 14:00', 
            estado: 'Entregado', 
            vehiculo: 'JKL-012', 
            chofer: 'Ana Rodríguez', 
            tracking: 'TRK-004'
        },
        { 
            id: 5, 
            origen: 'Tucumán', 
            destino: 'Salta', 
            cliente: 'Grupo Industrial Sur', 
            referencia: 'REENV-2024-005', 
            fecha_salida: '2024-01-16 07:00', 
            fecha_estimada_llegada: '2024-01-16 19:00', 
            estado: 'Programado', 
            vehiculo: 'MNO-345', 
            chofer: 'María López', 
            tracking: 'TRK-005'
        },
    ]);

    const [filtroEstado, setFiltroEstado] = useState<string>('todos');

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'En tránsito': return 'bg-blue-100 text-blue-800';
            case 'En preparación': return 'bg-yellow-100 text-yellow-800';
            case 'Programado': return 'bg-purple-100 text-purple-800';
            case 'Entregado': return 'bg-green-100 text-green-800';
            case 'Retrasado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getProgress = (fechaSalida: string, fechaEstimada: string) => {
        const salida = new Date(fechaSalida);
        const estimada = new Date(fechaEstimada);
        const ahora = new Date();
        
        const tiempoTotal = estimada.getTime() - salida.getTime();
        const tiempoTranscurrido = ahora.getTime() - salida.getTime();
        
        if (tiempoTranscurrido <= 0) return 0;
        if (tiempoTranscurrido >= tiempoTotal) return 100;
        
        return Math.round((tiempoTranscurrido / tiempoTotal) * 100);
    };

    const formatDateTime = (datetime: string) => {
        return new Date(datetime).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout title="Reenvíos Activos">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Reenvíos Activos
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Seguimiento en tiempo real de reenvíos y traslados
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                {/* Header y Filtros */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Seguimiento de Reenvíos
                        </h2>
                        <p className="text-sm text-gray-600">
                            Monitoreo en tiempo real de transportes activos
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-sat focus:border-sat"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="En tránsito">En tránsito</option>
                            <option value="En preparación">En preparación</option>
                            <option value="Programado">Programado</option>
                            <option value="Entregado">Entregado</option>
                        </select>
                        <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-medium text-blue-700">Activos</div>
                        <div className="text-2xl font-bold text-blue-900">
                            {reenvios.filter(r => r.estado !== 'Entregado').length}
                        </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-medium text-green-700">Hoy</div>
                        <div className="text-2xl font-bold text-green-900">
                            {reenvios.filter(r => {
                                const fecha = new Date(r.fecha_salida);
                                const hoy = new Date();
                                return fecha.toDateString() === hoy.toDateString();
                            }).length}
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-100">
                        <div className="text-sm font-medium text-yellow-700">En tránsito</div>
                        <div className="text-2xl font-bold text-yellow-900">
                            {reenvios.filter(r => r.estado === 'En tránsito').length}
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-100">
                        <div className="text-sm font-medium text-purple-700">Clientes activos</div>
                        <div className="text-2xl font-bold text-purple-900">
                            {new Set(reenvios.map(r => r.cliente)).size}
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Referencia</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Cliente</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Ruta</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Fechas</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Progreso</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Vehículo/Chofer</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reenvios
                                .filter(r => filtroEstado === 'todos' || r.estado === filtroEstado)
                                .map((reenvio) => {
                                    const progreso = getProgress(reenvio.fecha_salida, reenvio.fecha_estimada_llegada);
                                    return (
                                        <tr key={reenvio.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-local">{reenvio.referencia}</div>
                                                <div className="text-xs text-gray-500">Tracking: {reenvio.tracking}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{reenvio.cliente}</div>
                                                <div className="text-xs text-gray-500">ID: {reenvio.id}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div className="mr-2">
                                                        <div className="text-xs text-gray-500">Origen</div>
                                                        <div className="font-medium">{reenvio.origen}</div>
                                                    </div>
                                                    <div className="mx-2 text-gray-400">→</div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Destino</div>
                                                        <div className="font-medium">{reenvio.destino}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm">
                                                    <div>Salida: {formatDateTime(reenvio.fecha_salida)}</div>
                                                    <div>Estimada: {formatDateTime(reenvio.fecha_estimada_llegada)}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="w-32">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>Progreso</span>
                                                        <span>{progreso}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${
                                                                progreso < 30 ? 'bg-red-500' :
                                                                progreso < 70 ? 'bg-yellow-500' :
                                                                'bg-green-500'
                                                            }`}
                                                            style={{ width: `${progreso}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium">{reenvio.vehiculo}</div>
                                                    <div className="text-sm text-gray-600">{reenvio.chofer}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reenvio.estado)}`}>
                                                    {reenvio.estado}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <button className="text-sat hover:text-sat-600 text-sm">
                                                        Ver detalles
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900 text-sm">
                                                        Actualizar estado
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900 text-sm">
                                                        Contactar chofer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {reenvios
                        .filter(r => filtroEstado === 'todos' || r.estado === filtroEstado)
                        .map((reenvio) => {
                            const progreso = getProgress(reenvio.fecha_salida, reenvio.fecha_estimada_llegada);
                            return (
                                <div key={reenvio.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-gray-900">{reenvio.referencia}</div>
                                            <div className="text-sm text-gray-600">Cliente: {reenvio.cliente}</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reenvio.estado)}`}>
                                            {reenvio.estado}
                                        </span>
                                    </div>
                                    
                                    {/* Route */}
                                    <div className="mb-4">
                                        <div className="text-sm font-medium text-gray-700 mb-1">Ruta</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Origen</div>
                                                <div className="font-medium">{reenvio.origen}</div>
                                            </div>
                                            <div className="text-gray-400">→</div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Destino</div>
                                                <div className="font-medium">{reenvio.destino}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Salida</div>
                                            <div className="font-medium text-sm">
                                                {formatDateTime(reenvio.fecha_salida)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Estimada llegada</div>
                                            <div className="font-medium text-sm">
                                                {formatDateTime(reenvio.fecha_estimada_llegada)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-700">Progreso</span>
                                            <span className="font-medium">{progreso}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${
                                                    progreso < 30 ? 'bg-red-500' :
                                                    progreso < 70 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${progreso}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {/* Vehicle & Driver */}
                                    <div className="mb-4 p-3 bg-gray-50 rounded border">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="text-sm text-gray-600">Vehículo</div>
                                                <div className="font-medium">{reenvio.vehiculo}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Chofer</div>
                                                <div className="font-medium">{reenvio.chofer}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-3 py-1.5 text-sm text-sat border border-sat rounded hover:bg-sat-50 transition-colors">
                                            Ver detalles
                                        </button>
                                        <button className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                            Seguimiento
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Map View (Placeholder) */}
                <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-gray-900">Vista de Mapa</h3>
                            <span className="text-sm text-gray-600">{reenvios.filter(r => r.estado === 'En tránsito').length} en movimiento</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-100 h-64 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-gray-500 mb-2">🎯</div>
                            <div className="font-medium text-gray-700">Mapa de seguimiento en tiempo real</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {reenvios.filter(r => r.estado === 'En tránsito').length} reenvíos activos en el mapa
                            </div>
                            <button className="mt-3 px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                                Abrir vista completa del mapa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}