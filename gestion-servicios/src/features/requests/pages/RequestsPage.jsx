import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRequestStore } from '../store/requestStore'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { Button } from '../../../shared/components/ui/Button'
import { StatusBadge } from '../../../shared/components/ui/StatusBadge'
import { Modal } from '../../../shared/components/ui/Modal'
import toast from 'react-hot-toast'
import { CalendarIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

const STATUSES = ['all', 'pending', 'accepted', 'rejected', 'completed', 'cancelled']
const LABELS = { all: 'Todas', pending: 'Pendientes', accepted: 'Aceptadas', rejected: 'Rechazadas', completed: 'Completadas', cancelled: 'Canceladas' }

export const RequestsPage = () => {
  const { requests, loading, fetchMyRequests, cancelRequest } = useRequestStore()
  const [filter, setFilter] = useState('all')
  const [cancelId, setCancelId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => { fetchMyRequests() }, [])

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  const handleCancel = async () => {
    setCancelling(true)
    const res = await cancelRequest(cancelId)
    setCancelling(false)
    setCancelId(null)
    if (res.success) toast.success('Solicitud cancelada')
    else toast.error(res.error)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
          Mis solicitudes
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-3)' }}>
          Sigue el estado de todos tus pedidos de servicio
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={filter === s
              ? { background: 'var(--navy)', color: '#fff' }
              : { background: 'var(--gray-6)', color: 'var(--gray-2)' }
            }
          >
            {LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? <Spinner center /> : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-semibold mb-1" style={{ color: 'var(--navy)' }}>Sin solicitudes {filter !== 'all' ? LABELS[filter].toLowerCase() : ''}</p>
          <p className="text-sm mb-6" style={{ color: 'var(--gray-3)' }}>
            {filter === 'all' ? 'Explora servicios y solicita el que necesites' : 'Cambia el filtro para ver otras solicitudes'}
          </p>
          {filter === 'all' && <Link to="/services"><Button>Explorar servicios</Button></Link>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => (
            <div
              key={req._id}
              className="rounded-2xl border p-5 transition-all hover:shadow-md"
              style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--gray-1)' }}>
                      {req.service?.title || req.serviceTitle || 'Servicio'}
                    </h3>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--gray-3)' }}>
                    {req.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--gray-3)' }}>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {req.requestedDate
                      ? new Date(req.requestedDate).toLocaleDateString('es-GT')
                      : new Date(req.createdAt).toLocaleDateString('es-GT')
                    }
                  </div>
                </div>
                {req.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCancelId(req._id)}
                    className="text-red-500 hover:bg-red-50 shrink-0"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancelar solicitud" size="sm">
        <p className="text-sm mb-6" style={{ color: 'var(--gray-2)' }}>
          ¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setCancelId(null)}>
            Mantener
          </Button>
          <Button variant="danger" loading={cancelling} className="flex-1" onClick={handleCancel}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
