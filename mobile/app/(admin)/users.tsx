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
import { Pagination } from '../../src/components/ui/Pagination'
import { colors, typography, radii } from '../../src/theme'

export default function AdminUsersScreen() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<Record<string, unknown> | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' })

  const { data, isLoading } = useQuery({ queryKey: ['users', page, search], queryFn: () => adminService.getUsers({ page, limit: 20, search: search || undefined }) })
  const body = (data as any)?.data
  const users: Array<{ _id: string; name: string; email: string; username: string; role: string; status?: string }> = body?.data?.users || body?.users || body?.data || []
  const totalPages = body?.totalPages || 1

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); Alert.alert('Eliminado', 'Usuario eliminado') },
  })

  const updateMutation = useMutation({
    mutationFn: () => adminService.updateUser(editingUser!._id as string, { name: editForm.name, email: editForm.email, role: editForm.role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setShowEdit(false); Alert.alert('Actualizado', 'Usuario actualizado') },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Usuarios', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(96,165,250,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1) }}
        />
      </View>

      {isLoading ? <Spinner /> : users.length === 0 ? (
        <EmptyState title="Sin usuarios" description="No se encontraron usuarios" />
      ) : (
        <View style={styles.list}>
          {users.map((u) => (
            <Card key={u._id} style={styles.userCard}>
              <View style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{(u.name || 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.name} (@{u.username})</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
                <View style={styles.userActions}>
                  <Badge color={u.role === 'ADMIN_ROLE' ? 'purple' : 'blue'}>{u.role === 'ADMIN_ROLE' ? 'Admin' : 'User'}</Badge>
                  <TouchableOpacity
                    onPress={() => { setEditingUser(u as never); setEditForm({ name: u.name, email: u.email, role: u.role }); setShowEdit(true) }}
                    style={styles.editBtn}
                  >
                    <Text style={styles.editBtnText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { Alert.alert('Eliminar', `¿Eliminar a ${u.name}?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(u._id) }]) }} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </View>
      )}

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar Usuario">
        <View style={{ gap: 14 }}>
          {(['name', 'email', 'role'] as const).map((f) => (
            <View key={f}>
              <Text style={styles.label}>{f === 'role' ? 'Rol' : f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              {f === 'role' ? (
                <View style={styles.roleRow}>
                  {['USER_ROLE', 'ADMIN_ROLE'].map((r) => (
                    <TouchableOpacity key={r} style={[styles.roleChip, editForm.role === r && styles.roleActive]} onPress={() => setEditForm((p) => ({ ...p, role: r }))}>
                      <Text style={[styles.roleText, editForm.role === r && styles.roleTextActive]}>{r === 'USER_ROLE' ? 'Usuario' : 'Admin'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput style={styles.input} value={editForm[f]} onChangeText={(t) => setEditForm((p) => ({ ...p, [f]: t }))} placeholderTextColor={colors.textMuted} />
              )}
            </View>
          ))}
          <Button onPress={() => updateMutation.mutate()} loading={updateMutation.isPending}>Guardar Cambios</Button>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  searchRow: { marginBottom: 4 },
  searchInput: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
  list: { gap: 10 },
  userCard: { padding: 14 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.blue}25`, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.blue, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  userInfo: { flex: 1 },
  userName: { color: colors.textPrimary, fontSize: typography.sizes.base, fontWeight: typography.weights.semibold },
  userEmail: { color: colors.textMuted, fontSize: typography.sizes.sm },
  userActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  editBtnText: { color: colors.textSecondary, fontSize: 14 },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(248,113,113,0.1)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, color: colors.textPrimary, fontSize: typography.sizes.base },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border },
  roleActive: { backgroundColor: `${colors.purple}25`, borderColor: `${colors.purple}40` },
  roleText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  roleTextActive: { color: colors.purple, fontWeight: typography.weights.semibold },
})
