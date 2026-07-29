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

export default function AdminTagsScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', slug: '' })

  const { data, isLoading } = useQuery({ queryKey: ['tags'], queryFn: () => adminService.getTags() })
  const tags = ((data as any)?.data?.data || (data as any)?.data?.tags || []) as Array<{ _id: string; name: string; slug: string; description: string; usageCount: number; status: boolean }>

  const createMutation = useMutation({
    mutationFn: () => adminService.createTag(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); setShowModal(false); setForm({ name: '', description: '', slug: '' }); Alert.alert('Creado', 'Tag creado') },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteTag(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); Alert.alert('Eliminado', 'Tag eliminado') },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Tags', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(96,165,250,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <View style={styles.topRow}>
        <Text style={styles.count}>{tags.length} tags</Text>
        <Button size="sm" onPress={() => setShowModal(true)}>+ Nuevo</Button>
      </View>

      {isLoading ? <Spinner /> : tags.length === 0 ? (
        <EmptyState title="Sin tags" description="Crea tags para categorizar servicios" />
      ) : (
        <View style={styles.list}>
          {tags.map((t) => (
            <Card key={t._id} style={styles.tagCard}>
              <View style={styles.tagRow}>
                <View style={styles.tagInfo}>
                  <Text style={styles.tagName}>{t.name} <Text style={styles.tagSlug}>/</Text></Text>
                  <Text style={styles.tagDesc}>{t.description}</Text>
                  <View style={styles.tagMeta}>
                    <Badge color={t.status ? 'green' : 'gray'} size="sm">{t.status ? 'Activo' : 'Inactivo'}</Badge>
                    <Text style={styles.usageCount}>{t.usageCount} usos</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => { Alert.alert('Eliminar', `¿Eliminar ${t.name}?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(t._id) }]) }} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Tag">
        <View style={{ gap: 12 }}>
          {(['name', 'slug', 'description'] as const).map((f) => (
            <View key={f}>
              <Text style={styles.label}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              <TextInput style={styles.input} value={form[f]} onChangeText={(t) => setForm((p) => ({ ...p, [f]: t }))} placeholder={f} placeholderTextColor={colors.textMuted} />
            </View>
          ))}
          <Button onPress={() => { if (!form.name.trim()) { Alert.alert('Validación', 'El nombre es obligatorio'); return }; createMutation.mutate() }} loading={createMutation.isPending}>Crear Tag</Button>
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
  tagCard: { padding: 14 },
  tagRow: { flexDirection: 'row', alignItems: 'center' },
  tagInfo: { flex: 1 },
  tagName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 2 },
  tagSlug: { color: colors.textMuted, fontSize: typography.sizes.sm, fontWeight: typography.weights.normal },
  tagDesc: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  tagMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  usageCount: { color: colors.textMuted, fontSize: typography.sizes.xs },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(248,113,113,0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  deleteBtnText: { fontSize: 14 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
})
