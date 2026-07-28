import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const items = [
  { label: 'Inicio', path: '/dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { label: 'Servicios', path: '/services', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
  { label: 'Solicitudes', path: '/solicitudes', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { label: 'Favoritos', path: '/favorites', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
  { label: 'Perfil', path: '/profile', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
]

export const BottomNav = () => {
  const { isAdmin } = useAuth()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(17, 25, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-around py-2 px-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-all ${
                isActive ? 'text-[var(--brand)]' : 'text-white/40'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
