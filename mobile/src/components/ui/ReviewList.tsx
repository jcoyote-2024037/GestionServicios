import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsService } from '../../services/reviews'
import { useAuth } from '../../hooks/useAuth'
import { StarIcon } from './Star'
import { Badge } from './Badge'
import { Button } from './Button'
import { colors, typography } from '../../theme'
import { Review, User } from '../../types'

interface ReviewListProps {
  reviews: Review[]
  serviceId?: string
  onUpdate?: () => void
}

export function ReviewList({ reviews = [], serviceId, onUpdate }: ReviewListProps) {
  const { user, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reviews', 'service', serviceId] }); onUpdate?.() },
    onError: () => Alert.alert('Error', 'No se pudo eliminar'),
  })

  const likeMutation = useMutation({
    mutationFn: (id: string) => reviewsService.like(id),
    onSuccess: () => { onUpdate?.() },
  })

  if (!reviews.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No hay reseñas aún</Text>
        <Text style={styles.emptySub}>Sé el primero en dejar tu opinión</Text>
      </View>
    )
  }

  const avgRating = reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length

  const renderStars = (n: number, size: 'xs' | 'sm' = 'xs') => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={s <= n} size={size} />
      ))}
    </View>
  )

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.summary}>
        <View style={styles.summaryLeft}>
          <Text style={styles.avgRating}>{avgRating.toFixed(1)}</Text>
          {renderStars(Math.round(avgRating), 'sm')}
          <Text style={styles.totalReviews}>{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.summaryBars}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.calificacion === star).length
            const pct = reviews.length ? (count / reviews.length) * 100 : 0
            return (
              <View key={star} style={styles.barRow}>
                <Text style={styles.barLabel}>{star}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            )
          })}
        </View>
      </View>

      {reviews.map((review) => {
        const rid = review._id
        const reviewerId = typeof review.usuarioId === 'object' ? (review.usuarioId as User).id : review.usuarioId
        const isOwner = user && String(user.id) === String(reviewerId)
        const isEditing = editingId === rid

        return (
          <View key={rid} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewUser}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {typeof review.usuarioId === 'object' && review.usuarioId?.name
                      ? review.usuarioId.name.charAt(0)
                      : 'U'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.reviewName}>
                    {typeof review.usuarioId === 'object'
                      ? `${review.usuarioId?.name || ''} ${review.usuarioId?.surname || ''}`.trim() || 'Usuario'
                      : 'Usuario'}
                  </Text>
                  {renderStars(review.calificacion, 'xs')}
                </View>
              </View>
              <Text style={styles.reviewDate}>{new Date(review.fecha || review.createdAt).toLocaleDateString('es-GT')}</Text>
            </View>

            {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}

            {isEditing ? (
              <View style={{ gap: 8 }}>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  multiline
                />
                <View style={styles.editActions}>
                  <Button size="sm" onPress={async () => {
                    if (!editText.trim()) { Alert.alert('Error', 'El comentario no puede estar vacío'); return }
                    try {
                      await reviewsService.update(rid, { comentario: editText.trim() })
                      Alert.alert('Actualizada', 'Reseña actualizada')
                      setEditingId(null)
                      onUpdate?.()
                    } catch { Alert.alert('Error', 'No se pudo actualizar') }
                  }}>Guardar</Button>
                  <Button size="sm" variant="ghost" onPress={() => setEditingId(null)}>Cancelar</Button>
                </View>
              </View>
            ) : (
              <Text style={styles.reviewComment}>{review.comentario}</Text>
            )}

            <View style={styles.reviewActions}>
              <TouchableOpacity onPress={() => likeMutation.mutate(rid)} style={styles.actionBtn}>
                <Text style={styles.actionText}>♥ {review.likesCount || 0}</Text>
              </TouchableOpacity>
              {isOwner && (
                <>
                  <TouchableOpacity onPress={() => { setEditingId(rid); setEditText(review.comentario) }} style={styles.actionBtn}>
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    Alert.alert('Eliminar', '¿Eliminar esta reseña?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(rid) },
                    ])
                  }} style={styles.actionBtn}>
                    <Text style={[styles.actionText, { color: colors.red }]}>Eliminar</Text>
                  </TouchableOpacity>
                </>
              )}
              {isAdmin && (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await reviewsService.moderate(rid, { status: review.moderationStatus === 'approved' ? 'rejected' : 'approved' })
                      Alert.alert('Moderado', 'Estado de moderación actualizado')
                      onUpdate?.()
                    } catch { Alert.alert('Error') }
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>{review.moderationStatus === 'approved' ? 'Rechazar' : 'Aprobar'}</Text>
                </TouchableOpacity>
              )}
              {review.isVerifiedPurchase && (
                <Badge color="green">Compra verificada</Badge>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  emptyContainer: { alignItems: 'center', padding: 24 },
  emptyTitle: { color: colors.textMuted, fontSize: typography.sizes.sm, marginBottom: 4 },
  emptySub: { color: 'rgba(255,255,255,0.15)', fontSize: typography.sizes.xs },
  summary: {
    flexDirection: 'row', padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 16,
  },
  summaryLeft: { alignItems: 'center', gap: 4, minWidth: 80 },
  avgRating: { color: colors.accent, fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold },
  totalReviews: { color: colors.textMuted, fontSize: typography.sizes.xs },
  summaryBars: { flex: 1, gap: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { color: colors.textMuted, fontSize: typography.sizes.xs, width: 12, textAlign: 'center' },
  barBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  barCount: { color: colors.textMuted, fontSize: typography.sizes.xs, width: 20, textAlign: 'right' },
  reviewCard: {
    padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 8,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reviewUser: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${colors.brand}30`, alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: colors.brand, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  reviewName: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  reviewDate: { color: colors.textMuted, fontSize: typography.sizes.xs },
  reviewTitle: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  reviewComment: { color: colors.textSecondary, fontSize: typography.sizes.sm, lineHeight: 18 },
  reviewActions: { flexDirection: 'row', gap: 12, marginTop: 4, alignItems: 'center' },
  actionBtn: { paddingVertical: 2 },
  actionText: { color: colors.textMuted, fontSize: typography.sizes.xs },
  starRow: { flexDirection: 'row', gap: 1 },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, padding: 12, color: colors.textPrimary, fontSize: typography.sizes.sm,
    minHeight: 60, textAlignVertical: 'top',
  },
  editActions: { flexDirection: 'row', gap: 8 },
})
