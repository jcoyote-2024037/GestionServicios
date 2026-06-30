import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import RadarBackground from '../../../shared/components/ui/RadarBackground'
import '../../../shared/components/ui/glass.css'

export const RegisterPage = () => {
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    const res = await register({
      name: form.name,
      surname: form.surname,
      username: form.username,
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (res.success) {
      toast.success('Account created! Please check your email to verify.')
      navigate('/login')
    } else {
      toast.error(res.error || 'Error creating account')
    }
  }

  return (
    <RadarBackground>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '20px',
      }}>
        <div className="glass-card" style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px 36px',
          animation: 'slideInFromLeft 0.8s ease-out',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              animation: 'appear 1.2s ease-out',
            }}>
              Create account
            </h2>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.45)',
              animation: 'appear 1.6s ease-out',
            }}>
              Get started with your free account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-wrapper">
                <input
                  className="glass-input"
                  type="text"
                  name="name"
                  placeholder="First Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>
              <div className="input-wrapper">
                <input
                  className="glass-input"
                  type="text"
                  name="surname"
                  placeholder="Last Name"
                  value={form.surname}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>
            </div>

            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 10-16 0" />
              </svg>
              <input
                className="glass-input"
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

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
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                className="glass-input"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
              <input
                className="glass-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button className="glass-btn" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link to="/login" className="glass-link">Sign In</Link>
          </p>
        </div>
      </div>
    </RadarBackground>
  )
}
