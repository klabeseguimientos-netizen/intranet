// resources/js/Pages/Comercial/Contactos.tsx
import React from 'react';
import AppLayout from '@/layouts/app-layout';

export default function Contactos() {
    return (
        <AppLayout title="Contactos">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Contactos
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de contactos y prospectos
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Listado de Contactos
                    </h2>
                    <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                        + Nuevo Contacto
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Nombre</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Empresa</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Teléfono</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Email</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                                <td className="py-3 px-4">Juan Pérez</td>
                                <td className="py-3 px-4">Transportes Rápidos S.A.</td>
                                <td className="py-3 px-4">+54 11 1234-5678</td>
                                <td className="py-3 px-4">juan@transportes.com</td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        Activo
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <button className="text-sat hover:text-sat-600 text-sm">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-6 text-center text-gray-500 text-sm">
                    Página 1 de 5 - Mostrando 10 de 48 contactos
                </div>
            </div>
        </AppLayout>
    );
}