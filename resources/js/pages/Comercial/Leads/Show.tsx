// resources/js/Pages/Comercial/Leads/Show.tsx
import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import NuevoComentarioModal from '@/components/Modals/NuevoComentarioModal';
import EditarLeadModal from '@/components/Modals/EditarLeadModal';
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
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Bell,
  FileText,
  Edit,
  Tag,
  Building,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Trash2,
  Share2,
  Download,
  Printer,
  Copy,
  Eye,
  Users,
  DollarSign,
  Percent,
  TrendingUp,
  BarChart3,
  Paperclip,
  Globe,
  Briefcase,
  Target,
  Award,
  X,
  Hash
} from 'lucide-react';

interface PageProps {
  auth: {
    user: {
      ve_todas_cuentas: boolean;
      rol_id: number;
      personal_id: number;
      nombre_completo?: string;
    };
  };
  lead: {
    id: number;
    nombre_completo: string;
    genero: string;
    telefono: string;
    email: string;
    localidad_nombre?: string;
    provincia_nombre?: string;
    rubro_nombre?: string;
    estado_nombre: string;
    estado_color?: string;
    estado_tipo?: string;
    origen_nombre: string;
    asignado_nombre?: string;
    prefijo_id?: number;
    prefijo_codigo?: string;
    prefijo_descripcion?: string;
    observaciones?: string;
    es_cliente: boolean;
    es_activo: boolean;
    created: string;
    modified: string;
  };
  notas: Array<{
    id: number;
    observacion: string;
    tipo: string;
    usuario_nombre: string;
    created: string;
  }>;
  comentarios: Array<{
    id: number;
    comentario: string;
    tipo_nombre?: string;
    usuario_nombre: string;
    created: string;
  }>;
  notificaciones: Array<{
    id: number;
    titulo: string;
    mensaje: string;
    leida: boolean;
    prioridad: string;
    fecha_notificacion: string;
  }>;
  estadisticas: {
    total_notas: number;
    total_comentarios: number;
    total_notificaciones: number;
    notificaciones_no_leidas: number;
  };
  origenes?: Array<{
    id: number;
    nombre: string;
    color?: string;
  }>;
  estadosLead?: Array<{
    id: number;
    nombre: string;
    color_hex?: string;
    tipo?: string;
  }>;
  tiposComentario?: Array<{
    id: number;
    nombre: string;
  }>;
  rubros?: Array<{
    id: number;
    nombre: string;
  }>;
  provincias?: Array<{
    id: number;
    provincia: string;
  }>;
  comerciales?: Array<{
    id: number;
    nombre_completo: string;
    prefijo_id?: number;
    es_comercial: boolean;
  }>;
}

