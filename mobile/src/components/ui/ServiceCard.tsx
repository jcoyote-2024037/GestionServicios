import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Card } from './Card'
import { Badge } from './Badge'
import { colors, typography } from '../../theme'
import { Service } from '../../types'

interface ServiceCardProps {
  service: Service
  onPress?: () => void
  onFavorite?: () => void
  isFavorited?: boolean
}

export function ServiceCard({ service, onPress, onFavorite, isFavorited }: ServiceCardProps) {
  const categoria = typeof service.categoriaId === 'object' ? service.categoriaId?.nombre : ''
  const categoriaId = typeof service.categoriaId === 'object' ? service.categoriaId?._id : service.categoriaId

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{service.nombre}</Text>
        {onFavorite && (
          <TouchableOpacity onPress={onFavorite} style={styles.favBtn}>
            <Text style={[styles.favIcon, isFavorited && styles.favActive]}>
              {isFavorited ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.description} numberOfLines={2}>{service.descripcion}</Text>
      <View style={styles.meta}>
        <Badge color={service.estado === 'activo' ? 'green' : 'gray'}>
          {service.estado}
        </Badge>
        {categoria && <Badge color="purple">{categoria}</Badge>}
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>{service.viewsCount || 0} vistas</Text>
        <Text style={styles.stat}>{service.favoritosCount || 0} favs</Text>
        <Text style={styles.stat}>{service.reviewsCount || 0} reseñas</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  favBtn: {
    padding: 4,
  },
  favIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  favActive: {
    color: colors.brand,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
})
