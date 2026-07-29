import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { aiService } from '../../services/ai'
import { ChatMessage } from './ChatMessage'
import { colors, typography, radii, shadows } from '../../theme'
import { ChatMessage as ChatMessageType } from '../../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
        onPress={() => setIsOpen(true)}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.brand, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>✨</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <LinearGradient
            colors={[colors.surface, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>🤖</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Asistente IA</Text>
                <Text style={styles.headerSub}>Powered by Groq</Text>
              </View>
            </View>
            <View style={styles.headerStatus}>
              <View style={styles.statusDot} />
            </View>
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
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { opacity: 0.6 }]} />
                <View style={[styles.typingDot, { opacity: 0.3 }]} />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor={colors.textMuted}
                value={input}
                onChangeText={setInput}
                onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Enter' && handleSend()}
                editable={!loading}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim() || loading}
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              >
                <LinearGradient
                  colors={[colors.brand, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendGradient}
                >
                  <Text style={styles.sendBtnText}>➤</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 88, right: 20, zIndex: 100,
    width: 52, height: 52, borderRadius: 26,
    ...shadows.glow(colors.brand),
  },
  fabGradient: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  fabIcon: { fontSize: 22 },
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 54,
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backBtnText: { color: colors.textPrimary, fontSize: 20 },
  headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(167,139,250,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 18 },
  headerTitle: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  headerSub: { color: colors.textMuted, fontSize: typography.sizes.xs },
  headerStatus: { marginLeft: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  messagesArea: { flex: 1 },
  messagesContent: { padding: 16, gap: 12, paddingBottom: 24 },
  typingIndicator: { flexDirection: 'row', gap: 5, padding: 12 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.purple },
  inputContainer: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  input: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)', color: colors.textPrimary,
    fontSize: typography.sizes.base, borderWidth: 1, borderColor: colors.border,
    maxHeight: 100,
  },
  sendBtn: { borderRadius: 16, overflow: 'hidden' },
  sendGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 18 },
})
