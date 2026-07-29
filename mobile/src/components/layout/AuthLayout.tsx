import React from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import RadarBackground from '../ui/RadarBackground'
import { colors, typography } from '../../theme'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  icon?: React.ReactNode
}

export function AuthLayout({ children, title, subtitle, icon }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <RadarBackground>
        <View style={styles.centered}>
          <View style={styles.card}>
            <View style={styles.header}>
              {icon && <View style={styles.iconBox}>{icon}</View>}
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {children}
          </View>
        </View>
      </RadarBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 20, zIndex: 10,
  },
  card: {
    width: '100%', maxWidth: 420,
    backgroundColor: colors.surfaceRaised, borderRadius: 24, borderWidth: 1,
    borderColor: colors.border, padding: 36, gap: 20,
  },
  header: { alignItems: 'center', gap: 8, marginBottom: 16 },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: `${colors.brand}20`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  title: {
    color: colors.textPrimary, fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold, textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary, fontSize: typography.sizes.base,
    textAlign: 'center', lineHeight: 22,
  },
})
