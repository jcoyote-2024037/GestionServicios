import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { Spinner } from '../../../shared/components/ui/Spinner'

export const TagFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(isEditing)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing) {
      adminService.getTags().then(({ data }) => {
        const tags = data.tags || data.data || data || []
        const tag = tags.find((t) => (t._id || t.id) === id)
        if (tag) setForm({ name: tag.name || '', description: tag.description || '' })
        else { toast.error('Tag no encontrada'); navigate('/admin/tags') }
      }).catch(() => {
        toast.error('Error al cargar tag')
        navigate('/admin/tags')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditing, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nombre es obligatorio'); return }
    setSaving(true)
    try {
      if (isEditing) {
        await adminService.updateTag(id, form)
        toast.success('Tag actualizada')
      } else {
        await adminService.createTag(form)
        toast.success('Tag creada')
      }
      navigate('/admin/tags')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/admin/tags')} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-6">{isEditing ? 'Editar Tag' : 'Nueva Tag'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" placeholder="Nombre de la tag" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input resize-none" rows={4} placeholder="Descripción de la tag" />
          </div>
          <button type="submit" className="glass-btn" disabled={saving}>
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Tag' : 'Crear Tag'}
          </button>
        </form>
      </div>
    </div>
  )
}
