import { create } from 'zustand'
import api from '../../../shared/api/api'

export const useServiceStore = create((set, get) => ({
  services: [],
  service: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,

  fetchServices: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/services', { params })
      set({ services: data.services || data, total: data.total || 0, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cargar servicios', loading: false })
    }
  },

  fetchService: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/services/${id}`)
      set({ service: data.service || data, loading: false })
      return data.service || data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cargar servicio', loading: false })
    }
  },

  createService: async (formData) => {
    try {
      const { data } = await api.post('/services', formData)
      set((s) => ({ services: [data.service || data, ...s.services] }))
      return { success: true, service: data.service || data }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al crear servicio' }
    }
  },

  updateService: async (id, formData) => {
    try {
      const { data } = await api.put(`/services/${id}`, formData)
      set((s) => ({
        services: s.services.map((sv) => sv._id === id ? { ...sv, ...(data.service || data) } : sv)
      }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al actualizar' }
    }
  },

  deleteService: async (id) => {
    try {
      await api.delete(`/services/${id}`)
      set((s) => ({ services: s.services.filter((sv) => sv._id !== id) }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al eliminar' }
    }
  },
}))
