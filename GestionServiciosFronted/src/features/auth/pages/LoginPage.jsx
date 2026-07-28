import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { AuthLayout } from '../components/AuthLayout'

export const LoginPage = () => {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async ({ email, password }) => {
    const res = await login({ email, password })
    if (res.success) {
      toast.success('Bienvenido de nuevo')
      navigate(from, { replace: true })
    } else {
      if (res.error?.includes('verificar')) {
        toast.error('Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.', { duration: 6000 })
      } else {
        toast.error(res.error || 'Credenciales incorrectas')
      }
    }
  }

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Ingresa a tu cuenta de GestionServicios"
      icon={
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#f43f5e" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="glass-label">Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            className="glass-input"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de email inválido' }
            })}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="glass-label">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            className="glass-input"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' }
            })}
          />
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs hover:text-[var(--brand)] transition-colors" style={{ color: 'var(--text-muted)' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button type="submit" className="glass-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-white/40">
        ¿No tienes cuenta? <Link to="/register" className="glass-link">Crear cuenta</Link>
      </p>
    </AuthLayout>
  )
}
