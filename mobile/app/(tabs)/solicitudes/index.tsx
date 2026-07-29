import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../../src/hooks/useAuth'
import { solicitudesService } from '../../../src/services/solicitudes'
import { Card } from '../../../src/components/ui/Card'
import { Badge } from '../../../src/components/ui/Badge'
import { Spinner } from '../../../src/components/ui/Spinner'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Pagination } from '../../../src/components/ui/Pagination'
import { colors, typography } from '../../../src/theme'
import { SOLICITUD_STATUS_LABELS, SOLICITUD_STATUS_COLORS } from '../../../src/constants'

const PAGE_SIZE = 10
const statuses = ['', 'pending', 'accepted', 'completed', 'cancelled'] as const

export default function SolicitudesListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['solicitudes', user?.id],
    queryFn: () => isAdmin
      ? solicitudesService.getAll({ page: 1, limit: 100, status: filter || undefined })
      : solicitudesService.getHistoryByUser(user!.id),
  })

  const solicitudes = (data as any)?.data?.data || (data as any)?.data?.solicitudes || []

  const filtered = useMemo(() => {
    const list = solicitudes as Array<{ status: string }>
    return filter ? list.filter((s) => s.status === filter) : list
  }, [solicitudes, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) as Array<{
    _id: string; servicioId: { nombre: string } | string; descripcion: string;
    status: string; priceEstimate?: number; createdAt: string
  }>

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
    >
      <Text style={styles.title}>Solicitudes</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {statuses.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filter === s && styles.filterActive]}
            onPress={() => { setFilter(s); setPage(1) }}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s ? SOLICITUD_STATUS_LABELS[s] || s : 'Todas'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <Spinner />
      ) : paginated.length > 0 ? (
        <>
          <View style={styles.list}>
            {paginated.map((sol) => (
              <TouchableOpacity key={sol._id} onPress={() => router.push(`/solicitudes/${sol._id}`)}>
                <Card>
                  <View style={styles.solHeader}>
                    <Text style={styles.solName} numberOfLines={1}>
                      {typeof sol.servicioId === 'object' ? sol.servicioId?.nombre : 'Servicio'}
                    </Text>
                    <Badge color={SOLICITUD_STATUS_COLORS[sol.status] as never}>
                      {SOLICITUD_STATUS_LABELS[sol.status] || sol.status}
                    </Badge>
                  </View>
                  <Text style={styles.solDesc} numberOfLines={2}>{sol.descripcion}</Text>
                  {sol.priceEstimate && <Text style={styles.solPrice}>Q {sol.priceEstimate}</Text>}
                  <Text style={styles.solDate}>{new Date(sol.createdAt).toLocaleDateString()}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No hay solicitudes" description="No tienes solicitudes registradas" />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  filtersRow: { maxHeight: 40 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border, marginRight: 8,
  },
  filterActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  filterTextActive: { color: '#fff' },
  list: { gap: 12 },
  solHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  solName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, flex: 1 },
  solDesc: { color: colors.textSecondary, fontSize: typography.sizes.sm, lineHeight: 18, marginBottom: 8 },
  solPrice: { color: colors.brand, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold },
  solDate: { color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 4 },
})
