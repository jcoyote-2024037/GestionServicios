import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { Badge } from '../../../shared/components/ui/Badge'
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
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = isAdmin
        ? await solicitudesService.getAll({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })
        : await solicitudesService.getHistoryByUser(user?.id)
      setSolicitudes(data.data || data.solicitudes || (Array.isArray(data) ? data : []))
      setTotalPages(data.pagination?.totalPages || data.totalPages || 1)
    } catch {
      toast.error('Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, isAdmin, user?.id])

  useEffect(() => { fetchSolicitudes() }, [fetchSolicitudes])

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Solicitudes</h1>
        <p className="text-white/40 text-sm mt-1">
          {isAdmin ? 'Todas las solicitudes del sistema' : 'Tus solicitudes de servicio'}
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
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {sol.servicioId?.nombre || 'Servicio'}
                    </p>
                    <p className="text-white/40 text-xs mt-1 truncate">{sol.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
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
          {isAdmin && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}
