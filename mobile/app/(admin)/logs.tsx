import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { adminService } from '../../src/services/admin'
import { Card } from '../../src/components/ui/Card'
import { Badge } from '../../src/components/ui/Badge'
import { Spinner } from '../../src/components/ui/Spinner'
import { EmptyState } from '../../src/components/ui/EmptyState'
import { colors, typography, radii } from '../../src/theme'

const SEVERITY_STYLES: Record<string, 'gray' | 'yellow' | 'orange' | 'red'> = { LOW: 'gray', MEDIUM: 'yellow', HIGH: 'orange', CRITICAL: 'red' }

export default function AdminLogsScreen() {
  const queryClient = useQueryClient()
  const [severity, setSeverity] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['logs', severity], queryFn: () => adminService.getLogs({ page: 1, limit: 50, severity: severity || undefined }) })
  const logs = ((data as any)?.data?.data || (data as any)?.data?.logs || []) as Array<{ _id: string; action: string; affectedEntity: string; detail: string; severity: string; ipAddress: string; createdAt: string }>

  const severities = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteLog(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['logs'] }) },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Logs', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.textPrimary }} />
      <LinearGradient colors={['rgba(251,191,36,0.06)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {severities.map((s) => (
          <TouchableOpacity key={s} style={[styles.filterChip, severity === s && styles.filterActive]} onPress={() => setSeverity(s)}>
            <Text style={[styles.filterText, severity === s && styles.filterTextActive]}>{s || 'Todas'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? <Spinner /> : logs.length === 0 ? (
        <EmptyState title="Sin logs" description="No hay registros de auditoría" />
      ) : (
        <View style={styles.list}>
          {logs.map((log) => (
            <Card key={log._id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Badge color={SEVERITY_STYLES[log.severity] || 'gray'}>{log.severity}</Badge>
                <Text style={styles.logDate}>{new Date(log.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={styles.logAction}>{log.action}</Text>
              <Text style={styles.logDetail}>{log.detail}</Text>
              <Text style={styles.logMeta}>Entidad: {log.affectedEntity} • IP: {log.ipAddress}</Text>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  filterRow: { maxHeight: 40 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  filterActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  filterTextActive: { color: '#fff' },
  list: { gap: 10 },
  logCard: { padding: 14 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logDate: { color: colors.textMuted, fontSize: typography.sizes.xs },
  logAction: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, marginBottom: 4 },
  logDetail: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: 6 },
  logMeta: { color: colors.textMuted, fontSize: typography.sizes.xs },
})
