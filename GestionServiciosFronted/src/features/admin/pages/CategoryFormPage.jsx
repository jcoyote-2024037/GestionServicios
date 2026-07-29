import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { categoriesService } from '../../../shared/api/services/categoriesService'
import { Spinner } from '../../../shared/components/ui/Spinner'

export const CategoryFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(isEditing)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing) {
      categoriesService.getById(id).then(({ data }) => {
        const cat = data.category || data
        setForm({ nombre: cat.nombre || '', descripcion: cat.descripcion || '' })
      }).catch(() => {
        toast.error('Error al cargar categoría')
        navigate('/admin/categories')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditing, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { toast.error('Nombre es obligatorio'); return }
    setSaving(true)
    try {
      if (isEditing) {
        await categoriesService.update(id, form)
        toast.success('Categoría actualizada')
      } else {
        await categoriesService.create(form)
        toast.success('Categoría creada')
      }
      navigate('/admin/categories')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/admin/categories')} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-6">{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nombre *</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="glass-input" placeholder="Nombre de la categoría" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="glass-input resize-none" rows={4} placeholder="Descripción de la categoría" />
          </div>
          <button type="submit" className="glass-btn" disabled={saving}>
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Categoría' : 'Crear Categoría'}
          </button>
        </form>
      </div>
    </div>
  )
}
