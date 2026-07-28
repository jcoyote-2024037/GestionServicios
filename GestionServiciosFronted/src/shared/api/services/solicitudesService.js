import api from '../api'

export const solicitudesService = {
  getAll: (params) => api.get('/solicitudes', { params }),
  getById: (id) => api.get(`/solicitudes/${id}`),
  create: (data) => api.post('/solicitudes/create', data),
  update: (id, data) => api.put(`/solicitudes/update/${id}`, data),
  delete: (id) => api.delete(`/solicitudes/delete/${id}`),
  changeStatus: (id, data) => api.patch(`/solicitudes/estado/${id}`, data),
  getHistoryByUser: (userId) => api.get(`/solicitudes/historial/usuario/${userId}`),
  getHistoryByService: (serviceId) => api.get(`/solicitudes/historial/servicio/${serviceId}`),
  expirePending: () => api.post('/solicitudes/expirar'),
}
