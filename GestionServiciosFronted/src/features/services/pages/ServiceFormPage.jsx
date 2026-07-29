import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { servicesService } from '../../../shared/api/services/servicesService'
import { categoriesService } from '../../../shared/api/services/categoriesService'
import { adminService } from '../../../shared/api/services/adminService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { MapPicker } from '../../../shared/components/ui/MapPicker'
import { ServiceImagePlaceholder } from '../../../shared/components/ui/ServiceImagePlaceholder'
import { DAYS_OF_WEEK } from '../../../shared/constants'

const DAY_LABELS = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
}

export const ServiceFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(isEditing)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [availability, setAvailability] = useState([])
  const [mapLat, setMapLat] = useState(14.6349)
  const [mapLng, setMapLng] = useState(-90.5069)
  const [selectedImages, setSelectedImages] = useState([])
  const [imageUrls, setImageUrls] = useState([])

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre: '', descripcion: '', categoriaId: '', locationId: '',
      telefono: '', contactEmail: '', serviceAreaRadius: 5,
      lat: '', lng: ''
    }
  })

  const selectedLocationId = watch('locationId')

  useEffect(() => {
    if (selectedLocationId) {
      const loc = locations.find(l => (l._id || l.id) === selectedLocationId)
      if (loc?.lat && loc?.lng) {
        setMapLat(loc.lat)
        setMapLng(loc.lng)
        setValue('lat', loc.lat)
        setValue('lng', loc.lng)
      }
    }
  }, [selectedLocationId, locations, setValue])

  useEffect(() => {
    Promise.all([
      categoriesService.getActive().then(({ data }) => setCategories(data.categories || data.data || data || [])),
      adminService.getLocations().then(({ data }) => setLocations(data.locations || data.data || data || [])),
      adminService.getTags().then(({ data }) => setTags(data.tags || data.data || (Array.isArray(data) ? data : []))).catch(() => {}),
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
          lat: s.locationId?.lat || '',
          lng: s.locationId?.lng || '',
        })
        if (s.locationId?.lat && s.locationId?.lng) {
          setMapLat(s.locationId.lat)
          setMapLng(s.locationId.lng)
        }
        if (s.tags?.length) {
          setSelectedTags(s.tags.map(t => t._id || t))
        }
        if (s.availability?.length) {
          setAvailability(s.availability)
        }
        if (s.imagenes?.length) {
          setImageUrls(s.imagenes)
        }
      }).catch(() => {
        toast.error('Error al cargar servicio')
        navigate('/services')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditing, navigate, reset])

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  const toggleDay = (day) => {
    setAvailability(prev => {
      const exists = prev.find(a => a.day === day)
      if (exists) return prev.filter(a => a.day !== day)
      return [...prev, { day, open: '09:00', close: '18:00' }]
    })
  }

  const updateHour = (day, field, value) => {
    setAvailability(prev => prev.map(a => a.day === day ? { ...a, [field]: value } : a))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeImageUrl = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (formData) => {
    try {
      const data = new FormData()
      data.append('nombre', formData.nombre)
      data.append('descripcion', formData.descripcion)
      data.append('categoriaId', formData.categoriaId)
      data.append('locationId', formData.locationId)
      data.append('telefono', formData.telefono)
      data.append('contactEmail', formData.contactEmail || '')
      data.append('serviceAreaRadius', formData.serviceAreaRadius || 5)
      data.append('tags', JSON.stringify(selectedTags))
      data.append('availability', JSON.stringify(availability))

      selectedImages.forEach(file => data.append('imagenes', file))

      if (isEditing) {
        await servicesService.update(id, data)
        toast.success('Servicio actualizado')
      } else {
        await servicesService.create(data)
        toast.success('Servicio creado')
      }
      navigate('/services')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-6">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Nombre *</label>
              <input className="glass-input" placeholder="Nombre del servicio" {...register('nombre', { required: 'Nombre requerido', maxLength: { value: 100, message: 'Máximo 100 caracteres' } })} />
              {errors.nombre && <p className="text-xs text-red-400 mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Teléfono *</label>
              <input className="glass-input" placeholder="7-15 dígitos" {...register('telefono', { required: 'Teléfono requerido', pattern: { value: /^\d{7,15}$/, message: '7-15 dígitos numéricos' } })} />
              {errors.telefono && <p className="text-xs text-red-400 mt-1">{errors.telefono.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción *</label>
            <textarea rows={4} className="glass-input resize-none" placeholder="Describe tu servicio. Mínimo 20 caracteres." {...register('descripcion', { required: 'Descripción requerida', minLength: { value: 20, message: 'Mínimo 20 caracteres' }, maxLength: { value: 500, message: 'Máximo 500 caracteres' } })} />
            {errors.descripcion && <p className="text-xs text-red-400 mt-1">{errors.descripcion.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Categoría *</label>
              <select className="glass-input" {...register('categoriaId', { required: 'Categoría requerida' })}>
                <option value="" className="bg-[#111928]">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id} className="bg-[#111928]">{cat.nombre}</option>
                ))}
              </select>
              {errors.categoriaId && <p className="text-xs text-red-400 mt-1">{errors.categoriaId.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Ubicación *</label>
              <select className="glass-input" {...register('locationId', { required: 'Ubicación requerida' })}>
                <option value="" className="bg-[#111928]">Seleccionar ubicación</option>
                {locations.map((loc) => (
                  <option key={loc._id || loc.id} value={loc._id || loc.id} className="bg-[#111928]">
                    {[loc.municipality, loc.department, loc.zona].filter(Boolean).join(' - ')}
                  </option>
                ))}
              </select>
              {errors.locationId && <p className="text-xs text-red-400 mt-1">{errors.locationId.message}</p>}
            </div>
          </div>

          <MapPicker lat={mapLat} lng={mapLng} onLocationChange={(lat, lng) => { setMapLat(lat); setMapLng(lng) }} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Email de contacto</label>
              <input type="email" className="glass-input" placeholder="correo@ejemplo.com" {...register('contactEmail')} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Radio de cobertura (km)</label>
              <input type="number" min={1} max={100} className="glass-input" {...register('serviceAreaRadius')} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-3">Tags (selecciona las que apliquen)</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const tagId = tag._id || tag.id
                const isSelected = selectedTags.includes(tagId)
                return (
                  <button key={tagId} type="button" onClick={() => toggleTag(tagId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-[var(--brand)]/20 text-[var(--brand)] border-[var(--brand)]/30'
                        : 'bg-white/5 text-white/40 border-white/10 hover:text-white/60 hover:border-white/20'
                    }`}>
                    {tag.name}
                  </button>
                )
              })}
              {!tags.length && <p className="text-xs text-white/20">No hay tags disponibles. El administrador puede crearlas.</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-3">Horario de atención</label>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map(({ value: day, label }) => {
                const isActive = availability.find(a => a.day === day)
                return (
                  <div key={day} className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                    <button type="button" onClick={() => toggleDay(day)}
                      className={`w-20 sm:w-24 text-left text-xs font-medium transition-all ${
                        isActive ? 'text-[var(--brand)]' : 'text-white/30'
                      }`}>
                      {label}
                    </button>
                    {isActive ? (
                      <>
                        <input type="time" value={isActive.open} onChange={(e) => updateHour(day, 'open', e.target.value)}
                          className="glass-input w-24 sm:w-28 text-xs" />
                        <span className="text-white/20 text-xs">a</span>
                        <input type="time" value={isActive.close} onChange={(e) => updateHour(day, 'close', e.target.value)}
                          className="glass-input w-24 sm:w-28 text-xs" />
                        <button type="button" onClick={() => toggleDay(day)}
                          className="text-red-400/50 hover:text-red-400 text-xs whitespace-nowrap">Quitar</button>
                      </>
                    ) : (
                      <span className="text-white/15 text-xs">No disponible</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-3">Imágenes del servicio</label>
            <label className="flex items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all">
              <div className="text-center">
                <svg className="w-6 h-6 mx-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-white/20 mt-1">Agregar imágenes</p>
              </div>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {selectedImages.length > 0 || imageUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {imageUrls.map((url, i) => (
                  <div key={`url-${i}`} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button type="button" onClick={() => removeImageUrl(i)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      x
                    </button>
                  </div>
                ))}
                {selectedImages.map((file, i) => (
                  <div key={`file-${i}`} className="relative group">
                    <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      x
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2">
                <ServiceImagePlaceholder nombre="Vista previa" size="full" />
              </div>
            )}
          </div>

          <button type="submit" className="glass-btn w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}
          </button>
        </form>
      </div>
    </div>
  )
}
