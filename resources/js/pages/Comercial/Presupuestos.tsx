// resources/js/Pages/Comercial/Presupuestos.tsx
import React from 'react';
import AppLayout from '@/layouts/app-layout';

export default function Presupuestos() {
    return (
        <AppLayout title="Presupuestos">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Presupuestos
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión y seguimiento de presupuestos
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Presupuestos Generados
                    </h2>
                    <button className="px-4 py-2 bg-local text-white text-sm rounded hover:bg-local-600 transition-colors">
                        + Crear Presupuesto
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-700 mb-2">Total</h3>
                        <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-gray-700 mb-2">Enviados</h3>
                        <p className="text-2xl font-bold text-blue-600">32</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                        <h3 className="font-medium text-gray-700 mb-2">Aprobados</h3>
                        <p className="text-2xl font-bold text-green-600">18</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded border border-red-200">
                        <h3 className="font-medium text-gray-700 mb-2">Rechazados</h3>
                        <p className="text-2xl font-bold text-red-600">45</p>
                    </div>
                </div>
                
                <div className="text-gray-600 text-center py-8">
                    <p>Listado de presupuestos se cargará aquí</p>
                </div>
            </div>
        </AppLayout>
    );
}