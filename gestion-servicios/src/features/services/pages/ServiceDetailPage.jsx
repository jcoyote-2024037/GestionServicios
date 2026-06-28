import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useServiceStore } from '../store/serviceStore'
import { useRequestStore } from '../../requests/store/requestStore'
import { useFavoriteStore } from '../../favorites/store/favoriteStore'
import { useAuthStore } from '../../auth/store/authStore'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Button } from '../../../shared/components/ui/Button'
import { Modal } from '../../../shared/components/ui/Modal'
import { Textarea, Input } from '../../../shared/components/ui/Input'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  HeartIcon, StarIcon, MapPinIcon, ClockIcon,
  CurrencyDollarIcon, ArrowLeftIcon, UserCircleIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

export const ServiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { service, loading, fetchService } = useServiceStore()
  const { createRequest } = useRequestStore()
  const { isFavorite, toggleFavorite } = useFavoriteStore()
  const { isAuthenticated } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [sending, setSending] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { fetchService(id) }, [id])

  if (loading) return <Spinner center />
  if (!service) return <div className="text-center py-20" style={{ color: 'var(--gray-3)' }}>Servicio no encontrado</div>

  const fav = isFavorite(id)
  const rating = service.avgRating || service.rating || 0

  const onRequestSubmit = async (data) => {
    if (!isAuthenticated) { toast.error('Debes iniciar sesión'); navigate('/login'); return }
    setSending(true)
    const res = await createRequest({ serviceId: id, ...data })
    setSending(false)
    if (res.success) {
      toast.success('¡Solicitud enviada!')
      reset()
      setShowModal(false)
    } else {
      toast.error(res.error || 'Error al enviar solicitud')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm font-medium hover:underline" style={{ color: 'var(--gray-3)' }}>
        <ArrowLeftIcon className="w-4 h-4" /> Volver
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden h-72 w-full" style={{ background: 'var(--gray-6)' }}>
            {service.image || service.photo ? (
              <img src={service.image || service.photo} alt={service.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🛠️</div>
            )}
          </div>

          {/* Info */}
          <div>
            {service.category && (
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3" style={{ background: 'var(--navy)', color: '#fff' }}>
                {service.category}
              </span>
            )}
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
              {service.title || service.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--gray-2)' }}>
                    {rating.toFixed(1)} ({service.reviewCount || 0} reseñas)
                  </span>
                </div>
              )}
              {service.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" style={{ color: 'var(--gray-3)' }} />
                  <span className="text-sm" style={{ color: 'var(--gray-3)' }}>{service.location}</span>
                </div>
              )}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray-2)' }}>
              {service.description}
            </p>
          </div>

          {/* Provider */}
          {service.provider && (
            <div className="rounded-2xl p-5 border" style={{ background: 'var(--gray-6)', borderColor: 'var(--gray-5)' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--navy)' }}>Proveedor</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--navy)' }}>
                  {service.provider.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--gray-1)' }}>{service.provider.name}</p>
                  <p className="text-xs" style={{ color: 'var(--gray-3)' }}>{service.provider.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border p-6 sticky top-20" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
            {(service.price || service.basePrice) && (
              <div className="mb-5">
                <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
                  Q{service.price || service.basePrice}
                </span>
                {service.priceUnit && <span className="text-sm ml-1" style={{ color: 'var(--gray-3)' }}>/{service.priceUnit}</span>}
              </div>
            )}

            <div className="flex flex-col gap-3 mb-5">
              {service.duration && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray-2)' }}>
                  <ClockIcon className="w-4 h-4" />
                  {service.duration}
                </div>
              )}
              {service.availability && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray-2)' }}>
                  <CheckBadgeIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
                  {service.availability}
                </div>
              )}
            </div>

            <Button className="w-full mb-3" size="lg" onClick={() => {
              if (!isAuthenticated) { toast.error('Inicia sesión para solicitar'); navigate('/login'); return }
              setShowModal(true)
            }}>
              Solicitar servicio
            </Button>

            <button
              onClick={async () => {
                if (!isAuthenticated) { toast.error('Inicia sesión para guardar'); return }
                await toggleFavorite(id)
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
              style={{ borderColor: 'var(--gray-5)', color: fav ? 'var(--orange)' : 'var(--gray-2)' }}
            >
              {fav ? <HeartSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
              {fav ? 'Guardado' : 'Guardar en favoritos'}
            </button>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Solicitar servicio" size="md">
        <form onSubmit={handleSubmit(onRequestSubmit)} className="flex flex-col gap-4">
          <Input
            label="Fecha requerida"
            type="date"
            error={errors.requestedDate?.message}
            {...register('requestedDate', { required: 'Selecciona una fecha' })}
          />
          <Textarea
            label="Descripción de tu necesidad"
            placeholder="Cuéntanos en qué consiste tu proyecto..."
            rows={4}
            error={errors.description?.message}
            {...register('description', { required: 'Describe tu necesidad', minLength: { value: 20, message: 'Mínimo 20 caracteres' } })}
          />
          <Input
            label="Presupuesto (opcional)"
            placeholder="Q 0.00"
            type="number"
            {...register('budget')}
          />
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={sending} className="flex-1">
              Enviar solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
