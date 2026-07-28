import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { servicesService } from '../../../shared/api/services/servicesService'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { favoritesService } from '../../../shared/api/services/favoritesService'
import { reviewsService } from '../../../shared/api/services/reviewsService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { ReviewForm } from '../../reviews/components/ReviewForm'
import { ReviewList } from '../../reviews/components/ReviewList'
import { useAuth } from '../../../shared/hooks/useAuth'
import { reportesService } from '../../../shared/api/services/reportesService'

const REPORT_MOTIVOS = { estafa: 'Estafa', contenido_inapropiado: 'Contenido inapropiado', informacion_falsa: 'Información falsa', spam: 'Spam', otro: 'Otro' }

export const ServiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { descripcion: '', priceEstimate: '', scheduledDate: '' }
  })

  const [reportForm, setReportForm] = useState({ motivo: 'spam', descripcion: '', severity: 'medium' })

  const handleReport = async () => {
    if (!reportForm.descripcion.trim()) { toast.error('Describe el problema'); return }
    try {
      await reportesService.create({ servicioId: id, ...reportForm })
      toast.success('Reporte enviado')
      setShowReportModal(false)
      setReportForm({ motivo: 'spam', descripcion: '', severity: 'medium' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reportar')
    }
  }

  const handleDeleteService = async () => {
    if (!confirm('¿Eliminar este servicio permanentemente?')) return
    try {
      await servicesService.delete(id)
      toast.success('Servicio eliminado')
      navigate('/services')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [serviceRes, reviewsRes] = await Promise.all([
          servicesService.getById(id),
          reviewsService.getByService(id).catch(() => ({ data: { reviews: [] } }))
        ])
        setService(serviceRes.data.service || serviceRes.data)
        setReviews(reviewsRes.data.reviews || reviewsRes.data || [])
      } catch {
        toast.error('Error al cargar servicio')
        navigate('/services')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleToggleFavorite = async () => {
    try {
      await favoritesService.create({ servicioId: id })
      setIsFavorited(!isFavorited)
      toast.success(isFavorited ? 'Removido de favoritos' : 'Agregado a favoritos')
    } catch {
      toast.error('Error con favorito')
    }
  }

  const onRequestService = async (formData) => {
    setSubmitting(true)
    try {
      await solicitudesService.create({
        servicioId: id,
        descripcion: formData.descripcion,
        priceEstimate: formData.priceEstimate ? Number(formData.priceEstimate) : undefined,
        scheduledDate: formData.scheduledDate || undefined,
      })
      toast.success('Solicitud enviada')
      setShowRequestModal(false)
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!service) return null

  const isOwner = user?.id === service.usuarioId

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div className="space-y-6 min-w-0">
          {service.imagenes?.[0] && (
            <img src={service.imagenes[0]} alt={service.nombre} className="w-full h-64 object-cover rounded-2xl" />
          )}

          <div className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{service.nombre}</h1>
                <p className="text-white/50 text-sm">{service.descripcion}</p>
              </div>
              {user && !isOwner && (
                <button onClick={handleToggleFavorite} className="p-2 rounded-xl hover:bg-white/5 transition-all">
                  {isFavorited ? (
                    <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  ) : (
                    <svg className="w-6 h-6 text-white/30 hover:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-4">
              {service.categoriaId?.nombre && <Badge color="purple">{service.categoriaId.nombre}</Badge>}
              {service.averageRating > 0 && <Badge color="yellow">★ {service.averageRating.toFixed(1)} ({service.reviewsCount})</Badge>}
              <Badge color={service.estado === 'activo' ? 'green' : 'red'}>{service.estado}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xl font-bold text-white">{service.viewsCount || 0}</p>
                <p className="text-xs text-white/40">Visitas</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xl font-bold text-white">{service.favoritosCount || 0}</p>
                <p className="text-xs text-white/40">Favoritos</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xl font-bold text-white">{service.reviewsCount || 0}</p>
                <p className="text-xs text-white/40">Reseñas</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Reseñas</h2>
            {user && !isOwner && (
              <ReviewForm serviceId={id} onReviewCreated={(r) => setReviews([r, ...reviews])} />
            )}
            <ReviewList reviews={reviews} onUpdate={async () => {
              const { data } = await reviewsService.getByService(id)
              setReviews(data.reviews || data || [])
            }} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Detalles</h3>
            <div className="space-y-3">
              {service.telefono && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="text-white/70">{service.telefono}</span>
                </div>
              )}
              {service.contactEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-white/70">{service.contactEmail}</span>
                </div>
              )}
              {service.serviceAreaRadius && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-white/70">Radio: {service.serviceAreaRadius} km</span>
                </div>
              )}
            </div>
          </div>

          {user && !isOwner && service.estado === 'activo' && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="glass-btn w-full"
            >
              Solicitar Servicio
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => navigate(`/services/${id}/edit`)}
              className="glass-btn w-full"
            >
              Editar Servicio
            </button>
          )}

          {isAdmin && (
            <button onClick={handleDeleteService}
              className="btn-danger">
              Eliminar Servicio
            </button>
          )}

          {user && !isOwner && (
            <button onClick={() => setShowReportModal(true)}
              className="btn-warning">
              Reportar Servicio
            </button>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Solicitar Servicio" size="lg">
        <form onSubmit={handleSubmit(onRequestService)} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción de tu necesidad *</label>
            <textarea
              rows={3}
              className="glass-input resize-none"
              placeholder="Describe lo que necesitas..."
              {...register('descripcion', { required: 'La descripción es obligatoria' })}
            />
            {errors.descripcion && <p className="text-xs text-red-400 mt-1">{errors.descripcion.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Presupuesto estimado (Q)</label>
              <input type="number" className="glass-input" placeholder="Opcional" {...register('priceEstimate')} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Fecha preferida</label>
              <input type="date" className="glass-input" {...register('scheduledDate')} />
            </div>
          </div>
          <button type="submit" className="glass-btn" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Reportar Servicio">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Motivo *</label>
            <select value={reportForm.motivo} onChange={(e) => setReportForm({ ...reportForm, motivo: e.target.value })} className="glass-input">
              {Object.entries(REPORT_MOTIVOS).map(([k, v]) => <option key={k} value={k} className="bg-[#111928]">{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Severidad</label>
            <select value={reportForm.severity} onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })} className="glass-input">
              <option value="low" className="bg-[#111928]">Baja</option>
              <option value="medium" className="bg-[#111928]">Media</option>
              <option value="high" className="bg-[#111928]">Alta</option>
              <option value="critical" className="bg-[#111928]">Crítica</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción *</label>
            <textarea value={reportForm.descripcion} onChange={(e) => setReportForm({ ...reportForm, descripcion: e.target.value })}
              className="glass-input resize-none" rows={3} placeholder="Describe el problema con este servicio..." />
          </div>
          <button onClick={handleReport} className="w-full py-3 rounded-xl text-sm font-medium bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 transition-all">
            Enviar Reporte
          </button>
        </div>
      </Modal>
    </div>
  )
}
