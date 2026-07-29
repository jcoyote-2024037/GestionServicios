import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesService } from '../../../shared/api/services/servicesService'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { favoritesService } from '../../../shared/api/services/favoritesService'
import { useAuthStore } from '../../auth/store/authStore'
import { ServiceCard } from '../../../shared/components/ui/ServiceCard'
import { QuickActionCard } from '../../../shared/components/ui/QuickActionCard'
import { ServiceCardSkeleton, StatCardSkeleton } from '../../../shared/components/ui/Skeleton'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Buenos días', icon: '☀️', emoji: '🌤️' }
  if (h < 18) return { text: 'Buenas tardes', icon: '🌅', emoji: '☀️' }
  return { text: 'Buenas noches', icon: '🌙', emoji: '🌙' }
}

const quickActions = [
  {
    label: 'Crear Servicio',
    description: 'Publica un nuevo servicio',
    path: '/services/new',
    color: 'var(--brand)',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
  },
  {
    label: 'Ver Solicitudes',
    description: 'Revisa tus solicitudes activas',
    path: '/solicitudes',
    color: 'var(--accent)',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    label: 'Explorar',
    description: 'Descubre servicios cercanos',
    path: '/services',
    color: '#10b981',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  },
  {
    label: 'Favoritos',
    description: 'Tus servicios guardados',
    path: '/favorites',
    color: '#ec4899',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  },
]

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState({ servicios: 0, solicitudes: 0, favoritos: 0 })
  const [featuredServices, setFeaturedServices] = useState([])
  const [popularServices, setPopularServices] = useState([])
  const [loading, setLoading] = useState(true)
  const greet = greeting()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, solicitudesRes, favsRes, featuredRes, popularRes] = await Promise.allSettled([
          servicesService.getAll({ limit: 6 }),
          user?.id ? solicitudesService.getHistoryByUser(user.id) : Promise.resolve({ data: [] }),
          user?.id ? favoritesService.getByUser(user.id) : Promise.resolve({ data: [] }),
          servicesService.getFeatured(),
          servicesService.getPopular(),
        ])

        const svcs = servicesRes.status === 'fulfilled' ? (servicesRes.value?.data?.services || servicesRes.value?.data?.data || (Array.isArray(servicesRes.value?.data) ? servicesRes.value.data : [])) : []
        const sols = solicitudesRes.status === 'fulfilled' ? (solicitudesRes.value?.data?.data || solicitudesRes.value?.data?.solicitudes || (Array.isArray(solicitudesRes.value?.data) ? solicitudesRes.value.data : [])) : []
        const favs = favsRes.status === 'fulfilled' ? (favsRes.value?.data?.favorites || favsRes.value?.data?.data || (Array.isArray(favsRes.value?.data) ? favsRes.value.data : [])) : []

        setStats({ servicios: svcs.length, solicitudes: sols.length, favoritos: favs.length })

        if (featuredRes.status === 'fulfilled') {
          const fData = featuredRes.value?.data
          setFeaturedServices(fData?.services || fData?.data || (Array.isArray(fData) ? fData : []))
        }
        if (popularRes.status === 'fulfilled') {
          const pData = popularRes.value?.data
          setPopularServices(pData?.services || pData?.data || (Array.isArray(pData) ? pData : []))
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  const statCards = [
    { label: 'Servicios', value: stats.servicios, color: 'var(--brand)', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    ), route: '/services' },
    { label: 'Mis solicitudes', value: stats.solicitudes, color: 'var(--accent)', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ), route: '/solicitudes' },
    { label: 'Favoritos', value: stats.favoritos, color: '#10b981', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    ), route: '/favorites' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{greet.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {greet.text}, {user?.name || 'usuario'}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Bienvenido a tu panel de GestionServicios</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action, i) => (
          <div key={action.label} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <QuickActionCard
              icon={action.icon}
              label={action.label}
              description={action.description}
              color={action.color}
              onClick={() => navigate(action.path)}
            />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading
          ? [1, 2, 3].map(i => <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}><StatCardSkeleton /></div>)
          : statCards.map((card, i) => (
          <button key={card.label} onClick={() => navigate(card.route)}
            className="glass-card glass-card-interactive p-5 text-left group animate-fade-in"
            style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: `${card.color}18`, color: card.color }}>
                {card.icon}
              </div>
              <p className="text-white/40 text-sm">{card.label}</p>
            </div>
            <p className="text-3xl font-bold transition-all group-hover:scale-105 inline-block" style={{ color: card.color }}>
              {card.value}
            </p>
          </button>
        ))}
      </div>

      {/* Featured */}
      {!loading && featuredServices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Destacados
            </h2>
            <button onClick={() => navigate('/services')} className="text-sm text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredServices.slice(0, 6).map((service, i) => (
              <div key={service._id || service.id} className="animate-fade-in animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular */}
      {!loading && popularServices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Más populares
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularServices.slice(0, 6).map((service, i) => (
              <div key={service._id || service.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Services */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Servicios recientes</h2>
          <button onClick={() => navigate('/services')} className="text-sm text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
            Ver todos
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <ServiceCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredServices.slice(0, 3).map((service, i) => (
              <div key={service._id || service.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
