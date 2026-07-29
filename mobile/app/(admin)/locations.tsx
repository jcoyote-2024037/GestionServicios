import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native'
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

const FORM_DEFAULTS = { name: '', address: '', municipality: '', department: '', zona: '', lat: '', lng: '' }

export default function AdminLocationsScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState(FORM_DEFAULTS)

  const { data, isLoading } = useQuery({ queryKey: ['locations'], queryFn: () => adminService.getLocations() })
  const locations = ((data as any)?.data?.data || (data as any)?.data?.locations || []) as Array<{ _id: string; name: string; address: string; municipality: string; department: string; zona: string; status: boolean }>

  const createMutation = useMutation({
    mutationFn: () => adminService.createLocation({ ...form, lat: Number(form.lat) || 0, lng: Number(form.lng) || 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['locations'] }); setShowModal(false); setForm(FORM_DEFAULTS); Alert.alert('Creada', 'Ubicación creada') },
    onError: () => Alert.alert('Error', 'No se pudo crear'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteLocation(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['locations'] }); Alert.alert('Eliminada', 'Ubicación eliminada') },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Ubicaciones', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(251,191,36,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <View style={styles.topRow}>
        <Text style={styles.count}>{locations.length} ubicaciones</Text>
        <Button size="sm" onPress={() => { setEditing(null); setForm(FORM_DEFAULTS); setShowModal(true) }}>+ Nueva</Button>
      </View>

      {isLoading ? <Spinner /> : locations.length === 0 ? (
        <EmptyState title="Sin ubicaciones" description="Agrega ubicaciones para los servicios" />
      ) : (
        <View style={styles.list}>
          {locations.map((loc) => (
            <Card key={loc._id} style={styles.locCard}>
              <View style={styles.locHeader}>
                <Text style={styles.locName}>{loc.name}</Text>
                <Badge color={loc.status ? 'green' : 'gray'}>{loc.status ? 'Activo' : 'Inactivo'}</Badge>
              </View>
              <Text style={styles.locDetail}>{loc.address}</Text>
              <Text style={styles.locDetail}>{loc.municipality}, {loc.department} - Zona {loc.zona}</Text>
              <View style={styles.locActions}>
                <TouchableOpacity onPress={() => deleteMutation.mutate(loc._id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null) }} title="Nueva Ubicación">
        <View style={{ gap: 12 }}>
          {(['name', 'address', 'municipality', 'department', 'zona'] as const).map((f) => (
            <View key={f}>
              <Text style={styles.label}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              <TextInput style={styles.input} value={form[f]} onChangeText={(t) => setForm((p) => ({ ...p, [f]: t }))} placeholder={f} placeholderTextColor={colors.textMuted} />
            </View>
          ))}
          <Button onPress={() => { if (!form.name.trim()) { Alert.alert('Validación', 'El nombre es obligatorio'); return }; createMutation.mutate() }} loading={createMutation.isPending}>Crear Ubicación</Button>
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
  locCard: { padding: 14 },
  locHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  locName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  locDetail: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 2 },
  locActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(248,113,113,0.1)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
})
