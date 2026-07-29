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
    <div className="animate-fade-in space-y-8">
      {/* Greeting */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(236,72,153,0.05))',
          border: '1px solid rgba(244,63,94,0.1)',
        }}>
        <div className="flex items-center gap-4 relative z-10">
          <span className="text-3xl animate-float">{greet.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {greet.text}, <span className="gradient-text">{user?.name || 'usuario'}</span>
            </h1>
            <p className="text-white/40 text-sm mt-1">Bienvenido a tu panel de GestionServicios</p>
          </div>
        </div>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[var(--brand)] opacity-[0.03] blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[var(--accent)] opacity-[0.02] blur-3xl" />
      </div>

      {/* Quick actions */}
      <div>
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Acciones rápidas
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      </div>

      {/* Stats */}
      <div>
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Resumen
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading
            ? [1, 2, 3].map(i => <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}><StatCardSkeleton /></div>)
            : statCards.map((card, i) => (
            <button key={card.label} onClick={() => navigate(card.route)}
              className="stat-card text-left group animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s`, '--stat-color': card.color } as React.CSSProperties}>
              <div className="flex items-center gap-3 mb-4">
                <div className="stat-icon" style={{ background: `${card.color}18`, color: card.color }}>
                  {card.icon}
                </div>
                <p className="text-white/40 text-sm font-medium">{card.label}</p>
              </div>
              <p className="stat-value" style={{ color: card.color }}>
                {card.value}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {!loading && featuredServices.length > 0 && (
        <div>
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Destacados
            </h2>
            <button onClick={() => navigate('/services')} className="section-link">
              Ver todos
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
        <div>
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
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
      <div className="pb-4">
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Servicios recientes
          </h2>
          <button onClick={() => navigate('/services')} className="section-link">
            Ver todos
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
