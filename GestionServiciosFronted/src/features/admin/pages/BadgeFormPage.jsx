import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { BADGE_TYPES } from '../../../shared/constants'

const emptyForm = { name: '', description: '', badgeType: 'CALIFICACION', icon: '', priority: 50 }

export const BadgeFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(isEditing)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing) {
      adminService.getBadges().then(({ data }) => {
        const badges = data.badges || data.data || data || []
        const badge = badges.find((b) => (b._id || b.id) === id)
        if (badge) {
          setForm({
            name: badge.name || '', description: badge.description || '',
            badgeType: badge.badgeType || 'CALIFICACION', icon: badge.icon || '',
            priority: badge.priority || 50
          })
        } else { toast.error('Insignia no encontrada'); navigate('/admin/badges') }
      }).catch(() => {
        toast.error('Error al cargar insignia')
        navigate('/admin/badges')
      }).finally(() => setLoading(false))
    }
  }, [id, isEditing, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nombre es obligatorio'); return }
    setSaving(true)
    try {
      if (isEditing) {
        await adminService.updateBadge(id, form)
        toast.success('Insignia actualizada')
      } else {
        await adminService.createBadge(form)
        toast.success('Insignia creada')
      }
      navigate('/admin/badges')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/admin/badges')} className="text-white/40 hover:text-white text-sm mb-4 transition-colors flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>

      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-6">{isEditing ? 'Editar Insignia' : 'Nueva Insignia'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" placeholder="Nombre de la insignia" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input resize-none" rows={3} placeholder="Descripción de la insignia" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Tipo</label>
              <select value={form.badgeType} onChange={(e) => setForm({ ...form, badgeType: e.target.value })} className="glass-input">
                {Object.entries(BADGE_TYPES).map(([k, v]) => <option key={k} value={v} className="bg-[#111928]">{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Prioridad (1-100)</label>
              <input type="number" min={1} max={100} value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="glass-input" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Icono (emoji)</label>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="glass-input" placeholder="..." />
          </div>
          <button type="submit" className="glass-btn" disabled={saving}>
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Insignia' : 'Crear Insignia'}
          </button>
        </form>
      </div>
    </div>
  )
}
