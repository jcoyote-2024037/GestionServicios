import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '../../src/components/ui/Button'
import { colors, typography } from '../../src/theme'
import { authService } from '../../src/services/auth'

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (token) {
      verify(token)
    } else {
      setLoading(false)
    }
  }, [token])

  const verify = async (t: string) => {
    try {
      await authService.verifyEmail(t)
      setVerified(true)
      setTimeout(() => router.replace('/(auth)/login'), 2000)
    } catch {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (!email) return
    setSending(true)
    try {
      await authService.resendVerification(email)
    } catch {}
    setSending(false)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  if (verified) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>✓ Correo verificado</Text>
        <Text style={styles.subtitle}>Redirigiendo al inicio de sesión...</Text>
      </View>
    )
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Verificar Email</Text>
      <Text style={styles.subtitle}>Ingresa tu email para reenviar el enlace de verificación</Text>
      <TextInput
        style={styles.input}
        placeholder="tu@email.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button onPress={resend} loading={sending} style={{ marginTop: 12 }}>
        Reenviar
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, padding: 20, gap: 12 },
  title: { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, textAlign: 'center' },
  input: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
})
