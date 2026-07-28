import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'


export const LogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [severityFilter, setSeverityFilter] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (severityFilter) params.severity = severityFilter
      const { data } = await adminService.getLogs(params)
      setLogs(data.logs || data.data || data || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      toast.error('Error al cargar logs')
    } finally {
      setLoading(false)
    }
  }, [page, severityFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const handleDelete = async (log) => {
    if (!confirm('¿Eliminar este log permanentemente?')) return
    try {
      await adminService.deleteLog(log._id || log.id)
      toast.success('Log eliminado')
      fetchLogs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'action', label: 'Acción', render: (v) => <Badge color="purple">{v}</Badge> },
    { key: 'affectedEntity', label: 'Entidad', render: (v) => <span className="text-white text-sm">{v}</span> },
    { key: 'detail', label: 'Detalle', render: (v) => <span className="text-white/50 text-sm truncate block max-w-xs">{v || '-'}</span> },
    { key: 'severity', label: 'Severidad', render: (v) => {
      const colors = { LOW: 'gray', MEDIUM: 'yellow', HIGH: 'orange', CRITICAL: 'red' }
      return <Badge color={colors[v] || 'gray'}>{v}</Badge>
    }},
    { key: 'ipAddress', label: 'IP', render: (v) => <span className="text-white/40 text-xs font-mono">{v}</span> },
    { key: 'createdAt', label: 'Fecha', render: (v) => <span className="text-white/40 text-xs">{v ? new Date(v).toLocaleString('es-GT') : '-'}</span> },
    {
      key: 'actions', label: '', render: (_, row) => (
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
          className="btn-sm btn-danger">Eliminar</button>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Logs de Auditoría</h1>
        <p className="text-white/40 text-sm mt-1">Registro de actividades del sistema</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
          <button key={s} onClick={() => { setSeverityFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              severityFilter === s
                ? 'bg-[var(--brand)]/15 text-[var(--brand)] border-[var(--brand)]/20'
                : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent'
            }`}>
            {s || 'Todos'}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={logs} loading={loading} currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
