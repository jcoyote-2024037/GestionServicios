import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { REPORT_STATUS_LABELS, REPORT_MOTIVES } from '../../../shared/constants'

export const ReportsPage = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reviewForm, setReviewForm] = useState({ nuevoStatus: 'resolved', resolution: '' })

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminService.getReports({ page, limit: 10 })
      setReports(data.reports || data.data || data || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      toast.error('Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchReports() }, [fetchReports])

  const handleReview = async () => {
    try {
      await adminService.reviewReport(selectedReport._id || selectedReport.id, reviewForm)
      toast.success('Reporte revisado')
      setSelectedReport(null)
      setReviewForm({ nuevoStatus: 'resolved', resolution: '' })
      fetchReports()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al revisar')
    }
  }

  const handleDelete = async (report) => {
    if (!confirm('¿Eliminar este reporte permanentemente?')) return
    try {
      await adminService.deleteReport(report._id || report.id)
      toast.success('Reporte eliminado')
      fetchReports()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const columns = [
    { key: 'servicioId', label: 'Servicio', render: (v) => <span className="text-white text-sm">{v?.nombre || v?.toString()?.slice(0, 8) || '-'}</span> },
    { key: 'motivo', label: 'Motivo', render: (v) => <Badge color="orange">{REPORT_MOTIVES[v] || v}</Badge> },
    { key: 'severity', label: 'Severidad', render: (v) => <Badge color={v === 'critical' ? 'red' : v === 'high' ? 'orange' : v === 'medium' ? 'yellow' : 'gray'}>{v}</Badge> },
    { key: 'status', label: 'Estado', render: (v) => {
      const colors = { pending: 'yellow', under_review: 'blue', resolved: 'green', dismissed: 'gray' }
      return <Badge color={colors[v] || 'gray'}>{REPORT_STATUS_LABELS[v] || v}</Badge>
    }},
    { key: 'createdAt', label: 'Fecha', render: (v) => <span className="text-white/40 text-xs">{new Date(v).toLocaleDateString('es-GT')}</span> },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setSelectedReport(row) }}
            className="btn-sm btn-edit">Revisar</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
            className="btn-sm btn-danger">Eliminar</button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reportes</h1>
        <p className="text-white/40 text-sm mt-1">Revisa y modera los reportes de servicios</p>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={reports} loading={loading} currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={Boolean(selectedReport)} onClose={() => setSelectedReport(null)} title="Revisar Reporte">
        {selectedReport && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-white/40">Motivo</p>
              <p className="text-white text-sm font-medium">{REPORT_MOTIVES[selectedReport.motivo] || selectedReport.motivo}</p>
              <p className="text-xs text-white/40 mt-2">Descripción</p>
              <p className="text-white text-sm">{selectedReport.descripcion}</p>
              <p className="text-xs text-white/40 mt-2">Severidad</p>
              <Badge color={selectedReport.severity === 'critical' ? 'red' : 'orange'}>{selectedReport.severity}</Badge>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Acción</label>
              <select value={reviewForm.nuevoStatus} onChange={(e) => setReviewForm({ ...reviewForm, nuevoStatus: e.target.value })} className="glass-input">
                <option value="resolved" className="bg-[#111928]">Resuelto</option>
                <option value="dismissed" className="bg-[#111928]">Desestimado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Resolución</label>
              <textarea value={reviewForm.resolution} onChange={(e) => setReviewForm({ ...reviewForm, resolution: e.target.value })}
                className="glass-input resize-none" rows={3} placeholder="Describe la resolución..." />
            </div>
            <button onClick={handleReview}
              className="btn-primary w-full">
              Confirmar Revisión
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
