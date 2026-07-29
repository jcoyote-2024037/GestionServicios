import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { servicesService } from '../../../shared/api/services/servicesService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

export const MyServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const navigate = useNavigate()

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await servicesService.getMine()
      setServices(data.services || data.data || (Array.isArray(data) ? data : []))
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const handleDelete = async () => {
    try {
      await servicesService.delete(deleteId)
      toast.success('Servicio eliminado')
      fetchServices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
    setDeleteId(null)
  }

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '200px', render: (v, row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] text-sm font-bold flex-shrink-0">
          {(v || '?').charAt(0)}
        </div>
        <span className="text-white text-sm font-medium truncate">{v || '-'}</span>
      </div>
    )},
    { key: 'categoriaId', label: 'Categoría', render: (v) => <span className="text-white/60 text-sm">{v?.nombre || '-'}</span> },
    { key: 'estado', label: 'Estado', render: (v) => <Badge color={v === 'activo' ? 'green' : 'red'}>{v === 'activo' ? 'Activo' : 'Inactivo'}</Badge> },
    { key: 'averageRating', label: 'Rating', render: (v) => <span className="text-yellow-400 text-sm">{v ? `${v.toFixed(1)} ⭐` : '-'}</span> },
    {
      key: 'actions', label: '', width: '150px', render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/services/${row._id || row.id}/edit`) }}
            className="btn-sm btn-primary">
            Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(row._id || row.id) }}
            className="btn-sm btn-danger">
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Servicios</h1>
          <p className="text-white/40 text-sm mt-1">Administra tus propios servicios</p>
        </div>
        <button onClick={() => navigate('/services/new')}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
          + Nuevo Servicio
        </button>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={services} loading={loading} />
      </div>
      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Servicio" message="¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer." danger />
    </div>
  )
}
