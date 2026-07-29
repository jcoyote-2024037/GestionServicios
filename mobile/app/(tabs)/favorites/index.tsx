import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../../src/hooks/useAuth'
import { favoritesService } from '../../../src/services/favorites'
import { Card } from '../../../src/components/ui/Card'
import { Spinner } from '../../../src/components/ui/Spinner'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Button } from '../../../src/components/ui/Button'
import { colors, typography } from '../../../src/theme'

export default function FavoritesScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => favoritesService.getByUser(user!.id),
    enabled: !!user?.id,
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => favoritesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })

  const favorites = (data as any)?.data?.favorites || (data as any)?.data?.data || []

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Favoritos</Text>

      {isLoading ? (
        <Spinner />
      ) : favorites.length > 0 ? (
        <View style={styles.list}>
          {(favorites as Array<{ _id: string; servicioId: { _id: string; nombre: string } }>).map((fav) => (
            <Card key={fav._id}>
              <TouchableOpacity onPress={() => router.push(`/services/${fav.servicioId._id}`)}>
                <Text style={styles.favName}>{fav.servicioId.nombre}</Text>
              </TouchableOpacity>
              <View style={{ marginTop: 8 }}>
                <Button
                  variant="danger"
                  size="sm"
                  onPress={() => removeMutation.mutate(fav._id)}
                  loading={removeMutation.isPending}
                >
                  Quitar
                </Button>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState title="Sin favoritos" description="Agrega servicios a tus favoritos" />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  list: { gap: 12 },
  favName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
})
