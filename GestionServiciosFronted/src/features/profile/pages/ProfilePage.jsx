import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../../shared/hooks/useAuth'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { servicesService } from '../../../shared/api/services/servicesService'
import { Badge } from '../../../shared/components/ui/Badge'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { SOLICITUD_STATUS_LABELS } from '../../../shared/constants'

const statusColors = {
  pending: 'yellow', accepted: 'blue', rejected: 'red',
  completed: 'green', cancelled: 'gray', expired: 'orange',
}

export const ProfilePage = () => {
  const { user, updateProfile, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [myServices, setMyServices] = useState([])
  const [myHistory, setMyHistory] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: errProfile, isSubmitting: subProfile } } = useForm({
    defaultValues: {
      name: user?.name || '',
      surname: user?.surname || '',
      username: user?.username || '',
    }
  })

  const { register: regPass, handleSubmit: submitPass, formState: { errors: errPass, isSubmitting: subPass }, reset: resetPass } = useForm()

  const loadTabData = useCallback(async () => {
    if (activeTab === 'services' && user?.id) {
      setLoadingData(true)
      try {
        const { data } = await servicesService.getAll()
        const all = data.services || data.data || (Array.isArray(data) ? data : [])
        setMyServices(all.filter((s) => String(s.usuarioId) === String(user.id)))
      } catch {} finally { setLoadingData(false) }
    }
    if (activeTab === 'history' && user?.id) {
      setLoadingData(true)
      try {
        const { data } = await solicitudesService.getHistoryByUser(user.id)
        setMyHistory(data.data || data.solicitudes || (Array.isArray(data) ? data : []))
      } catch {} finally { setLoadingData(false) }
    }
  }, [activeTab, user?.id])

  useEffect(() => { loadTabData() }, [loadTabData])

  const onUpdateProfile = async (formData) => {
    try {
      await updateProfile(formData)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    }
  }

  const onUpdatePassword = async (formData) => {
    try {
      await updateProfile({ password: formData.newPassword })
      toast.success('Contraseña actualizada')
      resetPass()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar contraseña')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'services', label: 'Mis servicios' },
    { id: 'history', label: 'Historial' },
  ]

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] text-2xl font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user?.name} {user?.surname}</h1>
          <p className="text-white/40 text-sm">{user?.email}</p>
          <Badge color={isAdmin ? 'purple' : 'blue'} className="mt-1">
            {isAdmin ? 'Administrador' : 'Usuario'}
          </Badge>
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 border border-white/5">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--brand)]/20 text-[var(--brand)]'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Información Personal</h2>
            <form onSubmit={submitProfile(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Nombre</label>
                  <input {...regProfile('name', { required: 'Requerido' })} className="glass-input" />
                  {errProfile.name && <p className="text-xs text-red-400 mt-1">{errProfile.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Apellido</label>
                  <input {...regProfile('surname')} className="glass-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Username</label>
                <input {...regProfile('username', { required: 'Requerido' })} className="glass-input" />
                {errProfile.username && <p className="text-xs text-red-400 mt-1">{errProfile.username.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Email</label>
                <input value={user?.email || ''} disabled className="glass-input opacity-50" />
                <p className="text-xs text-white/20 mt-1">El email no se puede cambiar</p>
              </div>
              <button type="submit" disabled={subProfile}
                className="btn-primary">
                {subProfile ? 'Guardando...' : 'Actualizar Perfil'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Cambiar Contraseña</h2>
            <form onSubmit={submitPass(onUpdatePassword)} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Contraseña actual</label>
                <input type="password" {...regPass('currentPassword', { required: 'Requerida' })} className="glass-input" />
                {errPass.currentPassword && <p className="text-xs text-red-400 mt-1">{errPass.currentPassword.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Nueva contraseña</label>
                <input type="password" {...regPass('newPassword', { required: 'Requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} className="glass-input" />
                {errPass.newPassword && <p className="text-xs text-red-400 mt-1">{errPass.newPassword.message}</p>}
              </div>
              <button type="submit" disabled={subPass}
                className="btn-outline">
                {subPass ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>

          <button onClick={logout}
            className="btn-danger">
            Cerrar Sesión
          </button>
        </div>
      )}

      {activeTab === 'services' && (
        loadingData ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : !myServices.length ? (
          <EmptyState title="No tienes servicios" description="Crea tu primer servicio para empezar"
            action={<button onClick={() => navigate('/services/new')} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--brand)]/20 text-[var(--brand)] hover:bg-[var(--brand)]/30 border border-[var(--brand)]/30 transition-all">Crear servicio</button>} />
        ) : (
          <div className="space-y-3">
            {myServices.map((s) => (
              <div key={s._id || s.id} onClick={() => navigate(`/services/${s._id || s.id}`)}
                className="glass-card glass-card-interactive p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium text-sm">{s.nombre}</p>
                  <Badge color={s.estado === 'activo' ? 'green' : 'gray'}>{s.estado}</Badge>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'history' && (
        loadingData ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : !myHistory.length ? (
          <EmptyState title="Sin historial" description="Tus solicitudes aparecerán aquí" />
        ) : (
          <div className="space-y-3">
            {myHistory.map((sol) => (
              <div key={sol._id || sol.id} onClick={() => navigate(`/solicitudes/${sol._id || sol.id}`)}
                className="glass-card glass-card-interactive p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{sol.servicioId?.nombre || 'Servicio'}</p>
                    <p className="text-white/30 text-xs mt-1">{new Date(sol.fechaSolicitud || sol.createdAt).toLocaleDateString('es-GT')}</p>
                  </div>
                  <Badge color={statusColors[sol.status] || 'gray'}>
                    {SOLICITUD_STATUS_LABELS[sol.status] || sol.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
