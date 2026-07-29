import api from '../api'

export const adminService = {
  getUsers: (params) => api.get('/auth/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  getLocations: (params) => api.get('/locations', { params }),
  getZoneDensity: () => api.get('/locations/zone-density'),
  createLocation: (data) => api.post('/locations', data),
  updateLocation: (id, data) => api.put(`/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/locations/${id}`),

  getTags: (params) => api.get('/tags', { params }),
  getTagSuggestions: () => api.get('/tags/suggestions'),
  getRarelyUsedTags: () => api.get('/tags/rarely-used'),
  createTag: (data) => api.post('/tags', data),
  updateTag: (id, data) => api.put(`/tags/${id}`, data),
  deleteTag: (id) => api.delete(`/tags/${id}`),

  getBadges: (params) => api.get('/badges', { params }),
  getRankingProviders: () => api.get('/badges/ranking/providers'),
  createBadge: (data) => api.post('/badges', data),
  updateBadge: (id, data) => api.put(`/badges/${id}`, data),
  deleteBadge: (id) => api.delete(`/badges/${id}`),
  autoAssignBadge: (serviceId) => api.post('/badges/auto-assign', { serviceId }),
  autoAssignAllBadges: () => api.post('/badges/auto-assign/all'),

  getReports: (params) => api.get('/reportes', { params }),
  getPendingReports: () => api.get('/reportes/pendientes'),
  reviewReport: (id, data) => api.patch(`/reportes/revisar/${id}`, data),
  deleteReport: (id) => api.delete(`/reportes/delete/${id}`),

  getLogs: (params) => api.get('/logs', { params }),
  getAuditReport: () => api.get('/logs/audit/report'),
  getTimeline: (userId) => api.get(`/logs/timeline/${userId}`),
  deleteLog: (id) => api.delete(`/logs/${id}`),
}
