import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesService } from '../../../../src/services/services'
import { solicitudesService } from '../../../../src/services/solicitudes'
import { favoritesService } from '../../../../src/services/favorites'
import { reviewsService } from '../../../../src/services/reviews'
import { reportesService } from '../../../../src/services/reportes'
import { useAuth } from '../../../../src/hooks/useAuth'
import { Card } from '../../../../src/components/ui/Card'
import { Button } from '../../../../src/components/ui/Button'
import { Badge } from '../../../../src/components/ui/Badge'
import { Modal } from '../../../../src/components/ui/Modal'
import { Spinner } from '../../../../src/components/ui/Spinner'
import { ReviewForm } from '../../../../src/components/ui/ReviewForm'
import { ReviewList } from '../../../../src/components/ui/ReviewList'
import { colors, typography } from '../../../../src/theme'

const REPORT_MOTIVOS: Record<string, string> = {
  estafa: 'Estafa',
  contenido_inapropiado: 'Contenido inapropiado',
  informacion_falsa: 'Información falsa',
  spam: 'Spam',
  otro: 'Otro',
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAdmin } = useAuth()

  const [showRequest, setShowRequest] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [requestForm, setRequestForm] = useState({ descripcion: '', priceEstimate: '', scheduledDate: '' })
  const [reportForm, setReportForm] = useState({ motivo: 'spam', descripcion: '', severity: 'medium' as const })

  const { data, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesService.getById(id!),
    enabled: !!id,
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', 'service', id],
    queryFn: () => reviewsService.getByService(id!),
    enabled: !!id,
  })

  const service = (data as any)?.data?.service || (data as any)?.data?.data
  const reviews = (reviewsData as any)?.data?.reviews || (reviewsData as any)?.data?.data || []

  const requestMutation = useMutation({
    mutationFn: (form: { servicioId: string; descripcion: string; priceEstimate?: number; scheduledDate?: string }) =>
      solicitudesService.create(form),
    onSuccess: () => {
      Alert.alert('Solicitud enviada', 'Tu solicitud ha sido registrada')
      setShowRequest(false)
      setRequestForm({ descripcion: '', priceEstimate: '', scheduledDate: '' })
    },
    onError: (err: unknown) => Alert.alert('Error', (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'No se pudo crear la solicitud'),
  })

  const favoriteMutation = useMutation({
    mutationFn: () => favoritesService.create({ servicioId: id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      Alert.alert('Favorito', 'Agregado a favoritos')
    },
    onError: () => Alert.alert('Error', 'No se pudo agregar a favoritos'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => servicesService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      router.back()
    },
    onError: () => Alert.alert('Error', 'No se pudo eliminar el servicio'),
  })

  const handleReport = async () => {
    if (!reportForm.descripcion.trim()) { Alert.alert('Validación', 'Describe el problema'); return }
    try {
      await reportesService.create({ servicioId: id!, ...reportForm })
      Alert.alert('Reporte enviado', 'Gracias por reportar este servicio')
      setShowReport(false)
      setReportForm({ motivo: 'spam', descripcion: '', severity: 'medium' })
    } catch {
      Alert.alert('Error', 'No se pudo enviar el reporte')
    }
  }

  if (isLoading) return <Spinner fullScreen />
  if (!service) return <View style={{ flex: 1, backgroundColor: colors.surface }}><Text style={{ color: colors.textMuted, textAlign: 'center', padding: 40 }}>Servicio no encontrado</Text></View>

  const s = service as any
  const categoria = typeof s.categoriaId === 'object' ? String(s.categoriaId?.nombre || '') : ''
  const isOwner = user?.id === String(s.usuarioId || '')

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: (s.nombre as string) || 'Detalle',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />

      {s.imagenes && (s.imagenes as string[])[0] && (
        <Card>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>📷</Text>
          </View>
        </Card>
      )}

      <Card>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{s.nombre as string}</Text>
            <Text style={styles.description}>{s.descripcion as string}</Text>
          </View>
          {user && !isOwner && (
            <TouchableOpacity onPress={() => favoriteMutation.mutate()} style={styles.favBtn}>
              <Text style={styles.favIcon}>🤍</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.badges}>
          <Badge color={String(s.estado) === 'activo' ? 'green' : 'gray'}>{String(s.estado)}</Badge>
          {categoria && <Badge color="purple">{categoria}</Badge>}
          {Number(s.averageRating || 0) > 0 && <Badge color="yellow">★ {Number(s.averageRating).toFixed(1)}</Badge>}
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Stat value={Number(s.viewsCount || 0)} label="Visitas" />
        <Stat value={Number(s.favoritosCount || 0)} label="Favoritos" />
        <Stat value={Number(s.reviewsCount || 0)} label="Reseñas" />
      </View>

      {s.telefono && (
        <Card>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <Text style={styles.detail}>📞 {String(s.telefono || '')}</Text>
          {!!s.contactEmail && <Text style={styles.detail}>✉️ {String(s.contactEmail)}</Text>}
          {!!s.serviceAreaRadius && <Text style={styles.detail}>📍 Radio: {Number(s.serviceAreaRadius)} km</Text>}
        </Card>
      )}

      {user && !isOwner && String(s.estado) === 'activo' && (
        <Button onPress={() => setShowRequest(true)}>Solicitar Servicio</Button>
      )}

      {(isOwner || isAdmin) && (
        <Button variant="secondary" onPress={() => router.push(`/services/${id}/edit`)}>
          Editar Servicio
        </Button>
      )}

      {isAdmin && (
        <Button variant="danger" onPress={() => {
          Alert.alert('Eliminar', '¿Eliminar este servicio permanentemente?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate() },
          ])
        }}>
          Eliminar Servicio
        </Button>
      )}

      {user && !isOwner && (
        <Button variant="ghost" onPress={() => setShowReport(true)}>
          Reportar Servicio
        </Button>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Reseñas</Text>
        {user && !isOwner && (
          <ReviewForm serviceId={id!} onReviewCreated={() =>
            queryClient.invalidateQueries({ queryKey: ['reviews', 'service', id] })
          } />
        )}
        <ReviewList
          reviews={reviews as never[]}
          serviceId={id}
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['reviews', 'service', id] })}
        />
      </Card>

      <Modal isOpen={showRequest} onClose={() => setShowRequest(false)} title="Solicitar Servicio">
        <View style={{ gap: 12 }}>
          <View>
            <Text style={styles.modalLabel}>Descripción de tu necesidad *</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Describe lo que necesitas..."
              placeholderTextColor={colors.textMuted}
              value={requestForm.descripcion}
              onChangeText={(t) => setRequestForm((p) => ({ ...p, descripcion: t }))}
              multiline
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalLabel}>Presupuesto (Q)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Opcional"
                placeholderTextColor={colors.textMuted}
                value={requestForm.priceEstimate}
                onChangeText={(t) => setRequestForm((p) => ({ ...p, priceEstimate: t }))}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalLabel}>Fecha preferida</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={requestForm.scheduledDate}
                onChangeText={(t) => setRequestForm((p) => ({ ...p, scheduledDate: t }))}
              />
            </View>
          </View>
          <Button
            onPress={() => {
              if (!requestForm.descripcion.trim()) { Alert.alert('Validación', 'La descripción es obligatoria'); return }
              requestMutation.mutate({
                servicioId: id!,
                descripcion: requestForm.descripcion,
                priceEstimate: requestForm.priceEstimate ? Number(requestForm.priceEstimate) : undefined,
                scheduledDate: requestForm.scheduledDate || undefined,
              })
            }}
            loading={requestMutation.isPending}
          >
            Enviar Solicitud
          </Button>
        </View>
      </Modal>

      <Modal isOpen={showReport} onClose={() => setShowReport(false)} title="Reportar Servicio">
        <View style={{ gap: 12 }}>
          <View>
            <Text style={styles.modalLabel}>Motivo *</Text>
            <View style={styles.pickerRow}>
              {Object.entries(REPORT_MOTIVOS).map(([k, v]) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.chip, reportForm.motivo === k && styles.chipSelected]}
                  onPress={() => setReportForm((p) => ({ ...p, motivo: k }))}
                >
                  <Text style={[styles.chipText, reportForm.motivo === k && styles.chipTextSelected]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.modalLabel}>Severidad</Text>
            <View style={styles.pickerRow}>
              {['low', 'medium', 'high', 'critical'].map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.chip, reportForm.severity === sev && styles.chipSelected]}
                  onPress={() => setReportForm((p) => ({ ...p, severity: sev as typeof reportForm.severity }))}
                >
                  <Text style={[styles.chipText, reportForm.severity === sev && styles.chipTextSelected]}>
                    {sev === 'low' ? 'Baja' : sev === 'medium' ? 'Media' : sev === 'high' ? 'Alta' : 'Crítica'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.modalLabel}>Descripción *</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Describe el problema con este servicio..."
              placeholderTextColor={colors.textMuted}
              value={reportForm.descripcion}
              onChangeText={(t) => setReportForm((p) => ({ ...p, descripcion: t }))}
              multiline
            />
          </View>
          <Button onPress={handleReport}>Enviar Reporte</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  name: { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  favBtn: { padding: 8 },
  favIcon: { fontSize: 24 },
  description: { color: colors.textSecondary, fontSize: typography.sizes.base, lineHeight: 20 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 12 },
  detail: { color: colors.textSecondary, fontSize: typography.sizes.base, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: {
    flex: 1, alignItems: 'center', backgroundColor: colors.surfaceRaised,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  statValue: { color: colors.brand, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  statLabel: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  imagePlaceholder: {
    height: 200, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center', justifyContent: 'center',
  },
  imageText: { fontSize: 48 },
  modalLabel: { color: colors.textSecondary, fontSize: typography.sizes.xs, marginBottom: 6 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  chipTextSelected: { color: '#fff' },
})
