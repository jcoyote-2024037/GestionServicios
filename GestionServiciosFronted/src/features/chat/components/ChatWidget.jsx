import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiService } from '../../../shared/api/services/aiService'
import { useAuthStore } from '../../auth/store/authStore'
import { ChatMessage } from './ChatMessage'

const suggestions = [
  '¿Qué servicios tienes?',
  'Servicios mejor calificados',
  'Servicios cerca de mí',
  'Categorías disponibles',
]

const ServiceResultCard = ({ service, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/10 border border-white/5"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(236,72,153,0.2))' }}>
      <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm font-medium truncate">{service.nombre || service.name}</p>
      <p className="text-white/30 text-xs truncate">
        {service.categoriaId?.nombre || service.categoria || ''}
        {service.averageRating ? ` • ★ ${service.averageRating.toFixed(1)}` : ''}
      </p>
    </div>
    <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </div>
)

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy GestionBot, tu asistente. Pregúntame sobre servicios, categorías o lo que necesites.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (customMessage) => {
    const msg = customMessage || input.trim()
    if (!msg || loading || !token) {
      if (!token) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Debes iniciar sesión para usar el asistente.' }])
      }
      return
    }
    const userMessage = { role: 'user', content: msg }
    setMessages((prev) => [...prev, userMessage])
    if (!customMessage) setInput('')
    setLoading(true)
    try {
      const { data } = await aiService.chat(msg)
      const assistantMsg = {
        role: 'assistant',
        content: data.mensaje_ia || 'No pude procesar tu solicitud.',
        resultados: data.lista_resultados || [],
        sugerencia: data.sugerencia || '',
        hay_resultados: !!data.hay_resultados,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
        resultados: [],
        sugerencia: '',
        hay_resultados: false,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[580px] flex flex-col overflow-hidden"
          style={{
            background: 'rgba(17, 25, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">GestionBot</p>
              <p className="text-white/30 text-xs">Asistente IA</p>
            </div>
            <button onClick={() => setMessages([{ role: 'assistant', content: '¡Hola! Soy GestionBot, tu asistente. Pregúntame sobre servicios, categorías o lo que necesites.' }])}
              className="text-white/20 hover:text-white/40 text-xs transition-colors">
              Limpiar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
            {!token && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300/70 text-xs text-center">
                Inicia sesión para usar el asistente
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                <ChatMessage message={{ role: msg.role, content: msg.content }} />
                {msg.hay_resultados && msg.resultados?.length > 0 && (
                  <div className="mt-2 space-y-1.5 ml-2">
                    {msg.resultados.map((svc, j) => (
                      <ServiceResultCard
                        key={svc._id || svc.id || j}
                        service={svc}
                        onClick={() => {
                          const id = svc._id || svc.id
                          if (id) { navigate(`/services/${id}`); setIsOpen(false) }
                        }}
                      />
                    ))}
                  </div>
                )}
                {msg.sugerencia && (
                  <p className="text-[11px] text-white/20 italic mt-1 ml-2">{msg.sugerencia}</p>
                )}
              </div>
            ))}

            {/* Suggestions chips */}
            {!loading && token && messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                placeholder={token ? "Escribe tu mensaje..." : "Inicia sesión para chatear..."}
                disabled={loading || !token}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || !token}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
