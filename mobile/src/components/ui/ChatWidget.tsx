import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { aiService } from '../../services/ai'
import { ChatMessage } from './ChatMessage'
import { colors, typography } from '../../theme'
import { ChatMessage as ChatMessageType } from '../../types'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { role: 'assistant', content: '¡Hola! Soy el asistente de GestionServicios. ¿En qué puedo ayudarte?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessageType = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { data } = await aiService.chat(input.trim())
      const response = data.mensaje_ia || data.response || data.message || 'No pude procesar tu solicitud'
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>
          {isOpen ? '✕' : '💬'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Asistente IA</Text>
            <Text style={styles.headerSub}>Powered by Groq</Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messagesArea}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {loading && (
              <View style={styles.typing}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { opacity: 0.6 }]} />
                <View style={[styles.typingDot, { opacity: 0.3 }]} />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Enter' && handleSend()}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || loading}
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            >
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 24, right: 24, zIndex: 100,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: colors.brand, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabText: { fontSize: 24, color: '#fff' },
  container: {
    position: 'absolute', bottom: 92, right: 16, zIndex: 99,
    width: 320, maxHeight: 460,
    backgroundColor: 'rgba(17,25,40,0.96)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, overflow: 'hidden',
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16,
  },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  headerSub: { color: colors.textMuted, fontSize: typography.sizes.xs },
  messagesArea: { maxHeight: 300 },
  messagesContent: { padding: 12 },
  typing: { flexDirection: 'row', gap: 4, padding: 8, justifyContent: 'center' },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.purple },
  inputRow: {
    flexDirection: 'row', gap: 8, padding: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)', color: colors.textPrimary,
    fontSize: typography.sizes.sm, borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.3 },
  sendBtnText: { color: '#fff', fontSize: 18 },
})
