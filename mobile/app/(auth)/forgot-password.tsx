import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { Link } from 'expo-router'
import { Button } from '../../src/components/ui/Button'
import { colors, typography } from '../../src/theme'
import { authService } from '../../src/services/auth'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!email) return
    setLoading(true)
    try {
      await authService.requestReset(email)
      Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña.')
    } catch {
      Alert.alert('Error', 'No se pudo enviar el correo. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>Ingresa tu email y te enviaremos un enlace</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button onPress={onSubmit} loading={loading}>Enviar</Button>
          <Link href="/(auth)/login" style={styles.link}>Volver al inicio de sesión</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: colors.surfaceRaised, borderRadius: 24, borderWidth: 1,
    borderColor: colors.border, padding: 36, gap: 20,
  },
  title: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, textAlign: 'center' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  link: { color: colors.purple, fontSize: typography.sizes.sm, textAlign: 'center' },
})
