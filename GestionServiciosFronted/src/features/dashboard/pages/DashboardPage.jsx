import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesService } from '../../../shared/api/services/servicesService'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { favoritesService } from '../../../shared/api/services/favoritesService'
import { useAuthStore } from '../../auth/store/authStore'
import { ServiceCard } from '../../../shared/components/ui/ServiceCard'
import { Spinner } from '../../../shared/components/ui/Spinner'

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState({ servicios: 0, solicitudes: 0, favoritos: 0 })
  const [recentServices, setRecentServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [servicesRes, solicitudesRes, favsRes] = await Promise.allSettled([
          servicesService.getAll({ limit: 6 }),
          user?.id ? solicitudesService.getHistoryByUser(user.id) : Promise.resolve({ data: [] }),
          user?.id ? favoritesService.getByUser(user.id) : Promise.resolve({ data: [] }),
        ])

        const svcs = servicesRes.status === 'fulfilled' ? (servicesRes.value?.data?.services || servicesRes.value?.data?.data || (Array.isArray(servicesRes.value?.data) ? servicesRes.value.data : [])) : []
        const sols = solicitudesRes.status === 'fulfilled' ? (solicitudesRes.value?.data?.data || solicitudesRes.value?.data?.solicitudes || (Array.isArray(solicitudesRes.value?.data) ? solicitudesRes.value.data : [])) : []
        const favs = favsRes.status === 'fulfilled' ? (favsRes.value?.data?.favorites || favsRes.value?.data?.data || (Array.isArray(favsRes.value?.data) ? favsRes.value.data : [])) : []

        setStats({ servicios: svcs.length, solicitudes: sols.length, favoritos: favs.length })
        setRecentServices(svcs.slice(0, 6))
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchStats()
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Hola, {user?.name || 'usuario'} <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Bienvenido a tu panel de GestionServicios</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <button key={card.label} onClick={() => navigate(card.route)}
            className="glass-card glass-card-interactive p-5 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
              <p className="text-white/40 text-sm">{card.label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: card.color }}>
              {loading ? <span className="inline-block w-12 h-8 rounded bg-white/10 animate-pulse" /> : card.value}
            </p>
          </button>
        ))}
      </div>

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
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : !recentServices.length ? (
          <div className="glass-card p-8 text-center">
            <p className="text-white/30 text-sm">No hay servicios disponibles aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentServices.map((service) => (
              <ServiceCard key={service._id || service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
