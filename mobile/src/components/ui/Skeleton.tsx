import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { colors, radii } from '../../theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: object
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radii.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3))

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, opacity: opacity.current },
        style,
      ]}
    />
  )
}

export function ServiceCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={20} width="60%" />
      <View style={{ height: 8 }} />
      <Skeleton height={14} width="100%" />
      <View style={{ height: 4 }} />
      <Skeleton height={14} width="80%" />
      <View style={{ height: 16 }} />
      <View style={styles.row}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={40} height={24} borderRadius={12} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
})
