import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

export const BadgesPage = () => {
  const navigate = useNavigate()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

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
          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/badges/${(row._id || row.id)}/edit`) }} className="btn-sm btn-edit">Editar</button>
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
          <button onClick={() => navigate('/admin/badges/new')}
            className="glass-btn">
            + Nueva
          </button>
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={badges} loading={loading} />
      </div>

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Insignia" message="Estas seguro? Esta accion no se puede deshacer." danger />
    </div>
  )
}
