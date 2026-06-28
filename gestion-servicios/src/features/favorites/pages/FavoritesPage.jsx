import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFavoriteStore } from '../store/favoriteStore'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Button } from '../../../shared/components/ui/Button'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { StarIcon, MapPinIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export const FavoritesPage = () => {
  const { favorites, loading, fetchFavorites, toggleFavorite } = useFavoriteStore()

  useEffect(() => { fetchFavorites() }, [])

  const handleRemove = async (serviceId) => {
    await toggleFavorite(serviceId)
    toast.success('Eliminado de favoritos')
  }

  const services = favorites.map((f) => f.service || f).filter(Boolean)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
          <HeartSolid className="w-6 h-6" style={{ color: 'var(--orange)' }} />
          Mis favoritos
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-3)' }}>
          {services.length} servicio{services.length !== 1 ? 's' : ''} guardado{services.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? <Spinner center /> : services.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--navy)' }}>
            Aún no tienes favoritos
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--gray-3)' }}>
            Explora servicios y guarda los que más te interesen
          </p>
          <Link to="/services"><Button>Explorar servicios</Button></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const id = service._id || service.serviceId
            const rating = service.avgRating || service.rating || 0
            return (
              <div
                key={id}
                className="rounded-2xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}
              >
                <Link to={`/services/${id}`} className="block">
                  <div className="h-40 w-full overflow-hidden" style={{ background: 'var(--gray-6)' }}>
                    {service.image || service.photo ? (
                      <img src={service.image || service.photo} alt={service.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🛠️</div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/services/${id}`}>
                    <h3 className="font-semibold text-sm mb-1 hover:underline" style={{ color: 'var(--gray-1)' }}>
                      {service.title || service.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5" style={{ color: '#F59E0B', fill: rating > 0 ? '#F59E0B' : 'none' }} />
                      <span className="text-xs" style={{ color: 'var(--gray-3)' }}>{rating > 0 ? rating.toFixed(1) : 'Nuevo'}</span>
                    </div>
                    {service.price && <span className="text-sm font-bold" style={{ color: 'var(--orange)' }}>Q{service.price}</span>}
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    className="w-full mt-3 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium border transition-all hover:bg-red-50 hover:border-red-200"
                    style={{ borderColor: 'var(--gray-5)', color: 'var(--gray-3)' }}
                  >
                    <HeartSolid className="w-3.5 h-3.5 text-red-400" />
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
