import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../../src/services/admin'
import { Card } from '../../../src/components/ui/Card'
import { Spinner } from '../../../src/components/ui/Spinner'
import { colors, typography } from '../../../src/theme'

const adminModules = [
  { name: 'Usuarios', route: '/admin/users', icon: '👥' },
  { name: 'Categorías', route: '/admin/categories', icon: '📂' },
  { name: 'Ubicaciones', route: '/admin/locations', icon: '📍' },
  { name: 'Tags', route: '/admin/tags', icon: '🏷️' },
  { name: 'Insignias', route: '/admin/badges', icon: '🏅' },
  { name: 'Reportes', route: '/admin/reports', icon: '🚩' },
  { name: 'Logs', route: '/admin/logs', icon: '📋' },
]

export default function AdminDashboardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Panel de Administración</Text>
      <Text style={styles.subtitle}>Gestiona tu plataforma</Text>
      <View style={styles.grid}>
        {adminModules.map((mod) => (
          <TouchableOpacity key={mod.name} style={styles.moduleCard} onPress={() => router.push(mod.route as never)}>
            <Text style={styles.moduleIcon}>{mod.icon}</Text>
            <Text style={styles.moduleName}>{mod.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, marginTop: -12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard: {
    width: '47%', backgroundColor: colors.surfaceRaised, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, padding: 20, alignItems: 'center', gap: 8,
  },
  moduleIcon: { fontSize: 32 },
  moduleName: { color: colors.textPrimary, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold },
})
