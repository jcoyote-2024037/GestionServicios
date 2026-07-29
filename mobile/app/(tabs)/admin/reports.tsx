import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../../src/services/admin'
import { Card } from '../../../src/components/ui/Card'
import { Badge } from '../../../src/components/ui/Badge'
import { Button } from '../../../src/components/ui/Button'
import { Modal } from '../../../src/components/ui/Modal'
import { Spinner } from '../../../src/components/ui/Spinner'
import { colors, typography } from '../../../src/theme'
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../../../src/constants'

export default function AdminReportsScreen() {
  const queryClient = useQueryClient()
  const [reviewTarget, setReviewTarget] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')
  const [reviewAction, setReviewAction] = useState('resolved')

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => adminService.getReports({ page: 1, limit: 50 }),
  })

  const reports = ((data as any)?.data?.data || (data as any)?.data?.reports || []) as Array<{ _id: string; servicioId: { nombre: string } | string; motivo: string; severity: string; status: string; createdAt: string }>

  const reviewMutation = useMutation({
    mutationFn: () => adminService.reviewReport(reviewTarget!, { nuevoStatus: reviewAction, resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setReviewTarget(null)
      setResolution('')
      Alert.alert('Revisado', 'Reporte actualizado')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      Alert.alert('Eliminado', 'Reporte eliminado')
    },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Reportes', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      {isLoading ? <Spinner /> : reports.map((report) => {
        const servicioNombre = typeof report.servicioId === 'object' ? (report.servicioId as { nombre: string }).nombre : 'Servicio'
        return (
          <Card key={report._id}>
            <Text style={styles.name}>Servicio: {servicioNombre}</Text>
            <View style={styles.badges}>
              <Badge color="yellow">{report.motivo}</Badge>
              <Badge color={report.severity === 'high' || report.severity === 'critical' ? 'red' : 'orange'}>{report.severity}</Badge>
              <Badge color={(REPORT_STATUS_COLORS[report.status] || 'gray') as never}>
                {REPORT_STATUS_LABELS[report.status] || report.status}
              </Badge>
            </View>
            <Text style={styles.date}>{new Date(report.createdAt).toLocaleDateString()}</Text>
            <View style={styles.actions}>
              <Button size="sm" onPress={() => setReviewTarget(report._id)}>Revisar</Button>
              <Button size="sm" variant="danger" onPress={() => deleteMutation.mutate(report._id)}>Eliminar</Button>
            </View>
          </Card>
        )
      })}
      <Modal isOpen={!!reviewTarget} onClose={() => setReviewTarget(null)} title="Revisar Reporte">
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['resolved', 'dismissed'].map((action) => (
              <TouchableChip key={action} label={action === 'resolved' ? 'Resolver' : 'Desestimar'}
                selected={reviewAction === action} onPress={() => setReviewAction(action)} />
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Resolución" placeholderTextColor={colors.textMuted}
            value={resolution} onChangeText={setResolution} multiline />
          <Button onPress={() => reviewMutation.mutate()} loading={reviewMutation.isPending}>Guardar</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

import { TouchableOpacity } from 'react-native'

function TouchableChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  name: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  date: { color: colors.textMuted, fontSize: typography.sizes.xs, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
    minHeight: 80, textAlignVertical: 'top',
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  chipTextSelected: { color: '#fff' },
})
