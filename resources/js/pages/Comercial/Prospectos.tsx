// resources/js/Pages/Comercial/Prospectos.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import VerComentariosModal from '@/components/Modals/VerComentariosModal';
import NuevoComentarioModal from '@/components/Modals/NuevoComentarioModal';
import EditarLeadModal from '@/components/Modals/EditarLeadModal';
import VerNotaModal from '@/components/Modals/VerNotaModal';
import {
    Lead,
    Origen,
    EstadoLead,
    TipoComentario,
    Rubro,
    Provincia,
    Comercial,
    NotaLead
} from '@/types/leads';
import { Eye, Edit, MessageSquare, FileText, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    leads: {
        data: Lead[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    estadisticas: {
        total: number;
        nuevo: number;
        contactado: number;
        calificado: number;
        propuesta: number;
        cerrado: number;
    };
    filters?: {
        search?: string;
        estado_id?: string;
        origen_id?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
    };
    usuario: {
        ve_todas_cuentas: boolean;
        rol_id: number;
        personal_id: number;
        nombre_completo?: string;
        comercial?: {
            es_comercial: boolean;
            prefijo_id?: number;
        } | null;
    };
    origenes: Origen[];
    estadosLead: EstadoLead[];
    tiposComentario: TipoComentario[];
    rubros: Rubro[];
    comerciales: Comercial[];
    provincias: Provincia[];
    hay_comerciales: boolean;
}

// Componente de calendario simple
interface CalendarProps {
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    month: Date;
    onMonthChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
}

const MiniCalendar: React.FC<CalendarProps> = ({ 
    selectedDate, 
    onSelectDate, 
    month, 
    onMonthChange,
    minDate,
    maxDate
}) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    
    const handlePrevMonth = () => {
        const prevMonth = new Date(month);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        onMonthChange(prevMonth);
    };
    
    const handleNextMonth = () => {
        const nextMonth = new Date(month);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        onMonthChange(nextMonth);
    };
    
    const isDateDisabled = (date: Date): boolean => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };
    
    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            {/* Header del calendario */}
            <div className="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                    {format(month, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
            </div>
            
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
                {/* Espacios vacíos al inicio */}
                {Array.from({ length: start.getDay() === 0 ? 6 : start.getDay() - 1 }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-7"></div>
                ))}
                
                {days.map((day) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);
                    const isCurrentMonth = isSameMonth(day, month);
                    const disabled = isDateDisabled(day);
                    
                    return (
                        <button
                            key={day.toString()}
                            type="button"
                            onClick={() => !disabled && onSelectDate(day)}
                            disabled={disabled}
                            className={`
                                h-7 w-7 flex items-center justify-center text-xs rounded
                                ${isSelected ? 'bg-blue-600 text-white' : ''}
                                ${!isSelected && isCurrentDay ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                                ${!isSelected && !isCurrentDay && isCurrentMonth ? 'text-gray-700 hover:bg-gray-100' : ''}
                                ${!isSelected && !isCurrentMonth ? 'text-gray-400' : ''}
                                ${disabled ? 'text-gray-300 cursor-not-allowed hover:bg-transparent' : ''}
                            `}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default function Prospectos({ 
    leads, 
    estadisticas, 
    filters = {},
    usuario, 
    origenes, 
    estadosLead, 
    tiposComentario = [],
    rubros = [], 
    comerciales = [], 
    provincias = [],
    hay_comerciales = false 
}: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedEstado, setSelectedEstado] = useState(filters?.estado_id || '');
    const [selectedOrigen, setSelectedOrigen] = useState(filters?.origen_id || '');
    const [fechaInicio, setFechaInicio] = useState(filters?.fecha_inicio || '');
    const [fechaFin, setFechaFin] = useState(filters?.fecha_fin || '');
    const [showFilters, setShowFilters] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCalendarDesde, setShowCalendarDesde] = useState(false);
    const [showCalendarHasta, setShowCalendarHasta] = useState(false);
    const [currentMonthDesde, setCurrentMonthDesde] = useState<Date>(new Date());
    const [currentMonthHasta, setCurrentMonthHasta] = useState<Date>(new Date());
    const { data: leadsData, current_page, last_page, total, per_page } = leads;
    
    // Referencias para detectar clics fuera
    const datePickerRef = useRef<HTMLDivElement>(null);
    const calendarDesdeRef = useRef<HTMLDivElement>(null);
    const calendarHastaRef = useRef<HTMLDivElement>(null);
    
    // Estados para los modales
    const [showVerComentarios, setShowVerComentarios] = useState(false);
    const [showNuevoComentario, setShowNuevoComentario] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [showVerNota, setShowVerNota] = useState(false);

    // Cerrar calendarios al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarDesdeRef.current && !calendarDesdeRef.current.contains(event.target as Node)) {
                setShowCalendarDesde(false);
            }
            if (calendarHastaRef.current && !calendarHastaRef.current.contains(event.target as Node)) {
                setShowCalendarHasta(false);
            }
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Función para construir parámetros de consulta
    const getQueryParams = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedEstado) params.append('estado_id', selectedEstado);
        if (selectedOrigen) params.append('origen_id', selectedOrigen);
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        return params.toString() ? `?${params.toString()}` : '';
    };

    // Aplicar filtros automáticamente cuando cambian estado y origen
    useEffect(() => {
        const applyFiltersWithDelay = setTimeout(() => {
            if (selectedEstado || selectedOrigen) {
                applyFilters();
            }
        }, 300);

        return () => clearTimeout(applyFiltersWithDelay);
    }, [selectedEstado, selectedOrigen]);

    // Aplicar filtros automáticamente cuando cambian fechas
    useEffect(() => {
        const applyDateFiltersWithDelay = setTimeout(() => {
            if (fechaInicio && fechaFin) {
                applyFilters();
            }
        }, 300);

        return () => clearTimeout(applyDateFiltersWithDelay);
    }, [fechaInicio, fechaFin]);

    // Función para buscar
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    // Aplicar todos los filtros
    const applyFilters = () => {
        const filters: any = {};
        
        if (search) filters.search = search;
        if (selectedEstado) filters.estado_id = selectedEstado;
        if (selectedOrigen) filters.origen_id = selectedOrigen;
        if (fechaInicio) filters.fecha_inicio = fechaInicio;
        if (fechaFin) filters.fecha_fin = fechaFin;
        
        router.get('/comercial/prospectos', filters, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para limpiar todos los filtros
    const clearAllFilters = () => {
        setSearch('');
        setSelectedEstado('');
        setSelectedOrigen('');
        setFechaInicio('');
        setFechaFin('');
        
        router.get('/comercial/prospectos', {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para limpiar filtro de fechas
    const clearDateFilter = () => {
        setFechaInicio('');
        setFechaFin('');
        setShowDatePicker(false);
        
        const filters: any = {};
        if (search) filters.search = search;
        if (selectedEstado) filters.estado_id = selectedEstado;
        if (selectedOrigen) filters.origen_id = selectedOrigen;
        
        router.get('/comercial/prospectos', filters, {
            preserveState: true,
            replace: true,
        });
    };

    // Formatear fecha
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return 'Fecha inválida';
        }
    };

    // Formatear fecha para input date (YYYY-MM-DD)
    const formatDateForInput = (date: Date): string => {
        return format(date, 'yyyy-MM-dd');
    };

    // Obtener fecha de hoy
    const getToday = (): Date => {
        return new Date();
    };

    // Obtener fecha de hace 30 días
    const getLast30Days = (): Date => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    };

    // Obtener fecha de hace 7 días
    const getLast7Days = (): Date => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    };

    // Manejar selección de fecha desde
    const handleSelectDateDesde = (date: Date) => {
        const formattedDate = formatDateForInput(date);
        setFechaInicio(formattedDate);
        setShowCalendarDesde(false);
        
        // Si hay fecha fin y la nueva fecha desde es después, ajustar fecha fin
        if (fechaFin && new Date(formattedDate) > new Date(fechaFin)) {
            setFechaFin(formattedDate);
        }
    };

    // Manejar selección de fecha hasta
    const handleSelectDateHasta = (date: Date) => {
        const formattedDate = formatDateForInput(date);
        setFechaFin(formattedDate);
        setShowCalendarHasta(false);
        
        // Si hay fecha inicio y la nueva fecha hasta es antes, ajustar fecha inicio
        if (fechaInicio && new Date(formattedDate) < new Date(fechaInicio)) {
            setFechaInicio(formattedDate);
        }
    };

    // Función para aplicar rango de fechas rápido
    const applyQuickDateRange = (range: 'today' | 'week' | 'month' | 'all') => {
        const today = getToday();
        let startDate: Date | null = null;
        let endDate = today;
        
        switch(range) {
            case 'today':
                startDate = today;
                break;
            case 'week':
                startDate = getLast7Days();
                break;
            case 'month':
                startDate = getLast30Days();
                break;
            case 'all':
                setFechaInicio('');
                setFechaFin('');
                setShowDatePicker(false);
                applyFilters();
                return;
        }
        
        if (startDate) {
            setFechaInicio(formatDateForInput(startDate));
            setFechaFin(formatDateForInput(endDate));
            setShowDatePicker(false);
        }
    };

    // Formatear fecha larga
    const formatDateLong = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
        } catch {
            return 'Fecha inválida';
        }
    };

    // Obtener origen
    const getOrigen = (origenId: number) => {
        return origenes.find(o => o.id === origenId);
    };

    // Obtener estado lead
    const getEstadoLead = (estadoId: number) => {
        return estadosLead.find(e => e.id === estadoId);
    };

    // Obtener color del género
    const getGeneroColor = (genero: string) => {
        const colores: Record<string, string> = {
            masculino: 'bg-blue-100 text-blue-800',
            femenino: 'bg-pink-100 text-pink-800',
            otro: 'bg-purple-100 text-purple-800',
            no_especifica: 'bg-gray-100 text-gray-800',
        };
        return colores[genero] || 'bg-gray-100 text-gray-800';
    };

    // Funciones para abrir modales
    const abrirVerComentarios = (lead: Lead) => {
        setSelectedLead(lead);
        setShowVerComentarios(true);
    };

    const abrirNuevoComentario = (lead: Lead) => {
        setSelectedLead(lead);
        setShowNuevoComentario(true);
    };
    
    const abrirEditarLead = (lead: Lead) => {
        setSelectedLead(lead);
        setShowModalEditar(true);
    };

    const abrirVerNota = (lead: Lead) => {
        setSelectedLead(lead);
        setShowVerNota(true);
    };

    const cerrarModales = () => {
        setShowVerComentarios(false);
        setShowNuevoComentario(false);
        setShowModalEditar(false);
        setShowVerNota(false);
        setSelectedLead(null);
    };

    // Función para verificar si un lead tiene notas
    const tieneNotas = (lead: Lead) => {
        if (lead.notas && Array.isArray(lead.notas)) {
            return lead.notas.length > 0;
        }
        return (lead as any).notas_count > 0 || (lead as any).tiene_notas > 0;
    };

    // Función para obtener la última nota
    const obtenerUltimaNota = (lead: Lead): NotaLead | null => {
        if (!lead.notas || !Array.isArray(lead.notas) || lead.notas.length === 0) {
            return null;
        }
        
        const notasOrdenadas = [...lead.notas].sort((a, b) => 
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        
        return notasOrdenadas[0];
    };

    // Función para obtener el texto del tipo de nota
    const getTipoNotaText = (tipo: string) => {
        const tipos: Record<string, string> = {
            'informacion_cliente': 'Info Cliente',
            'detalle_contacto': 'Detalle Contacto',
            'observacion_inicial': 'Nota Inicial'
        };
        return tipos[tipo] || 'Nota';
    };

    // Verificar si hay filtros activos
    const hasActiveFilters = search || selectedEstado || selectedOrigen || fechaInicio || fechaFin;

    return (
        <AppLayout title="Prospectos">
            <Head title="Prospectos" />
            
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Prospectos
                        </h1>
                        <p className="mt-1 text-gray-600 text-base">
                            Gestión de leads y prospectos comerciales
                        </p>
                    </div>
                    
                    {/* Indicador de permisos */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            usuario.ve_todas_cuentas 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {usuario.ve_todas_cuentas ? '🔓 Ve todos los prospectos' : '🔒 Prospectos limitados'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                        >
                            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Pipeline de Prospectos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Pipeline de Prospectos
                    </h2>
                    <Link 
                        href="/comercial/leads/create" 
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors w-full md:w-auto text-center"
                    >
                        + Nuevo Prospecto
                    </Link>
                </div>
                
                {/* Estadísticas del Pipeline - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Nuevo</h3>
                        <p className="text-xl md:text-2xl font-bold text-gray-900">{estadisticas.nuevo}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center hover:bg-blue-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Contactado</h3>
                        <p className="text-xl md:text-2xl font-bold text-blue-600">{estadisticas.contactado}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center hover:bg-yellow-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Calificado</h3>
                        <p className="text-xl md:text-2xl font-bold text-yellow-600">{estadisticas.calificado}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center hover:bg-purple-100 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Propuesta</h3>
                        <p className="text-xl md:text-2xl font-bold text-purple-600">{estadisticas.propuesta}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center hover:bg-green-100 transition-colors cursor-pointer col-span-2 sm:col-span-1 md:col-auto">
                        <h3 className="font-medium text-gray-700 text-xs md:text-sm mb-1">Cerrado</h3>
                        <p className="text-xl md:text-2xl font-bold text-green-600">{estadisticas.cerrado}</p>
                    </div>
                </div>
                
                {/* Barra de búsqueda y filtros - Responsive */}
                <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-6`}>
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o teléfono..."
                                className="flex-grow px-3 py-2 border border-gray-300 rounded text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors flex-1"
                                >
                                    Buscar
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearAllFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors flex-1"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                    
                    {/* Filtros adicionales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <select 
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                            value={selectedEstado}
                            onChange={(e) => setSelectedEstado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            {estadosLead.map(estado => (
                                <option key={estado.id} value={estado.id}>
                                    {estado.nombre}
                                </option>
                            ))}
                        </select>
                        <select 
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                            value={selectedOrigen}
                            onChange={(e) => setSelectedOrigen(e.target.value)}
                        >
                            <option value="">Todos los orígenes</option>
                            {origenes.map(origen => (
                                <option key={origen.id} value={origen.id}>
                                    {origen.nombre}
                                </option>
                            ))}
                        </select>
                        
                        {/* Filtro de fecha - con calendarios */}
                        <div className="relative" ref={datePickerRef}>
                            <div 
                                className={`w-full px-3 py-2 border border-gray-300 rounded text-sm flex items-center justify-between cursor-pointer ${fechaInicio || fechaFin ? 'bg-blue-50 border-blue-300' : ''}`}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                        {fechaInicio && fechaFin 
                                            ? `${formatDate(fechaInicio)} - ${formatDate(fechaFin)}`
                                            : 'Rango de fecha'}
                                    </span>
                                </div>
                                {(fechaInicio || fechaFin) && (
                                    <div 
                                        className="text-gray-500 hover:text-gray-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearDateFilter();
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Selector de fechas desplegable */}
                            {showDatePicker && (
                                <div className="absolute z-10 mt-1 w-full md:w-[600px] bg-white border border-gray-300 rounded-lg shadow-lg">
                                    <div className="p-4">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Rápidos</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => applyQuickDateRange('today')}
                                                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                                                >
                                                    Hoy
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyQuickDateRange('week')}
                                                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                                                >
                                                    Últimos 7 días
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyQuickDateRange('month')}
                                                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                                                >
                                                    Últimos 30 días
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyQuickDateRange('all')}
                                                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                                                >
                                                    Todo el tiempo
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {/* Selector de fecha DESDE */}
                                            <div className="flex-1">
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Desde
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={fechaInicio}
                                                            max={formatDateForInput(getToday())}
                                                            onChange={(e) => setFechaInicio(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCalendarDesde(!showCalendarDesde)}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                        >
                                                            <Calendar className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Calendario DESDE */}
                                                {showCalendarDesde && (
                                                    <div ref={calendarDesdeRef} className="mt-2">
                                                        <MiniCalendar
                                                            selectedDate={fechaInicio ? new Date(fechaInicio) : null}
                                                            onSelectDate={handleSelectDateDesde}
                                                            month={currentMonthDesde}
                                                            onMonthChange={setCurrentMonthDesde}
                                                            maxDate={getToday()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Selector de fecha HASTA */}
                                            <div className="flex-1">
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Hasta
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={fechaFin}
                                                            max={formatDateForInput(getToday())}
                                                            min={fechaInicio}
                                                            onChange={(e) => setFechaFin(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCalendarHasta(!showCalendarHasta)}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                        >
                                                            <Calendar className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Calendario HASTA */}
                                                {showCalendarHasta && (
                                                    <div ref={calendarHastaRef} className="mt-2">
                                                        <MiniCalendar
                                                            selectedDate={fechaFin ? new Date(fechaFin) : null}
                                                            onSelectDate={handleSelectDateHasta}
                                                            month={currentMonthHasta}
                                                            onMonthChange={setCurrentMonthHasta}
                                                            minDate={fechaInicio ? new Date(fechaInicio) : undefined}
                                                            maxDate={getToday()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-600">
                                                    {fechaInicio && fechaFin && (
                                                        <span>
                                                            Mostrando registros del {formatDate(fechaInicio)} al {formatDate(fechaFin)}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDatePicker(false)}
                                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cerrar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Mostrar filtros activos */}
                    {hasActiveFilters && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-blue-700">Filtros activos:</span>
                                
                                {search && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                                        Búsqueda: "{search}"
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch('');
                                                const filters: any = {};
                                                if (selectedEstado) filters.estado_id = selectedEstado;
                                                if (selectedOrigen) filters.origen_id = selectedOrigen;
                                                if (fechaInicio) filters.fecha_inicio = fechaInicio;
                                                if (fechaFin) filters.fecha_fin = fechaFin;
                                                router.get('/comercial/prospectos', filters, { preserveState: true });
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                
                                {selectedEstado && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                                        Estado: {estadosLead.find(e => e.id === parseInt(selectedEstado))?.nombre}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedEstado('');
                                                const filters: any = {};
                                                if (search) filters.search = search;
                                                if (selectedOrigen) filters.origen_id = selectedOrigen;
                                                if (fechaInicio) filters.fecha_inicio = fechaInicio;
                                                if (fechaFin) filters.fecha_fin = fechaFin;
                                                router.get('/comercial/prospectos', filters, { preserveState: true });
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                
                                {selectedOrigen && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                                        Origen: {origenes.find(o => o.id === parseInt(selectedOrigen))?.nombre}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedOrigen('');
                                                const filters: any = {};
                                                if (search) filters.search = search;
                                                if (selectedEstado) filters.estado_id = selectedEstado;
                                                if (fechaInicio) filters.fecha_inicio = fechaInicio;
                                                if (fechaFin) filters.fecha_fin = fechaFin;
                                                router.get('/comercial/prospectos', filters, { preserveState: true });
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                
                                {fechaInicio && fechaFin && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                                        Fecha: {formatDate(fechaInicio)} - {formatDate(fechaFin)}
                                        <button
                                            type="button"
                                            onClick={clearDateFilter}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Tabla de Prospectos - Responsive */}
                {leadsData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay prospectos disponibles
                        </h3>
                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                            {hasActiveFilters 
                                ? 'No se encontraron prospectos con los filtros aplicados.'
                                : 'No hay prospectos registrados en el sistema.'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="mt-3 px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Versión móvil - Cards */}
                        <div className="md:hidden space-y-4">
                            {leadsData.map((lead) => {
                                const origen = getOrigen(lead.origen_id!);
                                const estado = getEstadoLead(lead.estado_lead_id);
                                const ultimaNota = obtenerUltimaNota(lead);
                                
                                return (
                                    <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {lead.nombre_completo || 'Sin nombre'}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    ID: {lead.id}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getGeneroColor(lead.genero)}`}>
                                                {lead.genero === 'masculino' ? '♂' : 
                                                 lead.genero === 'femenino' ? '♀' : 
                                                 lead.genero === 'otro' ? '⚧' : '?'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center text-sm">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-600">{lead.email || 'Sin email'}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-gray-600">{lead.telefono || 'Sin teléfono'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {estado && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" 
                                                      style={{ backgroundColor: `${estado.color_hex}20`, color: estado.color_hex }}>
                                                    {estado.nombre}
                                                </span>
                                            )}
                                            {origen && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" 
                                                      style={{ backgroundColor: `${origen.color}20`, color: origen.color }}>
                                                    {origen.nombre}
                                                </span>
                                            )}
                                        </div>

                                        {/* Indicador de nota si existe */}
                                        {tieneNotas(lead) && (
                                            <div className="mb-3 p-2 bg-purple-50 border border-purple-100 rounded text-xs">
                                                <div className="flex items-center gap-1 text-purple-700">
                                                    <FileText className="w-3 h-3" />
                                                    <span className="font-medium">Tiene nota:</span>
                                                    <span className="text-purple-600">
                                                        {ultimaNota ? `${getTipoNotaText(ultimaNota.tipo)} - ${formatDate(ultimaNota.created)}` : 'Ver nota'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">
                                                Registro: {formatDate(lead.created)}
                                            </span>
                                            <div className="flex space-x-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => abrirVerComentarios(lead)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="Ver comentarios"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => abrirEditarLead(lead)}
                                                    className="text-sat hover:text-sat-600 p-1"
                                                    title="Editar lead"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                
                                                <button 
                                                    type="button"
                                                    onClick={() => abrirNuevoComentario(lead)}
                                                    className="text-green-600 hover:text-green-800 p-1"
                                                    title="Nuevo seguimiento"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </button>
                                                
                                                {/* Mostrar botón de Nota solo si tiene notas */}
                                                {tieneNotas(lead) && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => abrirVerNota(lead)}
                                                        className="text-purple-600 hover:text-purple-800 p-1"
                                                        title="Ver nota"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Versión desktop - Tabla */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prospecto
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Género
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Origen
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registro
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leadsData.map((lead) => {
                                        const origen = getOrigen(lead.origen_id!);
                                        const estado = getEstadoLead(lead.estado_lead_id);
                                        const ultimaNota = obtenerUltimaNota(lead);
                                        
                                        return (
                                            <tr key={lead.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {lead.nombre_completo || 'Sin nombre'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ID: {lead.id}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm text-gray-900">{lead.email || 'Sin email'}</p>
                                                        <p className="text-xs text-gray-500">{lead.telefono || 'Sin teléfono'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGeneroColor(lead.genero)}`}>
                                                        {lead.genero === 'masculino' ? '♂ Masculino' : 
                                                         lead.genero === 'femenino' ? '♀ Femenino' : 
                                                         lead.genero === 'otro' ? '⚧ Otro' : 'No especifica'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {estado && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                                              style={{ backgroundColor: `${estado.color_hex}20`, color: estado.color_hex }}>
                                                            {estado.nombre}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {origen && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                                                              style={{ backgroundColor: `${origen.color}20`, color: origen.color }}>
                                                            {origen.nombre}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {formatDate(lead.created)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => abrirVerComentarios(lead)}
                                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                                                            title="Ver comentarios"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Ver
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => abrirEditarLead(lead)}
                                                            className="inline-flex items-center text-sat hover:text-sat-600 text-sm px-2 py-1 hover:bg-sat/10 rounded transition-colors"
                                                            title="Editar lead"
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Editar
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => abrirNuevoComentario(lead)}
                                                            className="inline-flex items-center text-green-600 hover:text-green-800 text-sm px-2 py-1 hover:bg-green-50 rounded transition-colors"
                                                            title="Nuevo seguimiento"
                                                        >
                                                            <MessageSquare className="h-4 w-4 mr-1" />
                                                            Seguimiento
                                                        </button>
                                                        
                                                        {/* Mostrar botón de Nota solo si tiene notas */}
                                                        {tieneNotas(lead) && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => abrirVerNota(lead)}
                                                                className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm px-2 py-1 hover:bg-purple-50 rounded transition-colors"
                                                                title="Ver nota"
                                                            >
                                                                <FileText className="h-4 w-4 mr-1" />
                                                                Nota
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Paginación - Responsive */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                            <div className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{(current_page - 1) * per_page + 1}</span> a{' '}
                                <span className="font-medium">
                                    {Math.min(current_page * per_page, total)}
                                </span>{' '}
                                de <span className="font-medium">{total}</span> prospectos
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => router.get(`/comercial/prospectos?page=${current_page - 1}${getQueryParams()}`)}
                                    disabled={current_page === 1}
                                    className={`px-3 py-1 border rounded text-sm ${current_page === 1 
                                        ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    ← Anterior
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700 hidden sm:inline">
                                    Página {current_page} de {last_page}
                                </span>
                                <div className="flex items-center space-x-1 sm:hidden">
                                    <span className="text-sm text-gray-700">{current_page}</span>
                                    <span className="text-sm text-gray-400">/</span>
                                    <span className="text-sm text-gray-700">{last_page}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.get(`/comercial/prospectos?page=${current_page + 1}${getQueryParams()}`)}
                                    disabled={current_page === last_page}
                                    className={`px-3 py-1 border rounded text-sm ${current_page === last_page 
                                        ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                                        : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modales separados */}
            <VerComentariosModal
                isOpen={showVerComentarios}
                onClose={cerrarModales}
                lead={selectedLead}
                onAddNewComment={() => {
                    setShowVerComentarios(false);
                    setShowNuevoComentario(true);
                }}
            />
            
            <NuevoComentarioModal
                isOpen={showNuevoComentario}
                onClose={cerrarModales}
                lead={selectedLead}
                tiposComentario={tiposComentario}
            />
            
            <EditarLeadModal
                isOpen={showModalEditar}
                onClose={cerrarModales}
                lead={selectedLead}
                origenes={origenes}
                rubros={rubros}
                comerciales={comerciales}
                provincias={provincias}
                usuario={usuario}
                onSuccess={() => {
                    router.reload({ only: ['leads'] });
                }}
            />
            
            <VerNotaModal
                isOpen={showVerNota}
                onClose={cerrarModales}
                lead={selectedLead}
            />
        </AppLayout>
    );
}