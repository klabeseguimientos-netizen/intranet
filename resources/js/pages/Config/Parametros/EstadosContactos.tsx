// resources/js/Pages/Config/Parametros/EstadosContactos.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface EstadoContacto {
    id: number;
    nombre: string;
    descripcion: string;
    color: string;
    activo: boolean;
}

export default function EstadosContactos() {
    const [estados] = useState<EstadoContacto[]>([
        { id: 1, nombre: 'Nuevo', descripcion: 'Contacto recién creado', color: 'bg-blue-500', activo: true },
        { id: 2, nombre: 'En contacto', descripcion: 'En proceso de comunicación', color: 'bg-yellow-500', activo: true },
        { id: 3, nombre: 'Calificado', descripcion: 'Contacto validado', color: 'bg-green-500', activo: true },
        { id: 4, nombre: 'Descartado', descripcion: 'Contacto no interesado', color: 'bg-red-500', activo: true },
        { id: 5, nombre: 'Inactivo', descripcion: 'Contacto sin actividad', color: 'bg-gray-500', activo: false },
    ]);

    return (
        <AppLayout title="Estados de Contactos">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Estados de Contactos
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de estados para contactos comerciales
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Estados Disponibles
                        </h2>
                        <p className="text-sm text-gray-600">
                            Configura los estados para clasificar contactos
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                        + Nuevo Estado
                    </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">ID</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Nombre</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Descripción</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Color</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {estados.map((estado) => (
                                <tr key={estado.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">{estado.id}</td>
                                    <td className="py-3 px-4 font-medium">{estado.nombre}</td>
                                    <td className="py-3 px-4 text-gray-600">{estado.descripcion}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <div className={`h-4 w-4 rounded-full ${estado.color} mr-2`}></div>
                                            <span>{estado.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${estado.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {estado.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button className="text-sat hover:text-sat-600 text-sm mr-3">
                                            Editar
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900 text-sm">
                                            {estado.activo ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {estados.map((estado) => (
                        <div key={estado.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-medium text-gray-900">{estado.nombre}</div>
                                    <div className="text-sm text-gray-600">ID: {estado.id}</div>
                                </div>
                                <div className="flex items-center">
                                    <div className={`h-3 w-3 rounded-full ${estado.color} mr-2`}></div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${estado.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {estado.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">{estado.descripcion}</div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-1.5 text-sm text-sat border border-sat rounded hover:bg-sat-50 transition-colors">
                                    Editar
                                </button>
                                <button className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                    {estado.activo ? 'Desactivar' : 'Activar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-sm text-gray-600">
                        Mostrando {estados.length} estados
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Anterior
                        </button>
                        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}