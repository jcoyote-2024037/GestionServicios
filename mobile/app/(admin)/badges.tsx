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

export default function AdminBadgesScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', badgeType: '', icon: '', priority: '0' })

  const { data, isLoading } = useQuery({ queryKey: ['badges'], queryFn: () => adminService.getBadges() })
  const badges = ((data as any)?.data?.data || (data as any)?.data?.badges || []) as Array<{ _id: string; name: string; description: string; badgeType: string; icon: string; priority: number; autoAssign: boolean; status: boolean }>

  const createMutation = useMutation({
    mutationFn: () => adminService.createBadge({ ...form, priority: parseInt(form.priority) || 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['badges'] }); setShowModal(false); setForm({ name: '', description: '', badgeType: '', icon: '', priority: '0' }); Alert.alert('Creada', 'Insignia creada') },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBadge(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['badges'] }); Alert.alert('Eliminada', 'Insignia eliminada') },
  })

  const autoAssignAll = useMutation({
    mutationFn: () => adminService.autoAssignAllBadges(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['badges'] }); Alert.alert('Asignadas', 'Insignias asignadas automáticamente') },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Insignias', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(244,114,182,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <View style={styles.topRow}>
        <Text style={styles.count}>{badges.length} insignias</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sm" variant="secondary" onPress={() => autoAssignAll.mutate()}>Auto-asignar</Button>
          <Button size="sm" onPress={() => setShowModal(true)}>+ Nueva</Button>
        </View>
      </View>

      {isLoading ? <Spinner /> : badges.length === 0 ? (
        <EmptyState title="Sin insignias" description="Crea insignias para reconocer a los proveedores" />
      ) : (
        <View style={styles.list}>
          {badges.map((b) => (
            <Card key={b._id} style={styles.badgeCard}>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeIcon}>{b.icon || '🏅'}</Text>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{b.name}</Text>
                  <Text style={styles.badgeDesc}>{b.description}</Text>
                  <View style={styles.badgeMeta}>
                    <Badge color="pink" size="sm">{b.badgeType}</Badge>
                    <Text style={styles.badgePriority}>Prioridad {b.priority}</Text>
                    <Badge color={b.status ? 'green' : 'gray'} size="sm">{b.status ? 'Activo' : 'Inactivo'}</Badge>
                  </View>
                </View>
                <TouchableOpacity onPress={() => { Alert.alert('Eliminar', `¿Eliminar ${b.name}?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(b._id) }]) }} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Insignia">
        <View style={{ gap: 12 }}>
          {(['name', 'description', 'badgeType', 'icon', 'priority'] as const).map((f) => (
            <View key={f}>
              <Text style={styles.label}>{f === 'badgeType' ? 'Tipo' : f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              <TextInput style={styles.input} value={form[f]} onChangeText={(t) => setForm((p) => ({ ...p, [f]: t }))} placeholder={f} placeholderTextColor={colors.textMuted} keyboardType={f === 'priority' ? 'number-pad' : 'default'} />
            </View>
          ))}
          <Button onPress={() => { if (!form.name.trim()) { Alert.alert('Validación', 'El nombre es obligatorio'); return }; createMutation.mutate() }} loading={createMutation.isPending}>Crear Insignia</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  list: { gap: 10 },
  badgeCard: { padding: 14 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badgeIcon: { fontSize: 32, width: 44, textAlign: 'center' },
  badgeInfo: { flex: 1 },
  badgeName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  badgeDesc: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  badgeMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badgePriority: { color: colors.textMuted, fontSize: typography.sizes.xs, alignSelf: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(248,113,113,0.1)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
})
