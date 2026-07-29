import { api } from '../lib/api'
import { Service } from '../types'

export const servicesService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<{ services: Service[]; data: Service[] }>('/services', { params }),

  getById: (id: string) =>
    api.get<{ service: Service; data: Service }>(`/services/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/services/create', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/services/update/${id}`, data),

  delete: (id: string) =>
    api.delete(`/services/delete/${id}`),
}
