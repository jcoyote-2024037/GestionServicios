import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Spinner } from './Spinner'
import { EmptyState } from './EmptyState'
import { Pagination } from './Pagination'
import { colors, typography } from '../../theme'

interface Column<T> {
  key: string
  label: string
  width?: number
  render?: (value: unknown, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns, data = [], loading = false, currentPage = 1,
  totalPages = 1, onPageChange, onRowClick,
  emptyTitle = 'No hay datos', emptyDescription = 'No se encontraron registros',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <View style={styles.center}><Spinner /></View>
    )
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <View
                key={col.key}
                style={[styles.headerCell, col.width ? { width: col.width } : { minWidth: 120 }]}
              >
                <Text style={styles.headerText}>{col.label}</Text>
              </View>
            ))}
          </View>
          {data.map((row, idx) => (
            <TouchableOpacity
              key={row._id || row.id || idx}
              onPress={() => onRowClick?.(row)}
              style={[styles.row, idx % 2 === 1 && styles.rowAlt]}
              disabled={!onRowClick}
            >
              {columns.map((col) => (
                <View key={col.key} style={[styles.cell, col.width ? { width: col.width } : { minWidth: 120 }]}>
                  {col.render
                    ? col.render((row as Record<string, unknown>)[col.key], row)
                    : <Text style={styles.cellText}>{(row as Record<string, unknown>)[col.key] as string}</Text>
                  }
                </View>
              ))}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {onPageChange && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { padding: 40, alignItems: 'center' },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 4 },
  headerCell: { paddingHorizontal: 12, paddingVertical: 8 },
  headerText: { color: colors.textMuted, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  cell: { paddingHorizontal: 12, paddingVertical: 10 },
  cellText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
})
