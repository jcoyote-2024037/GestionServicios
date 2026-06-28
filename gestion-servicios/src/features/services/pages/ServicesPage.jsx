import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useServiceStore } from '../store/serviceStore'
import { useFavoriteStore } from '../../favorites/store/favoriteStore'
import { useAuthStore } from '../../auth/store/authStore'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Button } from '../../../shared/components/ui/Button'
import {
  HeartIcon, StarIcon, MagnifyingGlassIcon,
  FunnelIcon, PlusIcon, MapPinIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export const ServicesPage = () => {
  const { services, loading, fetchServices } = useServiceStore()
  const { favorites, fetchFavorites, toggleFavorite, isFavorite } = useFavoriteStore()
  const { isAuthenticated, user } = useAuthStore()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchServices()
    if (isAuthenticated) fetchFavorites()
  }, [])

  const filtered = services.filter((s) => {
    const q = search.toLowerCase()
    return (
      (!q || s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)) &&
      (!category || s.category === category)
    )
  })

  const handleFavorite = async (e, id) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Inicia sesión para guardar favoritos'); return }
    await toggleFavorite(id)
  }

  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
            Servicios disponibles
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--gray-3)' }}>
            {filtered.length} servicio{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/services/new">
            <Button>
              <PlusIcon className="w-4 h-4" />
              Publicar servicio
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--gray-3)' }} />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: 'var(--gray-5)', background: 'var(--bg-white)', color: 'var(--gray-1)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--navy)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--gray-5)' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--gray-3)' }} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm outline-none appearance-none"
            style={{ borderColor: 'var(--gray-5)', background: 'var(--bg-white)', color: 'var(--gray-1)' }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner center />
      ) : filtered.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              fav={isFavorite(service._id)}
              onFav={(e) => handleFavorite(e, service._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ServiceCard = ({ service, fav, onFav }) => {
  const rating = service.avgRating || service.rating || 0

  return (
    <Link to={`/services/${service._id}`} className="group block">
      <div
        className="rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}
      >
        {/* Image */}
        <div className="relative w-full h-44 overflow-hidden" style={{ background: 'var(--gray-6)' }}>
          {service.image || service.photo ? (
            <img
              src={service.image || service.photo}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🛠️</span>
            </div>
          )}
          {service.category && (
            <span
              className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--navy)', color: '#fff' }}
            >
              {service.category}
            </span>
          )}
          <button
            onClick={onFav}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.95)' }}
          >
            {fav
              ? <HeartSolid className="w-4 h-4" style={{ color: 'var(--orange)' }} />
              : <HeartIcon className="w-4 h-4" style={{ color: 'var(--gray-3)' }} />
            }
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2" style={{ color: 'var(--gray-1)' }}>
            {service.title || service.name}
          </h3>

          {service.location && (
            <div className="flex items-center gap-1 mb-2">
              <MapPinIcon className="w-3 h-3 shrink-0" style={{ color: 'var(--gray-3)' }} />
              <span className="text-xs truncate" style={{ color: 'var(--gray-3)' }}>{service.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5" style={{ color: '#F59E0B', fill: rating > 0 ? '#F59E0B' : 'none' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--gray-2)' }}>
                {rating > 0 ? rating.toFixed(1) : 'Nuevo'}
              </span>
            </div>
            {(service.price || service.basePrice) && (
              <span className="text-sm font-bold" style={{ color: 'var(--orange)' }}>
                Q{service.price || service.basePrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

const EmptyState = ({ search }) => (
  <div className="text-center py-24">
    <div className="text-6xl mb-4">🔍</div>
    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--navy)' }}>
      {search ? 'Sin resultados' : 'No hay servicios aún'}
    </h3>
    <p className="text-sm" style={{ color: 'var(--gray-3)' }}>
      {search ? `No encontramos nada para "${search}"` : 'Sé el primero en publicar un servicio'}
    </p>
  </div>
)
