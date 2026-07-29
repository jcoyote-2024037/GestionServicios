import { useState } from 'react'
import toast from 'react-hot-toast'
import { Star } from './Star'
import { useAuth } from '../../../shared/hooks/useAuth'
import { reviewsService } from '../../../shared/api/services/reviewsService'

export const ReviewList = ({ reviews = [], onUpdate }) => {
  const { user, isAdmin } = useAuth()
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [reportModal, setReportModal] = useState(null)
  const [reportReason, setReportReason] = useState('inappropriate_content')

  if (!reviews.length) {
    return (
      <div className="text-center py-8">
        <p className="text-white/30 text-sm">No hay reseñas aún</p>
        <p className="text-white/15 text-xs mt-1">Sé el primero en dejar tu opinión</p>
      </div>
    )
  }

  const avgRating = reviews.reduce((acc, r) => acc + (r.calificacion || 0), 0) / reviews.length

  const handleLike = async (review) => {
    if (!user) { toast.error('Inicia sesión para dar like'); return }
    try {
      await reviewsService.like(review._id || review.id)
      toast.success('Like registrado')
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al dar like')
    }
  }

  const handleDelete = async (review) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    try {
      await reviewsService.delete(review._id || review.id)
      toast.success('Reseña eliminada')
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const startEdit = (review) => {
    setEditingId(review._id || review.id)
    setEditText(review.comentario || '')
  }

  const handleEdit = async (review) => {
    if (!editText.trim()) { toast.error('El comentario no puede estar vacío'); return }
    try {
      await reviewsService.update(review._id || review.id, { comentario: editText })
      toast.success('Reseña actualizada')
      setEditingId(null)
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    }
  }

  const handleReport = async (review) => {
    try {
      await reviewsService.report(review._id || review.id, { reason: reportReason, descripcion: 'Reportado desde el frontend' })
      toast.success('Reporte enviado')
      setReportModal(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reportar')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
        <div className="text-center">
          <p className="text-3xl font-bold text-[var(--accent)]">{avgRating.toFixed(1)}</p>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} filled={s <= Math.round(avgRating)} size="xs" />)}
          </div>
          <p className="text-white/30 text-xs mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => r.calificacion === star).length
          const pct = reviews.length ? (count / reviews.length) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2 flex-1">
              <span className="text-xs text-white/40 w-2">{star}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-white/30 w-6 text-right">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        {reviews.map((review) => {
          const rid = review._id || review.id
          const isOwner = user && (String(user.id) === String(review.usuarioId?._id || review.usuarioId))
          const isEditing = editingId === rid
          return (
            <div key={rid} className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] text-sm font-medium">
                    {review.usuarioId?.name?.charAt(0) || (typeof review.usuarioId === 'string' ? review.usuarioId.charAt(0) : 'U')}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {review.usuarioId?.name ? `${review.usuarioId.name} ${review.usuarioId.surname || ''}`.trim() : `Usuario`}
                    </p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} filled={s <= review.calificacion} size="xs" />)}
                    </div>
                  </div>
                </div>
                <span className="text-white/20 text-xs">{new Date(review.fecha || review.createdAt).toLocaleDateString('es-GT')}</span>
              </div>
              {review.title && <p className="text-white/80 text-sm font-medium mb-1">{review.title}</p>}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                    className="glass-input resize-none text-sm w-full" rows={2} />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(review)}
                      className="btn-sm btn-primary">
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="btn-sm btn-ghost">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">{review.comentario}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-white/30">
                <button onClick={() => handleLike(review)}
                  className="flex items-center gap-1 hover:text-[var(--brand)] transition-colors">
                  ♥ {review.likesCount || 0}
                </button>
                {isOwner && (
                  <>
                    <button onClick={() => startEdit(review)}
                      className="hover:text-yellow-400 transition-colors">Editar</button>
                    <button onClick={() => handleDelete(review)}
                      className="hover:text-red-400 transition-colors">Eliminar</button>
                  </>
                )}
                {user && !isOwner && (
                  <button onClick={() => setReportModal(rid)}
                    className="hover:text-orange-400 transition-colors">Reportar</button>
                )}
                {isAdmin && (
                  <button onClick={() => reviewsService.moderate(rid, { status: review.moderationStatus === 'approved' ? 'rejected' : 'approved' }).then(() => { toast.success('Moderado'); onUpdate?.() })}
                    className="hover:text-purple-400 transition-colors">
                    {review.moderationStatus === 'approved' ? 'Rechazar' : 'Aprobar'}
                  </button>
                )}
                {review.isVerifiedPurchase && (
                  <span className="text-green-400/70 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Compra verificada
                  </span>
                )}
              </div>

              {reportModal === rid && (
                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-orange-500/20 space-y-2">
                  <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="glass-input text-xs">
                    <option value="inappropriate_content" className="bg-[#111928]">Contenido inapropiado</option>
                    <option value="spam" className="bg-[#111928]">Spam</option>
                    <option value="false_information" className="bg-[#111928]">Información falsa</option>
                    <option value="harassment" className="bg-[#111928]">Acoso</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => handleReport(review)}
                      className="btn-sm btn-warning">
                      Enviar reporte
                    </button>
                    <button onClick={() => setReportModal(null)}
                      className="btn-sm btn-ghost">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
