import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native'
import { colors, typography } from '../../theme'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const typeStyles = {
    success: { bg: `${colors.green}30`, border: colors.green, text: colors.green },
    error: { bg: `${colors.red}30`, border: colors.red, text: colors.red },
    info: { bg: `${colors.purple}30`, border: colors.purple, text: colors.purple },
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((toast) => {
          const ts = typeStyles[toast.type]
          return (
            <View
              key={toast.id}
              style={[styles.toast, { backgroundColor: ts.bg, borderColor: ts.border }]}
            >
              <Text style={[styles.toastText, { color: ts.text }]}>{toast.message}</Text>
            </View>
          )
        })}
      </View>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 60, left: 0, right: 0, zIndex: 9999,
    alignItems: 'center', gap: 8, paddingHorizontal: 16,
  },
  toast: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1, maxWidth: '90%',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  toastText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, textAlign: 'center' },
})
