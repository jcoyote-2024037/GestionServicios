import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Input } from '../../../shared/components/ui/Input'
import { Button } from '../../../shared/components/ui/Button'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export const LoginPage = () => {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    const res = await login(data)
    setLoading(false)
    if (res.success) {
      toast.success('¡Bienvenido de nuevo!')
      navigate(res.user?.role === 'ADMIN_ROLE' ? '/admin' : '/services')
    } else {
      toast.error(res.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel - decorative */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12"
        style={{ background: 'var(--navy)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'var(--orange)' }}>
            GS
          </div>
          <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>GestionServicios</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            La plataforma que conecta profesionales con oportunidades reales
          </h1>
          <p className="text-blue-200 text-lg">
            Miles de servicios disponibles. Solicita, califica y gestiona todo en un solo lugar.
          </p>

          <div className="mt-12 flex flex-col gap-4">
            {[
              { n: '2,500+', label: 'Servicios disponibles' },
              { n: '98%', label: 'Satisfacción de usuarios' },
              { n: '24/7', label: 'Soporte disponible' },
            ].map(({ n, label }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-2xl font-bold" style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>{n}</span>
                <span className="text-blue-200">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">© 2025 GestionServicios. Todos los derechos reservados.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--navy)' }}>GS</div>
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>GestionServicios</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
              Iniciar sesión
            </h2>
            <p className="text-sm" style={{ color: 'var(--gray-3)' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
                Regístrate aquí
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Correo o usuario"
              placeholder="correo@ejemplo.com"
              icon={EnvelopeIcon}
              error={errors.emailOrUsername?.message}
              {...register('emailOrUsername', { required: 'Este campo es obligatorio' })}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              icon={LockClosedIcon}
              error={errors.password?.message}
              {...register('password', { required: 'La contraseña es obligatoria' })}
            />

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--gray-6)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--gray-2)' }}>Credenciales de prueba</p>
            <p className="text-xs" style={{ color: 'var(--gray-3)' }}>Usuario: <strong>demo@gestion.com</strong></p>
            <p className="text-xs" style={{ color: 'var(--gray-3)' }}>Contraseña: <strong>Demo1234!</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
