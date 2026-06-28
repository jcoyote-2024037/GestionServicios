import { create } from 'zustand'
import api from '../../../shared/api/api'

export const useFavoriteStore = create((set, get) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/favorites')
      set({ favorites: data.favorites || data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  isFavorite: (serviceId) => {
    return get().favorites.some((f) => (f._id || f.serviceId) === serviceId || f.service?._id === serviceId)
  },

  toggleFavorite: async (serviceId) => {
    const isFav = get().isFavorite(serviceId)
    try {
      if (isFav) {
        await api.delete(`/favorites/${serviceId}`)
        set((s) => ({ favorites: s.favorites.filter((f) => (f._id || f.serviceId) !== serviceId && f.service?._id !== serviceId) }))
      } else {
        const { data } = await api.post('/favorites', { serviceId })
        set((s) => ({ favorites: [...s.favorites, data.favorite || { _id: serviceId, service: { _id: serviceId } }] }))
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error' }
    }
  },
}))
