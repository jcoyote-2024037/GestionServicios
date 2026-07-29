import { api } from '../lib/api'
import { Favorite } from '../types'

export const favoritesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<Favorite[]>('/favorites', { params }),

  getByUser: (userId: string) =>
    api.get<{ favorites: Favorite[]; data: Favorite[] }>(`/favorites/user/${userId}`),

  create: (data: { servicioId: string }) =>
    api.post('/favorites/create', data),

  delete: (id: string) =>
    api.delete(`/favorites/delete/${id}`),

  getCount: (serviceId: string) =>
    api.get<{ count: number }>(`/favorites/count/${serviceId}`),

  getSuggestions: (userId: string) =>
    api.get<{ suggestions: unknown[]; services: unknown[]; data: unknown[] }>(`/favorites/suggestions/${userId}`),
}
