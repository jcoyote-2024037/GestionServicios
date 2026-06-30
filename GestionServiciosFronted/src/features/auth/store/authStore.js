import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../../../shared/api/api'

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingAuth: true,

      checkAuth: () => {
        const token = get().token
        set({ isLoadingAuth: false, isAuthenticated: Boolean(token) })
      },

      login: async ({ email, password }) => {
        try {
          const { data } = await api.post('/auth/login', { email, password })
          const token = data.token || data.accessToken
          const payload = decodeToken(token)
          const user = payload ? { id: payload.sub, role: payload.role } : null
          set({ user, token, isAuthenticated: true })
          return { success: true, user }
        } catch (err) {
          const message = err.response?.data?.message || 'Credenciales incorrectas'
          return { success: false, error: message }
        }
      },

      register: async (formData) => {
        try {
          const { data } = await api.post('/auth/register', formData)
          return { success: true, data }
        } catch (err) {
          const message = err.response?.data?.message || 'Error al registrarse'
          return { success: false, error: message }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateProfile: async (formData) => {
        try {
          const userId = get().user?.id
          const { data } = await api.put(`/users/${userId}`, formData)
          set({ user: { ...get().user, ...data.user } })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Error al actualizar perfil'
          return { success: false, error: message }
        }
      },
    }),
    { name: 'auth-store' }
  )
)
