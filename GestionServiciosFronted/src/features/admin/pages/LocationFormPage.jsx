import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { Spinner } from '../../../shared/components/ui/Spinner'

const emptyForm = { name: '', address: '', municipality: '', department: '', zona: '', lat: '', lng: '' }

export const LocationFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(isEditing)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing) {
      adminService.getLocations().then(({ data }) => {
        const locations = data.locations || data.data || data || []
        const loc = locations.find((l) => (l._id || l.id) === id)
        if (loc) {
          setForm({
            name: loc.name || '', address: loc.address || '', municipality: loc.municipality || '',
            department: loc.department || '', zona: loc.zona || '',
            lat: loc.lat?.toString() || '', lng: loc.lng?.toString() || ''
          })
        } else { toast.error('Ubicación no encontrada'); navigate('/admin/locations') }
      }).catch(() => {
        toast.error('Error al cargar ubicación')
        navigate('/admin/locations')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditing, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nombre es obligatorio'); return }
    const payload = { ...form, lat: form.lat ? Number(form.lat) : undefined, lng: form.lng ? Number(form.lng) : undefined }
    setSaving(true)
    try {
      if (isEditing) {
        await adminService.updateLocation(id, payload)
        toast.success('Ubicación actualizada')
      } else {
        await adminService.createLocation(payload)
        toast.success('Ubicación creada')
      }
      navigate('/admin/locations')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/admin/locations')} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-6">{isEditing ? 'Editar Ubicación' : 'Nueva Ubicación'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" placeholder="Nombre" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Dirección</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="glass-input" placeholder="Dirección" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Municipio</label>
              <input value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} className="glass-input" placeholder="Municipio" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Departamento</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="glass-input" placeholder="Departamento" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Zona</label>
              <input value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })} className="glass-input" placeholder="Zona" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Latitud</label>
              <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="glass-input" placeholder="0.0000" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Longitud</label>
              <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="glass-input" placeholder="0.0000" />
            </div>
          </div>
          <button type="submit" className="glass-btn" disabled={saving}>
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Ubicación' : 'Crear Ubicación'}
          </button>
        </form>
      </div>
    </div>
  )
}
