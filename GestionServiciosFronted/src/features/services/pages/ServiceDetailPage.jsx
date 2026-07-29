import { useState, useEffect, useRef } from 'react'
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
import { StaticMap } from '../../../shared/components/ui/StaticMap'
import { ServiceImagePlaceholder } from '../../../shared/components/ui/ServiceImagePlaceholder'
import { ReviewForm } from '../../reviews/components/ReviewForm'
import { ReviewList } from '../../reviews/components/ReviewList'
import { useAuth } from '../../../shared/hooks/useAuth'
import { reportesService } from '../../../shared/api/services/reportesService'
import { DAYS_OF_WEEK } from '../../../shared/constants'

const REPORT_MOTIVOS = { estafa: 'Estafa', contenido_inapropiado: 'Contenido inapropiado', informacion_falsa: 'Información falsa', spam: 'Spam', otro: 'Otro' }

function AnimatedCounter({ value, label, icon }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true
        let start = 0
        const end = value || 0
        const duration = 800
        const step = Math.max(1, Math.floor(end / 30))
        const timer = setInterval(() => {
          start += step
          if (start >= end) {
            setDisplay(end)
            clearInterval(timer)
          } else {
            setDisplay(start)
          }
        }, duration / 30)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="p-3 rounded-xl bg-white/5 text-center group hover:bg-white/[0.07] transition-all">
      {icon && <div className="text-white/20 mb-1">{icon}</div>}
      <p className="text-xl font-bold text-white transition-all group-hover:scale-110">{display}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  )
}

export const ServiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isDueno } = useAuth()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

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
  const images = service.imagenes || []
  const avail = service.availability || []
  const loc = service.locationId || {}
  const hasImages = images.length > 0

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          {/* Image Gallery */}
          <div className="glass-card p-2 overflow-hidden">
            {hasImages ? (
              <>
                <div className="relative w-full h-60 sm:h-72 rounded-xl overflow-hidden group">
                  <img src={images[selectedImage]} alt={service.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,9,11,0.4)] to-transparent pointer-events-none" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-2 px-1 overflow-x-auto pb-1">
                    {images.map((url, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === i ? 'border-[var(--brand)]' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-60 sm:h-72 rounded-xl overflow-hidden">
                <ServiceImagePlaceholder nombre={service.nombre} categoria={service.categoriaId?.nombre} />
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white mb-2">{service.nombre}</h1>
                <p className="text-white/50 text-sm leading-relaxed">{service.descripcion}</p>
              </div>
              {user && !isOwner && (
                <button onClick={handleToggleFavorite} className="p-2 rounded-xl hover:bg-white/5 transition-all flex-shrink-0 group">
                  <svg className={`w-6 h-6 transition-all duration-200 ${isFavorited ? 'text-pink-400 scale-110' : 'text-white/30 group-hover:text-pink-400'}`}
                    fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {service.categoriaId?.nombre && <Badge color="purple">{service.categoriaId.nombre}</Badge>}
              {service.averageRating > 0 && <Badge color="yellow">★ {service.averageRating.toFixed(1)} ({service.reviewsCount})</Badge>}
              <Badge color={service.estado === 'activo' ? 'green' : 'red'}>{service.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge>
            </div>

            {service.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {service.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-white/40 border border-white/10">
                    {tag.name || tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <AnimatedCounter value={service.viewsCount || 0} label="Visitas" icon={
                <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              } />
              <AnimatedCounter value={service.favoritosCount || 0} label="Favoritos" icon={
                <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              } />
              <AnimatedCounter value={service.reviewsCount || 0} label="Reseñas" icon={
                <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              } />
            </div>
          </div>

          {/* Availability */}
          {avail.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Horario de atención</h2>
              <div className="space-y-1.5">
                {DAYS_OF_WEEK.map(({ value: day, label }) => {
                  const slot = avail.find(a => a.day === day)
                  return (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-white/50 w-24">{label}</span>
                      {slot ? (
                        <span className="text-white/70">{slot.open} - {slot.close}</span>
                      ) : (
                        <span className="text-white/20">Cerrado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
                <div className="flex items-center gap-3 text-sm group">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0 transition-colors group-hover:text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href={`tel:${service.telefono}`} className="text-white/70 hover:text-[var(--brand)] transition-colors">{service.telefono}</a>
                </div>
              )}
              {service.contactEmail && (
                <div className="flex items-center gap-3 text-sm group">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0 transition-colors group-hover:text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href={`mailto:${service.contactEmail}`} className="text-white/70 hover:text-[var(--brand)] transition-colors break-all">{service.contactEmail}</a>
                </div>
              )}
              {service.serviceAreaRadius && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-white/70">Radio: {service.serviceAreaRadius} km</span>
                </div>
              )}
            </div>
          </div>

          {(loc.lat || loc.municipality) && (
            <StaticMap
              lat={loc.lat}
              lng={loc.lng}
              label={service.nombre}
              height="200px"
              className="[&_.leaflet-container]:rounded-xl [&_.leaflet-container]:border [&_.leaflet-container]:border-white/10"
            />
          )}

          {/* Owner quick stats */}
          {isOwner && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Tus estadísticas</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-white">{service.viewsCount || 0}</p>
                  <p className="text-[10px] text-white/30">Visitas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{service.solicitudesCount || 0}</p>
                  <p className="text-[10px] text-white/30">Solicitudes</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pb-24 md:pb-0">
            {user && !isOwner && service.estado === 'activo' && (
              <button onClick={() => setShowRequestModal(true)} className="glass-btn w-full">
                Solicitar Servicio
              </button>
            )}

            {(isAdmin || (isDueno && isOwner)) && (
              <button onClick={() => navigate(`/services/${id}/edit`)} className="btn-info w-full justify-center text-sm">
                Editar Servicio
              </button>
            )}

            {(isAdmin || (isDueno && isOwner)) && (
              <button onClick={handleDeleteService} className="btn-danger w-full justify-center text-sm">
                Eliminar Servicio
              </button>
            )}

            {user && !isOwner && (
              <button onClick={() => setShowReportModal(true)} className="btn-outline w-full justify-center text-sm">
                Reportar Servicio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {user && !isOwner && service.estado === 'activo' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden"
          style={{
            background: 'rgba(17, 25, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
          <button onClick={() => setShowRequestModal(true)} className="glass-btn w-full">
            Solicitar Servicio
          </button>
        </div>
      )}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Solicitar Servicio" size="lg">
        <form onSubmit={handleSubmit(onRequestService)} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción de tu necesidad *</label>
            <textarea rows={3} className="glass-input resize-none" placeholder="Describe lo que necesitas..." {...register('descripcion', { required: 'La descripción es obligatoria' })} />
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

      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Reportar Servicio">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Motivo *</label>
            <select value={reportForm.motivo} onChange={(e) => setReportForm({ ...reportForm, motivo: e.target.value })} className="glass-input">
              {Object.entries(REPORT_MOTIVOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Severidad</label>
            <select value={reportForm.severity} onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })} className="glass-input">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción *</label>
            <textarea value={reportForm.descripcion} onChange={(e) => setReportForm({ ...reportForm, descripcion: e.target.value })}
              className="glass-input resize-none" rows={3} placeholder="Describe el problema con este servicio..." />
          </div>
          <button onClick={handleReport} className="btn-warning w-full justify-center text-sm">
            Enviar Reporte
          </button>
        </div>
      </Modal>
    </div>
  )
}