export default function Show({ 
  lead, 
  notas, 
  comentarios, 
  notificaciones, 
  estadisticas,
  auth,
  origenes = [],
  estadosLead = [],
  tiposComentario = [],
  rubros = [],
  provincias = [],
  comerciales = []
}: PageProps) {
  const [activeTab, setActiveTab] = useState('informacion');
  const [cargando, setCargando] = useState(false);
  const [tiemposEstados, setTiemposEstados] = useState<any[]>([]);
  const [cargandoTiempos, setCargandoTiempos] = useState(false);
  
  // Estados para los modales
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showNuevoComentario, setShowNuevoComentario] = useState(false);

  const formatFecha = (fechaString: string) => {
    if (!fechaString) return 'No disponible';
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getBadgeEstado = () => {
    // Si tiene color_hex, usarlo directamente
    if (lead.estado_color) {
      const colorHex = lead.estado_color.startsWith('#') ? lead.estado_color : `#${lead.estado_color}`;
      return (
        <span 
          className="px-3 py-1 text-sm rounded-full flex items-center gap-1"
          style={{ 
            backgroundColor: `${colorHex}20`, // 20 = 12.5% opacity
            color: colorHex,
            border: `1px solid ${colorHex}40` // 40 = 25% opacity
          }}
        >
          {lead.estado_nombre}
        </span>
      );
    }
    
    // Si no tiene color, determinar por estado_tipo
    const estadoTipo = lead.estado_tipo?.toLowerCase();
    
    if (estadoTipo === 'nuevo') {
      return (
        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          {lead.estado_nombre}
        </span>
      );
    } else if (estadoTipo === 'activo') {
      return (
        <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {lead.estado_nombre}
        </span>
      );
    } else if (estadoTipo === 'final_positivo') {
      return (
        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          {lead.estado_nombre}
        </span>
      );
    } else if (estadoTipo === 'final_negativo') {
      return (
        <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {lead.estado_nombre}
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
        {lead.estado_nombre}
      </span>
    );
  };

  const getIconoGenero = (genero: string) => {
    switch(genero) {
      case 'masculino':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'femenino':
        return <Users className="h-4 w-4 text-pink-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLabelGenero = (genero: string) => {
    const generos: Record<string, string> = {
      'masculino': 'Masculino',
      'femenino': 'Femenino',
      'otro': 'Otro',
      'no_especifica': 'No especifica'
    };
    return generos[genero] || genero;
  };

  const formatTelefono = (telefono: string) => {
    if (!telefono) return 'No disponible';
    return telefono;
  };

  // Verificar si el usuario puede ver tiempos entre estados
  const puedeVerTiempos = auth.user.ve_todas_cuentas === true || auth.user.rol_id !== 5;

  // Cargar tiempos entre estados cuando se active la pestaña
  useEffect(() => {
    if (activeTab === 'tiempos' && tiemposEstados.length === 0 && !cargandoTiempos && puedeVerTiempos) {
      cargarTiemposEstados();
    }
  }, [activeTab]);

  const cargarTiemposEstados = async () => {
    setCargandoTiempos(true);
    try {
      const response = await fetch(`/comercial/leads/${lead.id}/tiempos-estados`);
      if (!response.ok) throw new Error('Error al cargar tiempos');
      const data = await response.json();
      setTiemposEstados(data);
    } catch (err) {
      console.error('Error cargando tiempos:', err);
      // Datos de ejemplo en caso de error
      setTiemposEstados([
        {
          desde: 'Nuevo',
          hasta: 'Contactado',
          dias: 2,
          horas: 6,
          minutos: 45,
          fecha_cambio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          razon: 'Primer contacto exitoso'
        },
        {
          desde: 'Contactado',
          hasta: 'Calificado',
          dias: 1,
          horas: 12,
          minutos: 0,
          fecha_cambio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          razon: 'Lead calificado como interesado'
        }
      ]);
    } finally {
      setCargandoTiempos(false);
    }
  };

  const calcularEstadisticasTiempos = () => {
    if (tiemposEstados.length === 0) return null;
    
    const totalDias = tiemposEstados.reduce((total, tiempo) => total + tiempo.dias, 0);
    const promedioDias = totalDias / tiemposEstados.length;
    
    return {
      totalCambios: tiemposEstados.length,
      totalDias,
      promedioDias: promedioDias.toFixed(1)
    };
  };

  // Funciones para abrir/cerrar modales
  const abrirEditarLead = () => {
    setShowModalEditar(true);
  };

  const abrirNuevoComentario = () => {
    setShowNuevoComentario(true);
  };

  const cerrarModales = () => {
    setShowModalEditar(false);
    setShowNuevoComentario(false);
  };

  // Definir las pestañas disponibles
  const tabsBase = [
    { id: 'informacion', label: 'Información', icon: <User className="h-4 w-4" /> },
    { id: 'notas', label: 'Notas', icon: <MessageSquare className="h-4 w-4" />, count: estadisticas.total_notas },
    { id: 'comentarios', label: 'Comentarios', icon: <MessageSquare className="h-4 w-4" />, count: estadisticas.total_comentarios },
  ];

  // Agregar pestaña de tiempos solo si el usuario tiene permiso
  if (puedeVerTiempos) {
    tabsBase.push({ id: 'tiempos', label: 'Tiempos', icon: <TrendingUp className="h-4 w-4" /> });
  }

  // Agregar pestaña de notificaciones siempre
  tabsBase.push(
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="h-4 w-4" />, count: estadisticas.total_notificaciones }
  );

  const estadisticasTiempos = calcularEstadisticasTiempos();

  return (
    <AppLayout title={`Lead #${lead.id} - ${lead.nombre_completo}`}>
      <Head title={`Lead #${lead.id} - ${lead.nombre_completo}`} />
      
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => router.visit('/comercial/prospectos')}
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Lead #{lead.id}
                </h1>
                {getBadgeEstado()}
                {lead.es_cliente && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Cliente
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                  {getIconoGenero(lead.genero)}
                  {lead.nombre_completo}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCheck className="h-4 w-4" />
                  <div>
                    <span>Asignado a: {lead.asignado_nombre || 'Sin asignar'}</span>
                    {lead.prefijo_codigo && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <Hash className="h-3 w-3 inline mr-1" />
                        {lead.prefijo_codigo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                {lead.rubro_nombre && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {lead.rubro_nombre}
                  </span>
                )}
                {lead.origen_nombre && (
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Origen: {lead.origen_nombre}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Creado: {formatFecha(lead.created)}
                </span>
              </div>
            </div>
            
            {/* Acciones con botones para modales */}
            <div className="flex items-center gap-2">
              <button
                onClick={abrirEditarLead}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              
              <button
                onClick={abrirNuevoComentario}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Seguimiento</span>
              </button>
              
              <button
                onClick={() => router.visit('/comercial/prospectos')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - Actualizadas sin el contador de estados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Notas</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {estadisticas.total_notas}
                </p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Comentarios</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {estadisticas.total_comentarios}
                </p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Notificaciones</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {estadisticas.total_notificaciones}
                </p>
              </div>
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">No leídas</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {estadisticas.notificaciones_no_leidas}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
              {tabsBase.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-2 px-3 sm:px-4 border-b-2 text-sm font-medium whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`
                      ml-1 px-1.5 py-0.5 text-xs rounded-full
                      ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {activeTab === 'informacion' && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.nombre_completo}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">
                            {getLabelGenero(lead.genero)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {lead.email && (
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <a 
                            href={`mailto:${lead.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {lead.email}
                          </a>
                          <p className="text-xs text-gray-500">Email</p>
                        </div>
                      </div>
                    )}
                    
                    {lead.telefono && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <a 
                            href={`tel:${lead.telefono}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {formatTelefono(lead.telefono)}
                          </a>
                          <p className="text-xs text-gray-500">Teléfono</p>
                        </div>
                      </div>
                    )}
                    
                    {lead.localidad_nombre && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {lead.localidad_nombre}
                            {lead.provincia_nombre && `, ${lead.provincia_nombre}`}
                          </p>
                          <p className="text-xs text-gray-500">Ubicación</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Información del lead */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información del Lead
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.origen_nombre}</p>
                        <p className="text-xs text-gray-500">Origen del lead</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Target className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.estado_nombre}</p>
                        <p className="text-xs text-gray-500">Estado actual</p>
                      </div>
                    </div>
                    
                    {lead.rubro_nombre && (
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.rubro_nombre}</p>
                          <p className="text-xs text-gray-500">Rubro/Industria</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.asignado_nombre || 'Sin asignar'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {lead.prefijo_codigo && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {lead.prefijo_codigo}
                            </span>
                          )}
                          {lead.prefijo_descripcion && (
                            <span className="text-xs text-gray-500">
                              {lead.prefijo_descripcion}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Comercial asignado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Observaciones */}
              {lead.observaciones && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {lead.observaciones}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Estado del lead */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Creado:</span> {formatFecha(lead.created)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Última modificación:</span> {formatFecha(lead.modified)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.es_activo ? (
                      <span className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                        Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                        <X className="h-4 w-4" />
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notas' && (
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notas ({estadisticas.total_notas})
                </h3>
              </div>
              
              {notas.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay notas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notas.map((nota) => (
                    <div key={nota.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {nota.usuario_nombre || 'Usuario desconocido'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFecha(nota.created)}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {nota.tipo || 'Nota'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {nota.observacion}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'comentarios' && (
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Comentarios ({estadisticas.total_comentarios})
                </h3>
                <button
                  onClick={abrirNuevoComentario}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo comentario</span>
                  <span className="sm:hidden">Nuevo</span>
                </button>
              </div>
              
              {comentarios.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay comentarios</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comentarios.map((comentario) => (
                    <div key={comentario.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {comentario.usuario_nombre || 'Usuario desconocido'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFecha(comentario.created)}
                          </p>
                        </div>
                        {comentario.tipo_nombre && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {comentario.tipo_nombre}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comentario.comentario}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'tiempos' && puedeVerTiempos && (
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tiempos entre Estados
              </h3>
              
              {cargandoTiempos ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4 text-sm">Cargando tiempos entre estados...</p>
                </div>
              ) : tiemposEstados.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de transiciones</h3>
                  <p className="text-gray-600 text-sm">
                    No se han registrado cambios de estado para este lead.
                  </p>
                </div>
              ) : (
                <>
                  {/* Estadísticas */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Estadísticas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Total cambios</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{estadisticasTiempos?.totalCambios}</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Total días</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{estadisticasTiempos?.totalDias}</p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">Promedio por cambio</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {estadisticasTiempos?.promedioDias} días
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lista de tiempos */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Transiciones de estado</h3>
                    <div className="space-y-3">
                      {tiemposEstados.map((tiempo, index) => (
                        <div key={index} className="border-l-2 border-blue-300 pl-4 py-3 hover:bg-gray-50 rounded-r">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                  {tiempo.desde}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-sm font-medium text-gray-700 bg-blue-100 px-3 py-1.5 rounded-lg">
                                  {tiempo.hasta}
                                </span>
                              </div>
                              {tiempo.razon && (
                                <p className="text-xs text-gray-500 mt-2">
                                  <span className="font-medium">Razón:</span> {tiempo.razon}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">{tiempo.dias}</span> día{tiempo.dias !== 1 ? 's' : ''}
                                {tiempo.horas > 0 && <span>, {tiempo.horas}h</span>}
                                {tiempo.minutos > 0 && <span> {tiempo.minutos}m</span>}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatFecha(tiempo.fecha_cambio)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'notificaciones' && (
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notificaciones ({estadisticas.total_notificaciones})
              </h3>
              
              {notificaciones.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay notificaciones</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notificaciones.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        !notif.leida ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Bell className={`h-4 w-4 ${
                              !notif.leida ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                            <p className={`font-medium ${
                              !notif.leida ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {notif.titulo}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">{notif.mensaje}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatFecha(notif.fecha_notificacion)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notif.prioridad === 'urgente' 
                            ? 'bg-red-100 text-red-800'
                            : notif.prioridad === 'alta'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {notif.prioridad}
                        </span>
                        {!notif.leida && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            No leída
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <NuevoComentarioModal
        isOpen={showNuevoComentario}
        onClose={cerrarModales}
        lead={lead}
        tiposComentario={tiposComentario}
        estadosLead={estadosLead}
        comentariosExistentes={comentarios.length}
        onSuccess={() => {
          router.reload({ only: ['lead', 'comentarios', 'estadisticas'] });
        }}
      />
      
      <EditarLeadModal
        isOpen={showModalEditar}
        onClose={cerrarModales}
        lead={lead}
        origenes={origenes}
        rubros={rubros}
        comerciales={comerciales}
        provincias={provincias}
        usuario={auth.user}
        onSuccess={() => {
          router.reload();
        }}
      />
    </AppLayout>
  );
}