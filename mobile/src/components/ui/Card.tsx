import React from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { colors, radii, shadows } from '../../theme'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  glowColor?: string
  variant?: 'default' | 'glass' | 'elevated'
}

export function Card({ children, onPress, style, glowColor, variant = 'default' }: CardProps) {
  const cardStyle = [styles.base, styles[variant], glowColor && { borderColor: glowColor.replace(')', ',0.2)').replace('rgb', 'rgba') }, style].filter(Boolean) as ViewStyle[]

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    )
  }

  return <View style={cardStyle}>{children}</View>
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderRadius: radii.xl,
  },
  default: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  elevated: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...shadows.lg,
  },
})
