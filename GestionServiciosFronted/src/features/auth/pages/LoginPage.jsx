import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import LoginForm from '../../../shared/components/ui/LoginForm'
import RadarBackground from '../../../shared/components/ui/RadarBackground'

export const LoginPage = () => {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleLogin = async ({ email, password }) => {
    const res = await login({ email, password })
    if (res.success) {
      toast.success('¡Bienvenido de nuevo!')
      navigate('/dashboard')
    } else {
      toast.error(res.error || 'Error al iniciar sesión')
    }
  }

  return (
    <RadarBackground>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
          padding: '20px',
        }}
      >
        <LoginForm onSubmit={handleLogin} />
      </div>
    </RadarBackground>
  )
}
