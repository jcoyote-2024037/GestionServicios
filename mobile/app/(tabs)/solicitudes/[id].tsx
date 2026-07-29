import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { solicitudesService } from '../../../src/services/solicitudes'
import { useAuth } from '../../../src/hooks/useAuth'
import { Card } from '../../../src/components/ui/Card'
import { Badge } from '../../../src/components/ui/Badge'
import { Button } from '../../../src/components/ui/Button'
import { Spinner } from '../../../src/components/ui/Spinner'
import { colors, typography } from '../../../src/theme'
import { SOLICITUD_STATUS_LABELS, SOLICITUD_STATUS_COLORS } from '../../../src/constants'

export default function SolicitudDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user, isAdmin } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['solicitud', id],
    queryFn: () => solicitudesService.getById(id!),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (data: { nuevoEstado: string }) => solicitudesService.changeStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitud', id] })
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      Alert.alert('Actualizado', 'Estado actualizado')
    },
    onError: () => Alert.alert('Error', 'No se pudo actualizar'),
  })

  if (isLoading) return <Spinner fullScreen />

  const solicitud = (data as any)?.data?.solicitud || (data as any)?.data?.data

  if (!solicitud) return <Text style={styles.errorText}>No encontrada</Text>

  const s = solicitud as { _id: string; servicioId: { nombre: string } | string; descripcion: string; status: string; priceEstimate?: number; scheduledDate?: string; fechaSolicitud: string; createdAt: string; cancelReason?: string; historialEstados?: Array<{ estado: string; fecha: string; observacion?: string }> }
  const servicioNombre = typeof s.servicioId === 'object' ? s.servicioId?.nombre : 'Servicio'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Solicitud', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.serviceName}>{servicioNombre}</Text>
          <Badge color={(SOLICITUD_STATUS_COLORS[s.status] || 'gray') as never}>
            {SOLICITUD_STATUS_LABELS[s.status] || s.status}
          </Badge>
        </View>
        <Text style={styles.description}>{s.descripcion}</Text>
        {s.priceEstimate && <Text style={styles.price}>Q {s.priceEstimate}</Text>}
        <Text style={styles.date}>Creada: {new Date(s.createdAt || s.fechaSolicitud).toLocaleDateString()}</Text>
      </Card>

      {s.status === 'pending' && isAdmin && (
        <View style={styles.actions}>
          <Button variant="success" onPress={() => statusMutation.mutate({ nuevoEstado: 'accepted' })}>
            Aceptar
          </Button>
          <Button variant="danger" onPress={() => statusMutation.mutate({ nuevoEstado: 'rejected' })}>
            Rechazar
          </Button>
        </View>
      )}

      {s.status === 'accepted' && (
        <Button onPress={() => statusMutation.mutate({ nuevoEstado: 'completed' })}>
          Marcar como Completada
        </Button>
      )}

      {s.historialEstados && s.historialEstados.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Historial</Text>
          {s.historialEstados.map((h, i) => (
            <View key={i} style={styles.timelineItem}>
              <Text style={styles.timelineStatus}>{SOLICITUD_STATUS_LABELS[h.estado] || h.estado}</Text>
              <Text style={styles.timelineDate}>{new Date(h.fecha).toLocaleString()}</Text>
              {h.observacion && <Text style={styles.timelineObs}>{h.observacion}</Text>}
            </View>
          ))}
        </Card>
      )}

      {s.cancelReason && (
        <Card>
          <Text style={styles.sectionTitle}>Motivo de cancelación</Text>
          <Text style={styles.description}>{s.cancelReason}</Text>
        </Card>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  serviceName: { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, flex: 1 },
  description: { color: colors.textSecondary, fontSize: typography.sizes.base, lineHeight: 20, marginBottom: 12 },
  price: { color: colors.brand, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: 8 },
  date: { color: colors.textMuted, fontSize: typography.sizes.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  timelineItem: { borderLeftWidth: 2, borderLeftColor: colors.brand, paddingLeft: 12, marginBottom: 12 },
  timelineStatus: { color: colors.textPrimary, fontWeight: typography.weights.semibold },
  timelineDate: { color: colors.textMuted, fontSize: typography.sizes.xs },
  timelineObs: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: 4 },
  errorText: { color: colors.textPrimary, textAlign: 'center', padding: 40, fontSize: typography.sizes.md },
})
