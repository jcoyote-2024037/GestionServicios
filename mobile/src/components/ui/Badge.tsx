import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radii, typography } from '../../theme'

interface BadgeProps {
  children: React.ReactNode
  color?: 'purple' | 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'pink'
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  purple: { bg: 'rgba(167,139,250,0.2)', text: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
  green: { bg: 'rgba(74,222,128,0.2)', text: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  red: { bg: 'rgba(248,113,113,0.2)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
  yellow: { bg: 'rgba(251,191,36,0.2)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  blue: { bg: 'rgba(96,165,250,0.2)', text: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  gray: { bg: 'rgba(107,114,128,0.2)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
  orange: { bg: 'rgba(251,146,60,0.2)', text: '#fb923c', border: 'rgba(251,146,60,0.3)' },
  pink: { bg: 'rgba(244,114,182,0.2)', text: '#f472b6', border: 'rgba(244,114,182,0.3)' },
}

export function Badge({ children, color = 'purple' }: BadgeProps) {
  const c = colorMap[color] || colorMap.purple

  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.text, { color: c.text }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
})
