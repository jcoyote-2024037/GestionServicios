import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { colors } from '../../theme'

interface SpinnerProps {
  size?: 'small' | 'large'
  color?: string
  fullScreen?: boolean
}

export function Spinner({ size = 'large', color = colors.brand, fullScreen = false }: SpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    )
  }
  return <ActivityIndicator size={size} color={color} />
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
})
