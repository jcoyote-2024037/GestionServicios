import api from '../api'

export const servicesService = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getMine: (params) => api.get('/services/mine', { params }),
  getNearby: (params) => api.get('/services/nearby', { params }),
  create: (data) => api.post('/services/create', data),
  update: (id, data) => api.put(`/services/update/${id}`, data),
  delete: (id) => api.delete(`/services/delete/${id}`),
}
