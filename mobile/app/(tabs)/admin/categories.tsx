import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '../../../src/services/categories'
import { Card } from '../../../src/components/ui/Card'
import { Badge } from '../../../src/components/ui/Badge'
import { Button } from '../../../src/components/ui/Button'
import { Modal } from '../../../src/components/ui/Modal'
import { Spinner } from '../../../src/components/ui/Spinner'
import { colors, typography } from '../../../src/theme'

export default function AdminCategoriesScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  const categories = ((data as any)?.data?.data || (data as any)?.data?.categories || []) as Array<{ _id: string; nombre: string; descripcion: string; estado: string }>

  const createMutation = useMutation({
    mutationFn: () => categoriesService.create({ nombre: form.nombre, descripcion: form.descripcion } as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false)
      setForm({ nombre: '', descripcion: '' })
      Alert.alert('Creado', 'Categoría creada')
    },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Categorías', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <Button onPress={() => setShowModal(true)}>Nueva Categoría</Button>
      {isLoading ? <Spinner /> : categories.map((cat) => (
        <Card key={cat._id}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{cat.nombre}</Text>
              {cat.descripcion && <Text style={styles.desc}>{cat.descripcion}</Text>}
            </View>
            <Badge color={cat.estado === 'activo' ? 'green' : 'gray'}>{cat.estado}</Badge>
          </View>
        </Card>
      ))}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Categoría">
        <View style={{ gap: 12 }}>
          <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.textMuted}
            value={form.nombre} onChangeText={(t) => setForm((p) => ({ ...p, nombre: t }))} />
          <TextInput style={[styles.input, styles.multiline]} placeholder="Descripción" placeholderTextColor={colors.textMuted}
            value={form.descripcion} onChangeText={(t) => setForm((p) => ({ ...p, descripcion: t }))} multiline />
          <Button onPress={() => createMutation.mutate()} loading={createMutation.isPending}>Crear</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  desc: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
})
