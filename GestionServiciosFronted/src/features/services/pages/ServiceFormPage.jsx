import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { servicesService } from '../../../shared/api/services/servicesService'
import { categoriesService } from '../../../shared/api/services/categoriesService'
import { adminService } from '../../../shared/api/services/adminService'
import { Spinner } from '../../../shared/components/ui/Spinner'

export const ServiceFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(isEditing)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre: '', descripcion: '', categoriaId: '', locationId: '',
      telefono: '', contactEmail: '', serviceAreaRadius: 5
    }
  })

  useEffect(() => {
    Promise.all([
      categoriesService.getActive().then(({ data }) => setCategories(data.categories || data.data || data || [])),
      adminService.getLocations().then(({ data }) => setLocations(data.locations || data.data || data || []))
    ]).catch(() => {})

    if (isEditing) {
      servicesService.getById(id).then(({ data }) => {
        const s = data.service || data
        reset({
          nombre: s.nombre || '',
          descripcion: s.descripcion || '',
          categoriaId: s.categoriaId?._id || s.categoriaId || '',
          locationId: s.locationId?._id || s.locationId || '',
          telefono: s.telefono || '',
          contactEmail: s.contactEmail || '',
          serviceAreaRadius: s.serviceAreaRadius || 5,
        })
      }).catch(() => {
        toast.error('Error al cargar servicio')
        navigate('/services')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditing, navigate, reset])

  const onSubmit = async (formData) => {
    try {
      if (isEditing) {
        await servicesService.update(id, formData)
        toast.success('Servicio actualizado')
      } else {
        await servicesService.create(formData)
        toast.success('Servicio creado')
      }
      navigate('/services')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-6">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nombre *</label>
            <input className="glass-input" placeholder="Nombre del servicio" {...register('nombre', { required: 'Nombre requerido', maxLength: { value: 100, message: 'Máximo 100 caracteres' } })} />
            {errors.nombre && <p className="text-xs text-red-400 mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción *</label>
            <textarea rows={4} className="glass-input resize-none" placeholder="Describe tu servicio" {...register('descripcion', { required: 'Descripción requerida', maxLength: { value: 500, message: 'Máximo 500 caracteres' } })} />
            {errors.descripcion && <p className="text-xs text-red-400 mt-1">{errors.descripcion.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Categoría *</label>
              <select className="glass-input" {...register('categoriaId', { required: 'Categoría requerida' })}>
                <option value="" className="bg-[#111928]">Seleccionar</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id} className="bg-[#111928]">{cat.nombre}</option>
                ))}
              </select>
              {errors.categoriaId && <p className="text-xs text-red-400 mt-1">{errors.categoriaId.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Ubicación *</label>
              <select className="glass-input" {...register('locationId', { required: 'Ubicación requerida' })}>
                <option value="" className="bg-[#111928]">Seleccionar</option>
                {locations.map((loc) => (
                  <option key={loc._id || loc.id} value={loc._id || loc.id} className="bg-[#111928]">{loc.nombre || loc.direccion || `Ubicación #${loc._id || loc.id}`}</option>
                ))}
              </select>
              {errors.locationId && <p className="text-xs text-red-400 mt-1">{errors.locationId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Teléfono *</label>
              <input className="glass-input" placeholder="7-15 dígitos" {...register('telefono', { required: 'Teléfono requerido', pattern: { value: /^\d{7,15}$/, message: '7-15 dígitos numéricos' } })} />
              {errors.telefono && <p className="text-xs text-red-400 mt-1">{errors.telefono.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Email de contacto</label>
              <input type="email" className="glass-input" placeholder="Opcional" {...register('contactEmail')} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Radio de cobertura (km)</label>
            <input type="number" min={1} max={100} className="glass-input" {...register('serviceAreaRadius')} />
          </div>

          <button type="submit" className="glass-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}
          </button>
        </form>
      </div>
    </div>
  )
}
