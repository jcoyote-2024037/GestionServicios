import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { Badge } from '../../../shared/components/ui/Badge'
import { ChatModal } from '../../../shared/components/chat/ChatModal'
import { useAuth } from '../../../shared/hooks/useAuth'
import { SOLICITUD_STATUS_LABELS } from '../../../shared/constants'

const statusColors = {
  pending: 'yellow',
  accepted: 'blue',
  rejected: 'red',
  completed: 'green',
  cancelled: 'gray',
  expired: 'orange',
}

const statusIcons = {
  pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  accepted: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  cancelled: 'M6 18L18 6M6 6l12 12',
  expired: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

const statusFilters = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export const SolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [chatSolicitudId, setChatSolicitudId] = useState(null)
  const { user, isAdmin, isDueno } = useAuth()
  const navigate = useNavigate()

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    const params = { page, limit: 10, ...(statusFilter && { status: statusFilter }) }
    try {
      const res = await (isAdmin || isDueno
        ? solicitudesService.getAll(params)
        : solicitudesService.getHistoryByUser(user?.id, params))
      const { data, pagination } = res.data
      setSolicitudes(data || [])
      setTotalPages(pagination?.totalPages || 1)
    } catch {
      toast.error('Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, isAdmin, isDueno, user?.id])

  useEffect(() => { fetchSolicitudes() }, [fetchSolicitudes])

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `hace ${days}d`
    return new Date(dateStr).toLocaleDateString('es-GT')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Solicitudes</h1>
        <p className="text-white/40 text-sm mt-1">
          {isAdmin ? 'Todas las solicitudes del sistema' : isDueno ? 'Solicitudes de tus servicios' : 'Tus solicitudes de servicio'}
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1) }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              statusFilter === value
                ? 'text-white shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
            }`}
            style={statusFilter === value ? { background: 'linear-gradient(135deg, var(--brand), var(--accent))' } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !solicitudes.length ? (
        <EmptyState
          title="No hay solicitudes"
          description="Aún no tienes solicitudes de servicio"
        />
      ) : (
        <>
          <div className="space-y-3">
            {solicitudes.map((sol, idx) => {
              const serviceName = sol.servicioId?.nombre || sol.servicio?.nombre || 'Servicio'
              const daysSince = sol.fechaSolicitud || sol.createdAt
              const isUrgent = daysSince && (Date.now() - new Date(daysSince).getTime()) > 5 * 24 * 60 * 60 * 1000

              return (
                <div
                  key={sol._id || sol.id}
                  onClick={() => navigate(`/solicitudes/${sol._id || sol.id}`)}
                  className="glass-card glass-card-interactive p-4 cursor-pointer group"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={statusIcons[sol.status] || statusIcons.pending} />
                        </svg>
                        <p className="text-white font-medium text-sm truncate">{serviceName}</p>
                      </div>
                      <p className="text-white/35 text-xs line-clamp-1 ml-6">{sol.descripcion}</p>
                      {sol.usuario && (
                        <div className="flex items-center gap-2 mt-1.5 ml-6 text-[11px] text-white/25">
                          <span>{sol.usuario.name}</span>
                          {sol.usuario.phone && <span>• {sol.usuario.phone}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setChatSolicitudId(sol._id || sol.id) }}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Chatear">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      </button>
                      {sol.priceEstimate && (
                        <span className="text-white/40 text-xs font-medium">Q {sol.priceEstimate}</span>
                      )}
                      <Badge color={statusColors[sol.status] || 'gray'}>
                        {SOLICITUD_STATUS_LABELS[sol.status] || sol.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 ml-6">
                    <span className={`text-[11px] ${isUrgent && sol.status === 'pending' ? 'text-red-400' : 'text-white/20'}`}>
                      {getTimeAgo(daysSince)}
                    </span>
                    {isUrgent && sol.status === 'pending' && (
                      <span className="text-[10px] text-red-400/60 font-medium">• Sin respuesta</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      {chatSolicitudId && (
        <ChatModal solicitudId={chatSolicitudId} isOpen={true} onClose={() => setChatSolicitudId(null)} />
      )}
    </div>
  )
}
