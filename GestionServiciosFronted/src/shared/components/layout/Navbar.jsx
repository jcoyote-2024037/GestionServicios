import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { notificationsService } from '../../api/services/notificationsService'

export const Navbar = ({ onOpenSidebar }) => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const dropdownRef = useRef(null)

  const fetchNotificaciones = useCallback(async () => {
    try {
      const { data } = await notificationsService.getAll({ page: 1, limit: 5 })
      if (data.success) {
        setNotificaciones(data.data)
        setNoLeidas(data.noLeidas)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (open) fetchNotificaciones()
  }, [open, fetchNotificaciones])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem('auth-store')
    let token = ''
    if (raw) {
      try { token = JSON.parse(raw).state?.token || '' } catch {}
    }
    if (!token) return

    const socketUrl = (import.meta.env.VITE_API_URL || '').replace('/gestionservicio/v1', '') || 'http://localhost:3000'
    import('socket.io-client').then(({ io }) => {
      const socket = io(socketUrl, { auth: { token } })
      socket.on('chat_notification', () => setNoLeidas((c) => c + 1))
      socket.on('nueva_solicitud', () => setNoLeidas((c) => c + 1))
      socket.on('solicitud_status_changed', () => setNoLeidas((c) => c + 1))
      return () => socket.disconnect()
    })
  }, [])

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationsService.markAsRead(id)
      setNotificaciones((prev) => prev.map((n) => (n._id === id ? { ...n, leida: true } : n)))
      setNoLeidas((c) => Math.max(0, c - 1))
    } catch (_) {}
  }

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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {noLeidas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl border overflow-hidden"
              style={{
                background: 'rgba(17, 25, 40, 0.98)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-medium text-white">Notificaciones</span>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  Ver todas
                </button>
              </div>

              {notificaciones.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-white/30">Sin notificaciones</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notificaciones.map((n) => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 border-b border-white/5 last:border-0 transition-colors ${
                        n.leida ? '' : 'bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.leida ? 'text-white/50' : 'text-white'}`}>
                            {n.titulo}
                          </p>
                          {n.mensaje && (
                            <p className="text-xs text-white/30 mt-0.5 truncate">{n.mensaje}</p>
                          )}
                          <p className="text-[10px] text-white/20 mt-1">
                            {new Date(n.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!n.leida && (
                          <button
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            className="shrink-0 w-2 h-2 rounded-full bg-[var(--brand)] mt-1.5 hover:ring-2 hover:ring-[var(--brand)]/40 transition-all"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
