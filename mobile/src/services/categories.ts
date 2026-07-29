import { api } from '../lib/api'
import { Category } from '../types'

export const categoriesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<{ categories: Category[]; data: Category[] }>('/categories', { params }),

  getActive: () =>
    api.get<{ categories: Category[]; data: Category[] }>('/categories/active'),

  create: (data: Record<string, unknown>) =>
    api.post('/categories/create', data),
}
