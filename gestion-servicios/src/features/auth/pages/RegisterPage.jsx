import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Input } from '../../../shared/components/ui/Input'
import { Button } from '../../../shared/components/ui/Button'
import { UserIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon } from '@heroicons/react/24/outline'

export const RegisterPage = () => {
  const register_ = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data
    setLoading(true)
    const res = await register_(payload)
    setLoading(false)
    if (res.success) {
      toast.success('Cuenta creada exitosamente')
      navigate('/login')
    } else {
      toast.error(res.error || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg">
        <div className="rounded-2xl p-8 shadow-sm border" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--navy)' }}>GS</div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>GestionServicios</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
            Crear cuenta
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--gray-3)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--orange)' }}>
              Inicia sesión
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                placeholder="Juan"
                icon={UserIcon}
                error={errors.name?.message}
                {...register('name', { required: 'Nombre requerido' })}
              />
              <Input
                label="Apellido"
                placeholder="García"
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Apellido requerido' })}
              />
            </div>

            <Input
              label="Usuario"
              placeholder="juangarcia123"
              icon={UserIcon}
              error={errors.username?.message}
              {...register('username', { required: 'Usuario requerido', minLength: { value: 4, message: 'Mínimo 4 caracteres' } })}
            />

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="juan@ejemplo.com"
              icon={EnvelopeIcon}
              error={errors.email?.message}
              {...register('email', {
                required: 'Correo requerido',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }
              })}
            />

            <Input
              label="Teléfono (opcional)"
              placeholder="+502 1234-5678"
              icon={PhoneIcon}
              {...register('phone')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Mín. 8 caracteres"
              icon={LockClosedIcon}
              error={errors.password?.message}
              {...register('password', {
                required: 'Contraseña requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' }
              })}
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              icon={LockClosedIcon}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (val) => val === password || 'Las contraseñas no coinciden'
              })}
            />

            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              Crear cuenta
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
