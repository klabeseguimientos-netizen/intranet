// resources/js/Pages/Comercial/Recordatorios.tsx
import React from 'react';
import AppLayout from '@/layouts/app-layout';

export default function Recordatorios() {
    return (
        <AppLayout title="Recordatorios">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Recordatorios
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de recordatorios y seguimientos
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recordatorios Programados
                    </h2>
                    <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                        + Nuevo Recordatorio
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded hover:border-sat transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-gray-900">Seguimiento a Transportes Rápidos</h3>
                                <p className="text-sm text-gray-600 mt-1">Vencimiento de contrato próximo</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Hoy, 15:00</p>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1 inline-block">
                                    Pendiente
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded hover:border-sat transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-gray-900">Llamar a Logística Integral</h3>
                                <p className="text-sm text-gray-600 mt-1">Seguimiento de presupuesto enviado</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Mañana, 10:00</p>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1 inline-block">
                                    Programado
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}