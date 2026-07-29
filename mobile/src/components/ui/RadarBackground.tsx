import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Dimensions, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

interface RadarBackgroundProps {
  children: React.ReactNode
}

function RadarBackground({ children }: RadarBackgroundProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    )
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    )
    pulse.start()
    rotate.start()
    return () => { pulse.stop(); rotate.stop() }
  }, [])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  })

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.3],
  })

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#09090b', '#0a0a1a']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.scanLine,
          { transform: [{ rotate: spin }] },
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
        ]}
      />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, height },
  scanLine: {
    position: 'absolute', top: 0, left: width / 2 - 1, width: 2, height,
    backgroundColor: 'rgba(244,63,94,0.06)',
  },
  pulse: {
    position: 'absolute', top: height / 2 - 100, left: width / 2 - 100,
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)',
  },
})

export default RadarBackground
