import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useServiceStore } from '../store/serviceStore'
import { Input, Textarea, Select } from '../../../shared/components/ui/Input'
import { Button } from '../../../shared/components/ui/Button'

const CATEGORIES = [
  'Diseño', 'Tecnología', 'Marketing', 'Educación', 'Salud',
  'Construcción', 'Hogar', 'Legal', 'Finanzas', 'Otro'
]

export const ServiceFormPage = () => {
  const { createService } = useServiceStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    const res = await createService(data)
    setLoading(false)
    if (res.success) {
      toast.success('Servicio publicado exitosamente')
      navigate(`/services/${res.service._id}`)
    } else {
      toast.error(res.error || 'Error al publicar')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
          Publicar nuevo servicio
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-3)' }}>
          Completa la información de tu servicio para que los clientes puedan encontrarte
        </p>
      </div>

      <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Título del servicio *"
            placeholder="ej. Diseño de logotipo profesional"
            error={errors.title?.message}
            {...register('title', { required: 'El título es requerido', minLength: { value: 5, message: 'Mínimo 5 caracteres' } })}
          />

          <Textarea
            label="Descripción *"
            placeholder="Describe detalladamente qué ofreces, tu experiencia y qué incluye el servicio..."
            rows={5}
            error={errors.description?.message}
            {...register('description', { required: 'La descripción es requerida', minLength: { value: 50, message: 'Mínimo 50 caracteres' } })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Categoría *"
              error={errors.category?.message}
              {...register('category', { required: 'Selecciona una categoría' })}
            >
              <option value="">Seleccionar...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Input
              label="Precio (Q) *"
              type="number"
              placeholder="500"
              error={errors.price?.message}
              {...register('price', { required: 'El precio es requerido', min: { value: 1, message: 'Precio mínimo Q1' } })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ubicación"
              placeholder="Ciudad de Guatemala"
              {...register('location')}
            />
            <Input
              label="Duración estimada"
              placeholder="ej. 3-5 días hábiles"
              {...register('duration')}
            />
          </div>

          <Input
            label="URL de imagen (opcional)"
            placeholder="https://ejemplo.com/imagen.jpg"
            type="url"
            {...register('image')}
          />

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Publicar servicio
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
