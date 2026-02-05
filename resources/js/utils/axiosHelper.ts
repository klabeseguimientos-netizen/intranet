import axios from 'axios';

const notificacionesApi = {
  // Obtener notificaciones NO LEÍDAS para dropdown
  getNoLeidas: (params?: any) => {
    return axios.get('/ajax/notificaciones', { 
      params: {
        ...params,
        limit: params?.limit || 10
        // Por defecto el backend ya filtra por leida=false
      }
    });
  },
  
  // Obtener TODAS las notificaciones (incluyendo leídas) para vista completa
  getTodas: (params?: any) => {
    return axios.get('/ajax/notificaciones', { 
      params: {
        ...params,
        todas: true,
        limit: params?.limit || 20
      }
    });
  },
  
  // Marcar como leída
  marcarLeida: (id: number) => {
    return axios.post(`/ajax/notificaciones/${id}/marcar-leida`);
  },
  
  // Marcar todas como leídas
  marcarTodasLeidas: () => {
    return axios.post('/ajax/notificaciones/marcar-todas-leidas');
  },
  
  // Eliminar notificación
  eliminar: (id: number) => {
    return axios.delete(`/ajax/notificaciones/${id}`);
  },
  
  // Obtener contador
  getContador: () => {
    return axios.get('/ajax/notificaciones/contador');
  }
};

export { notificacionesApi };