import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/store/authStore'
import {
  Bars3Icon, XMarkIcon, BellIcon, HeartIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--navy)' }}
          >
            GS
          </div>
          <span
            className="text-lg font-bold hidden sm:block"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}
          >
            GestionServicios
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/services" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--gray-2)' }}>
            Servicios
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/requests" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--gray-2)' }}>
                Mis Solicitudes
              </Link>
              <Link to="/favorites" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--gray-2)' }}>
                Favoritos
              </Link>
              {user?.role === 'ADMIN_ROLE' && (
                <Link to="/admin" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--orange)' }}>
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/favorites"
                className="hidden md:flex p-2 rounded-xl hover:bg-gray-100 transition-colors"
                title="Favoritos"
              >
                <HeartIcon className="w-5 h-5" style={{ color: 'var(--gray-3)' }} />
              </Link>
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'var(--navy)' }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--gray-1)' }}>
                  {user?.name?.split(' ')[0] || 'Perfil'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 rounded-xl hover:bg-gray-100 transition-colors"
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" style={{ color: 'var(--gray-3)' }} />
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-gray-100"
                style={{ color: 'var(--navy)' }}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: 'var(--orange)' }}
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen
              ? <XMarkIcon className="w-5 h-5" style={{ color: 'var(--navy)' }} />
              : <Bars3Icon className="w-5 h-5" style={{ color: 'var(--navy)' }} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t animate-fade-in"
          style={{ borderColor: 'var(--gray-5)', background: 'var(--bg-white)' }}
        >
          <nav className="px-4 py-3 flex flex-col gap-1">
            <MobileLink to="/services" onClick={() => setMenuOpen(false)}>Servicios</MobileLink>
            {isAuthenticated ? (
              <>
                <MobileLink to="/requests" onClick={() => setMenuOpen(false)}>Mis Solicitudes</MobileLink>
                <MobileLink to="/favorites" onClick={() => setMenuOpen(false)}>Favoritos</MobileLink>
                <MobileLink to="/profile" onClick={() => setMenuOpen(false)}>Mi Perfil</MobileLink>
                {user?.role === 'ADMIN_ROLE' && (
                  <MobileLink to="/admin" onClick={() => setMenuOpen(false)}>Panel Admin</MobileLink>
                )}
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false) }}
                  className="text-left px-3 py-2 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--error)' }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</MobileLink>
                <MobileLink to="/register" onClick={() => setMenuOpen(false)}>Registrarse</MobileLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

const MobileLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="px-3 py-2 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
    style={{ color: 'var(--gray-1)' }}
  >
    {children}
  </Link>
)
