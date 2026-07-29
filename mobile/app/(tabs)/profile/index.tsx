import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../../src/hooks/useAuth'
import { Card } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { colors, typography } from '../../../src/theme'

type ProfileTab = 'perfil' | 'servicios' | 'historial'

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ProfileTab>('perfil')

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'perfil', label: 'Perfil' },
    { key: 'servicios', label: 'Mis Servicios' },
    { key: 'historial', label: 'Historial' },
  ]

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name} {user?.surname}</Text>
        <Text style={styles.role}>{user?.role === 'ADMIN_ROLE' ? 'Administrador' : 'Usuario'}</Text>
      </View>

      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'perfil' && <ProfileTabContent user={user} logout={logout} updateProfile={updateProfile} />}
      {activeTab === 'servicios' && (
        <View style={{ padding: 20 }}>
          <Text style={styles.placeholder}>Tus servicios aparecerán aquí</Text>
        </View>
      )}
      {activeTab === 'historial' && (
        <View style={{ padding: 20 }}>
          <Text style={styles.placeholder}>Tu historial de solicitudes aparecerá aquí</Text>
        </View>
      )}
    </ScrollView>
  )
}

function ProfileTabContent({ user, logout, updateProfile }: {
  user: { name?: string; surname?: string; username?: string; email?: string; id?: string; role?: string } | null
  logout: () => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
}) {
  const router = useRouter()
  const [form, setForm] = useState({ name: user?.name || '', surname: user?.surname || '', username: user?.username || '' })
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })

  const handleSave = async () => {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    Alert.alert('Guardado', 'Perfil actualizado')
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  return (
    <View style={{ gap: 16 }}>
      {user?.role === 'ADMIN_ROLE' && (
        <Button variant="secondary" onPress={() => router.replace('/(admin)' as never)}>
          Panel de Administración
        </Button>
      )}
      <Card style={{ gap: 12 }}>
        <Field label="Nombre" value={form.name} onChange={(t) => setForm((p) => ({ ...p, name: t }))} />
        <Field label="Apellido" value={form.surname} onChange={(t) => setForm((p) => ({ ...p, surname: t }))} />
        <Field label="Username" value={form.username} onChange={(t) => setForm((p) => ({ ...p, username: t }))} />
        <Field label="Email" value={user?.email || ''} editable={false} />
        <Button onPress={handleSave} loading={saving}>Guardar Cambios</Button>
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
        <Field label="Contraseña actual" value={pwForm.currentPassword} onChange={(t) => setPwForm((p) => ({ ...p, currentPassword: t }))} secureTextEntry />
        <Field label="Nueva contraseña" value={pwForm.newPassword} onChange={(t) => setPwForm((p) => ({ ...p, newPassword: t }))} secureTextEntry />
        <Button variant="secondary">Cambiar Contraseña</Button>
      </Card>

      <Button variant="danger" onPress={handleLogout}>Cerrar Sesión</Button>
    </View>
  )
}

function Field({ label, value, onChange, secureTextEntry, editable = true }: {
  label: string; value: string; onChange?: (t: string) => void; secureTextEntry?: boolean; editable?: boolean
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        editable={editable}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brand,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: typography.weights.bold },
  name: { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  role: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  tabsRow: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  tabText: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  tabTextActive: { color: '#fff' },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  field: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  inputDisabled: { opacity: 0.5 },
  placeholder: { color: colors.textMuted, fontSize: typography.sizes.base, textAlign: 'center' },
})
