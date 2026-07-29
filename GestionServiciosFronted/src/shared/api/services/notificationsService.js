import api from '../api'

export const notificationsService = {
  getAll: (params) => api.get('/notifications', { params }),
  countUnread: () => api.get('/notifications/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
}
