import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '../types'
import { tokenStorage, decodeToken, extractUser } from '../utils/token'
import { authService } from '../services/auth'
import { api } from '../lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoadingAuth: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>
  register: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoadingAuth: true,
  })

  const checkAuth = useCallback(async () => {
    try {
      const stored = await tokenStorage.getToken()
      if (stored) {
        const payload = decodeToken(stored)
        if (payload) {
          const expMs = payload.exp * 1000
          if (Date.now() >= expMs) {
            await tokenStorage.clear()
            setState({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false })
            return
          }
          const user = extractUser(payload) as User
          setState({ user, token: stored, isAuthenticated: true, isLoadingAuth: false })
          return
        }
      }
      setState((prev) => ({ ...prev, isLoadingAuth: false }))
    } catch {
      setState((prev) => ({ ...prev, isLoadingAuth: false }))
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authService.login({ email, password })
      const token = data.token || data.accessToken || ''
      if (!token) {
        return { success: false, error: 'No se recibió el token' }
      }
      const payload = decodeToken(token)
      const user = extractUser(payload) as User
      await tokenStorage.setToken(token)
      await tokenStorage.setUser(JSON.stringify(user))
      setState({ user, token, isAuthenticated: true, isLoadingAuth: false })
      return { success: true, role: user.role }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Credenciales incorrectas'
      return { success: false, error: message }
    }
  }

  const register = async (data: Record<string, unknown>) => {
    try {
      await authService.register(data)
      return { success: true }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Error al registrarse'
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    await tokenStorage.clear()
    setState({ user: null, token: null, isAuthenticated: false, isLoadingAuth: false })
  }

  const updateProfile = async (formData: Record<string, unknown>) => {
    try {
      const userId = state.user?.id
      if (!userId) return { success: false, error: 'Usuario no encontrado' }
      await api.put(`/users/${userId}`, formData)
      if (formData.name || formData.surname || formData.username) {
        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...formData } as User : null,
        }))
      }
      return { success: true }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Error al actualizar perfil'
      return { success: false, error: message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
