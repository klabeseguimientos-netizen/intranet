// resources/js/Components/Notificaciones/NotificacionesDropdown.tsx
import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { notificacionesApi } from '@/utils/axiosHelper';
import { 
  Bell, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Users,
  RefreshCw
} from 'lucide-react';

interface Notificacion {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  entidad_tipo: 'lead' | 'presupuesto' | 'contrato' | 'comentario';
  entidad_id: number | null;
  leida: boolean;
  fecha_notificacion: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  created: string;
}

interface PageProps {
  auth: {
    user: {
      id: number;
      nombre_usuario: string;
      nombre_completo: string;
      rol_id: number;
    };
  };
  [key: string]: any;
}

const NotificacionesDropdown: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [sinLeer, setSinLeer] = useState<number>(0);
  const [mostrarDropdown, setMostrarDropdown] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  
  const { props } = usePage<PageProps>();
  const usuario = props.auth?.user;
  
  // Función para hacer fetch con headers correctos
  const fetchJson = async (url: string, options: RequestInit = {}) => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    const defaultOptions: RequestInit = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin'
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    return response.json();
  };
  
  // Cargar notificaciones iniciales
useEffect(() => {
    if (usuario?.id) {
        cargarNotificaciones();
    }
    
    // Escuchar eventos de actualización
    const handleActualizacion = () => {
        cargarNotificaciones();
    };
    
    window.addEventListener('notificaciones-actualizadas', handleActualizacion);
    
    // También escuchar cuando la página gana foco (por si acaso)
    window.addEventListener('focus', handleActualizacion);
    
    return () => {
        window.removeEventListener('notificaciones-actualizadas', handleActualizacion);
        window.removeEventListener('focus', handleActualizacion);
    };
}, [usuario?.id]);
  
// En cargarNotificaciones:
const cargarNotificaciones = async (): Promise<void> => {
    if (cargando || !usuario?.id) return;
    
    setCargando(true);
    
    try {
        // Usar axiosHelper con la nueva ruta AJAX
        const response = await notificacionesApi.getNotificaciones({
            limit: 10,
            no_leidas: true
        });
        
        if (response.data.success) {
            setNotificaciones(response.data.data || []);
            setSinLeer(response.data.meta?.total_no_leidas || 0);
        } else {
            console.error('Error en respuesta:', response.data.error);
        }
    } catch (error) {
        console.error('Error cargando notificaciones:', error);
    } finally {
        setCargando(false);
    }
};

