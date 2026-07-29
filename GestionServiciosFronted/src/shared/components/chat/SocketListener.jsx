import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/gestionservicio/v1', '') || 'http://localhost:3000'

export const SocketListener = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const raw = localStorage.getItem('auth-store')
    let token = ''
    if (raw) {
      try { token = JSON.parse(raw).state?.token || '' } catch {}
    }

    const socket = io(SOCKET_URL, { auth: { token } })
    socketRef.current = socket

    socket.on('chat_notification', ({ solicitudId, text }) => {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Nuevo mensaje</p>
              <p className="text-white/50 text-xs truncate max-w-[200px]">{text}</p>
            </div>
            <button onClick={() => { navigate(`/solicitudes/${solicitudId}`); toast.dismiss(t.id) }}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all">
              Ver
            </button>
          </div>
        ),
        { duration: 8000 }
      )
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, user, navigate])

  return null
}
