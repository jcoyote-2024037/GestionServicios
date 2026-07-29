import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { ChatModal } from '../../../shared/components/chat/ChatModal'
import { SOLICITUD_STATUS_LABELS, SOLICITUD_STATUS } from '../../../shared/constants'
import { useAuth } from '../../../shared/hooks/useAuth'

const statusColors = {
  pending: 'yellow', accepted: 'blue', rejected: 'red',
  completed: 'green', cancelled: 'gray', expired: 'orange',
}

const STATUS_ORDER = ['pending', 'accepted', 'completed']
const ACTIVE_STEPS = ['pending', 'accepted']

export const SolicitudDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [solicitud, setSolicitud] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [statusForm, setStatusForm] = useState({ nuevoEstado: '', observacion: '' })
  const [submittingStatus, setSubmittingStatus] = useState(false)

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
    setSubmittingStatus(true)
    try {
      await solicitudesService.changeStatus(id, statusForm)
      toast.success('Estado actualizado')
      await loadSolicitud()
      setShowStatusModal(false)
      setStatusForm({ nuevoEstado: '', observacion: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estado')
    } finally {
      setSubmittingStatus(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('¿Cancelar esta solicitud?')) return
    try {
      await solicitudesService.changeStatus(id, { nuevoEstado: 'cancelled', cancelReason: 'Cancelado por el usuario', observacion: 'Cancelado por el usuario' })
      toast.success('Solicitud cancelada')
      await loadSolicitud()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cancelar')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!solicitud) return null

  const currentStatus = solicitud.status
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const isProvider = solicitud.proveedorId && Number(solicitud.proveedorId) === Number(user?.id)
  const isRequester = solicitud.usuarioId && Number(solicitud.usuarioId) === Number(user?.id)
  const canAct = isAdmin || isProvider
  const isTerminal = ['rejected', 'cancelled', 'expired', 'completed'].includes(currentStatus)

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h1 className="text-xl font-bold text-white truncate">{solicitud.servicioId?.nombre || 'Servicio'}</h1>
            </div>
            <p className="text-white/40 text-sm ml-6">{solicitud.descripcion}</p>
          </div>
          <Badge color={statusColors[solicitud.status] || 'gray'} className="flex-shrink-0 ml-2">
            {SOLICITUD_STATUS_LABELS[solicitud.status] || solicitud.status}
          </Badge>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {solicitud.priceEstimate && (
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Presupuesto</p>
              <p className="text-white font-semibold">Q {solicitud.priceEstimate}</p>
            </div>
          )}
          {solicitud.scheduledDate && (
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Fecha programada</p>
              <p className="text-white font-semibold">{new Date(solicitud.scheduledDate).toLocaleDateString('es-GT')}</p>
            </div>
          )}
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Solicitado el</p>
            <p className="text-white font-semibold">{new Date(solicitud.fechaSolicitud || solicitud.createdAt).toLocaleDateString('es-GT')}</p>
          </div>
          {solicitud.servicioId?.categoriaId?.nombre && (
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Categoría</p>
              <p className="text-white font-semibold">{solicitud.servicioId.categoriaId.nombre}</p>
            </div>
          )}
        </div>

        {/* Progress stepper */}
        {!isTerminal && (
          <div className="mb-6">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Progreso</p>
            <div className="flex items-center gap-0">
              {STATUS_ORDER.map((status, i) => {
                const isActive = currentIndex >= i
                const isComplete = currentIndex > i
                const isCurrent = currentIndex === i && ACTIVE_STEPS.includes(currentStatus)
                return (
                  <div key={status} className="flex-1 flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all duration-300 ${
                      isComplete ? 'bg-green-500/20 text-green-400' :
                      isCurrent ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/30 animate-pulse-soft' :
                      'bg-white/5 text-white/20'
                    }`}>
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : isCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                      )}
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                        i < currentIndex ? 'bg-green-500/40' : 'bg-white/10'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              {STATUS_ORDER.map((status) => (
                <span key={status} className={`text-[10px] transition-all ${
                  STATUS_ORDER.indexOf(status) <= currentIndex ? 'text-white/40' : 'text-white/15'
                }`}>
                  {SOLICITUD_STATUS_LABELS[status]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Terminal status display */}
        {isTerminal && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            currentStatus === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
            currentStatus === 'rejected' ? 'bg-red-500/10 border border-red-500/20' :
            currentStatus === 'cancelled' ? 'bg-gray-500/10 border border-gray-500/20' :
            'bg-orange-500/10 border border-orange-500/20'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              currentStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
              currentStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
              currentStatus === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
              'bg-orange-500/20 text-orange-400'
            }`}>
              {currentStatus === 'completed' ? '✓' : currentStatus === 'rejected' ? '✕' : currentStatus === 'cancelled' ? '−' : '!'}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                Solicitud {SOLICITUD_STATUS_LABELS[currentStatus]?.toLowerCase()}
              </p>
              <p className="text-white/40 text-xs">{new Date(solicitud.updatedAt || solicitud.createdAt).toLocaleDateString('es-GT')}</p>
            </div>
          </div>
        )}

        {/* Requester info */}
        {solicitud.usuario && (
          <div className="p-4 rounded-xl bg-white/5 mb-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Solicitante</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
                {(solicitud.usuario.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{solicitud.usuario.name}</p>
                <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                  {solicitud.usuario.email && <span>{solicitud.usuario.email}</span>}
                  {solicitud.usuario.phone && <span>{solicitud.usuario.phone}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel reason */}
        {solicitud.cancelReason && (
          <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/15 mb-4">
            <p className="text-[10px] text-red-400/60 uppercase tracking-wider mb-1">Razón de cancelación</p>
            <p className="text-white/80 text-sm">{solicitud.cancelReason}</p>
          </div>
        )}

        {/* Status history timeline */}
        {solicitud.historialEstados?.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Historial</p>
            <div className="space-y-0">
              {solicitud.historialEstados.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 transition-all ${
                      i === 0 ? 'bg-[var(--brand)] shadow-[0_0_6px_var(--brand-glow)]' : 'bg-white/15'
                    }`} />
                    {i < solicitud.historialEstados.length - 1 && (
                      <div className="w-px flex-1 bg-white/5 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <Badge color={statusColors[h.estado] || 'gray'}>
                        {SOLICITUD_STATUS_LABELS[h.estado] || h.estado}
                      </Badge>
                      <span className="text-white/15 text-[11px]">
                        {new Date(h.fecha).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {h.observacion && (
                      <p className="text-white/25 text-xs mt-1">{h.observacion}</p>
                    )}
                    {h.cambiadoPor && (
                      <p className="text-white/10 text-[10px] mt-0.5">por {h.cambiadoPor}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {solicitud.status === 'pending' && canAct && (
            <>
              <button onClick={() => { setStatusForm({ nuevoEstado: 'accepted', observacion: '' }); setShowStatusModal(true) }}
                className="btn-success flex-1 min-w-[120px] justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Aceptar
              </button>
              <button onClick={() => { setStatusForm({ nuevoEstado: 'rejected', observacion: '' }); setShowStatusModal(true) }}
                className="btn-danger flex-1 min-w-[120px] justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Rechazar
              </button>
            </>
          )}
          {solicitud.status === 'accepted' && canAct && (
            <button onClick={() => { setStatusForm({ nuevoEstado: 'completed', observacion: '' }); setShowStatusModal(true) }}
              className="btn-success flex-1 justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Marcar Completada
            </button>
          )}
          {['accepted', 'completed'].includes(solicitud.status) && (isRequester || canAct) && (
            <button onClick={() => setShowChat(true)}
              className="btn-info flex-1 justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Chatear
            </button>
          )}
          {['pending', 'accepted'].includes(solicitud.status) && (isRequester || isAdmin) && (
            <button onClick={handleCancel}
              className="btn-outline justify-center">
              Cancelar solicitud
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title={statusForm.nuevoEstado === 'accepted' ? 'Aceptar Solicitud' : statusForm.nuevoEstado === 'rejected' ? 'Rechazar Solicitud' : 'Actualizar Estado'}>
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
          <button onClick={handleStatusChange} className="glass-btn" disabled={submittingStatus}>
            {submittingStatus ? 'Actualizando...' : 'Confirmar'}
          </button>
        </div>
      </Modal>
      {showChat && (
        <ChatModal solicitudId={id} isOpen={showChat} onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}
