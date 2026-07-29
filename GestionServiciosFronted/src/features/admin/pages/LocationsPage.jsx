import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

export const LocationsPage = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminService.getLocations()
      setLocations(data.locations || data.data || data || [])
    } catch {
      toast.error('Error al cargar ubicaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLocations() }, [fetchLocations])

  const handleDelete = async () => {
    try { await adminService.deleteLocation(deleteId); toast.success('Ubicacion eliminada'); fetchLocations() }
    catch (err) { toast.error(err.response?.data?.message || 'Error al eliminar') }
    setDeleteId(null)
  }

  const columns = [
    { key: 'name', label: 'Nombre', render: (v) => <span className="text-white font-medium text-sm">{v}</span> },
    { key: 'municipality', label: 'Municipio', render: (v) => <span className="text-white/60 text-sm">{v || '-'}</span> },
    { key: 'department', label: 'Departamento', render: (v) => <span className="text-white/60 text-sm">{v || '-'}</span> },
    { key: 'zona', label: 'Zona', render: (v) => <span className="text-white/40 text-sm">{v || '-'}</span> },
    { key: 'status', label: 'Estado', render: (v) => <Badge color={v ? 'green' : 'red'}>{v ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/locations/${(row._id || row.id)}/edit`) }} className="btn-sm btn-edit">Editar</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(row._id || row.id) }} className="btn-sm btn-danger">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ubicaciones</h1>
          <p className="text-white/40 text-sm mt-1">Gestiona las ubicaciones del sistema</p>
        </div>
        <button onClick={() => navigate('/admin/locations/new')}
          className="btn-primary">
          + Nueva
        </button>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={locations} loading={loading} />
      </div>

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Ubicacion" message="Estas seguro? Esta accion no se puede deshacer." danger />
    </div>
  )
}
