import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'
import { BADGE_TYPES } from '../../../shared/constants'

const emptyForm = { name: '', description: '', badgeType: 'CALIFICACION', icon: '', priority: 50 }

export const BadgesPage = () => {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const fetchBadges = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminService.getBadges()
      setBadges(data.badges || data.data || data || [])
    } catch {
      toast.error('Error al cargar insignias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBadges() }, [fetchBadges])

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (b) => {
    setForm({
      name: b.name || '', description: b.description || '',
      badgeType: b.badgeType || 'CALIFICACION', icon: b.icon || '', priority: b.priority || 50
    })
    setEditId(b._id || b.id); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nombre es obligatorio'); return }
    try {
      if (editId) { await adminService.updateBadge(editId, form); toast.success('Insignia actualizada') }
      else { await adminService.createBadge(form); toast.success('Insignia creada') }
      setShowForm(false); fetchBadges()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar') }
  }

  const handleDelete = async () => {
    try { await adminService.deleteBadge(deleteId); toast.success('Insignia eliminada'); fetchBadges() }
    catch (err) { toast.error(err.response?.data?.message || 'Error al eliminar') }
    setDeleteId(null)
  }

  const handleAutoAssignAll = async () => {
    try { await adminService.autoAssignAllBadges(); toast.success('Auto-asignacion completada') }
    catch (err) { toast.error(err.response?.data?.message || 'Error en auto-asignacion') }
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (v) => <span className="text-white font-medium text-sm">{v}</span> },
    { key: 'badgeType', label: 'Tipo', render: (v) => <Badge color="purple">{v}</Badge> },
    { key: 'priority', label: 'Prioridad', render: (v) => <span className="text-white/40 text-sm">{v}</span> },
    { key: 'autoAssign', label: 'Auto', render: (v) => <Badge color={v ? 'green' : 'gray'}>{v ? 'Si' : 'No'}</Badge> },
    { key: 'status', label: 'Estado', render: (v) => <Badge color={v ? 'green' : 'red'}>{v ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row) }} className="btn-sm btn-edit">Editar</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(row._id || row.id) }} className="btn-sm btn-danger">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Insignias</h1>
          <p className="text-white/40 text-sm mt-1">Gestiona las insignias del sistema</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAutoAssignAll}
            className="btn-sm btn-success">
            Auto-Asignar Todas
          </button>
          <button onClick={openCreate}
            className="btn-primary">
            + Nueva
          </button>
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={badges} loading={loading} />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Editar Insignia' : 'Nueva Insignia'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripcion</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input resize-none" rows={3} />
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
          <button type="submit"
            className="btn-primary w-full">
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Insignia" message="Estas seguro? Esta accion no se puede deshacer." danger />
    </div>
  )
}
