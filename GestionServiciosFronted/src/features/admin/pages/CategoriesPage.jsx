import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { categoriesService } from '../../../shared/api/services/categoriesService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

export const CategoriesPage = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

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
          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/categories/${(row._id || row.id)}/edit`) }} className="btn-sm btn-edit">Editar</button>
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
        <button onClick={() => navigate('/admin/categories/new')}
          className="btn-primary">
          + Nueva
        </button>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={categories} loading={loading} />
      </div>

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Categoría" message="¿Estás seguro? Esta acción no se puede deshacer." danger />
    </div>
  )
}
