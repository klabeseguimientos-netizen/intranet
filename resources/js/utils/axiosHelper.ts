import axios from 'axios';

const notificacionesApi = {
    // Obtener notificaciones para el dropdown
    getNotificaciones: (params = {}) => {
        return axios.get('/ajax/notificaciones', { params });
    },
    
    // Obtener contador
    getContador: () => {
        return axios.get('/ajax/notificaciones/contador');
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
    }
};

export { notificacionesApi };