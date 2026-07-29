import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../src/hooks/useAuth'
import { servicesService } from '../../src/services/services'
import { solicitudesService } from '../../src/services/solicitudes'
import { favoritesService } from '../../src/services/favorites'
import { ServiceCard } from '../../src/components/ui/ServiceCard'
import { ServiceCardSkeleton } from '../../src/components/ui/Skeleton'
import { colors, typography, radii, shadows } from '../../src/theme'
import { useState } from 'react'

const STAT_ICONS: Record<string, string> = {
  Servicios: '📋',
  Solicitudes: '📝',
  Favoritos: '❤️',
}

export default function DashboardScreen() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', 'dashboard'],
    queryFn: () => servicesService.getAll({ limit: 6 }),
  })

  const { data: allServicesData } = useQuery({
    queryKey: ['services', 'all'],
    queryFn: () => servicesService.getAll({}),
  })

  const { data: solicitudesData } = useQuery({
    queryKey: ['solicitudes', 'dashboard', user?.id],
    queryFn: () => isAdmin
      ? solicitudesService.getAll({ page: 1, limit: 1 })
      : solicitudesService.getHistoryByUser(user!.id),
    enabled: !!user,
  })

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites', 'dashboard', user?.id],
    queryFn: () => favoritesService.getAll(),
    enabled: !!user,
  })

  const services = (servicesData as any)?.data?.data || (servicesData as any)?.data?.services || []
  const allBody = (allServicesData as any)?.data
  const totalServices = allBody?.total || (allBody?.data || allBody?.services || []).length

  const solicitudes = (solicitudesData as any)?.data?.data || (solicitudesData as any)?.data?.solicitudes || []
  const totalSolicitudes = solicitudes.length

  const favorites = (favoritesData as any)?.data?.data || (favoritesData as any)?.data?.favorites || []
  const totalFavorites = favorites.length

  const stats = [
    { label: 'Servicios', value: totalServices, route: '/services' },
    { label: 'Solicitudes', value: totalSolicitudes, route: '/solicitudes' },
    { label: 'Favoritos', value: totalFavorites, route: '/favorites' },
  ]

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['services'] })
    await queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
    await queryClient.invalidateQueries({ queryKey: ['favorites'] })
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
    >
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.name || 'Usuario'}!</Text>
          <Text style={styles.subtitle}>Panel de Control</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat, idx) => (
          <TouchableOpacity
            key={stat.label}
            style={styles.statCard}
            onPress={() => router.push(stat.route as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[`${colors.brand}15`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.statGradient}
            />
            <Text style={styles.statIcon}>{STAT_ICONS[stat.label]}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Servicios Recientes</Text>
        <TouchableOpacity onPress={() => router.push('/services' as never)}>
          <Text style={styles.seeAll}>Ver todos →</Text>
        </TouchableOpacity>
      </View>

      {servicesLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
        </View>
      ) : services.length > 0 ? (
        <View style={styles.grid}>
          {(services as Array<{ _id: string; nombre: string; descripcion: string; estado: string }>).slice(0, 5).map((service) => (
            <ServiceCard
              key={service._id}
              service={service as never}
              onPress={() => router.push(`/services/${service._id}`)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No hay servicios</Text>
          <Text style={styles.emptyDesc}>Crea tu primer servicio para empezar</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  greetingSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${colors.brand}25`,
    borderWidth: 1.5, borderColor: `${colors.brand}40`,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.brand, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: colors.surfaceRaised, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16,
    alignItems: 'center', gap: 6, position: 'relative', overflow: 'hidden',
    ...shadows.md,
  },
  statGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
  statIcon: { fontSize: 20 },
  statValue: { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  statLabel: { color: colors.textMuted, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  seeAll: { color: colors.brand, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  grid: { gap: 14 },
  emptyCard: {
    alignItems: 'center', padding: 40, backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl, borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  emptyDesc: { color: colors.textMuted, fontSize: typography.sizes.sm, textAlign: 'center' },
})
