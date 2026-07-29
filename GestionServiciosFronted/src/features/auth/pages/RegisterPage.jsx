import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { AuthLayout } from '../components/AuthLayout'
import { adminService } from '../../../shared/api/services/adminService'

export const RegisterPage = () => {
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])

  const { register: reg, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', surname: '', username: '', email: '', phone: '', password: '', confirmPassword: '', locationId: '' }
  })

  const password = watch('password')

  useEffect(() => {
    adminService.getLocations().then((res) => {
      const body = res.data
      const list = body?.data || body?.locations || []
      setLocations(Array.isArray(list) ? list : [])
    }).catch(() => {})
  }, [])

  const onSubmit = async (formData) => {
    const loc = locations.find((l) => String(l._id || l.id) === formData.locationId)
    const { confirmPassword, locationId, ...data } = formData
    const res = await register({
      ...data,
      municipality: loc?.municipality || '',
      department: loc?.department || '',
      zona: loc?.zona || ''
    })
    if (res.success) {
      toast.success('Correo enviado con éxito. Revisa tu bandeja para verificar tu cuenta.', { duration: 5000 })
      navigate('/login')
    } else {
      toast.error(res.error || 'Error al crear cuenta')
    }
  }

  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Regístrate para empezar a usar GestionServicios"
      icon={
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#f43f5e" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="glass-label">Nombre</label>
            <input
              placeholder="Juan"
              className="glass-input"
              {...reg('name', { required: 'Nombre requerido' })}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name.message}</p>}
          </div>
          <div>
            <label className="glass-label">Apellido</label>
            <input
              placeholder="Pérez"
              className="glass-input"
              {...reg('surname', { required: 'Apellido requerido' })}
            />
            {errors.surname && <p className="text-xs text-red-400 mt-1.5">{errors.surname.message}</p>}
          </div>
        </div>

        <div>
          <label className="glass-label">Username</label>
          <input
            placeholder="juanperez"
            className="glass-input"
            {...reg('username', { required: 'Username requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
          />
          {errors.username && <p className="text-xs text-red-400 mt-1.5">{errors.username.message}</p>}
        </div>

        <div>
          <label className="glass-label">Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            className="glass-input"
            {...reg('email', {
              required: 'Email requerido',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato inválido' }
            })}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="glass-label">Teléfono</label>
          <input
            type="tel"
            placeholder="+502 1234 5678"
            className="glass-input"
            {...reg('phone')}
          />
        </div>

        <div>
          <label className="glass-label">Ubicación</label>
          <select
            className="glass-input"
            {...reg('locationId')}
          >
            <option value="" className="bg-[#111928]">Seleccionar ubicación</option>
            {locations.map((loc) => (
              <option key={loc._id || loc.id} value={loc._id || loc.id} className="bg-[#111928]">
                {[loc.municipality, loc.department, loc.zona].filter(Boolean).join(' - ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="glass-label">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            className="glass-input"
            {...reg('password', {
              required: 'Contraseña requerida',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' }
            })}
          />
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label className="glass-label">Confirmar contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            className="glass-input"
            {...reg('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: (v) => v === password || 'Las contraseñas no coinciden'
            })}
          />
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="glass-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-white/40">
        ¿Ya tienes cuenta? <Link to="/login" className="glass-link">Iniciar Sesión</Link>
      </p>
    </AuthLayout>
  )
}