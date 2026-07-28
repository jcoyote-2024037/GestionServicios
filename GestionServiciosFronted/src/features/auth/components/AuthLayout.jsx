import { Link } from 'react-router-dom'
import RadarBackground from '../../../shared/components/ui/RadarBackground'

export const AuthLayout = ({ children, title, subtitle, icon }) => {
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
          maxWidth: '420px',
          padding: '44px 36px 38px',
          animation: 'slideInFromLeft 0.8s ease-out',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {icon && (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(167,139,250,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                {icon}
              </div>
            )}
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              animation: 'appear 1.2s ease-out',
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.45)',
                animation: 'appear 1.6s ease-out',
                lineHeight: 1.5,
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </RadarBackground>
  )
}

export const AuthLink = ({ to, children }) => (
  <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
    <Link to={to} className="glass-link">{children}</Link>
  </p>
)

export const AuthDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>or</span>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
  </div>
)
