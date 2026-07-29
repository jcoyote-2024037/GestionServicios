import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radii, typography } from '../../theme'

interface BadgeProps {
  children: React.ReactNode
  color?: 'purple' | 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'pink'
  outline?: boolean
  size?: 'sm' | 'md'
}

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  purple: { bg: 'rgba(167,139,250,0.15)', text: '#c4b5fd', border: 'rgba(167,139,250,0.25)', glow: 'rgba(167,139,250,0.08)' },
  green: { bg: 'rgba(74,222,128,0.15)', text: '#86efac', border: 'rgba(74,222,128,0.25)', glow: 'rgba(74,222,128,0.08)' },
  red: { bg: 'rgba(248,113,113,0.15)', text: '#fca5a5', border: 'rgba(248,113,113,0.25)', glow: 'rgba(248,113,113,0.08)' },
  yellow: { bg: 'rgba(251,191,36,0.15)', text: '#fde68a', border: 'rgba(251,191,36,0.25)', glow: 'rgba(251,191,36,0.08)' },
  blue: { bg: 'rgba(96,165,250,0.15)', text: '#93c5fd', border: 'rgba(96,165,250,0.25)', glow: 'rgba(96,165,250,0.08)' },
  gray: { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', border: 'rgba(107,114,128,0.25)', glow: 'rgba(107,114,128,0.08)' },
  orange: { bg: 'rgba(251,146,60,0.15)', text: '#fdba74', border: 'rgba(251,146,60,0.25)', glow: 'rgba(251,146,60,0.08)' },
  pink: { bg: 'rgba(244,114,182,0.15)', text: '#f9a8d4', border: 'rgba(244,114,182,0.25)', glow: 'rgba(244,114,182,0.08)' },
}

export function Badge({ children, color = 'purple', outline = false, size = 'sm' }: BadgeProps) {
  const c = colorMap[color] || colorMap.purple

  return (
    <View style={[
      styles.badge,
      styles[`size_${size}`],
      {
        backgroundColor: outline ? 'transparent' : c.bg,
        borderColor: outline ? c.border : 'transparent',
      },
      !outline && { shadowColor: c.glow.replace('0.08', '0.15'), shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
    ]}>
      <Text style={[styles.text, styles[`text_${size}`], { color: c.text }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  size_sm: { paddingHorizontal: 10, paddingVertical: 3 },
  size_md: { paddingHorizontal: 14, paddingVertical: 5 },
  text: { fontWeight: typography.weights.semibold },
  text_sm: { fontSize: typography.sizes.xs, letterSpacing: 0.3 },
  text_md: { fontSize: typography.sizes.sm, letterSpacing: 0.3 },
})
