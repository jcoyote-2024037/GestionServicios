import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter, Link } from 'expo-router'
import { useAuth } from '../../src/hooks/useAuth'
import { authService } from '../../src/services/auth'
import { Button } from '../../src/components/ui/Button'
import { colors, typography } from '../../src/theme'

export default function RegisterScreen() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [form, setForm] = useState({ name: '', surname: '', username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showVerify, setShowVerify] = useState(false)
  const [verifyToken, setVerifyToken] = useState('')
  const [verifying, setVerifying] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name) errs.name = 'El nombre es obligatorio'
    if (!form.surname) errs.surname = 'El apellido es obligatorio'
    if (!form.username || form.username.length < 3) errs.username = 'Mínimo 3 caracteres'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido'
    if (!form.password || form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    const res = await registerUser(form)
    setLoading(false)
    if (res.success) {
      setShowVerify(true)
    } else {
      setErrors({ root: res.error || 'Error al registrarse' })
    }
  }

  const handleVerify = async () => {
    if (!verifyToken.trim()) return
    setVerifying(true)
    try {
      await authService.verifyEmail(verifyToken.trim())
      Alert.alert('Correo verificado', 'Tu cuenta ha sido verificada. Ahora puedes iniciar sesión.')
      router.replace('/(auth)/login')
    } catch {
      Alert.alert('Error', 'Token inválido o expirado')
    } finally {
      setVerifying(false)
    }
  }

  const set = (key: string) => (text: string) => setForm((prev) => ({ ...prev, [key]: text }))

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {!showVerify ? (
            <>
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Regístrate en GestionServicios</Text>

              <View style={styles.form}>
                <Field label="Nombre" value={form.name} onChange={set('name')} error={errors.name} />
                <Field label="Apellido" value={form.surname} onChange={set('surname')} error={errors.surname} />
                <Field label="Username" value={form.username} onChange={set('username')} error={errors.username} />
                <Field label="Email" value={form.email} onChange={set('email')} keyboardType="email-address" error={errors.email} />
                <Field label="Contraseña" value={form.password} onChange={set('password')} secureTextEntry error={errors.password} />
                <Field label="Confirmar Contraseña" value={form.confirmPassword} onChange={set('confirmPassword')} secureTextEntry error={errors.confirmPassword} />

                {errors.root && <Text style={styles.rootError}>{errors.root}</Text>}

                <Button onPress={onSubmit} loading={loading} style={{ marginTop: 8 }}>
                  Crear Cuenta
                </Button>
              </View>

              <Link href="/(auth)/login" style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Link>
            </>
          ) : (
            <>
              <Text style={styles.title}>Verifica tu correo</Text>
              <Text style={styles.subtitle}>
                Te enviamos un enlace de verificación a {form.email}.{'\n\n'}
                Si no encuentras el correo, pega el token de verificación aquí manualmente:
              </Text>
              <View style={styles.form}>
                <Field
                  label="Token de verificación"
                  value={verifyToken}
                  onChange={setVerifyToken}
                />
                <Button onPress={handleVerify} loading={verifying} style={{ marginTop: 8 }}>
                  Verificar Correo
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => router.replace('/(auth)/login')}
                >
                  Ir a iniciar sesión
                </Button>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, value, onChange, error, secureTextEntry, keyboardType }: {
  label: string; value: string; onChange: (t: string) => void; error?: string; secureTextEntry?: boolean; keyboardType?: 'email-address'
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.glassInput, error && styles.inputError]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: colors.surfaceRaised, borderRadius: 24, borderWidth: 1,
    borderColor: colors.border, padding: 36, gap: 20,
  },
  title: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, textAlign: 'center' },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  glassInput: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  inputError: { borderColor: colors.red },
  errorText: { color: colors.red, fontSize: typography.sizes.xs },
  rootError: { color: colors.red, fontSize: typography.sizes.sm, textAlign: 'center' },
  link: { color: colors.purple, fontSize: typography.sizes.sm, textAlign: 'center' },
})
