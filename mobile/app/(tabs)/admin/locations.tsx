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

export default function AdminLocationsScreen() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', municipality: '', department: '', zona: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => adminService.getLocations(),
  })

  const locations = ((data as any)?.data?.data || (data as any)?.data?.locations || []) as Array<{ _id: string; name: string; address: string; municipality: string; department: string; zona: string; status: boolean }>

  const createMutation = useMutation({
    mutationFn: () => adminService.createLocation(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      setShowModal(false)
      setForm({ name: '', address: '', municipality: '', department: '', zona: '' })
      Alert.alert('Creado', 'Ubicación creada')
    },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Ubicaciones', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <Button onPress={() => setShowModal(true)}>Nueva Ubicación</Button>
      {isLoading ? <Spinner /> : locations.map((loc) => (
        <Card key={loc._id}>
          <Text style={styles.name}>{loc.name}</Text>
          <Text style={styles.detail}>{loc.address}, {loc.municipality}, {loc.department}</Text>
          <Text style={styles.detail}>Zona: {loc.zona}</Text>
          <Badge color={loc.status ? 'green' : 'gray'}>{loc.status ? 'Activo' : 'Inactivo'}</Badge>
        </Card>
      ))}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Ubicación">
        <View style={{ gap: 12 }}>
          {(['name', 'address', 'municipality', 'department', 'zona'] as const).map((field) => (
            <TextInput key={field} style={styles.input} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              placeholderTextColor={colors.textMuted} value={form[field]}
              onChangeText={(t) => setForm((p) => ({ ...p, [field]: t }))} />
          ))}
          <Button onPress={() => createMutation.mutate()} loading={createMutation.isPending}>Crear</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  name: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 4 },
  detail: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base,
  },
})
