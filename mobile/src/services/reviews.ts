import { api } from '../lib/api'
import { Review } from '../types'

export const reviewsService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/reviews', { params }),

  getByService: (serviceId: string) =>
    api.get<{ reviews: Review[]; data: Review[] }>(`/reviews/service/${serviceId}`),

  create: (data: { servicioId: string; usuarioId: string; calificacion: number; comentario: string; title?: string }) =>
    api.post('/reviews/create', data),

  update: (id: string, data: { comentario: string }) =>
    api.put(`/reviews/update/${id}`, data),

  delete: (id: string) =>
    api.delete(`/reviews/delete/${id}`),

  like: (id: string) =>
    api.patch(`/reviews/like/${id}`),

  moderate: (id: string, data: { status: string }) =>
    api.patch(`/reviews/moderate/${id}`, data),

  report: (id: string, data: { reason: string; descripcion: string }) =>
    api.post(`/reviews/report/${id}`, data),
}
