import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { servicesService } from '../../src/services/services'
import { Card } from '../../src/components/ui/Card'
import { Badge } from '../../src/components/ui/Badge'
import { Button } from '../../src/components/ui/Button'
import { Modal } from '../../src/components/ui/Modal'
import { Spinner } from '../../src/components/ui/Spinner'
import { EmptyState } from '../../src/components/ui/EmptyState'
import { Pagination } from '../../src/components/ui/Pagination'
import { colors, typography, radii } from '../../src/theme'

const PAGE_SIZE = 10

export default function AdminServicesScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'services'], queryFn: () => servicesService.getAll({}) })
  const allServices = (data as any)?.data?.data || (data as any)?.data?.services || []
  const filtered = allServices.filter((s: { nombre?: string; descripcion?: string }) => !search || s.nombre?.toLowerCase().includes(search.toLowerCase()) || s.descripcion?.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) as Array<{ _id: string; nombre: string; descripcion: string; estado: string; usuarioId: string; viewsCount: number; favoritosCount: number }>

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'services'] }); Alert.alert('Eliminado', 'Servicio eliminado') },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Servicios', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(244,63,94,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <TextInput style={styles.searchInput} placeholder="Buscar servicios..." placeholderTextColor={colors.textMuted} value={search} onChangeText={(t) => { setSearch(t); setPage(1) }} />
      <Text style={styles.count}>{allServices.length} servicios totales</Text>

      {isLoading ? <Spinner /> : paginated.length === 0 ? (
        <EmptyState title="Sin servicios" description="No hay servicios registrados" />
      ) : (
        <View style={styles.list}>
          {paginated.map((s) => (
            <Card key={s._id} style={styles.svcCard}>
              <View style={styles.svcRow}>
                <View style={styles.svcInfo}>
                  <Text style={styles.svcName}>{s.nombre}</Text>
                  <Text style={styles.svcDesc} numberOfLines={2}>{s.descripcion}</Text>
                  <View style={styles.svcMeta}>
                    <Badge color={s.estado === 'activo' ? 'green' : 'gray'}>{s.estado}</Badge>
                    <Text style={styles.svcStat}>{s.viewsCount || 0} vistas</Text>
                    <Text style={styles.svcStat}>{s.favoritosCount || 0} favs</Text>
                  </View>
                </View>
                <View style={styles.svcActions}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => router.push(`/(tabs)/services/${s._id}` as never)}>
                    <Text style={styles.viewBtnText}>👁</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { Alert.alert('Eliminar', `¿Eliminar "${s.nombre}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(s._id) }]) }} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  searchInput: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
  count: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  list: { gap: 10 },
  svcCard: { padding: 14 },
  svcRow: { flexDirection: 'row', alignItems: 'center' },
  svcInfo: { flex: 1 },
  svcName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 4 },
  svcDesc: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 8 },
  svcMeta: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  svcStat: { color: colors.textMuted, fontSize: typography.sizes.xs },
  svcActions: { gap: 8, marginLeft: 8 },
  viewBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { fontSize: 16 },
  deleteBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(248,113,113,0.1)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 16 },
})
