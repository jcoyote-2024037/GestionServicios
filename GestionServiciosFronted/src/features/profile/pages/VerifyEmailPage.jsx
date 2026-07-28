import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../../../shared/api/services/authService'
import { AuthLayout } from '../../auth/components/AuthLayout'
import '../../../shared/components/ui/glass.css'

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const location = useLocation()
  const emailFromRegister = location.state?.email || ''
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (token && !verified && !loading) {
      setLoading(true)
      authService.verifyEmail(token)
        .then(() => {
          setVerified(true)
          toast.success('Email verificado correctamente')
          setTimeout(() => navigate('/login'), 2000)
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Token inválido o expirado')
        })
        .finally(() => setLoading(false))
    }
  }, [token])

  if (token) {
    return (
      <AuthLayout
        title={verified ? 'Email Verificado' : 'Verificando...'}
        subtitle={verified ? 'Serás redirigido al login en unos segundos' : 'Procesando tu verificación'}
        icon={
          verified ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )
        }
      >
        {verified ? (
          <button onClick={() => navigate('/login')} className="glass-btn">
            Ir al Login
          </button>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>Verificando tu correo...</p>
        )}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reenviar Verificación"
      subtitle="Ingresa tu email para reenviar el correo"
      icon={
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 4L12 13 2 4" />
        </svg>
      }
    >
      <form onSubmit={async (e) => {
        e.preventDefault()
        const formEmail = e.target.email.value
        try {
          await authService.resendVerification(formEmail)
          toast.success('Correo de verificación reenviado')
        } catch (err) {
          toast.error(err.response?.data?.message || 'Error al reenviar')
        }
      }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="input-wrapper">
          <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13 2 4" />
          </svg>
          <input
            className="glass-input"
            type="email"
            name="email"
            placeholder="Email address"
            defaultValue={emailFromRegister}
            required
          />
        </div>
        <button className="glass-btn" type="submit">
          Reenviar Verificación
        </button>
      </form>
    </AuthLayout>
  )
}
