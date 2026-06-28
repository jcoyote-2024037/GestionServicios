import { useEffect, useState } from 'react'
import { useServiceStore } from '../../services/store/serviceStore'
import { useRequestStore } from '../../requests/store/requestStore'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import toast from 'react-hot-toast'
import {
  ChartBarIcon, DocumentTextIcon, WrenchScrewdriverIcon,
  UsersIcon, CheckIcon, XMarkIcon
} from '@heroicons/react/24/outline'

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { key: 'services', label: 'Servicios', icon: WrenchScrewdriverIcon },
  { key: 'requests', label: 'Solicitudes', icon: DocumentTextIcon },
]

export const AdminPage = () => {
  const { services, loading: svcLoading, fetchServices, deleteService } = useServiceStore()
  const { requests, loading: reqLoading, fetchAllRequests, updateRequestStatus } = useRequestStore()
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    fetchServices()
    fetchAllRequests()
  }, [])

  const handleStatus = async (id, status) => {
    const res = await updateRequestStatus(id, status)
    if (res.success) toast.success(`Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'}`)
    else toast.error(res.error)
  }

  const handleDeleteService = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return
    const res = await deleteService(id)
    if (res.success) toast.success('Servicio eliminado')
    else toast.error(res.error)
  }

  const stats = {
    total: services.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    totalReq: requests.length,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
          Panel de administración
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-3)' }}>
          Gestiona servicios, solicitudes y usuarios
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b pb-1" style={{ borderColor: 'var(--gray-5)' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px"
            style={tab === key
              ? { borderColor: 'var(--orange)', color: 'var(--navy)' }
              : { borderColor: 'transparent', color: 'var(--gray-3)' }
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Servicios publicados', value: stats.total, color: 'var(--navy)' },
              { label: 'Total solicitudes', value: stats.totalReq, color: 'var(--navy)' },
              { label: 'Pendientes de revisión', value: stats.pending, color: 'var(--orange)' },
              { label: 'Completadas', value: stats.completed, color: 'var(--success)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border p-5" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--gray-3)' }}>{label}</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Recent requests */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--gray-5)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--navy)' }}>Últimas solicitudes</h2>
            </div>
            {reqLoading ? <Spinner center /> : (
              <div>
                {requests.slice(0, 5).map((req) => (
                  <div key={req._id} className="px-5 py-3 flex items-center justify-between gap-4 border-b last:border-0" style={{ borderColor: 'var(--gray-5)' }}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--gray-1)' }}>
                        {req.service?.title || req.serviceTitle || 'Servicio'}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--gray-3)' }}>
                        {req.user?.name || req.userName || 'Usuario'}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services */}
      {tab === 'services' && (
        <div className="animate-fade-in">
          {svcLoading ? <Spinner center /> : (
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--gray-5)' }}>
                    {['Servicio', 'Categoría', 'Precio', 'Acciones'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--gray-3)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map((sv) => (
                    <tr key={sv._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--gray-5)' }}>
                      <td className="px-5 py-3">
                        <p className="font-medium" style={{ color: 'var(--gray-1)' }}>{sv.title || sv.name}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--gray-6)', color: 'var(--gray-2)' }}>
                          {sv.category || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold" style={{ color: 'var(--navy)' }}>
                        {sv.price ? `Q${sv.price}` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(sv._id)}
                          className="text-red-500 hover:bg-red-50 text-xs"
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Requests */}
      {tab === 'requests' && (
        <div className="animate-fade-in flex flex-col gap-3">
          {reqLoading ? <Spinner center /> : requests.map((req) => (
            <div
              key={req._id}
              className="rounded-2xl border p-5 flex items-start justify-between gap-4"
              style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--gray-1)' }}>
                    {req.service?.title || req.serviceTitle || 'Servicio'}
                  </p>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-xs mb-1" style={{ color: 'var(--gray-3)' }}>
                  Cliente: {req.user?.name || req.userName || 'Desconocido'}
                </p>
                <p className="text-xs line-clamp-1" style={{ color: 'var(--gray-3)' }}>{req.description}</p>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleStatus(req._id, 'accepted')}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: '#D1FAE5', color: '#065F46' }}
                    title="Aceptar"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStatus(req._id, 'rejected')}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: '#FEE2E2', color: '#991B1B' }}
                    title="Rechazar"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
