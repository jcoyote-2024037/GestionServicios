import { useState, useRef, useEffect } from 'react'
import { aiService } from '../../../shared/api/services/aiService'
import { ChatMessage } from './ChatMessage'

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente de GestionServicios. ¿En qué puedo ayudarte?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const { data } = await aiService.chat(input.trim())
      setMessages((prev) => [...prev, { role: 'assistant', content: data.mensaje_ia || data.response || data.message || 'No pude procesar tu solicitud' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
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
          className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] flex flex-col overflow-hidden"
          style={{
            background: 'rgba(17, 25, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white font-semibold text-sm">Asistente IA</p>
            <p className="text-white/30 text-xs">Powered by Groq</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-center py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                placeholder="Escribe tu mensaje..."
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
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
