import api from '../api'

export const reportesService = {
  create: (data) => api.post('/reportes/create', data),
}
