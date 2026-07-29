import { api } from '../lib/api'
import { User } from '../types'

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; accessToken?: string }>('/auth/login', data),

  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', data),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  requestReset: (email: string) =>
    api.post('/auth/request-reset', { email }),

  resetPassword: (data: Record<string, unknown>) =>
    api.post('/auth/reset-password', data),

  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ users: User[]; data: User[]; totalPages: number }>('/auth/users', { params }),
}
