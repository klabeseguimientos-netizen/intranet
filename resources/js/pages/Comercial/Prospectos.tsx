// resources/js/Pages/Comercial/Prospectos.tsx
import React from 'react';
import AppLayout from '@/layouts/app-layout';

export default function Prospectos() {
    return (
        <AppLayout title="Prospectos">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Prospectos
                </h1>
                <p className="mt-1 text-gray-700 text-base">
                    Gestión de leads y prospectos comerciales
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Pipeline de Prospectos
                    </h2>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                        + Nuevo Prospecto
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded border text-center">
                        <h3 className="font-medium text-gray-700 mb-2">Nuevo</h3>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border border-blue-200 text-center">
                        <h3 className="font-medium text-gray-700 mb-2">Contactado</h3>
                        <p className="text-2xl font-bold text-blue-600">18</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-200 text-center">
                        <h3 className="font-medium text-gray-700 mb-2">Calificado</h3>
                        <p className="text-2xl font-bold text-yellow-600">12</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-200 text-center">
                        <h3 className="font-medium text-gray-700 mb-2">Propuesta</h3>
                        <p className="text-2xl font-bold text-purple-600">8</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-200 text-center">
                        <h3 className="font-medium text-gray-700 mb-2">Cerrado</h3>
                        <p className="text-2xl font-bold text-green-600">6</p>
                    </div>
                </div>
                
                <div className="text-gray-600">
                    <p>Seleccione un prospecto para ver detalles y realizar seguimiento.</p>
                </div>
            </div>
        </AppLayout>
    );
}