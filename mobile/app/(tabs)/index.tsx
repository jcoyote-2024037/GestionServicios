import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../src/hooks/useAuth'
import { servicesService } from '../../src/services/services'
import { solicitudesService } from '../../src/services/solicitudes'
import { favoritesService } from '../../src/services/favorites'
import { ServiceCard } from '../../src/components/ui/ServiceCard'
import { ServiceCardSkeleton } from '../../src/components/ui/Skeleton'
import { Spinner } from '../../src/components/ui/Spinner'
import { colors, typography } from '../../src/theme'
import { useState } from 'react'

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
  const allServices = allBody?.data || allBody?.services || []
  const totalServices = allBody?.total || allServices.length

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
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
    >
      <Text style={styles.greeting}>
        Bienvenido, {user?.name || 'Usuario'}
      </Text>
      <Text style={styles.subtitle}>Panel de Control</Text>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <TouchableOpacity key={stat.label} style={styles.statCard} onPress={() => router.push(stat.route as never)}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Servicios Recientes</Text>
      {servicesLoading ? (
        <View style={styles.servicesGrid}>
          {Array.from({ length: 3 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
        </View>
      ) : services.length > 0 ? (
        <View style={styles.servicesGrid}>
          {(services as Array<{ _id: string; nombre: string; descripcion: string; estado: string }>).slice(0, 6).map((service) => (
            <ServiceCard
              key={service._id}
              service={service as never}
              onPress={() => router.push(`/services/${service._id}`)}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No hay servicios disponibles</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  greeting: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.base, marginTop: -12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, backgroundColor: colors.surfaceRaised, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, padding: 16, alignItems: 'center', gap: 4,
  },
  statValue: { color: colors.brand, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  statLabel: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  servicesGrid: { gap: 12 },
  empty: { color: colors.textMuted, fontSize: typography.sizes.base, textAlign: 'center', padding: 20 },
})