// En marcarComoLeida:
const marcarComoLeida = async (id: number, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    
    try {
        // Usar la nueva ruta AJAX
        const response = await notificacionesApi.marcarLeida(id);
        
        if (response.data.success) {
            setNotificaciones(prev => prev.filter(n => n.id !== id));
            
            if (response.data.meta?.total_no_leidas !== undefined) {
                setSinLeer(response.data.meta.total_no_leidas);
            } else {
                const notificacion = notificaciones.find(n => n.id === id);
                if (notificacion && !notificacion.leida) {
                    setSinLeer(prev => Math.max(0, prev - 1));
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
  
  const marcarTodasComoLeidas = async (): Promise<void> => {
    try {
      const response = await fetchJson('/notificaciones/marcar-todas-leidas', {
        method: 'POST'
      });
      
      if (response.success) {
        // Eliminar todas las notificaciones no leídas de la lista
        setNotificaciones(prev => prev.filter(n => n.leida));
        
        // O simplemente limpiar todas si prefieres
        // setNotificaciones([]);
        
        // Actualizar contador desde el backend si está disponible
        if (response.meta?.total_no_leidas !== undefined) {
          setSinLeer(response.meta.total_no_leidas);
        } else {
          // O establecer a 0 directamente
          setSinLeer(0);
        }
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };
  
  // Versión alternativa usando el mismo método que marcarComoLeida
  const marcarTodasComoLeidasV2 = async (): Promise<void> => {
    try {
      // Si hay notificaciones no leídas, marcarlas una por una
      const notificacionesNoLeidas = notificaciones.filter(n => !n.leida);
      
      if (notificacionesNoLeidas.length === 0) return;
      
      // Podemos hacer una sola petición al backend y luego actualizar el estado
      const response = await notificacionesApi.marcarTodasLeidas();
      
      if (response.data.success) {
        // Ocultar todas las notificaciones no leídas inmediatamente
        setNotificaciones(prev => prev.filter(n => n.leida));
        setSinLeer(0);
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      
      // Fallback: marcar cada una individualmente
      try {
        // Crear un array de promesas para marcar todas como leídas
        const promesas = notificaciones
          .filter(n => !n.leida)
          .map(n => notificacionesApi.marcarLeida(n.id));
        
        await Promise.all(promesas);
        
        // Ocultar todas después de marcarlas
        setNotificaciones([]);
        setSinLeer(0);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
    }
  };
  
  const navegarAEntidad = (notificacion: Notificacion): void => {
    if (!notificacion.entidad_tipo || !notificacion.entidad_id) return;
    
    let ruta = '';
    switch(notificacion.entidad_tipo) {
      case 'lead':
        ruta = `/leads/${notificacion.entidad_id}`;
        break;
      case 'presupuesto':
        ruta = `/presupuestos/${notificacion.entidad_id}`;
        break;
      case 'contrato':
        ruta = `/contratos/${notificacion.entidad_id}`;
        break;
      default:
        return;
    }
    
    // Marcar como leída al navegar también
    if (!notificacion.leida) {
      notificacionesApi.marcarLeida(notificacion.id).catch(console.error);
    }
    
    router.visit(ruta);
    setMostrarDropdown(false);
  };
  
  const getIconoPorTipo = (tipo: string): React.ReactNode => {
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
      case 'asignacion_lead':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'comentario_recordatorio':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getColorPrioridad = (prioridad: string): string => {
    switch(prioridad) {
      case 'urgente':
        return 'bg-red-100 border-red-500';
      case 'alta':
        return 'bg-orange-100 border-orange-500';
      case 'normal':
        return 'bg-blue-50 border-blue-500';
      case 'baja':
        return 'bg-gray-50 border-gray-400';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };
  
  const formatFecha = (fechaString: string): string => {
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      if (fecha.toDateString() === hoy.toDateString()) {
        return `Hoy ${fecha.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      } else if (fecha.toDateString() === ayer.toDateString()) {
        return `Ayer ${fecha.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      } else {
        return fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  // Si no hay usuario, no mostrar nada
  if (!usuario) {
    return null;
  }
  
  return (
    <div className="relative">
      <button 
        onClick={() => {
          setMostrarDropdown(!mostrarDropdown);
          if (!mostrarDropdown) {
            cargarNotificaciones();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-sat transition-colors"
        title="Notificaciones"
        type="button"
      >
        <Bell size={22} />
        {sinLeer > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>
      
      {mostrarDropdown && (
        <>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
                <p className="text-sm text-gray-600">
                  {sinLeer > 0 ? `${sinLeer} sin leer` : 'Todas leídas'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {sinLeer > 0 && (
                  <button 
                    onClick={marcarTodasComoLeidasV2}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm flex items-center gap-1"
                    title="Marcar todas como leídas"
                  >
                    <Check className="h-4 w-4" />
                    <span>Marcar todas</span>
                  </button>
                )}
                
                <button 
                  onClick={() => cargarNotificaciones()}
                  className={`p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded ${cargando ? 'animate-spin' : ''}`}
                  title="Actualizar"
                  disabled={cargando}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay notificaciones nuevas</p>
                </div>
              ) : (
                notificaciones.map((notificacion) => (
                  <div 
                    key={notificacion.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notificacion.leida ? 'bg-blue-50' : ''
                    } ${getColorPrioridad(notificacion.prioridad)} border-l-4`}
                    onClick={() => navegarAEntidad(notificacion)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {getIconoPorTipo(notificacion.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium truncate ${
                            !notificacion.leida ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {notificacion.titulo}
                          </h4>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            <button 
                              onClick={(e) => marcarComoLeida(notificacion.id, e)}
                              className="p-1 text-gray-400 hover:text-green-600 rounded hover:bg-gray-100"
                              title="Marcar como leída"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notificacion.mensaje}
                        </p>
                        
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {formatFecha(notificacion.fecha_notificacion)}
                          </span>
                          
                          {notificacion.prioridad === 'urgente' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Urgente
                            </span>
                          )}
                          {notificacion.prioridad === 'alta' && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Alta
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Link para ver todas las notificaciones */}
            {notificaciones.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <a 
                  href="/notificaciones" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    router.visit('/notificaciones');
                    setMostrarDropdown(false);
                  }}
                >
                  Ver todas las notificaciones
                </a>
              </div>
            )}
          </div>
          
          {/* Backdrop para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setMostrarDropdown(false)}
          />
        </>
      )}
    </div>
  );
};

export default NotificacionesDropdown;