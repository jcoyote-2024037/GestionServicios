import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsService } from '../../services/reviews'
import { useAuth } from '../../hooks/useAuth'
import { Button } from './Button'
import { StarRating } from './Star'
import { colors, typography } from '../../theme'

interface ReviewFormProps {
  serviceId: string
  onReviewCreated?: () => void
}

export function ReviewForm({ serviceId, onReviewCreated }: ReviewFormProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [title, setTitle] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { servicioId: string; usuarioId: string; calificacion: number; comentario: string; title?: string }) =>
      reviewsService.create(data),
    onSuccess: () => {
      Alert.alert('Publicada', 'Tu reseña ha sido publicada')
      setComentario('')
      setTitle('')
      setCalificacion(5)
      queryClient.invalidateQueries({ queryKey: ['reviews', 'service', serviceId] })
      onReviewCreated?.()
    },
    onError: () => Alert.alert('Error', 'No se pudo publicar la reseña'),
  })

  const handleSubmit = () => {
    if (!comentario.trim() || comentario.length < 20) {
      Alert.alert('Validación', 'El comentario debe tener al menos 20 caracteres')
      return
    }
    mutation.mutate({
      servicioId: serviceId,
      usuarioId: user!.id,
      calificacion,
      comentario: comentario.trim(),
      title: title.trim() || undefined,
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user?.name || 'Tu'}</Text>
          <StarRating value={calificacion} onChange={setCalificacion} size="sm" />
        </View>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Título de tu reseña (opcional)"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Cuéntanos sobre tu experiencia (mínimo 20 caracteres)..."
        placeholderTextColor={colors.textMuted}
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={3}
      />
      <View style={styles.footer}>
        <Text style={styles.counter}>{comentario.length} / 500</Text>
        <Button
          size="sm"
          onPress={handleSubmit}
          loading={mutation.isPending}
          disabled={comentario.length < 20}
        >
          Publicar
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${colors.brand}30`, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.brand, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  name: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, padding: 12, color: colors.textPrimary, fontSize: typography.sizes.sm,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { color: colors.textMuted, fontSize: typography.sizes.xs },
})
