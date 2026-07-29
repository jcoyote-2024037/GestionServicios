import api from '../api'

export const reviewsService = {
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  getByService: (serviceId) => api.get(`/reviews/service/${serviceId}`),
  create: (data) => api.post('/reviews/create', data),
  update: (id, data) => api.put(`/reviews/update/${id}`, data),
  delete: (id) => api.delete(`/reviews/delete/${id}`),
  like: (id) => api.patch(`/reviews/like/${id}`),
  moderate: (id, data) => api.patch(`/reviews/moderate/${id}`, data),
  report: (id, data) => api.post(`/reviews/report/${id}`, data),
}
