import api from '../api'

export const categoriesService = {
  getAll: (params) => api.get('/categories', { params }),
  getActive: () => api.get('/categories/active'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories/create', data),
  update: (id, data) => api.put(`/categories/update/${id}`, data),
  delete: (id) => api.delete(`/categories/delete/${id}`),
}
