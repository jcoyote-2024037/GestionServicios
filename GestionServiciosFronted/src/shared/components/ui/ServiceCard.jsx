import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from './Badge'
import { ServiceImagePlaceholder } from './ServiceImagePlaceholder'

export const ServiceCard = ({ service, onFavorite, isFavorited = false }) => {
  const navigate = useNavigate()
  const [imgLoaded, setImgLoaded] = useState(false)
  const serviceId = service._id || service.id

  return (
    <div
      onClick={() => navigate(`/services/${serviceId}`)}
      className="glass-card glass-card-interactive p-5 cursor-pointer group relative"
    >
      {/* Featured badge */}
      {service.featured && (
        <div className="absolute top-3 right-3 z-10 animate-fade-in">
          <span className="glass-badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.25)' }}>
            Destacado
          </span>
        </div>
      )}

      <div className="relative w-full h-40 rounded-xl mb-3 overflow-hidden bg-white/[0.02]">
        {service.imagenes?.[0] ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 shimmer-enhanced" />
            )}
            <img
              src={service.imagenes[0]}
              alt={service.nombre}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,9,11,0.7)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <ServiceImagePlaceholder nombre={service.nombre} categoria={service.categoriaId?.nombre} />
        )}

        {/* Hover overlay actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span
            onClick={(e) => { e.stopPropagation(); navigate(`/services/${serviceId}`) }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white backdrop-blur-md transition-all hover:scale-105"
            style={{ background: 'rgba(244,63,94,0.85)' }}
          >
            Ver detalles
          </span>
          {onFavorite && (
            <span
              onClick={(e) => { e.stopPropagation(); onFavorite(service) }}
              className="w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <svg className={`w-5 h-5 transition-all ${isFavorited ? 'text-pink-400 scale-110' : 'text-white/70'}`}
                fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-white font-semibold text-sm line-clamp-1">{service.nombre}</h3>
        {onFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(service) }}
            className="flex-shrink-0 transition-all duration-200 hover:scale-110 md:hidden"
          >
            <svg className={`w-5 h-5 transition-all ${isFavorited ? 'text-pink-400 scale-110' : 'text-white/30 hover:text-pink-400'}`}
              fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-white/40 text-xs line-clamp-2 mb-3 leading-relaxed">{service.descripcion}</p>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        {service.categoriaId?.nombre && <Badge color="purple">{service.categoriaId.nombre}</Badge>}
        {service.averageRating > 0 && <Badge color="yellow">★ {service.averageRating.toFixed(1)}</Badge>}
        <Badge color={service.estado === 'activo' ? 'green' : 'red'}>{service.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge>
      </div>

      {service.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {service.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/30 border border-white/10">
              {tag.name || tag}
            </span>
          ))}
          {service.tags.length > 3 && (
            <span className="text-[10px] text-white/20">+{service.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-white/30 pt-1 border-t border-white/[0.04]">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          {service.viewsCount || 0}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          {service.favoritosCount || 0}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {service.reviewsCount || 0}
        </span>
      </div>
    </div>
  )
}
