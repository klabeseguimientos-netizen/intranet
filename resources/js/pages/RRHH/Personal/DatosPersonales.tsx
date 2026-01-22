// resources/js/Pages/RRHH/Personal/DatosPersonales.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Empleado {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    fecha_nacimiento: string;
    puesto: string;
    departamento: string;
    fecha_ingreso: string;
    email: string;
    telefono: string;
    direccion: string;
    estado: string;
}

export default function DatosPersonales() {
    const [empleados] = useState<Empleado[]>([
        { id: 1, nombre: 'María', apellido: 'López', dni: '30.123.456', fecha_nacimiento: '1985-05-15', puesto: 'Gerente Comercial', departamento: 'Ventas', fecha_ingreso: '2020-03-01', email: 'maria@localsat.com', telefono: '+54 11 1234-5678', direccion: 'Av. Corrientes 1234', estado: 'Activo' },
        { id: 2, nombre: 'Juan', apellido: 'Pérez', dni: '31.234.567', fecha_nacimiento: '1990-08-22', puesto: 'Ejecutivo de Ventas', departamento: 'Ventas', fecha_ingreso: '2021-06-15', email: 'juan@localsat.com', telefono: '+54 11 2345-6789', direccion: 'Calle Florida 567', estado: 'Activo' },
        { id: 3, nombre: 'Carlos', apellido: 'Gómez', dni: '32.345.678', fecha_nacimiento: '1988-11-30', puesto: 'Técnico de Campo', departamento: 'Operaciones', fecha_ingreso: '2019-09-10', email: 'carlos@localsat.com', telefono: '+54 11 3456-7890', direccion: 'Av. Santa Fe 890', estado: 'Activo' },
        { id: 4, nombre: 'Ana', apellido: 'Rodríguez', dni: '33.456.789', fecha_nacimiento: '1992-02-14', puesto: 'Analista RRHH', departamento: 'Recursos Humanos', fecha_ingreso: '2022-01-20', email: 'ana@localsat.com', telefono: '+54 11 4567-8901', direccion: 'Calle Lavalle 234', estado: 'Activo' },
        { id: 5, nombre: 'Luis', apellido: 'Martínez', dni: '34.567.890', fecha_nacimiento: '1995-07-05', puesto: 'Desarrollador', departamento: 'Tecnología', fecha_ingreso: '2023-03-15', email: 'luis@localsat.com', telefono: '+54 11 5678-9012', direccion: 'Av. Libertador 3456', estado: 'Prueba' },
    ]);

    const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado>(empleados[0]);

    const getDepartamentoColor = (departamento: string) => {
        switch (departamento) {
            case 'Ventas': return 'bg-blue-100 text-blue-800';
            case 'Operaciones': return 'bg-green-100 text-green-800';
            case 'Recursos Humanos': return 'bg-purple-100 text-purple-800';
            case 'Tecnología': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout title="Datos Personales">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Datos Personales
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión de información personal del personal
                </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Employee List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Empleados</h2>
                            <button className="px-3 py-1.5 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                                + Nuevo
                            </button>
                        </div>

                        <div className="space-y-3">
                            {empleados.map((empleado) => (
                                <button
                                    key={empleado.id}
                                    onClick={() => setSelectedEmpleado(empleado)}
                                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                                        selectedEmpleado.id === empleado.id 
                                            ? 'border-sat bg-sat-50' 
                                            : 'border-gray-200 hover:border-sat hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center mb-2">
                                        <div className="h-10 w-10 rounded-full bg-local flex items-center justify-center text-white font-semibold mr-3">
                                            {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {empleado.nombre} {empleado.apellido}
                                            </div>
                                            <div className="text-sm text-gray-600">{empleado.puesto}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>DNI: {empleado.dni}</span>
                                        <span className={`px-2 py-1 rounded-full ${empleado.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {empleado.estado}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-6 p-4 bg-gray-50 rounded border">
                            <h3 className="font-medium text-gray-900 mb-2">Resumen</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total empleados:</span>
                                    <span className="font-medium">{empleados.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Activos:</span>
                                    <span className="font-medium">{empleados.filter(e => e.estado === 'Activo').length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Departamentos:</span>
                                    <span className="font-medium">{new Set(empleados.map(e => e.departamento)).size}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Employee Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                    {selectedEmpleado.nombre} {selectedEmpleado.apellido}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Información personal y laboral
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 text-sm border border-sat text-sat rounded hover:bg-sat-50 transition-colors">
                                    Editar
                                </button>
                                <button className="px-3 py-1.5 text-sm bg-sat text-white rounded hover:bg-sat-600 transition-colors">
                                    Imprimir Ficha
                                </button>
                            </div>
                        </div>

                        {/* Employee Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-blue-50 rounded border border-blue-100">
                                <div className="text-sm font-medium text-blue-700">Departamento</div>
                                <div className="text-lg font-bold text-blue-900">{selectedEmpleado.departamento}</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded border border-green-100">
                                <div className="text-sm font-medium text-green-700">Antigüedad</div>
                                <div className="text-lg font-bold text-green-900">
                                    {Math.floor((new Date().getTime() - new Date(selectedEmpleado.fecha_ingreso).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
                                </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded border border-purple-100">
                                <div className="text-sm font-medium text-purple-700">Estado</div>
                                <div className="text-lg font-bold text-purple-900">{selectedEmpleado.estado}</div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-3">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                                    <div className="p-2 bg-gray-50 rounded border">{selectedEmpleado.dni}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
                                    <div className="p-2 bg-gray-50 rounded border">{selectedEmpleado.fecha_nacimiento}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="p-2 bg-gray-50 rounded border">{selectedEmpleado.email}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <div className="p-2 bg-gray-50 rounded border">{selectedEmpleado.telefono}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <div className="p-2 bg-gray-50 rounded border">{selectedEmpleado.direccion}</div>
                                </div>
                            </div>
                        </div>

                        {/* Laboral Details */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-3">Información Laboral</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                                    <div className="p-2 bg-gray-50 rounded border">{selectedEmpleado.puesto}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                    <div className="p-2 bg-gray-50 rounded border">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getDepartamentoColor(selectedEmpleado.departamento)}`}>
                                            {selectedEmpleado.departamento}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Ingreso</label>
                                    <div className="p-2 bg-gray-50 rounded border">{selectedEmpleado.fecha_ingreso}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Contrato</label>
                                    <div className="p-2 bg-gray-50 rounded border">Contrato Indefinido</div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h3 className="font-medium text-gray-900">Contacto de Emergencia</h3>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <div className="p-2 bg-gray-50 rounded border">Laura González</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                                        <div className="p-2 bg-gray-50 rounded border">Cónyuge</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <div className="p-2 bg-gray-50 rounded border">+54 11 6789-0123</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}