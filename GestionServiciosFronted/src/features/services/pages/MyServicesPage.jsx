import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { servicesService } from '../../../shared/api/services/servicesService'
import { Badge } from '../../../shared/components/ui/Badge'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
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

  const totalViews = services.reduce((sum, s) => sum + (s.viewsCount || 0), 0)
  const activeCount = services.filter(s => s.estado === 'activo').length

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Servicios</h1>
          <p className="text-white/40 text-sm mt-1">Administra tus propios servicios</p>
        </div>
        <button onClick={() => navigate('/services/new')}
          className="glass-btn w-auto px-5 py-2.5 text-sm">
          + Nuevo Servicio
        </button>
      </div>

      {/* Mini stats */}
      {services.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-white">{services.length}</p>
            <p className="text-[11px] text-white/30 mt-0.5">Total</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
            <p className="text-[11px] text-white/30 mt-0.5">Activos</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-[var(--brand)]">{totalViews}</p>
            <p className="text-[11px] text-white/30 mt-0.5">Visitas totales</p>
          </div>
        </div>
      )}

      {!services.length ? (
        <EmptyState
          title="No tienes servicios"
          description="Crea tu primer servicio para empezar a recibir solicitudes"
          action={
            <button onClick={() => navigate('/services/new')}
              className="glass-btn w-auto px-6">
              Crear Servicio
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {services.map((s, i) => (
            <div key={s._id || s.id}
              className="glass-card glass-card-interactive p-4 cursor-pointer group"
              onClick={() => navigate(`/services/${s._id || s.id}`)}
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
                    {(s.nombre || '?').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{s.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.categoriaId?.nombre && (
                        <span className="text-[11px] text-white/30">{s.categoriaId.nombre}</span>
                      )}
                      {s.averageRating > 0 && (
                        <span className="text-[11px] text-yellow-400/60">★ {s.averageRating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/25">
                    <span>{s.viewsCount || 0} vistas</span>
                    <span>{s.favoritosCount || 0} fav</span>
                  </div>
                  <Badge color={s.estado === 'activo' ? 'green' : 'red'}>{s.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-3 sm:hidden">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/services/${s._id || s.id}/edit`) }}
                  className="btn-sm btn-edit flex-1 justify-center">
                  Editar
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(s._id || s.id) }}
                  className="btn-sm btn-danger flex-1 justify-center">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Servicio" message="¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer." danger />
    </div>
  )
}
