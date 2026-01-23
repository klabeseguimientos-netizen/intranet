// resources/js/Pages/RRHH/Equipos/EquipoTecnico.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Wrench,  Clock, CheckCircle, AlertTriangle, HardHat, Cpu, Settings, Zap } from 'lucide-react';

interface Tecnico {
    id: number;
    nombre: string;
    apellido: string;
    especialidad: string;
    nivel: string;
    certificaciones: string[];
    experiencia: number; // años
    servicios_mes: number;
    promedio_tiempo: number; // horas
    satisfaccion_cliente: number; // porcentaje
    disponibilidad: string;
    herramientas: string[];
    zona_cobertura: string[];
    ultimo_mantenimiento: string;
    estado: string;
}

interface Servicio {
    tipo: string;
    cantidad: number;
    tiempo_promedio: number;
    complejidad: string;
}

export default function EquipoTecnico() {
    const [tecnicos, setTecnicos] = useState<Tecnico[]>([
        { id: 1, nombre: 'Carlos', apellido: 'Gómez', especialidad: 'Instalaciones SAT', nivel: 'Senior', certificaciones: ['SAT Nivel 3', 'Fibra Óptica'], experiencia: 8, servicios_mes: 45, promedio_tiempo: 2.5, satisfaccion_cliente: 98, disponibilidad: 'Full Time', herramientas: ['Analizador SAT', 'Medidor de señal'], zona_cobertura: ['Capital Federal', 'GBA Norte'], ultimo_mantenimiento: '2024-01-15', estado: 'Activo' },
        { id: 2, nombre: 'Roberto', apellido: 'Mendoza', especialidad: 'Mantenimiento', nivel: 'Senior', certificaciones: ['SAT Nivel 2', 'Electrónica'], experiencia: 6, servicios_mes: 38, promedio_tiempo: 3.0, satisfaccion_cliente: 96, disponibilidad: 'Full Time', herramientas: ['Osciloscopio', 'Multímetro'], zona_cobertura: ['GBA Sur', 'La Plata'], ultimo_mantenimiento: '2024-01-20', estado: 'Activo' },
        { id: 3, nombre: 'Javier', apellido: 'Silva', especialidad: 'Reparaciones', nivel: 'Mid', certificaciones: ['SAT Nivel 1'], experiencia: 3, servicios_mes: 30, promedio_tiempo: 4.0, satisfaccion_cliente: 92, disponibilidad: 'Full Time', herramientas: ['Estación de soldadura', 'Tester'], zona_cobertura: ['Capital Federal'], ultimo_mantenimiento: '2024-01-10', estado: 'Activo' },
        { id: 4, nombre: 'Luis', apellido: 'Torres', especialidad: 'Instalaciones Fibra', nivel: 'Junior', certificaciones: ['Fibra Óptica Básica'], experiencia: 1, servicios_mes: 25, promedio_tiempo: 5.0, satisfaccion_cliente: 88, disponibilidad: 'Full Time', herramientas: ['Fusionadora', 'OTDR'], zona_cobertura: ['GBA Oeste'], ultimo_mantenimiento: '2024-01-05', estado: 'Capacitación' },
        { id: 5, nombre: 'Miguel', apellido: 'Rojas', especialidad: 'Soporte Técnico', nivel: 'Mid', certificaciones: ['SAT Nivel 2', 'Redes'], experiencia: 4, servicios_mes: 35, promedio_tiempo: 2.0, satisfaccion_cliente: 94, disponibilidad: 'Guardia', herramientas: ['Laptop diagnóstico', 'Software SAT'], zona_cobertura: ['Todas'], ultimo_mantenimiento: '2024-01-18', estado: 'Activo' },
    ]);

    const [servicios, setServicios] = useState<Servicio[]>([
        { tipo: 'Instalación SAT', cantidad: 120, tiempo_promedio: 3.0, complejidad: 'Media' },
        { tipo: 'Mantenimiento', cantidad: 85, tiempo_promedio: 2.5, complejidad: 'Baja' },
        { tipo: 'Reparación', cantidad: 65, tiempo_promedio: 4.5, complejidad: 'Alta' },
        { tipo: 'Instalación Fibra', cantidad: 40, tiempo_promedio: 5.0, complejidad: 'Alta' },
        { tipo: 'Soporte Remoto', cantidad: 200, tiempo_promedio: 1.0, complejidad: 'Baja' },
    ]);

    const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>('todos');
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<string>('todos');
    const [filtroZona, setFiltroZona] = useState<string>('todos');

    const filteredTecnicos = tecnicos.filter(t => {
        if (filtroEspecialidad !== 'todos' && t.especialidad !== filtroEspecialidad) return false;
        if (filtroDisponibilidad !== 'todos' && t.disponibilidad !== filtroDisponibilidad) return false;
        if (filtroZona !== 'todos' && !t.zona_cobertura.includes(filtroZona)) return false;
        return true;
    });

    const especialidades = ['Instalaciones SAT', 'Mantenimiento', 'Reparaciones', 'Instalaciones Fibra', 'Soporte Técnico'];
    const zonas = ['Capital Federal', 'GBA Norte', 'GBA Sur', 'GBA Oeste', 'La Plata', 'Todas'];

    const getNivelColor = (nivel: string) => {
        switch (nivel) {
            case 'Senior': return 'bg-purple-100 text-purple-800';
            case 'Mid': return 'bg-blue-100 text-blue-800';
            case 'Junior': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Activo': return 'bg-green-100 text-green-800';
            case 'Capacitación': return 'bg-yellow-100 text-yellow-800';
            case 'Guardia': return 'bg-blue-100 text-blue-800';
            case 'Vacaciones': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getComplejidadColor = (complejidad: string) => {
        switch (complejidad) {
            case 'Alta': return 'bg-red-100 text-red-800';
            case 'Media': return 'bg-yellow-100 text-yellow-800';
            case 'Baja': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const calcularTotalServicios = () => {
        return tecnicos.reduce((sum, t) => sum + t.servicios_mes, 0);
    };

    const calcularPromedioSatisfaccion = () => {
        return Math.round(tecnicos.reduce((sum, t) => sum + t.satisfaccion_cliente, 0) / tecnicos.length);
    };

    return (
        <AppLayout title="Equipo Técnico">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Equipo Técnico
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Gestión del equipo de instalación y mantenimiento
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Operaciones Técnicas
                        </h2>
                        <p className="text-sm text-gray-600">
                            Gestión de técnicos, servicios y cobertura
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-sat text-sat text-sm rounded hover:bg-sat-50 transition-colors">
                            Programar Servicio
                        </button>
                        <button className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors">
                            + Nuevo Técnico
                        </button>
                    </div>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Wrench size={20} className="text-blue-600" />
                            <div className="text-sm font-medium text-blue-700">Servicios/Mes</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                            {calcularTotalServicios()}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                            Promedio: {Math.round(calcularTotalServicios() / tecnicos.length)} por técnico
                        </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <div className="text-sm font-medium text-green-700">Satisfacción</div>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                            {calcularPromedioSatisfaccion()}%
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                            {tecnicos.filter(t => t.satisfaccion_cliente >= 90).length}/{tecnicos.length} excelente
                        </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={20} className="text-purple-600" />
                            <div className="text-sm font-medium text-purple-700">Tiempo Promedio</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                            {Math.round(tecnicos.reduce((sum, t) => sum + t.promedio_tiempo, 0) / tecnicos.length * 10) / 10}h
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                            Por servicio
                        </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                            <HardHat size={20} className="text-orange-600" />
                            <div className="text-sm font-medium text-orange-700">Experiencia Total</div>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                            {tecnicos.reduce((sum, t) => sum + t.experiencia, 0)} años
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                            Promedio: {Math.round(tecnicos.reduce((sum, t) => sum + t.experiencia, 0) / tecnicos.length)} años
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por especialidad</label>
                        <select
                            value={filtroEspecialidad}
                            onChange={(e) => setFiltroEspecialidad(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-sat focus:border-sat"
                        >
                            <option value="todos">Todas las especialidades</option>
                            {especialidades.map((esp) => (
                                <option key={esp} value={esp}>{esp}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por disponibilidad</label>
                        <select
                            value={filtroDisponibilidad}
                            onChange={(e) => setFiltroDisponibilidad(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-sat focus:border-sat"
                        >
                            <option value="todos">Todas las disponibilidades</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Guardia">Guardia</option>
                            <option value="Capacitación">Capacitación</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por zona</label>
                        <select
                            value={filtroZona}
                            onChange={(e) => setFiltroZona(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-sat focus:border-sat"
                        >
                            <option value="todos">Todas las zonas</option>
                            {zonas.map((zona) => (
                                <option key={zona} value={zona}>{zona}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Service Types */}
                <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Tipos de Servicio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {servicios.map((servicio, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-sat transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium text-gray-900">{servicio.tipo}</div>
                                        <div className="text-2xl font-bold text-sat">{servicio.cantidad}</div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getComplejidadColor(servicio.complejidad)}`}>
                                        {servicio.complejidad}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Tiempo promedio:</span>
                                        <span className="font-medium">{servicio.tiempo_promedio}h</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technicians Table */}
                <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Técnicos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Técnico</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Especialidad/Nivel</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Servicios Mes</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Tiempo Promedio</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Satisfacción</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Zona Cobertura</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredTecnicos.map((tecnico) => (
                                    <tr key={tecnico.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                    {tecnico.nombre.charAt(0)}{tecnico.apellido.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{tecnico.nombre} {tecnico.apellido}</div>
                                                    <div className="text-xs text-gray-500">{tecnico.disponibilidad}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Exp: {tecnico.experiencia} años
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                <div className="font-medium">{tecnico.especialidad}</div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getNivelColor(tecnico.nivel)}`}>
                                                    {tecnico.nivel}
                                                </span>
                                                <div className="text-xs text-gray-600">
                                                    {tecnico.certificaciones.length} certificaciones
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                <div className="font-bold text-gray-900">{tecnico.servicios_mes}</div>
                                                <div className="text-xs text-gray-600">
                                                    ~{Math.round(tecnico.servicios_mes / 30)} por día
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-blue-600" />
                                                <span className="font-medium">{tecnico.promedio_tiempo}h</span>
                                                <div className="text-xs text-gray-600">
                                                    por servicio
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            tecnico.satisfaccion_cliente >= 95 ? 'bg-green-500' :
                                                            tecnico.satisfaccion_cliente >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${tecnico.satisfaccion_cliente}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium">{tecnico.satisfaccion_cliente}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                {tecnico.zona_cobertura.map((zona, idx) => (
                                                    <span key={idx} className="block text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                                        {zona}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(tecnico.estado)}`}>
                                                {tecnico.estado}
                                            </span>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Último mantenimiento: {tecnico.ultimo_mantenimiento}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-2">
                                                <button className="text-sm text-sat hover:text-sat-600">
                                                    Asignar Servicio
                                                </button>
                                                <button className="text-sm text-green-600 hover:text-green-800">
                                                    Ver Herramientas
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Certifications & Tools */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-900 mb-3">Certificaciones del Equipo</h3>
                        <div className="space-y-3">
                            {Array.from(new Set(tecnicos.flatMap(t => t.certificaciones))).map((cert, index) => {
                                const count = tecnicos.filter(t => t.certificaciones.includes(cert)).length;
                                return (
                                    <div key={index} className="p-3 bg-white rounded border border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium text-gray-900">{cert}</div>
                                            <div className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                {count} técnicos
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {tecnicos.filter(t => t.certificaciones.includes(cert)).map(t => `${t.nombre} ${t.apellido}`).join(', ')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border">
                        <h3 className="font-medium text-gray-900 mb-3">Herramientas en Uso</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from(new Set(tecnicos.flatMap(t => t.herramientas))).map((herramienta, index) => (
                                <div key={index} className="p-3 bg-white rounded border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings size={14} className="text-gray-500" />
                                        <div className="font-medium text-gray-900 text-sm">{herramienta}</div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {tecnicos.filter(t => t.herramientas.includes(herramienta)).length} técnicos
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Coverage Map */}
                <div className="mt-6 p-4 bg-gradient-to-r from-sat-50 to-blue-50 rounded border border-sat-100">
                    <h3 className="font-medium text-gray-900 mb-3">Cobertura por Zona</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {zonas.map((zona) => {
                            const tecnicosZona = tecnicos.filter(t => t.zona_cobertura.includes(zona) || t.zona_cobertura.includes('Todas'));
                            return (
                                <div key={zona} className="p-3 bg-white rounded border">
                                    <div className="font-medium text-gray-900 text-sm mb-2">{zona}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-sat">{tecnicosZona.length}</span>
                                        <HardHat size={16} className="text-gray-400" />
                                    </div>
                                    <div className="text-xs text-gray-600">técnicos disponibles</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}