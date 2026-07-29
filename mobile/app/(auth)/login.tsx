import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native'
import { useRouter, Link } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../src/hooks/useAuth'
import { authService } from '../../src/services/auth'
import { Button } from '../../src/components/ui/Button'
import { colors, typography } from '../../src/theme'
import { loginSchema, LoginForm } from '../../src/utils/validation'

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth()
  const [showVerify, setShowVerify] = useState(false)
  const [verifyToken, setVerifyToken] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    const res = await login(data.email, data.password)
    if (res.success) {
      router.replace('/(tabs)')
    } else {
      const msg = res.error || 'Credenciales incorrectas'
      setError('root', { message: msg })
      if (msg.toLowerCase().includes('verificar') || msg.toLowerCase().includes('verified')) {
        setVerifyEmail(data.email)
      }
    }
  }

  const handleVerify = async () => {
    if (!verifyToken.trim()) return
    setVerifying(true)
    try {
      await authService.verifyEmail(verifyToken.trim())
      Alert.alert('Correo verificado', 'Tu cuenta ha sido verificada. Ahora puedes iniciar sesión.')
      setShowVerify(false)
      setVerifyToken('')
    } catch {
      Alert.alert('Error', 'Token inválido o expirado')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!verifyEmail.trim()) return
    setResending(true)
    try {
      await authService.resendVerification(verifyEmail)
      Alert.alert('Reenviado', 'Correo de verificación reenviado')
    } catch {
      Alert.alert('Error', 'No se pudo reenviar el correo')
    } finally {
      setResending(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Ingresa a tu cuenta de GestionServicios</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.glassInput, errors.email && styles.inputError]}
                    placeholder="tu@email.com"
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.glassInput, errors.password && styles.inputError]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  />
                )}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>

            {errors.root && (
              <Text style={styles.rootError}>{errors.root.message}</Text>
            )}

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitBtn}
            >
              Iniciar Sesión
            </Button>
          </View>

          <Link href="/(auth)/register" style={styles.link}>
            ¿No tienes cuenta? Crear cuenta
          </Link>
          <Link href="/(auth)/forgot-password" style={styles.smallLink}>
            ¿Olvidaste tu contraseña?
          </Link>

          <TouchableOpacity onPress={() => setShowVerify(!showVerify)}>
            <Text style={[styles.smallLink, { color: colors.brand }]}>
              {showVerify ? 'Ocultar' : '¿No recibiste el correo? Verificar manualmente'}
            </Text>
          </TouchableOpacity>

          {showVerify && (
            <View style={styles.verifySection}>
              <Text style={styles.subtitle}>Pega tu token de verificación aquí:</Text>
              <TextInput
                style={styles.glassInput}
                placeholder="Token de verificación"
                placeholderTextColor={colors.textMuted}
                value={verifyToken}
                onChangeText={setVerifyToken}
                autoCapitalize="none"
              />
              <Button onPress={handleVerify} loading={verifying}>
                Verificar Correo
              </Button>
              {verifyEmail ? (
                <Button variant="secondary" onPress={handleResend} loading={resending}>
                  Reenviar correo a {verifyEmail}
                </Button>
              ) : (
                <Text style={styles.smallLink}>
                  Inicia sesión primero o ingresa tu email en el campo de arriba
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: colors.surfaceRaised, borderRadius: 24, borderWidth: 1,
    borderColor: colors.border, padding: 36, gap: 16,
  },
  title: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, textAlign: 'center' },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  glassInput: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  inputError: { borderColor: colors.red },
  errorText: { color: colors.red, fontSize: typography.sizes.xs },
  rootError: { color: colors.red, fontSize: typography.sizes.sm, textAlign: 'center' },
  submitBtn: { marginTop: 8 },
  link: { color: colors.purple, fontSize: typography.sizes.sm, textAlign: 'center' },
  smallLink: { color: colors.textMuted, fontSize: typography.sizes.xs, textAlign: 'center', marginTop: 4 },
  verifySection: { gap: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
})
