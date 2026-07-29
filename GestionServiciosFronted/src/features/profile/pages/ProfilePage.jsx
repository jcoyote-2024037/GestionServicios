import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../../shared/hooks/useAuth'
import { solicitudesService } from '../../../shared/api/services/solicitudesService'
import { servicesService } from '../../../shared/api/services/servicesService'
import { adminService } from '../../../shared/api/services/adminService'
import { Badge } from '../../../shared/components/ui/Badge'
import { ProfileSkeleton, SolicitudSkeleton } from '../../../shared/components/ui/Skeleton'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { StaticMap } from '../../../shared/components/ui/StaticMap'
import { QuickActionCard } from '../../../shared/components/ui/QuickActionCard'
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
  const [locations, setLocations] = useState([])

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: errProfile, isSubmitting: subProfile } } = useForm({
    defaultValues: {
      name: user?.name || '',
      surname: user?.surname || '',
      username: user?.username || '',
      locationId: '',
    }
  })

  useEffect(() => {
    adminService.getLocations().then((res) => {
      const body = res.data
      const list = body?.data || body?.locations || []
      setLocations(Array.isArray(list) ? list : [])
    }).catch(() => {})
  }, [])

  const userLocation = locations.find(l =>
    l.municipality?.toLowerCase() === user?.municipality?.toLowerCase() &&
    l.department?.toLowerCase() === user?.department?.toLowerCase()
  )

  const { register: regPass, handleSubmit: submitPass, formState: { errors: errPass, isSubmitting: subPass }, reset: resetPass } = useForm()

  const loadTabData = useCallback(async () => {
    if (activeTab === 'services' && user?.id) {
      setLoadingData(true)
      try {
        const { data } = await servicesService.getMine()
        setMyServices(data.services || data.data || (Array.isArray(data) ? data : []))
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
      const loc = locations.find((l) => String(l._id || l.id) === formData.locationId)
      await updateProfile({
        name: formData.name,
        surname: formData.surname,
        username: formData.username,
        municipality: loc?.municipality || '',
        department: loc?.department || '',
        zona: loc?.zona || ''
      })
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
      <div className="flex items-center gap-5 mb-8">
        <div className="relative w-16 h-16 flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] opacity-30 blur-md" />
          <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{user?.name} {user?.surname}</h1>
          <p className="text-white/40 text-sm truncate">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={isAdmin ? 'purple' : 'blue'}>
              {isAdmin ? 'Administrador' : user?.role === 'DUENO_ROLE' ? 'Dueño' : 'Usuario'}
            </Badge>
            <span className="text-white/15 text-[11px]">
              Miembro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-GT', { month: 'long', year: 'numeric' }) : 'hoy'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, label: 'Servicios', desc: loadingData ? '...' : `${myServices.length} registrados`, color: 'var(--brand)', tab: 'services' },
          { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, label: 'Historial', desc: loadingData ? '...' : `${myHistory.length} solicitudes`, color: 'var(--accent)', tab: 'history' },
          { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, label: 'Ubicación', desc: user?.municipality || 'No configurada', color: '#10b981', tab: 'profile' },
        ].map((item, i) => (
          <div key={item.label} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <QuickActionCard
              icon={item.icon}
              label={item.label}
              description={item.desc}
              color={item.color}
              onClick={() => setActiveTab(item.tab)}
            />
          </div>
        ))}
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
              <div>
                <label className="block text-xs text-white/40 mb-1">Ubicación</label>
                <select className="glass-input" {...regProfile('locationId')}>
                  <option value="" className="bg-[#111928]">{(user?.municipality ? [user?.municipality, user?.department, user?.zona].filter(Boolean).join(' - ') : 'Seleccionar ubicación')}</option>
                  {locations.map((loc) => (
                    <option key={loc._id || loc.id} value={loc._id || loc.id} className="bg-[#111928]">
                      {[loc.municipality, loc.department, loc.zona].filter(Boolean).join(' - ')}
                    </option>
                  ))}
                </select>
              </div>

              {userLocation?.lat && userLocation?.lng && (
                <StaticMap
                  lat={userLocation.lat}
                  lng={userLocation.lng}
                  label={`${user?.name} ${user?.surname}`}
                  height="180px"
                />
              )}

              <button type="submit" disabled={subProfile}
                className="glass-btn">
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
        loadingData ? <div className="py-4"><ProfileSkeleton /></div>
        : !myServices.length ? (
          <EmptyState title="No tienes servicios" description="Crea tu primer servicio para empezar"
            action={<button onClick={() => navigate('/services/new')} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--brand)]/20 text-[var(--brand)] hover:bg-[var(--brand)]/30 border border-[var(--brand)]/30 transition-all">Crear servicio</button>} />
        ) : (
          <div className="space-y-3">
            {myServices.map((s, i) => (
              <div key={s._id || s.id} onClick={() => navigate(`/services/${s._id || s.id}`)}
                className="glass-card glass-card-interactive p-4 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{s.nombre}</p>
                    {s.categoriaId?.nombre && (
                      <p className="text-white/30 text-xs mt-0.5">{s.categoriaId.nombre}</p>
                    )}
                  </div>
                  <Badge color={s.estado === 'activo' ? 'green' : 'gray'}>{s.estado === 'activo' ? 'Activo' : 'Inactivo'}</Badge>
                </div>
                {s.averageRating > 0 && (
                  <p className="text-yellow-400/60 text-xs mt-2">★ {s.averageRating.toFixed(1)}</p>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'history' && (
        loadingData ? <div className="py-4"><ProfileSkeleton /></div>
        : !myHistory.length ? (
          <EmptyState title="Sin historial" description="Tus solicitudes aparecerán aquí" />
        ) : (
          <div className="space-y-3">
            {myHistory.map((sol, i) => (
              <div key={sol._id || sol.id} onClick={() => navigate(`/solicitudes/${sol._id || sol.id}`)}
                className="glass-card glass-card-interactive p-4 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{sol.servicioId?.nombre || 'Servicio'}</p>
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
