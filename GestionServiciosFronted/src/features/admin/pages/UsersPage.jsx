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
    { key: 'role', label: 'Rol', render: (v) => <Badge color={v === 'ADMIN_ROLE' ? 'purple' : 'blue'}>{v === 'ADMIN_ROLE' ? 'Admin' : 'Usuario'}</Badge> },
    { key: 'status', label: 'Estado', render: (v) => <Badge color={v ? 'green' : 'red'}>{v ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', label: '', render: (_, row) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteId(row.id || row._id) }}
          className="btn-sm btn-danger">
          Eliminar
        </button>
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
    </div>
  )
}
