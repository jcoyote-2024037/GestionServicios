import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, typography, radii } from '../../theme'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={[styles.navBtn, currentPage === 1 && styles.disabled]}
      >
        <Text style={[styles.navText, currentPage === 1 && styles.disabledText]}>← Anterior</Text>
      </TouchableOpacity>

      <View style={styles.pagesRow}>
        {start > 1 && (
          <>
            <TouchableOpacity onPress={() => onPageChange(1)} style={styles.pageBtn}>
              <Text style={styles.pageText}>1</Text>
            </TouchableOpacity>
            {start > 2 && <Text style={styles.ellipsis}>···</Text>}
          </>
        )}

        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            onPress={() => onPageChange(page)}
            style={[styles.pageBtn, page === currentPage && styles.activePage]}
          >
            <Text style={[styles.pageText, page === currentPage && styles.activeText]}>{page}</Text>
          </TouchableOpacity>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <Text style={styles.ellipsis}>···</Text>}
            <TouchableOpacity onPress={() => onPageChange(totalPages)} style={styles.pageBtn}>
              <Text style={styles.pageText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={[styles.navBtn, currentPage === totalPages && styles.disabled]}
      >
        <Text style={[styles.navText, currentPage === totalPages && styles.disabledText]}>Siguiente →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 20,
  },
  navBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  disabled: { opacity: 0.3 },
  navText: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  disabledText: { color: colors.textMuted },
  pagesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pageBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  pageText: { color: colors.textSecondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  activePage: { backgroundColor: `${colors.brand}25`, borderWidth: 1, borderColor: `${colors.brand}40` },
  activeText: { color: colors.brand, fontWeight: typography.weights.semibold },
  ellipsis: { color: colors.textMuted, fontSize: typography.sizes.sm, paddingHorizontal: 2 },
})
