import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Card } from './Card'
import { Badge } from './Badge'
import { colors, typography, radii } from '../../theme'
import { Service } from '../../types'

interface ServiceCardProps {
  service: Service
  onPress?: () => void
  onFavorite?: () => void
  isFavorited?: boolean
}

export function ServiceCard({ service, onPress, onFavorite, isFavorited }: ServiceCardProps) {
  const categoria = typeof service.categoriaId === 'object' ? service.categoriaId?.nombre : ''
  const rating = service.averageRating || 0

  return (
    <Card onPress={onPress} variant="elevated" style={styles.card}>
      <LinearGradient
        colors={['rgba(244,63,94,0.03)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          <Badge color={service.estado === 'activo' ? 'green' : 'gray'} size="sm">
            {service.estado === 'activo' ? '● Activo' : '● Inactivo'}
          </Badge>
          {categoria && <Badge color="purple" outline size="sm">{categoria}</Badge>}
        </View>
        {onFavorite && (
          <TouchableOpacity onPress={onFavorite} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.favIcon, isFavorited && styles.favActive]}>
              {isFavorited ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>{service.nombre}</Text>
      <Text style={styles.description} numberOfLines={2}>{service.descripcion}</Text>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{service.viewsCount || 0}</Text>
          <Text style={styles.statLabel}>visitas</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{service.favoritosCount || 0}</Text>
          <Text style={styles.statLabel}>favoritos</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{service.reviewsCount || 0}</Text>
          <Text style={styles.statLabel}>reseñas</Text>
        </View>
        {rating > 0 && (
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.yellow }]}>★ {rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>rating</Text>
          </View>
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { position: 'relative', overflow: 'hidden', padding: 0 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 14, marginBottom: 10,
  },
  badgesRow: { flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' },
  favBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  favIcon: { fontSize: 18, color: colors.textMuted },
  favActive: { color: colors.brand },
  name: {
    color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold,
    paddingHorizontal: 16, marginBottom: 4,
  },
  description: {
    color: colors.textSecondary, fontSize: typography.sizes.sm, lineHeight: 18,
    paddingHorizontal: 16, marginBottom: 14,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 16, marginBottom: 12 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 14, gap: 20 },
  stat: { alignItems: 'center', gap: 1 },
  statValue: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  statLabel: { color: colors.textMuted, fontSize: typography.sizes.xs },
})
