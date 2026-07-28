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

const extractUser = (payload) => {
  if (!payload) return null
  return {
    id: payload.sub,
    role: payload.role,
    name: payload.name || '',
    surname: payload.surname || '',
    username: payload.username || '',
    email: payload.email || '',
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
        if (token) {
          const payload = decodeToken(token)
          if (payload) {
            const expMs = payload.exp * 1000
            if (Date.now() >= expMs) {
              set({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false })
              return
            }
            set({ user: extractUser(payload), isAuthenticated: true, isLoadingAuth: false })
            return
          }
        }
        set({ isLoadingAuth: false })
      },

      login: async ({ email, password }) => {
        try {
          const { data } = await api.post('/auth/login', { email, password })
          const token = data.token || data.accessToken
          const payload = decodeToken(token)
          const user = extractUser(payload)
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
          if (formData.name || formData.surname || formData.username) {
            set({ user: { ...get().user, ...formData } })
          }
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
