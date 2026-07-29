import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, radii } from '../../theme'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon || (
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📭</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    gap: 10,
  },
  iconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  iconText: { fontSize: 32 },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.sizes.base,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  action: { marginTop: 10 },
})
