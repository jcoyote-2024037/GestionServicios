import { useAuth } from '../../hooks/useAuth'

export const Navbar = ({ onOpenSidebar }) => {
  const { user, isAdmin } = useAuth()

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6"
      style={{
        background: 'rgba(17, 25, 40, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={onOpenSidebar}
        className="md:hidden text-white/50 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-white/70 font-medium">
            {user?.name || user?.username || 'Usuario'}
          </p>
          <p className="text-xs text-white/30">
            {isAdmin ? 'Administrador' : 'Usuario'}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
        >
          {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
