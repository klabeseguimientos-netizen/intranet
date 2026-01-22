// resources/js/Pages/Comercial/Cuentas/Detalles.tsx
import React from 'react';
import AppLayout from '@/layouts/app-layout';

export default function DetallesCuentas() {
    return (
        <AppLayout title="Detalles de Cuentas">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Detalles de Cuentas
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Información detallada de las cuentas de clientes
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Cuentas Registradas
                        </h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Buscar cuenta..."
                                className="px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-700 mb-2">Cuentas Totales</h3>
                        <p className="text-2xl font-bold text-local">156</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-700 mb-2">Cuentas Activas</h3>
                        <p className="text-2xl font-bold text-green-600">124</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-700 mb-2">Cuentas Nuevas</h3>
                        <p className="text-2xl font-bold text-blue-600">12</p>
                    </div>
                </div>
                
                <div className="text-gray-600">
                    <p>Seleccione una cuenta para ver los detalles completos.</p>
                </div>
            </div>
        </AppLayout>
    );
}