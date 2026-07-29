import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { chatService } from '../../api/services/chatService'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/gestionservicio/v1', '') || 'http://localhost:3000'

export const ChatModal = ({ solicitudId, isOpen, onClose }) => {
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isOpen) return

    const init = async () => {
      setLoading(true)
      try {
        const { data } = await chatService.init(solicitudId)
        setRoom(data.room)

        const msgRes = await chatService.getMessages(data.room._id || data.room.id)
        setMessages(msgRes.data.messages || [])
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al abrir chat')
        onClose()
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [isOpen, solicitudId, onClose])

  useEffect(() => {
    if (!room || !user) return

    const raw = localStorage.getItem('auth-store')
    let token = ''
    if (raw) {
      try { token = JSON.parse(raw).state?.token || '' } catch {}
    }

    const socket = io(SOCKET_URL, { auth: { token } })
    socketRef.current = socket

    const roomId = room._id || room.id

    socket.on('connect', () => {
      socket.emit('join_chat', roomId)
    })

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.emit('leave_chat', roomId)
      socket.disconnect()
    }
  }, [room, user])

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await chatService.sendMessage(room._id || room.id, text.trim())
      const newMsg = res.data.message
      setMessages((prev) => [...prev, newMsg])
      setText('')
    } catch (err) {
      toast.error('Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }, [text, sending, room])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111928] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg sm:mx-4 max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm">Chat</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16"><Spinner /></div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[50vh]">
              {messages.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">Sin mensajes aún. Envía el primero.</p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.from === user.id
                return (
                  <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      isMine
                        ? 'bg-[var(--brand)]/20 text-white border border-[var(--brand)]/20'
                        : 'bg-white/10 text-white/80'
                    }`}>
                      <p className="break-words">{msg.text}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="glass-input flex-1 resize-none text-sm"
                />
                <button onClick={handleSend} disabled={!text.trim() || sending}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
                  {sending ? <Spinner size="sm" /> : 'Enviar'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
