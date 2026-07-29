import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../src/hooks/useAuth'
import { adminService } from '../../src/services/admin'
import { servicesService } from '../../src/services/services'
import { colors, typography, radii, shadows } from '../../src/theme'
import { useState } from 'react'

const MODULES = [
  { name: 'Usuarios', route: '/users' as const, icon: '👥', desc: 'Gestiona usuarios y roles' },
  { name: 'Categorías', route: '/categories' as const, icon: '📂', desc: 'Crea y edita categorías' },
  { name: 'Ubicaciones', route: '/locations' as const, icon: '📍', desc: 'Administra ubicaciones' },
  { name: 'Servicios', route: '/services' as const, icon: '🔧', desc: 'Gestiona todos los servicios' },
  { name: 'Tags', route: '/tags' as const, icon: '🏷️', desc: 'Administra etiquetas' },
  { name: 'Insignias', route: '/badges' as const, icon: '🏅', desc: 'Crea y asigna insignias' },
  { name: 'Reportes', route: '/reports' as const, icon: '🚩', desc: 'Revisa reportes' },
  { name: 'Logs', route: '/logs' as const, icon: '📋', desc: 'Auditoría del sistema' },
]

export default function AdminDashboardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data: servicesData } = useQuery({ queryKey: ['admin', 'services'], queryFn: () => servicesService.getAll({}) })
  const { data: usersData } = useQuery({ queryKey: ['admin', 'users'], queryFn: () => adminService.getUsers() })

  const totalServices = (servicesData as any)?.data?.total || (servicesData as any)?.data?.data?.length || 0
  const totalUsers = (usersData as any)?.data?.total || (usersData as any)?.data?.data?.length || 0

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['admin'] })
    setRefreshing(false)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['rgba(244,63,94,0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.subtitle}>{user?.name || 'Administrador'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔧</Text>
            <Text style={styles.statValue}>{totalServices}</Text>
            <Text style={styles.statLabel}>Servicios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Módulos de Gestión</Text>
        <View style={styles.grid}>
          {MODULES.map((mod) => (
            <TouchableOpacity
              key={mod.name}
              style={styles.moduleCard}
              onPress={() => router.push(mod.route as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.moduleIcon}>{mod.icon}</Text>
              <Text style={styles.moduleName}>{mod.name}</Text>
              <Text style={styles.moduleDesc}>{mod.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.userViewBtn} onPress={() => router.replace('/(tabs)' as never)}>
          <Text style={styles.userViewText}>Ver vista de usuario →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 8,
  },
  greeting: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, marginTop: 1 },
  logoutBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.md,
    backgroundColor: 'rgba(248,113,113,0.12)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)',
  },
  logoutText: { color: colors.red, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, backgroundColor: colors.surfaceRaised, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 20, alignItems: 'center', gap: 6,
    ...shadows.md,
  },
  statIcon: { fontSize: 28 },
  statValue: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  statLabel: { color: colors.textMuted, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  sectionTitle: {
    color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold,
    marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard: {
    width: '47%', backgroundColor: colors.surfaceRaised, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 18, gap: 6,
    ...shadows.sm,
  },
  moduleIcon: { fontSize: 28, marginBottom: 2 },
  moduleName: { color: colors.textPrimary, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold },
  moduleDesc: { color: colors.textMuted, fontSize: typography.sizes.xs, lineHeight: 16 },
  userViewBtn: {
    paddingVertical: 14, borderRadius: radii.md, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border,
  },
  userViewText: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
})
