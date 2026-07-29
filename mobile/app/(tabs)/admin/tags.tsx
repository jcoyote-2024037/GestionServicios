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

export default function AdminTagsScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => adminService.getTags(),
  })

  const tags = ((data as any)?.data?.data || (data as any)?.data?.tags || []) as Array<{ _id: string; name: string; slug: string; description: string; usageCount: number; status: boolean }>

  const createMutation = useMutation({
    mutationFn: () => adminService.createTag(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setShowModal(false)
      setForm({ name: '', description: '' })
      Alert.alert('Creado', 'Tag creado')
    },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Tags', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <Button onPress={() => setShowModal(true)}>Nuevo Tag</Button>
      {isLoading ? <Spinner /> : tags.map((tag) => (
        <Card key={tag._id}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{tag.name}</Text>
              <Text style={styles.slug}>/{tag.slug}</Text>
              {tag.description && <Text style={styles.desc}>{tag.description}</Text>}
              <Text style={styles.usage}>{tag.usageCount} usos</Text>
            </View>
            <Badge color={tag.status ? 'green' : 'gray'}>{tag.status ? 'Activo' : 'Inactivo'}</Badge>
          </View>
        </Card>
      ))}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Tag">
        <View style={{ gap: 12 }}>
          <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.textMuted}
            value={form.name} onChangeText={(t) => setForm((p) => ({ ...p, name: t }))} />
          <TextInput style={[styles.input, styles.multiline]} placeholder="Descripción" placeholderTextColor={colors.textMuted}
            value={form.description} onChangeText={(t) => setForm((p) => ({ ...p, description: t }))} multiline />
          <Button onPress={() => createMutation.mutate()} loading={createMutation.isPending}>Crear</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  slug: { color: colors.textMuted, fontSize: typography.sizes.xs, marginBottom: 4 },
  desc: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  usage: { color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
})
