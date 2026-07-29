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

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Solicitudes</h1>
        <p className="text-white/40 text-sm mt-1">
          {isAdmin ? 'Todas las solicitudes del sistema' : isDueno ? 'Solicitudes de tus servicios' : 'Tus solicitudes de servicio'}
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'accepted', 'rejected', 'completed', 'cancelled', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              statusFilter === status
                ? 'bg-[var(--brand)]/15 text-[var(--brand)] border-[var(--brand)]/20'
                : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            {status ? SOLICITUD_STATUS_LABELS[status] : 'Todas'}
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
            {solicitudes.map((sol) => (
              <div
                key={sol._id || sol.id}
                onClick={() => navigate(`/solicitudes/${sol._id || sol.id}`)}
                className="glass-card glass-card-interactive p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0" onClick={() => navigate(`/solicitudes/${sol._id || sol.id}`)}>
                      <p className="text-white font-medium text-sm truncate">
                        {sol.servicioId?.nombre || sol.servicio?.nombre || 'Servicio'}
                      </p>
                      <p className="text-white/40 text-xs mt-1 truncate">{sol.descripcion}</p>
                      {sol.usuario && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                          <span>{sol.usuario.name}</span>
                          {sol.usuario.email && <span>{sol.usuario.email}</span>}
                          {sol.usuario.phone && <span>{sol.usuario.phone}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setChatSolicitudId(sol._id || sol.id) }}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                        title="Chatear">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                      {sol.priceEstimate && (
                        <span className="text-white/50 text-xs font-medium">Q {sol.priceEstimate}</span>
                      )}
                      <Badge color={statusColors[sol.status] || 'gray'}>
                        {SOLICITUD_STATUS_LABELS[sol.status] || sol.status}
                      </Badge>
                    </div>
                </div>
                <p className="text-white/20 text-xs mt-2">
                  {new Date(sol.fechaSolicitud || sol.createdAt).toLocaleDateString('es-GT')}
                </p>
              </div>
            ))}
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
