import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { Spinner } from '../../../shared/components/ui/Spinner'

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, reportsRes, logsRes] = await Promise.allSettled([
          adminService.getUsers({ limit: 1 }),
          adminService.getPendingReports(),
          adminService.getLogs({ limit: 1 }),
        ])
        setStats({
          totalUsers: usersRes.value?.data?.total || usersRes.value?.data?.users?.length || 0,
          pendingReports: reportsRes.value?.data?.reports?.length || reportsRes.value?.data?.total || 0,
          totalLogs: logsRes.value?.data?.total || logsRes.value?.data?.logs?.length || 0,
        })
      } catch {
        toast.error('Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  const cards = [
    { label: 'Usuarios', value: stats?.totalUsers || 0, color: '#8b5cf6', route: '/admin/users', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    )},
    { label: 'Reportes Pendientes', value: stats?.pendingReports || 0, color: '#ef4444', route: '/admin/reports', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
    )},
    { label: 'Logs de Auditoría', value: stats?.totalLogs || 0, color: '#3b82f6', route: '/admin/logs', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
  ]

  const shortcuts = [
    { label: 'Usuarios', route: '/admin/users', color: '#8b5cf6' },
    { label: 'Categorías', route: '/admin/categories', color: 'var(--brand)' },
    { label: 'Ubicaciones', route: '/admin/locations', color: '#10b981' },
    { label: 'Tags', route: '/admin/tags', color: '#f59e0b' },
    { label: 'Insignias', route: '/admin/badges', color: '#ec4899' },
    { label: 'Reportes', route: '/admin/reports', color: '#ef4444' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="text-white/40 text-sm mt-1">Vista general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <button key={card.label} onClick={() => navigate(card.route)}
            className="glass-card glass-card-interactive p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
              <p className="text-white/40 text-sm">{card.label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold text-white mb-4">Accesos rápidos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shortcuts.map((s) => (
          <button key={s.route} onClick={() => navigate(s.route)}
            className="glass-card glass-card-interactive p-4 text-left">
            <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ background: `${s.color}20` }}>
              <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            </div>
            <p className="text-white text-sm font-medium">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
