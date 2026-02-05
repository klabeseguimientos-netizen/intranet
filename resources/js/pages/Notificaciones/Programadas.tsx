// resources/js/Pages/Notificaciones/Programadas.tsx
import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertCircle, 
  FileText, 
  Users,
  CheckCircle,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  Eye,
  X,
  Menu,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

// Interfaz para los datos de paginación
interface PaginationData {
  data: any[];
  links: any[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

interface PageProps {
  auth: {
    user: any;
  };
  programadas: PaginationData;
  estadisticas: {
    total: number;
    hoy: number;
    semana: number;
    mes: number;
  };
  filtros: {
    tipo?: string;
    prioridad?: string;
    busqueda?: string;
  };
  tipos: Record<string, string>;
}

export default function Programadas({ 
  programadas = { data: [], links: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20 } }, 
  estadisticas = { total: 0, hoy: 0, semana: 0, mes: 0 }, 
  filtros = {}, 
  tipos = {} 
}: PageProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState(filtros.busqueda || '');
  const [filtrosLocales, setFiltrosLocales] = useState({
    tipo: filtros.tipo || '',
    prioridad: filtros.prioridad || ''
  });
  const [cargando, setCargando] = useState(false);
  const [mostrarMenuMovil, setMostrarMenuMovil] = useState(false);

  // Asegurar que programadas.data sea un array
  const notificaciones = Array.isArray(programadas.data) ? programadas.data : [];
  const meta = programadas.meta || { total: 0, current_page: 1, last_page: 1, per_page: 20 };
  const links = programadas.links || [];

  const aplicarFiltros = () => {
    const params: any = { ...filtrosLocales };
    if (busqueda.trim()) params.busqueda = busqueda.trim();
    
    router.get('/notificaciones/programadas', params, {
      preserveState: true,
      replace: true,
      onStart: () => setCargando(true),
      onFinish: () => setCargando(false),
    });
  };

  const limpiarFiltros = () => {
    setFiltrosLocales({ tipo: '', prioridad: '' });
    setBusqueda('');
    router.get('/notificaciones/programadas', {}, {
      preserveState: true,
      replace: true,
      onStart: () => setCargando(true),
      onFinish: () => setCargando(false),
    });
  };

  const getIconoPorTipo = (tipo: string) => {
    switch(tipo) {
      case 'lead_sin_contactar':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'lead_proximo_contacto':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'presupuesto_por_vencer':
      case 'presupuesto_vencido':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'contrato_por_vencer':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'recordatorio_seguimiento':
        return <CalendarDays className="h-5 w-5 text-purple-500" />;
      case 'asignacion_lead':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'comentario_recordatorio':
        return <CheckCircle className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLabelTipo = (tipo: string) => {
    return tipos[tipo] || tipo;
  };

  const getBadgePrioridad = (prioridad: string) => {
    switch(prioridad) {
      case 'urgente':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Alta</span>;
      case 'normal':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Normal</span>;
      case 'baja':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Baja</span>;
      default:
        return null;
    }
  };

  const getBadgeDias = (dias: number) => {
    if (dias === 0) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Hoy</span>;
    } else if (dias === 1) {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Mañana</span>;
    } else if (dias <= 7) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Próximos 7 días</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Futuro</span>;
    }
  };

  const formatFecha = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      
      if (fecha.toDateString() === hoy.toDateString()) {
        return `Hoy ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const navegarAEntidad = (notificacion: any) => {
    if (!notificacion.entidad_tipo || !notificacion.entidad_id) return;
    
    let ruta = '';
    switch(notificacion.entidad_tipo) {
      case 'lead':
        ruta = `/comercial/leads/${notificacion.entidad_id}`;
        break;
      case 'presupuesto':
        ruta = `/comercial/presupuestos/${notificacion.entidad_id}`;
        break;
      case 'contrato':
        ruta = `/comercial/cuentas/${notificacion.entidad_id}`;
        break;
      case 'comentario':
        ruta = `/comercial/leads/${notificacion.entidad_id}`;
        break;
      default:
        return;
    }
    
    router.visit(ruta);
  };

  return (
    <AppLayout title="Notificaciones Programadas">
      <Head title="Notificaciones Programadas" />
      
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
        {/* Header - Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                  Notificaciones Programadas
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {estadisticas.total > 0 
                    ? `${estadisticas.total} notificación(es) programada(s)` 
                    : 'No hay notificaciones programadas'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  * Solo se muestran notificaciones con fecha programada futura
                </p>
              </div>
              
              {/* Botón menú móvil */}
              <button
                onClick={() => setMostrarMenuMovil(!mostrarMenuMovil)}
                className="sm:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                {mostrarMenuMovil ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
            
            {/* Botones de acción - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => router.reload()}
                disabled={cargando}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Actualizar"
              >
                <RefreshCw className={`h-5 w-5 ${cargando ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>
          </div>
          
          {/* Botones de acción - Mobile (si menú está abierto) */}
          {mostrarMenuMovil && (
            <div className="sm:hidden mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => router.reload()}
                disabled={cargando}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Actualizar"
              >
                <RefreshCw className={`h-5 w-5 ${cargando ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => {
                  setMostrarFiltros(!mostrarFiltros);
                  setMostrarMenuMovil(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 justify-center"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>
          )}
          
          {/* Barra de búsqueda */}
          <div className="mt-3 sm:mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                placeholder="Buscar en notificaciones programadas..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Estadísticas - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Programadas hoy</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{estadisticas.hoy}</p>
              </div>
              <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Próxima semana</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{estadisticas.semana}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Próximo mes</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{estadisticas.mes}</p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total programadas</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filtros - Responsive */}
        {mostrarFiltros && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filtrosLocales.tipo}
                  onChange={(e) => setFiltrosLocales(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(tipos).map(([valor, label]) => (
                    <option key={valor} value={valor}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={filtrosLocales.prioridad}
                  onChange={(e) => setFiltrosLocales(prev => ({ ...prev, prioridad: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="urgente">Urgente</option>
                  <option value="alta">Alta</option>
                  <option value="normal">Normal</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Limpiar filtros
              </button>
              <button
                onClick={aplicarFiltros}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}

        {/* Lista de notificaciones programadas - Responsive */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {cargando ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 text-sm sm:text-base">Cargando notificaciones programadas...</p>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">
                {busqueda || filtrosLocales.tipo || filtrosLocales.prioridad 
                  ? 'No se encontraron notificaciones programadas con esos filtros' 
                  : 'No hay notificaciones programadas'
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Las notificaciones aparecerán aquí cuando se programen para fechas futuras
              </p>
              {(busqueda || filtrosLocales.tipo || filtrosLocales.prioridad) && (
                <button
                  onClick={limpiarFiltros}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                >
                  Limpiar filtros para ver todas
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {notificaciones.map((notificacion: any) => (
                  <div 
                    key={notificacion.id}
                    className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navegarAEntidad(notificacion)}
                  >
                    <div className="flex items-start">
                      <div className="mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0">
                        {getIconoPorTipo(notificacion.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {notificacion.titulo}
                              </h3>
                              <div className="flex items-center gap-1">
                                {notificacion.dias_faltantes !== undefined && getBadgeDias(notificacion.dias_faltantes)}
                                <div className="hidden sm:block">
                                  {getBadgePrioridad(notificacion.prioridad)}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                              {notificacion.mensaje}
                            </p>
                          </div>
                          
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                        
                        <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs text-gray-500">
                                {formatFecha(notificacion.fecha_notificacion)}
                              </span>
                            </div>
                            {/* Badge prioridad móvil */}
                            <div className="sm:hidden">
                              {getBadgePrioridad(notificacion.prioridad)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1 sm:mt-0">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {getLabelTipo(notificacion.tipo)}
                            </span>
                            
                            {notificacion.entidad_tipo && notificacion.entidad_id && (
                              <span className="text-xs text-gray-500">
                                {notificacion.entidad_tipo.charAt(0).toUpperCase() + notificacion.entidad_tipo.slice(1)} #{notificacion.entidad_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginación */}
              {links && links.length > 3 && (
                <div className="px-3 sm:px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Mostrando {notificaciones.length} de {meta.total} notificaciones programadas
                    </div>
                    
                    <div className="flex justify-center space-x-1 sm:space-x-2 overflow-x-auto">
                      {links.map((link: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (link.url) {
                              const url = new URL(link.url);
                              router.get(url.pathname + url.search, {}, {
                                preserveState: true,
                                onStart: () => setCargando(true),
                                onFinish: () => setCargando(false),
                              });
                            }
                          }}
                          disabled={!link.url || link.active}
                          className={`px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-md ${
                            link.active
                              ? 'bg-blue-600 text-white'
                              : link.url
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Información adicional */}
        <div className="mt-4 sm:mt-6 text-sm text-gray-500">
          <p>
            <strong>Nota:</strong> Las notificaciones programadas se convertirán en notificaciones activas 
            cuando llegue su fecha programada. Puedes ver las notificaciones activas en{' '}
            <button 
              onClick={() => router.visit('/notificaciones')}
              className="text-blue-600 hover:text-blue-800"
            >
              Notificaciones activas
            </button>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}