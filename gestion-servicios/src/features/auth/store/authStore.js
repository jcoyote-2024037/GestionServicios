import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../../../shared/api/api'

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

      login: async ({ emailOrUsername, password }) => {
        try {
          const { data } = await api.post('/auth/login', { emailOrUsername, password })
          const token = data.accessToken || data.token
          const user  = data.userDetails || data.user
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
          const userId = get().user?._id || get().user?.uid
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
