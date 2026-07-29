import { api } from '../lib/api'

export const reportesService = {
  create: (data: { servicioId: string; motivo: string; descripcion: string; severity: string }) =>
    api.post('/reportes/create', data),
}
