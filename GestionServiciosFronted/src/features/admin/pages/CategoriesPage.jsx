import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { categoriesService } from '../../../shared/api/services/categoriesService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await categoriesService.getAll()
      setCategories(data.categories || data.data || data || [])
    } catch {
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const openCreate = () => { setForm({ nombre: '', descripcion: '' }); setEditId(null); setShowForm(true) }
  const openEdit = (cat) => { setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' }); setEditId(cat._id || cat.id); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { toast.error('Nombre es obligatorio'); return }
    try {
      if (editId) { await categoriesService.update(editId, form); toast.success('Categoría actualizada') }
      else { await categoriesService.create(form); toast.success('Categoría creada') }
      setShowForm(false); fetchCategories()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar') }
  }

  const handleDelete = async () => {
    try { await categoriesService.delete(deleteId); toast.success('Categoría eliminada'); fetchCategories() }
    catch (err) { toast.error(err.response?.data?.message || 'Error al eliminar') }
    setDeleteId(null)
  }

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (v) => <span className="text-white font-medium text-sm">{v}</span> },
    { key: 'descripcion', label: 'Descripción', render: (v) => <span className="text-white/50 text-sm truncate block max-w-xs">{v || '-'}</span> },
    { key: 'estado', label: 'Estado', render: (v) => <Badge color={v === 'activo' ? 'green' : 'red'}>{v}</Badge> },
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
          <h1 className="text-2xl font-bold text-white">Categorías</h1>
          <p className="text-white/40 text-sm mt-1">Gestiona las categorías de servicios</p>
        </div>
        <button onClick={openCreate}
          className="btn-primary">
          + Nueva
        </button>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={categories} loading={loading} />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Nombre *</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="glass-input" placeholder="Nombre de la categoría" />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="glass-input resize-none" rows={3} placeholder="Descripción de la categoría" />
          </div>
          <button type="submit"
            className="btn-primary w-full">
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Categoría" message="¿Estás seguro? Esta acción no se puede deshacer." danger />
    </div>
  )
}
