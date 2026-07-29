import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { categoriesService } from '../../src/services/categories'
import { Card } from '../../src/components/ui/Card'
import { Badge } from '../../src/components/ui/Badge'
import { Button } from '../../src/components/ui/Button'
import { Modal } from '../../src/components/ui/Modal'
import { Spinner } from '../../src/components/ui/Spinner'
import { EmptyState } from '../../src/components/ui/EmptyState'
import { colors, typography, radii, shadows } from '../../src/theme'

export default function AdminCategoriesScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<{ _id: string; nombre: string; descripcion: string } | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesService.getAll() })

  const categories = ((data as any)?.data?.data || (data as any)?.data?.categories || []) as Array<{ _id: string; nombre: string; descripcion: string; estado: string }>

  const createMutation = useMutation({
    mutationFn: () => categoriesService.create({ nombre: form.nombre, descripcion: form.descripcion } as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false); setForm({ nombre: '', descripcion: '' })
      Alert.alert('Creado', 'Categoría creada exitosamente')
    },
    onError: () => Alert.alert('Error', 'No se pudo crear la categoría'),
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { api } = await import('../../src/lib/api')
      await api.put(`/categories/update/${editing!._id}`, { nombre: form.nombre, descripcion: form.descripcion })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false); setEditing(null); setForm({ nombre: '', descripcion: '' })
      Alert.alert('Actualizado', 'Categoría actualizada')
    },
    onError: () => Alert.alert('Error', 'No se pudo actualizar'),
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Categorías', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(167,139,250,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <View style={styles.topRow}>
        <Text style={styles.count}>{categories.length} categorías</Text>
        <Button size="sm" onPress={() => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setShowModal(true) }}>+ Nueva</Button>
      </View>

      {isLoading ? <Spinner /> : categories.length === 0 ? (
        <EmptyState title="Sin categorías" description="Crea la primera categoría para los servicios" />
      ) : (
        <View style={styles.list}>
          {categories.map((cat) => (
            <Card key={cat._id} style={styles.catCard}>
              <View style={styles.catRow}>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat.nombre}</Text>
                  {cat.descripcion && <Text style={styles.catDesc}>{cat.descripcion}</Text>}
                </View>
                <View style={styles.catActions}>
                  <Badge color={cat.estado === 'activo' ? 'green' : 'gray'}>{cat.estado}</Badge>
                  <TouchableOpacity
                    onPress={() => { setEditing(cat); setForm({ nombre: cat.nombre, descripcion: cat.descripcion }); setShowModal(true) }}
                    style={styles.editBtn}
                  >
                    <Text style={styles.editBtnText}>✎</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null) }} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}>
        <View style={{ gap: 14 }}>
          <View>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={form.nombre} onChangeText={(t) => setForm((p) => ({ ...p, nombre: t }))} placeholder="Ej: Limpieza" placeholderTextColor={colors.textMuted} />
          </View>
          <View>
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, styles.textarea]} value={form.descripcion} onChangeText={(t) => setForm((p) => ({ ...p, descripcion: t }))} placeholder="Descripción opcional" placeholderTextColor={colors.textMuted} multiline />
          </View>
          <Button onPress={() => { if (!form.nombre.trim()) { Alert.alert('Validación', 'El nombre es obligatorio'); return }; editing ? updateMutation.mutate() : createMutation.mutate() }} loading={createMutation.isPending || updateMutation.isPending}>
            {editing ? 'Actualizar' : 'Crear Categoría'}
          </Button>
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
  catCard: { padding: 14 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catInfo: { flex: 1 },
  catName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 2 },
  catDesc: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  catActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  editBtnText: { color: colors.textSecondary, fontSize: 16 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
})
