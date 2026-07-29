import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { favoritesService } from '../../../shared/api/services/favoritesService'
import { servicesService } from '../../../shared/api/services/servicesService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { ServiceCard } from '../../../shared/components/ui/ServiceCard'
import { useAuth } from '../../../shared/hooks/useAuth'

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await favoritesService.getByUser(user?.id)
      setFavorites(data.favorites || data.data || data || [])
    } catch {
      toast.error('Error al cargar favoritos')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  useEffect(() => {
    if (!loading && user?.id && favorites.length < 4) {
      favoritesService.getSuggestions(user.id).then(({ data }) => {
        setSuggestions(data.suggestions || data.services || data.data || (Array.isArray(data) ? data : []))
      }).catch(() => {})
    }
  }, [loading, user?.id, favorites.length])

  const handleInteract = async (e, fav) => {
    e.stopPropagation()
    try { await favoritesService.interact(fav._id || fav.id) } catch {}
  }

  const handleRemove = async (e, favId) => {
    e.stopPropagation()
    try {
      await favoritesService.delete(favId)
      setFavorites(favorites.filter((f) => (f._id || f.id) !== favId))
      toast.success('Eliminado de favoritos')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mis Favoritos</h1>
        <p className="text-white/40 text-sm mt-1">Servicios que guardaste para acceder rápido</p>
      </div>

      {!favorites.length ? (
        <EmptyState
          title="No hay favoritos"
          description="Guarda servicios en favoritos para verlos aquí"
          action={
            <button onClick={() => navigate('/services')}
              className="glass-btn w-auto px-6">
              Explorar servicios
            </button>
          }
        />
      ) : (
        <div className="space-y-3 mb-8">
          {favorites.map((fav) => (
            <div key={fav._id || fav.id}
              onClick={(e) => { handleInteract(e, fav); navigate(`/services/${fav.servicioId?._id || fav.servicioId}`) }}
              className="glass-card glass-card-interactive p-4 cursor-pointer group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{fav.servicioId?.nombre || 'Servicio'}</p>
                    {fav.servicioId?.descripcion && (
                      <p className="text-white/40 text-xs mt-0.5 truncate">{fav.servicioId.descripcion}</p>
                    )}
                    <p className="text-white/15 text-[11px] mt-1">
                      Guardado el {new Date(fav.fecha || fav.createdAt).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                </div>
                <button onClick={(e) => handleRemove(e, fav._id || fav.id)}
                  className="text-white/20 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Sugeridos para ti</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.slice(0, 6).map((service) => (
              <ServiceCard key={service._id || service.id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
