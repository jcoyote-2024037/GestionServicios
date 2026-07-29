import api from '../api'

export const favoritesService = {
  getAll: (params) => api.get('/favorites', { params }),
  getById: (id) => api.get(`/favorites/${id}`),
  getByUser: (userId) => api.get(`/favorites/user/${userId}`),
  create: (data) => api.post('/favorites/create', data),
  update: (id, data) => api.put(`/favorites/update/${id}`, data),
  delete: (id) => api.delete(`/favorites/delete/${id}`),
  getCount: (serviceId) => api.get(`/favorites/count/${serviceId}`),
  getSuggestions: (userId) => api.get(`/favorites/suggestions/${userId}`),
  interact: (id) => api.patch(`/favorites/interact/${id}`),
}
