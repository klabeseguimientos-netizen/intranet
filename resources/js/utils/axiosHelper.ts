import axios from 'axios';

const notificacionesApi = {
  // Obtener notificaciones NO LEÍDAS para dropdown
  getNoLeidas: (params?: any) => {
    return axios.get('/notificaciones/ajax', { 
      params: {
        ...params,
        limit: params?.limit || 10
        // Por defecto el backend ya filtra por leida=false
      }
    });
  },
  
  // Obtener TODAS las notificaciones (incluyendo leídas) para vista completa
  getTodas: (params?: any) => {
    return axios.get('/notificaciones/ajax', { 
      params: {
        ...params,
        todas: true,
        limit: params?.limit || 20
      }
    });
  },
  
  // Marcar como leída
  marcarLeida: (id: number) => {
    return axios.post(`/notificaciones/ajax/${id}/marcar-leida`);
  },
  
  // Marcar todas como leídas
  marcarTodasLeidas: () => {
    return axios.post('/notificaciones/ajax/marcar-todas-leidas');
  },
  
  // Eliminar notificación
  eliminar: (id: number) => {
    return axios.delete(`/notificaciones/ajax/${id}`);
  },
  
  // Obtener contador
  getContador: () => {
    return axios.get('/notificaciones/ajax/contador');
  }
};

export { notificacionesApi };