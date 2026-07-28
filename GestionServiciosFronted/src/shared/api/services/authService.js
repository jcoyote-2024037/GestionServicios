import api from '../api'

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  requestReset: (email) => api.post('/auth/request-reset', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  getUsers: (params) => api.get('/auth/users', { params }),
}
