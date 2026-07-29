import { useState } from 'react'
import toast from 'react-hot-toast'
import { reviewsService } from '../../../shared/api/services/reviewsService'
import { useAuth } from '../../../shared/hooks/useAuth'
import { StarRating } from './Star'

export const ReviewForm = ({ serviceId, onReviewCreated }) => {
  const { user } = useAuth()
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comentario.trim() || comentario.length < 20) {
      toast.error('El comentario debe tener al menos 20 caracteres')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await reviewsService.create({
        servicioId: serviceId,
        usuarioId: Number(user?.id),
        calificacion,
        comentario,
        title: title || undefined,
      })
      toast.success('Reseña publicada')
      onReviewCreated?.(data.review || data)
      setComentario('')
      setTitle('')
      setCalificacion(5)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al publicar reseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] text-sm font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{user?.name || 'Tu'}</p>
          <StarRating value={calificacion} onChange={setCalificacion} size="sm" />
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--brand)]/50 mb-2"
        placeholder="Título de tu reseña (opcional)"
      />

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--brand)]/50 resize-none mb-3"
        rows={3}
        placeholder="Cuéntanos sobre tu experiencia (mínimo 20 caracteres)..."
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">{comentario.length} / 500</span>
        <button type="submit" disabled={submitting || comentario.length < 20}
          className="glass-btn">
          {submitting ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}
