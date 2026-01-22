// resources/js/Pages/RRHH/Personal/Cumpleanos.tsx
import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Cake, Gift, Calendar, PartyPopper, Users } from 'lucide-react';

interface EmpleadoCumple {
    id: number;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    edad: number;
    departamento: string;
    puesto: string;
    email: string;
    telefono: string;
    proximo_cumple: number; // días hasta el próximo cumpleaños
    mes: string;
    signo_zodiaco: string;
}

export default function Cumpleanos() {
    const [empleados, setEmpleados] = useState<EmpleadoCumple[]>([
        { id: 1, nombre: 'María', apellido: 'López', fecha_nacimiento: '1985-05-15', edad: 39, departamento: 'Ventas', puesto: 'Gerente Comercial', email: 'maria@localsat.com', telefono: '+54 11 1234-5678', proximo_cumple: 120, mes: 'Mayo', signo_zodiaco: 'Tauro' },
        { id: 2, nombre: 'Juan', apellido: 'Pérez', fecha_nacimiento: '1990-08-22', edad: 33, departamento: 'Ventas', puesto: 'Ejecutivo de Ventas', email: 'juan@localsat.com', telefono: '+54 11 2345-6789', proximo_cumple: 45, mes: 'Agosto', signo_zodiaco: 'Leo' },
        { id: 3, nombre: 'Carlos', apellido: 'Gómez', fecha_nacimiento: '1988-11-30', edad: 35, departamento: 'Operaciones', puesto: 'Técnico de Campo', email: 'carlos@localsat.com', telefono: '+54 11 3456-7890', proximo_cumple: 300, mes: 'Noviembre', signo_zodiaco: 'Sagitario' },
        { id: 4, nombre: 'Ana', apellido: 'Rodríguez', fecha_nacimiento: '1992-02-14', edad: 32, departamento: 'Recursos Humanos', puesto: 'Analista RRHH', email: 'ana@localsat.com', telefono: '+54 11 4567-8901', proximo_cumple: 15, mes: 'Febrero', signo_zodiaco: 'Acuario' },
        { id: 5, nombre: 'Luis', apellido: 'Martínez', fecha_nacimiento: '1995-07-05', edad: 28, departamento: 'Tecnología', puesto: 'Desarrollador', email: 'luis@localsat.com', telefono: '+54 11 5678-9012', proximo_cumple: 180, mes: 'Julio', signo_zodiaco: 'Cáncer' },
    ]);

    const [filtroMes, setFiltroMes] = useState<string>('todos');
    const [filtroDepartamento, setFiltroDepartamento] = useState<string>('todos');
    const [cumpleHoy, setCumpleHoy] = useState<EmpleadoCumple[]>([]);
    const [cumpleProximo, setCumpleProximo] = useState<EmpleadoCumple[]>([]);

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const departamentos = ['Ventas', 'Operaciones', 'Recursos Humanos', 'Tecnología'];

    useEffect(() => {
        // Simular empleados que cumplen hoy (para demo)
        const hoy = empleados.filter(e => e.proximo_cumple === 0);
        const proximos = empleados
            .filter(e => e.proximo_cumple > 0 && e.proximo_cumple <= 30)
            .sort((a, b) => a.proximo_cumple - b.proximo_cumple);
        
        setCumpleHoy(hoy);
        setCumpleProximo(proximos);
    }, [empleados]);

    const filteredEmpleados = empleados.filter(e => {
        if (filtroMes !== 'todos') {
            const mesCumple = new Date(e.fecha_nacimiento).getMonth();
            if (meses[mesCumple] !== filtroMes) return false;
        }
        if (filtroDepartamento !== 'todos' && e.departamento !== filtroDepartamento) {
            return false;
        }
        return true;
    });

    const getSignoColor = (signo: string) => {
        const colores: Record<string, string> = {
            'Aries': 'bg-red-100 text-red-800',
            'Tauro': 'bg-green-100 text-green-800',
            'Géminis': 'bg-yellow-100 text-yellow-800',
            'Cáncer': 'bg-blue-100 text-blue-800',
            'Leo': 'bg-orange-100 text-orange-800',
            'Virgo': 'bg-emerald-100 text-emerald-800',
            'Libra': 'bg-pink-100 text-pink-800',
            'Escorpio': 'bg-purple-100 text-purple-800',
            'Sagitario': 'bg-indigo-100 text-indigo-800',
            'Capricornio': 'bg-gray-100 text-gray-800',
            'Acuario': 'bg-cyan-100 text-cyan-800',
            'Piscis': 'bg-teal-100 text-teal-800',
        };
        return colores[signo] || 'bg-gray-100 text-gray-800';
    };

    const getProximoCumpleColor = (dias: number) => {
        if (dias === 0) return 'bg-green-100 text-green-800';
        if (dias <= 7) return 'bg-yellow-100 text-yellow-800';
        if (dias <= 30) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout title="Cumpleaños">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Cumpleaños del Personal
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión y seguimiento de cumpleaños del equipo
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                {/* Header y Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Celebración de Cumpleaños
                        </h2>
                        <p className="text-sm text-gray-600">
                            Organice celebraciones y envíe felicitaciones
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors flex items-center gap-2">
                        <Gift size={16} />
                        Programar Celebración
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-pink-50 rounded border border-pink-100">
                        <div className="flex items-center gap-2 mb-2">
                            <PartyPopper size={20} className="text-pink-600" />
                            <div className="text-sm font-medium text-pink-700">Cumple hoy</div>
                        </div>
                        <div className="text-2xl font-bold text-pink-900">{cumpleHoy.length}</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={20} className="text-blue-600" />
                            <div className="text-sm font-medium text-blue-700">Próximos 30 días</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{cumpleProximo.length}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Cake size={20} className="text-purple-600" />
                            <div className="text-sm font-medium text-purple-700">Este mes</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                            {empleados.filter(e => {
                                const mesActual = new Date().getMonth();
                                const mesCumple = new Date(e.fecha_nacimiento).getMonth();
                                return mesCumple === mesActual;
                            }).length}
                        </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={20} className="text-green-600" />
                            <div className="text-sm font-medium text-green-700">Promedio edad</div>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                            {Math.round(empleados.reduce((sum, e) => sum + e.edad, 0) / empleados.length)} años
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por mes</label>
                        <select
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-sat focus:border-sat"
                        >
                            <option value="todos">Todos los meses</option>
                            {meses.map((mes) => (
                                <option key={mes} value={mes}>{mes}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por departamento</label>
                        <select
                            value={filtroDepartamento}
                            onChange={(e) => setFiltroDepartamento(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-sat focus:border-sat"
                        >
                            <option value="todos">Todos los departamentos</option>
                            {departamentos.map((depto) => (
                                <option key={depto} value={depto}>{depto}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Acciones</label>
                        <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Enviar Recordatorios
                        </button>
                    </div>
                </div>

                {/* Birthday Highlights */}
                {cumpleHoy.length > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                            <PartyPopper size={20} className="text-green-600" />
                            <h3 className="font-semibold text-green-900">¡Cumpleaños de Hoy!</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {cumpleHoy.map((empleado) => (
                                <div key={empleado.id} className="p-4 bg-white rounded-lg border border-green-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                            {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">
                                                {empleado.nombre} {empleado.apellido}
                                            </div>
                                            <div className="text-sm text-gray-600">{empleado.puesto}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">🎂 {empleado.edad} años</span>
                                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                                            Felicitar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Birthdays */}
                {cumpleProximo.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">Próximos Cumpleaños (30 días)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {cumpleProximo.map((empleado) => (
                                <div key={empleado.id} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-gray-900">{empleado.nombre} {empleado.apellido}</div>
                                            <div className="text-sm text-gray-600">{empleado.departamento}</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getProximoCumpleColor(empleado.proximo_cumple)}`}>
                                            {empleado.proximo_cumple === 0 ? 'Hoy' : `En ${empleado.proximo_cumple} días`}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <div className="text-gray-700">🎂 {new Date(empleado.fecha_nacimiento).toLocaleDateString('es-AR')}</div>
                                            <div className="text-gray-600">Edad: {empleado.edad + 1}</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getSignoColor(empleado.signo_zodiaco)}`}>
                                            {empleado.signo_zodiaco}
                                        </span>
                                    </div>
                                    <button className="w-full mt-3 px-3 py-1.5 text-sm border border-sat text-sat rounded hover:bg-sat-50 transition-colors">
                                        Programar Regalo
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Full Table */}
                <div className="mt-8">
                    <h3 className="font-medium text-gray-900 mb-3">Calendario de Cumpleaños</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Empleado</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Fecha Nacimiento</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Edad</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Mes</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Signo</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Próximo Cumple</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Departamento</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEmpleados.map((empleado) => (
                                    <tr key={empleado.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-local flex items-center justify-center text-white text-xs font-semibold">
                                                    {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{empleado.nombre} {empleado.apellido}</div>
                                                    <div className="text-xs text-gray-500">{empleado.puesto}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">{empleado.fecha_nacimiento}</td>
                                        <td className="py-3 px-4 font-medium">{empleado.edad} años</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                {empleado.mes}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getSignoColor(empleado.signo_zodiaco)}`}>
                                                {empleado.signo_zodiaco}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getProximoCumpleColor(empleado.proximo_cumple)}`}>
                                                {empleado.proximo_cumple === 0 ? 'Hoy' : `En ${empleado.proximo_cumple} días`}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{empleado.departamento}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button className="text-sat hover:text-sat-600 text-sm">
                                                    Felicitar
                                                </button>
                                                <button className="text-green-600 hover:text-green-800 text-sm">
                                                    Regalo
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Monthly Stats */}
                <div className="mt-8 p-4 bg-gray-50 rounded border">
                    <h3 className="font-medium text-gray-900 mb-3">Cumpleaños por Mes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {meses.map((mes) => {
                            const count = empleados.filter(e => {
                                const mesCumple = new Date(e.fecha_nacimiento).getMonth();
                                return meses[mesCumple] === mes;
                            }).length;
                            
                            return (
                                <div key={mes} className="text-center p-3 bg-white rounded border">
                                    <div className="text-sm font-medium text-gray-700">{mes.substring(0, 3)}</div>
                                    <div className="text-lg font-bold text-sat mt-1">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}