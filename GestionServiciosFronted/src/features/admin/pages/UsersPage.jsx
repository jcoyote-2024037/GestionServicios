import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../../../shared/api/services/adminService'
import { DataTable } from '../../../shared/components/ui/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog'
import { SearchBar } from '../../../shared/components/ui/SearchBar'

export const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [roleId, setRoleId] = useState(null)
  const [roleAction, setRoleAction] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const { data } = await adminService.getUsers(params)
      setUsers(data.users || data.data || data || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(deleteId)
      toast.success('Usuario eliminado')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
    setDeleteId(null)
  }

  const handleRoleChange = async () => {
    try {
      const newRole = roleAction === 'make_dueno' ? 'DUENO_ROLE' : 'USER_ROLE'
      await adminService.updateUser(roleId, { role: newRole })
      toast.success(`Rol actualizado a ${newRole === 'DUENO_ROLE' ? 'Dueño' : 'Usuario'}`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar rol')
    }
    setRoleId(null)
    setRoleAction(null)
  }

  const columns = [
    { key: 'id', label: 'ID', width: '60px', render: (v, row) => <span className="text-white/30 text-xs">{String(row.id || row._id || '')}</span> },
    { key: 'name', label: 'Nombre', render: (v, row) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] text-xs font-bold">
          {(row.name || '?').charAt(0)}
        </div>
        <span className="text-white text-sm">{`${row.name || ''} ${row.surname || ''}`.trim() || '-'}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: (v) => <span className="text-white/60 text-sm">{v}</span> },
    { key: 'username', label: 'Username', render: (v) => <span className="text-white/40 text-sm">{v}</span> },
    { key: 'role', label: 'Rol', render: (v) => {
      const color = v === 'ADMIN_ROLE' ? 'purple' : v === 'DUENO_ROLE' ? 'yellow' : 'blue'
      const label = v === 'ADMIN_ROLE' ? 'Admin' : v === 'DUENO_ROLE' ? 'Dueño' : 'Usuario'
      return <Badge color={color}>{label}</Badge>
    }},
    { key: 'status', label: 'Estado', render: (v) => <Badge color={v ? 'green' : 'red'}>{v ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.role !== 'ADMIN_ROLE' && (
            <button onClick={(e) => { e.stopPropagation(); setRoleId(row.id || row._id); setRoleAction(row.role === 'DUENO_ROLE' ? 'remove_dueno' : 'make_dueno') }}
              className={`btn-sm ${row.role === 'DUENO_ROLE' ? 'btn-outline' : 'btn-primary'}`}>
              {row.role === 'DUENO_ROLE' ? 'Quitar Dueño' : 'Hacer Dueño'}
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(row.id || row._id) }}
            className="btn-sm btn-danger">
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        <p className="text-white/40 text-sm mt-1">Administra los usuarios del sistema</p>
      </div>
      <div className="mb-4">
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar usuarios por nombre, email..." />
      </div>
      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={users} loading={loading} currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <ConfirmDialog isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Eliminar Usuario" message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer." danger />
      <ConfirmDialog isOpen={Boolean(roleId)} onClose={() => { setRoleId(null); setRoleAction(null) }} onConfirm={handleRoleChange}
        title={roleAction === 'make_dueno' ? 'Hacer Dueño' : 'Quitar Dueño'}
        message={roleAction === 'make_dueno' ? '¿Estás seguro de que deseas convertir a este usuario en Dueño? Podrá gestionar servicios y solicitudes.' : '¿Estás seguro de que deseas quitar el rol de Dueño a este usuario?'}
        confirmText={roleAction === 'make_dueno' ? 'Hacer Dueño' : 'Quitar Dueño'} />
    </div>
  )
}
