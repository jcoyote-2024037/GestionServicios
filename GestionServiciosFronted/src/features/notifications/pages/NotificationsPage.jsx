import { useState, useEffect, useCallback } from 'react'
import { notificationsService } from '../../../shared/api/services/notificationsService'
import { Spinner } from '../../../shared/components/ui/Spinner'

const tipoStyles = {
  nueva_solicitud: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  solicitud_status_changed: 'bg-green-500/20 text-green-300 border-green-500/30',
  chat_notification: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const tipoLabels = {
  nueva_solicitud: 'Nueva solicitud',
  solicitud_status_changed: 'Cambio de estado',
  chat_notification: 'Mensaje',
}

export const NotificationsPage = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await notificationsService.getAll({ page, limit: 20 })
      if (data.success) {
        setNotificaciones(data.data)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Error al cargar notificaciones:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id)
      setNotificaciones((prev) =>
        prev.map((n) => (n._id === id ? { ...n, leida: true } : n))
      )
    } catch (err) {
      console.error('Error al marcar como leída:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
    } catch (err) {
      console.error('Error al marcar todas:', err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Notificaciones</h1>
        <button
          onClick={handleMarkAllAsRead}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          Marcar todas como leídas
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm">No tienes notificaciones</div>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.leida && handleMarkAsRead(n._id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                n.leida
                  ? 'border-white/5 bg-white/[0.02]'
                  : 'border-white/10 bg-white/[0.04]'
              } hover:bg-white/[0.06]`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border shrink-0 mt-0.5 ${
                    tipoStyles[n.tipo] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }`}
                >
                  {tipoLabels[n.tipo] || n.tipo}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{n.titulo}</p>
                  {n.mensaje && (
                    <p className="text-xs text-white/50 mt-0.5 truncate">{n.mensaje}</p>
                  )}
                  <p className="text-[10px] text-white/20 mt-1">
                    {new Date(n.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {!n.leida && (
                  <span className="w-2 h-2 rounded-full bg-[var(--brand)] shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Anterior
          </button>
          <span className="text-xs text-white/40">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
