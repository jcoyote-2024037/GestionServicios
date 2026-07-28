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
    try {
      await favoritesService.interact(fav._id || fav.id)
    } catch {
      // silently fail — interact is optional tracking
    }
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
              className="btn-primary">
              Explorar servicios
            </button>
          }
        />
      ) : (
        <div className="space-y-3 mb-8">
          {favorites.map((fav) => (
            <div key={fav._id || fav.id}
              onClick={(e) => { handleInteract(e, fav); navigate(`/services/${fav.servicioId?._id || fav.servicioId}`) }}
              className="glass-card glass-card-interactive p-4 cursor-pointer">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{fav.servicioId?.nombre || 'Servicio'}</p>
                  {fav.servicioId?.descripcion && (
                    <p className="text-white/40 text-xs mt-1 truncate">{fav.servicioId.descripcion}</p>
                  )}
                  <p className="text-white/20 text-xs mt-1">
                    Guardado el {new Date(fav.fecha || fav.createdAt).toLocaleDateString('es-GT')}
                  </p>
                </div>
                <button onClick={(e) => handleRemove(e, fav._id || fav.id)}
                  className="text-white/30 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
