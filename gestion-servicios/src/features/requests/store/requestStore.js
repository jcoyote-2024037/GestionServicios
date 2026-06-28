import { create } from 'zustand'
import api from '../../../shared/api/api'

export const useRequestStore = create((set) => ({
  requests: [],
  loading: false,
  error: null,

  fetchMyRequests: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/requests/my')
      set({ requests: data.requests || data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cargar solicitudes', loading: false })
    }
  },

  fetchAllRequests: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/requests')
      set({ requests: data.requests || data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cargar solicitudes', loading: false })
    }
  },

  createRequest: async (payload) => {
    try {
      const { data } = await api.post('/requests', payload)
      set((s) => ({ requests: [data.request || data, ...s.requests] }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al enviar solicitud' }
    }
  },

  updateRequestStatus: async (id, status) => {
    try {
      const { data } = await api.patch(`/requests/${id}/status`, { status })
      set((s) => ({
        requests: s.requests.map((r) => r._id === id ? { ...r, status: data.status || status } : r)
      }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al actualizar' }
    }
  },

  cancelRequest: async (id) => {
    try {
      await api.patch(`/requests/${id}/cancel`)
      set((s) => ({
        requests: s.requests.map((r) => r._id === id ? { ...r, status: 'cancelled' } : r)
      }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al cancelar' }
    }
  },
}))
