import { api } from '../lib/api'
import { Solicitud } from '../types'

export const solicitudesService = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ data: Solicitud[]; solicitudes: Solicitud[]; pagination: { totalPages: number } }>('/solicitudes', { params }),

  getById: (id: string) =>
    api.get<{ solicitud: Solicitud; data: Solicitud }>(`/solicitudes/${id}`),

  create: (data: { servicioId: string; descripcion: string; priceEstimate?: number; scheduledDate?: string }) =>
    api.post('/solicitudes/create', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/solicitudes/update/${id}`, data),

  delete: (id: string) =>
    api.delete(`/solicitudes/delete/${id}`),

  changeStatus: (id: string, data: { nuevoEstado: string; observacion?: string }) =>
    api.patch(`/solicitudes/estado/${id}`, data),

  getHistoryByUser: (userId: string) =>
    api.get<{ data: Solicitud[]; solicitudes: Solicitud[] }>(`/solicitudes/historial/usuario/${userId}`),

  getHistoryByService: (serviceId: string) =>
    api.get(`/solicitudes/historial/servicio/${serviceId}`),

  expirePending: () =>
    api.post('/solicitudes/expirar'),
}
