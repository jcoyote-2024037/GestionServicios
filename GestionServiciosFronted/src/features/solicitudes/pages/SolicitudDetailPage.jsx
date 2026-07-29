import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { ChatModal } from '../../../shared/components/chat/ChatModal'
import { SOLICITUD_STATUS_LABELS } from '../../../shared/constants'
import { useAuth } from '../../../shared/hooks/useAuth'

const statusColors = {
  pending: 'yellow', accepted: 'blue', rejected: 'red',
  completed: 'green', cancelled: 'gray', expired: 'orange',
}

export const SolicitudDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isDueno } = useAuth()
  const [solicitud, setSolicitud] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [statusForm, setStatusForm] = useState({ nuevoEstado: '', observacion: '' })

  const loadSolicitud = async () => {
    try {
      const { data } = await solicitudesService.getById(id)
      setSolicitud(data.solicitud || data)
    } catch {
      toast.error('Error al cargar solicitud')
      navigate('/solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSolicitud() }, [id, navigate])

  const handleStatusChange = async () => {
    try {
      await solicitudesService.changeStatus(id, statusForm)
      toast.success('Estado actualizado')
      await loadSolicitud()
      setShowStatusModal(false)
      setStatusForm({ nuevoEstado: '', observacion: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const handleCancel = async () => {
    try {
      await solicitudesService.changeStatus(id, { nuevoEstado: 'cancelled', observacion: 'Cancelado por el usuario' })
      toast.success('Solicitud cancelada')
      await loadSolicitud()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cancelar')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!solicitud) return null

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">{solicitud.servicioId?.nombre || 'Servicio'}</h1>
            <p className="text-white/40 text-sm mt-1">{solicitud.descripcion}</p>
          </div>
          <Badge color={statusColors[solicitud.status] || 'gray'}>
            {SOLICITUD_STATUS_LABELS[solicitud.status] || solicitud.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {solicitud.priceEstimate && (
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-white/40">Presupuesto</p>
              <p className="text-white font-medium">Q {solicitud.priceEstimate}</p>
            </div>
          )}
          {solicitud.scheduledDate && (
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-white/40">Fecha programada</p>
              <p className="text-white font-medium">{new Date(solicitud.scheduledDate).toLocaleDateString('es-GT')}</p>
            </div>
          )}
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-white/40">Fecha de solicitud</p>
            <p className="text-white font-medium">{new Date(solicitud.fechaSolicitud || solicitud.createdAt).toLocaleDateString('es-GT')}</p>
          </div>
        </div>

        {solicitud.usuario && (
          <div className="p-3 rounded-xl bg-white/5 mb-4">
            <p className="text-xs text-white/40 mb-2">Solicitante</p>
            <div className="space-y-1 text-sm text-white/80">
              <p className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {solicitud.usuario.name}
              </p>
              {solicitud.usuario.email && (
                <p className="text-white/60 text-xs flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {solicitud.usuario.email}
                </p>
              )}
              {solicitud.usuario.phone && (
                <p className="text-white/60 text-xs flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {solicitud.usuario.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {(isAdmin || isDueno || solicitud.chatEnabled || solicitud.usuarioId === user?.id || solicitud.usuario?.id === user?.id) && (
          <button onClick={() => setShowChat(true)}
            className="w-full mb-4 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Chatear con el solicitante
          </button>
        )}

        {solicitud.historialEstados?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-2">Historial de estados</p>
            <div className="space-y-2">
              {solicitud.historialEstados.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-white/50 text-xs">{new Date(h.fecha).toLocaleDateString('es-GT')}</span>
                  <Badge color={statusColors[h.estado] || 'gray'}>{SOLICITUD_STATUS_LABELS[h.estado] || h.estado}</Badge>
                  {h.observacion && <span className="text-white/30 text-xs">{h.observacion}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {solicitud.cancelReason && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <p className="text-xs text-red-400">Razón de cancelación</p>
            <p className="text-white text-sm">{solicitud.cancelReason}</p>
          </div>
        )}

        <div className="flex gap-3">
          {solicitud.status === 'pending' && (
            <>
              <button onClick={() => { setStatusForm({ nuevoEstado: 'accepted', observacion: '' }); setShowStatusModal(true) }}
                className="btn-success" style={{ flex: 1 }}>
                Aceptar
              </button>
              <button onClick={() => { setStatusForm({ nuevoEstado: 'rejected', observacion: '' }); setShowStatusModal(true) }}
                className="btn-danger" style={{ flex: 1 }}>
                Rechazar
              </button>
            </>
          )}
          {solicitud.status === 'accepted' && (
            <button onClick={() => { setStatusForm({ nuevoEstado: 'completed', observacion: '' }); setShowStatusModal(true) }}
              className="btn-info" style={{ flex: 1 }}>
              Marcar Completada
            </button>
          )}
          {['pending', 'accepted'].includes(solicitud.status) && (
            <button onClick={handleCancel}
              className="btn-outline" style={{ flex: 1 }}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Cambiar Estado">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Observación</label>
            <textarea
              value={statusForm.observacion}
              onChange={(e) => setStatusForm({ ...statusForm, observacion: e.target.value })}
              className="glass-input resize-none"
              rows={3}
              placeholder="Opcional: agrega un comentario"
            />
          </div>
          <button onClick={handleStatusChange} className="glass-btn">Confirmar</button>
        </div>
      </Modal>
      {showChat && (
        <ChatModal solicitudId={id} isOpen={showChat} onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}
