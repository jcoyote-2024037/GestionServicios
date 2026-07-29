import { api } from '../lib/api'

export const adminService = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/auth/users', { params }),

  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),

  updateUser: (id: string, data: Record<string, unknown>) =>
    api.put(`/users/${id}`, data),

  getLocations: (params?: Record<string, unknown>) =>
    api.get('/locations', { params }),

  getZoneDensity: () =>
    api.get('/locations/zone-density'),

  createLocation: (data: Record<string, unknown>) =>
    api.post('/locations', data),

  updateLocation: (id: string, data: Record<string, unknown>) =>
    api.put(`/locations/${id}`, data),

  deleteLocation: (id: string) =>
    api.delete(`/locations/${id}`),

  getTags: (params?: Record<string, unknown>) =>
    api.get('/tags', { params }),

  getTagSuggestions: () =>
    api.get('/tags/suggestions'),

  getRarelyUsedTags: () =>
    api.get('/tags/rarely-used'),

  createTag: (data: Record<string, unknown>) =>
    api.post('/tags', data),

  updateTag: (id: string, data: Record<string, unknown>) =>
    api.put(`/tags/${id}`, data),

  deleteTag: (id: string) =>
    api.delete(`/tags/${id}`),

  getBadges: (params?: Record<string, unknown>) =>
    api.get('/badges', { params }),

  getRankingProviders: () =>
    api.get('/badges/ranking/providers'),

  createBadge: (data: Record<string, unknown>) =>
    api.post('/badges', data),

  updateBadge: (id: string, data: Record<string, unknown>) =>
    api.put(`/badges/${id}`, data),

  deleteBadge: (id: string) =>
    api.delete(`/badges/${id}`),

  autoAssignBadge: (serviceId: string) =>
    api.post('/badges/auto-assign', { serviceId }),

  autoAssignAllBadges: () =>
    api.post('/badges/auto-assign/all'),

  getReports: (params?: { page?: number; limit?: number }) =>
    api.get('/reportes', { params }),

  getPendingReports: () =>
    api.get('/reportes/pendientes'),

  reviewReport: (id: string, data: { nuevoStatus: string; resolution: string }) =>
    api.patch(`/reportes/revisar/${id}`, data),

  deleteReport: (id: string) =>
    api.delete(`/reportes/delete/${id}`),

  getLogs: (params?: { page?: number; limit?: number; severity?: string }) =>
    api.get('/logs', { params }),

  getAuditReport: () =>
    api.get('/logs/audit/report'),

  getTimeline: (userId: string) =>
    api.get(`/logs/timeline/${userId}`),

  deleteLog: (id: string) =>
    api.delete(`/logs/${id}`),
}
