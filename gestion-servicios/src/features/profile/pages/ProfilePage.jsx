import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../auth/store/authStore'
import { Input } from '../../../shared/components/ui/Input'
import { Button } from '../../../shared/components/ui/Button'
import { UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('info')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const res = await updateProfile(data)
    setLoading(false)
    if (res.success) toast.success('Perfil actualizado')
    else toast.error(res.error || 'Error al actualizar')
  }

  const TABS = [
    { key: 'info', label: 'Información personal' },
    { key: 'security', label: 'Seguridad' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
          Mi perfil
        </h1>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Avatar sidebar */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border p-6 flex flex-col items-center text-center" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3"
              style={{ background: 'var(--navy)' }}
            >
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--gray-1)' }}>
              {user?.name} {user?.lastName}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--gray-3)' }}>{user?.email}</p>
            {user?.role === 'ADMIN_ROLE' && (
              <span
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--navy)', color: '#fff' }}
              >
                <ShieldCheckIcon className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="md:col-span-3">
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={tab === t.key
                  ? { background: 'var(--navy)', color: '#fff' }
                  : { background: 'var(--gray-6)', color: 'var(--gray-2)' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
            {tab === 'info' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    error={errors.name?.message}
                    {...register('name', { required: 'Nombre requerido' })}
                  />
                  <Input
                    label="Apellido"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>
                <Input
                  label="Correo electrónico"
                  type="email"
                  error={errors.email?.message}
                  {...register('email', { required: 'Correo requerido' })}
                />
                <Input
                  label="Teléfono"
                  {...register('phone')}
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" loading={loading}>
                    Guardar cambios
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm" style={{ color: 'var(--gray-2)' }}>
                  Para cambiar tu contraseña, contacta al soporte o usa el flujo de recuperación.
                </p>
                <Button variant="secondary" onClick={() => window.location.href = '/login'}>
                  Cambiar contraseña
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
