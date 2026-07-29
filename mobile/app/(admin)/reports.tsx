import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { adminService } from '../../src/services/admin'
import { Card } from '../../src/components/ui/Card'
import { Badge } from '../../src/components/ui/Badge'
import { Button } from '../../src/components/ui/Button'
import { Modal } from '../../src/components/ui/Modal'
import { Spinner } from '../../src/components/ui/Spinner'
import { EmptyState } from '../../src/components/ui/EmptyState'
import { colors, typography, radii } from '../../src/theme'

const SEVERITY_COLORS: Record<string, 'blue' | 'yellow' | 'orange' | 'red'> = { low: 'blue', medium: 'yellow', high: 'orange', critical: 'red' }
const STATUS_COLORS: Record<string, 'yellow' | 'blue' | 'green' | 'gray'> = { pending: 'yellow', under_review: 'blue', resolved: 'green', dismissed: 'gray' }

export default function AdminReportsScreen() {
  const queryClient = useQueryClient()
  const [reviewTarget, setReviewTarget] = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState('')
  const [resolution, setResolution] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['reports'], queryFn: () => adminService.getReports({ page: 1, limit: 50 }) })
  const reports = ((data as any)?.data?.data || (data as any)?.data?.reports || []) as Array<{ _id: string; servicioId: { nombre: string } | string; usuarioId: string; motivo: string; descripcion: string; severity: string; status: string; createdAt: string }>

  const reviewMutation = useMutation({
    mutationFn: () => adminService.reviewReport(reviewTarget!, { nuevoStatus: reviewAction, resolution }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); setReviewTarget(null); setReviewAction(''); setResolution(''); Alert.alert('Revisado', 'Reporte actualizado') },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteReport(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); Alert.alert('Eliminado', 'Reporte eliminado') },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Reportes', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(248,113,113,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <Text style={styles.count}>{reports.length} reportes</Text>

      {isLoading ? <Spinner /> : reports.length === 0 ? (
        <EmptyState title="Sin reportes" description="No hay reportes pendientes" />
      ) : (
        <View style={styles.list}>
          {reports.map((r) => (
            <Card key={r._id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Badge color={SEVERITY_COLORS[r.severity] || 'gray'}>{r.severity}</Badge>
                <Badge color={STATUS_COLORS[r.status] || 'gray'}>{r.status}</Badge>
              </View>
              <Text style={styles.reportMotivo}>Motivo: {r.motivo}</Text>
              <Text style={styles.reportDesc}>{r.descripcion}</Text>
              <Text style={styles.reportService}>
                Servicio: {typeof r.servicioId === 'object' ? r.servicioId?.nombre : r.servicioId}
              </Text>
              <Text style={styles.reportDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
              <View style={styles.reportActions}>
                {r.status === 'pending' && (
                  <Button size="sm" onPress={() => setReviewTarget(r._id)}>Revisar</Button>
                )}
                <TouchableOpacity onPress={() => { Alert.alert('Eliminar', '¿Eliminar este reporte?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(r._id) }]) }} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Modal isOpen={!!reviewTarget} onClose={() => setReviewTarget(null)} title="Revisar Reporte">
        <View style={{ gap: 14 }}>
          <View>
            <Text style={styles.label}>Acción</Text>
            <View style={styles.actionRow}>
              {['resolved', 'dismissed'].map((a) => (
                <TouchableOpacity key={a} style={[styles.actionChip, reviewAction === a && styles.actionActive]} onPress={() => setReviewAction(a)}>
                  <Text style={[styles.actionText, reviewAction === a && styles.actionTextActive]}>{a === 'resolved' ? 'Resolver' : 'Desestimar'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.label}>Resolución</Text>
            <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} value={resolution} onChangeText={setResolution} placeholder="Detalles de la resolución..." placeholderTextColor={colors.textMuted} multiline />
          </View>
          <Button onPress={() => { if (!reviewAction) { Alert.alert('Selecciona una acción'); return }; reviewMutation.mutate() }} loading={reviewMutation.isPending}>Aplicar</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  count: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  list: { gap: 10 },
  reportCard: { padding: 14 },
  reportHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  reportMotivo: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 4 },
  reportDesc: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 8 },
  reportService: { color: colors.textMuted, fontSize: typography.sizes.xs, marginBottom: 2 },
  reportDate: { color: colors.textMuted, fontSize: typography.sizes.xs, marginBottom: 8 },
  reportActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(248,113,113,0.1)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border },
  actionActive: { backgroundColor: `${colors.green}25`, borderColor: `${colors.green}40` },
  actionText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  actionTextActive: { color: colors.green, fontWeight: typography.weights.semibold },
})
