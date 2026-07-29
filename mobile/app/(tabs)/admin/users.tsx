import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../../src/services/admin'
import { SearchBar } from '../../../src/components/ui/SearchBar'
import { Card } from '../../../src/components/ui/Card'
import { Badge } from '../../../src/components/ui/Badge'
import { Spinner } from '../../../src/components/ui/Spinner'
import { Button } from '../../../src/components/ui/Button'
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog'
import { colors, typography } from '../../../src/theme'

export default function AdminUsersScreen() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => adminService.getUsers({ page, limit: 20, search: search || undefined }),
  })

  const body = (data as any)?.data
  const users = (body?.data?.users || body?.users || body?.data || []) as Array<{ _id: string; name: string; email: string; username: string; role: string; status?: string }>

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      Alert.alert('Eliminado', 'Usuario eliminado')
    },
    onError: () => Alert.alert('Error', 'No se pudo eliminar'),
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Usuarios', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <SearchBar onSearch={setSearch} />
      {isLoading ? <Spinner /> : users.map((user) => (
        <Card key={user._id}>
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userUsername}>@{user.username}</Text>
            </View>
            <View style={styles.userMeta}>
              <Badge color={user.role === 'ADMIN_ROLE' ? 'purple' : 'blue'}>{user.role === 'ADMIN_ROLE' ? 'Admin' : 'User'}</Badge>
              <Button variant="danger" size="sm" onPress={() => setDeleteTarget(user._id)}>Eliminar</Button>
            </View>
          </View>
        </Card>
      ))}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Eliminar usuario" message="¿Estás seguro?" danger confirmText="Eliminar" />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { gap: 2, flex: 1 },
  userName: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  userEmail: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  userUsername: { color: colors.textMuted, fontSize: typography.sizes.xs },
  userMeta: { gap: 8, alignItems: 'flex-end' },
})
