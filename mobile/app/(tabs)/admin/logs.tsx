import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../../src/services/admin'
import { Card } from '../../../src/components/ui/Card'
import { Badge } from '../../../src/components/ui/Badge'
import { Button } from '../../../src/components/ui/Button'
import { Spinner } from '../../../src/components/ui/Spinner'
import { colors, typography } from '../../../src/theme'
import { LOG_SEVERITY_COLORS } from '../../../src/constants'

export default function AdminLogsScreen() {
  const queryClient = useQueryClient()
  const [severity, setSeverity] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['logs', severity],
    queryFn: () => adminService.getLogs({ page: 1, limit: 50, severity: severity || undefined }),
  })

  const logs = ((data as any)?.data?.data || (data as any)?.data?.logs || []) as Array<{ _id: string; action: string; affectedEntity: string; detail: string; severity: string; ipAddress: string; createdAt: string }>

  const severities = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      Alert.alert('Eliminado', 'Log eliminado')
    },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Logs', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {severities.map((s) => (
            <TouchableChip key={s} label={s || 'Todas'} selected={severity === s} onPress={() => setSeverity(s)} />
          ))}
        </View>
      </ScrollView>
      {isLoading ? <Spinner /> : logs.map((log) => (
        <Card key={log._id}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.action}>{log.action}</Text>
              <Text style={styles.entity}>{log.affectedEntity}</Text>
              {log.detail && <Text style={styles.detail}>{log.detail}</Text>}
              <Text style={styles.meta}>{log.ipAddress} | {new Date(log.createdAt).toLocaleString()}</Text>
            </View>
            <View style={{ gap: 8, alignItems: 'flex-end' }}>
              <Badge color={(LOG_SEVERITY_COLORS[log.severity] || 'gray') as never}>{log.severity}</Badge>
              <Button size="sm" variant="danger" onPress={() => deleteMutation.mutate(log._id)}>Eliminar</Button>
            </View>
          </View>
        </Card>
      ))}
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
  action: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  entity: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: 2 },
  detail: { color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 4 },
  meta: { color: colors.textMuted, fontSize: typography.sizes.xs, marginTop: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  chipTextSelected: { color: '#fff' },
})
