import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

export const TagsPage = () => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  const fetchTags = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminService.getTags()
      setTags(data.tags || data.data || data || [])
    } catch {
      toast.error('Error al cargar tags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTags() }, [fetchTags])

  const openCreate = () => { setForm({ name: '', description: '' }); setEditId(null); setShowForm(true) }
  const openEdit = (tag) => { setForm({ name: tag.name || '', description: tag.description || '' }); setEditId(tag._id || tag.id); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nombre es obligatorio'); return }
    try {
      if (editId) { await adminService.updateTag(editId, form); toast.success('Tag actualizada') }
      else { await adminService.createTag(form); toast.success('Tag creada') }
      setShowForm(false); fetchTags()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar') }
  }

  const handleDelete = async () => {
    try { await adminService.deleteTag(deleteId); toast.success('Tag eliminada'); fetchTags() }
    catch (err) { toast.error(err.response?.data?.message || 'Error al eliminar') }
    setDeleteId(null)
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (v) => <span className="text-white font-medium text-sm">{v}</span> },
    { key: 'slug', label: 'Slug', render: (v) => <span className="text-white/30 text-xs font-mono">{v}</span> },
    { key: 'description', label: 'Descripción', render: (v) => <span className="text-white/50 text-sm truncate block max-w-xs">{v || '-'}</span> },
    { key: 'usageCount', label: 'Usos', render: (v) => <span className="text-white/40 text-sm">{v || 0}</span> },
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
          <h1 className="text-2xl font-bold text-white">Tags</h1>
          <p className="text-white/40 text-sm mt-1">Gestiona las etiquetas de servicios</p>
        </div>
        <button onClick={openCreate}
          className="btn-primary">
          + Nueva
        </button>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={tags} loading={loading} />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Editar Tag' : 'Nueva Tag'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" placeholder="Nombre de la tag" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input resize-none" rows={3} placeholder="Descripción de la tag" />
          </div>
          <button type="submit"
            className="btn-primary w-full">
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Tag" message="¿Estás seguro? Esta acción no se puede deshacer." danger />
    </div>
  )
}
