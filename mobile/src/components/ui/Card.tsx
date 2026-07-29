import React from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { colors, radii } from '../../theme'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  hover?: boolean
}

export function Card({ children, onPress, style, hover = false }: CardProps) {
  const cardStyle = [styles.card, hover && styles.hover, style].filter(Boolean) as ViewStyle[]

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    )
  }

  return <View style={cardStyle}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  hover: {
    // shadow effect
  },
})
