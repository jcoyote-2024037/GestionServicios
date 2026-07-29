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

export default function AdminBadgesScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', badgeType: 'VERIFICADO', icon: '', priority: '0' })

  const { data, isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => adminService.getBadges(),
  })

  const badges = ((data as any)?.data?.data || (data as any)?.data?.badges || []) as Array<{ _id: string; name: string; description: string; badgeType: string; priority: number; autoAssign: boolean; status: boolean }>

  const createMutation = useMutation({
    mutationFn: () => adminService.createBadge({ ...form, priority: parseInt(form.priority) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] })
      setShowModal(false)
      setForm({ name: '', description: '', badgeType: 'VERIFICADO', icon: '', priority: '0' })
      Alert.alert('Creada', 'Insignia creada')
    },
  })

  const autoAssignMutation = useMutation({
    mutationFn: () => adminService.autoAssignAllBadges(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] })
      Alert.alert('Asignadas', 'Insignias asignadas automáticamente')
    },
  })

  const types = ['CALIFICACION', 'SOLICITUDES', 'VERIFICADO', 'RECOMENDADO']

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Insignias', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button style={{ flex: 1 }} onPress={() => setShowModal(true)}>Nueva Insignia</Button>
        <Button variant="secondary" style={{ flex: 1 }} onPress={() => autoAssignMutation.mutate()} loading={autoAssignMutation.isPending}>
          Auto-Asignar
        </Button>
      </View>
      {isLoading ? <Spinner /> : badges.map((badge) => (
        <Card key={badge._id}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{badge.name}</Text>
              <Badge color="purple">{badge.badgeType}</Badge>
              {badge.description && <Text style={styles.desc}>{badge.description}</Text>}
              <Text style={styles.meta}>Prioridad: {badge.priority} | {badge.autoAssign ? 'Auto' : 'Manual'}</Text>
            </View>
            <Badge color={badge.status ? 'green' : 'gray'}>{badge.status ? 'Activo' : 'Inactivo'}</Badge>
          </View>
        </Card>
      ))}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Insignia">
        <View style={{ gap: 12 }}>
          <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.textMuted}
            value={form.name} onChangeText={(t) => setForm((p) => ({ ...p, name: t }))} />
          <TextInput style={[styles.input, styles.multiline]} placeholder="Descripción" placeholderTextColor={colors.textMuted}
            value={form.description} onChangeText={(t) => setForm((p) => ({ ...p, description: t }))} multiline />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {types.map((type) => (
              <TouchableChip key={type} label={type} selected={form.badgeType === type}
                onPress={() => setForm((p) => ({ ...p, badgeType: type }))} />
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Priority" placeholderTextColor={colors.textMuted}
            value={form.priority} onChangeText={(t) => setForm((p) => ({ ...p, priority: t }))} keyboardType="number-pad" />
          <Button onPress={() => createMutation.mutate()} loading={createMutation.isPending}>Crear</Button>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 4 },
  desc: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: 4 },
  meta: { color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  chipTextSelected: { color: '#fff' },
})
