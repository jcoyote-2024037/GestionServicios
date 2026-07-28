import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { Modal } from '../../../shared/components/ui/Modal'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'

const emptyForm = { name: '', address: '', municipality: '', department: '', zona: '', lat: '', lng: '' }

export const LocationsPage = () => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)

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

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (loc) => {
    setForm({
      name: loc.name || '', address: loc.address || '', municipality: loc.municipality || '',
      department: loc.department || '', zona: loc.zona || '',
      lat: loc.lat?.toString() || '', lng: loc.lng?.toString() || ''
    })
    setEditId(loc._id || loc.id); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nombre es obligatorio'); return }
    const payload = { ...form, lat: form.lat ? Number(form.lat) : undefined, lng: form.lng ? Number(form.lng) : undefined }
    try {
      if (editId) { await adminService.updateLocation(editId, payload); toast.success('Ubicacion actualizada') }
      else { await adminService.createLocation(payload); toast.success('Ubicacion creada') }
      setShowForm(false); fetchLocations()
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar') }
  }

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
          <h1 className="text-2xl font-bold text-white">Ubicaciones</h1>
          <p className="text-white/40 text-sm mt-1">Gestiona las ubicaciones del sistema</p>
        </div>
        <button onClick={openCreate}
          className="btn-primary">
          + Nueva
        </button>
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={locations} loading={loading} />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Editar Ubicacion' : 'Nueva Ubicacion'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Direccion</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="glass-input" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Municipio</label>
              <input value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} className="glass-input" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Departamento</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="glass-input" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Zona</label>
              <input value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })} className="glass-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Latitud</label>
              <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="glass-input" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Longitud</label>
              <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="glass-input" />
            </div>
          </div>
          <button type="submit"
            className="btn-primary w-full">
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Ubicacion" message="Estas seguro? Esta accion no se puede deshacer." danger />
    </div>
  )
}
