import { useNavigate } from 'react-router-dom'
import { Badge } from './Badge'

export const ServiceCard = ({ service, onFavorite, isFavorited = false }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/services/${service._id || service.id}`)}
      className="glass-card glass-card-interactive p-5 cursor-pointer"
    >
      {service.imagenes?.[0] ? (
        <img
          src={service.imagenes[0]}
          alt={service.nombre}
          className="w-full h-40 object-cover rounded-xl mb-3"
        />
      ) : (
        <div className="w-full h-40 rounded-xl mb-3 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-white font-semibold text-sm line-clamp-1">{service.nombre}</h3>
        {onFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(service) }}
            className="flex-shrink-0 transition-colors"
          >
            {isFavorited ? (
              <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white/30 hover:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <p className="text-white/40 text-xs line-clamp-2 mb-3">{service.descripcion}</p>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {service.categoriaId?.nombre && <Badge color="purple">{service.categoriaId.nombre}</Badge>}
        {service.averageRating > 0 && <Badge color="yellow">★ {service.averageRating.toFixed(1)}</Badge>}
        <Badge color={service.estado === 'activo' ? 'green' : 'red'}>{service.estado}</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-white/30">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          {service.viewsCount || 0}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          {service.favoritosCount || 0}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          {service.reviewsCount || 0}
        </span>
      </div>
    </div>
  )
}
