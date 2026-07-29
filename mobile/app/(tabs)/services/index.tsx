import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { servicesService } from '../../../src/services/services'
import { categoriesService } from '../../../src/services/categories'
import { favoritesService } from '../../../src/services/favorites'
import { useAuth } from '../../../src/hooks/useAuth'
import { ServiceCard } from '../../../src/components/ui/ServiceCard'
import { SearchBar } from '../../../src/components/ui/SearchBar'
import { Spinner } from '../../../src/components/ui/Spinner'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Pagination } from '../../../src/components/ui/Pagination'
import { ServiceCardSkeleton } from '../../../src/components/ui/Skeleton'
import { colors, typography } from '../../../src/theme'
import { Category } from '../../../src/types'

const PAGE_SIZE = 12

export default function ServicesListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesService.getAll(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoriesService.getActive(),
  })

  const allServices = (servicesData as any)?.data?.data || (servicesData as any)?.data?.services || []
  const categories = ((categoriesData as any)?.data?.data || (categoriesData as any)?.data?.categories || []) as Category[]

  const filteredServices = useMemo(() => {
    let result = allServices as Array<{ _id: string; nombre: string; descripcion: string; categoriaId: { _id: string } | string }>
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((s) => s.nombre?.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q))
    }
    if (selectedCategory) {
      result = result.filter((s) => (typeof s.categoriaId === 'object' ? s.categoriaId?._id : s.categoriaId) === selectedCategory)
    }
    return result
  }, [allServices, search, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE))
  const paginatedServices = filteredServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const favMutation = useMutation({
    mutationFn: (serviceId: string) => favoritesService.create({ servicioId: serviceId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['services'] })
    setRefreshing(false)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Servicios</Text>
          <Text style={styles.subtitle}>Explora todos los servicios disponibles</Text>
        </View>
        {user && (
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/services/new')}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar servicios..." />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryActive]}
          onPress={() => { setSelectedCategory(''); setPage(1) }}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Todas</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={[styles.categoryChip, selectedCategory === cat._id && styles.categoryActive]}
            onPress={() => { setSelectedCategory(cat._id); setPage(1) }}
          >
            <Text style={[styles.chipText, selectedCategory === cat._id && styles.chipTextActive]}>{cat.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        {isLoading ? (
          <View style={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
          </View>
        ) : paginatedServices.length > 0 ? (
          <>
            <View style={styles.grid}>
              {paginatedServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service as never}
                  onPress={() => router.push(`/services/${service._id}`)}
                />
              ))}
            </View>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="No hay servicios"
            description="No se encontraron servicios con los filtros aplicados"
            action={
              user ? (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/services/new')}>
                  <Text style={styles.emptyBtnText}>Crear Primer Servicio</Text>
                </TouchableOpacity>
              ) : undefined
            }
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
  searchRow: { marginBottom: 12 },
  categoriesRow: { maxHeight: 40, marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border, marginRight: 8,
  },
  categoryActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  chipTextActive: { color: '#fff' },
  scrollContent: { paddingBottom: 40 },
  grid: { gap: 12 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.brand },
  emptyBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
})
