import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native'
import { colors, radii, typography } from '../../theme'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: ViewStyle
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  const containerStyle: ViewStyle[] = [styles.base, styles[`size_${size}`], styles[`variant_${variant}`], isDisabled && styles.disabled, style as ViewStyle].filter(Boolean) as ViewStyle[]

  const textStyle: TextStyle[] = [styles.text, styles[`text_${size}`], styles[`text_${variant}`], isDisabled && styles.textDisabled].filter(Boolean) as TextStyle[]

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : colors.textPrimary} />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    gap: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  variant_primary: {
    backgroundColor: colors.brand,
  },
  variant_secondary: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: colors.redBg,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
  },
  variant_success: {
    backgroundColor: colors.greenBg,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  variant_warning: {
    backgroundColor: colors.orangeBg,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.2)',
  },
  variant_info: {
    backgroundColor: colors.blueBg,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.2)',
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
  text_sm: {
    fontSize: typography.sizes.sm,
  },
  text_md: {
    fontSize: typography.sizes.base,
  },
  text_lg: {
    fontSize: typography.sizes.md,
  },
  text_primary: {
    color: '#fff',
  },
  text_secondary: {
    color: colors.textPrimary,
  },
  text_ghost: {
    color: colors.textSecondary,
  },
  text_danger: {
    color: colors.red,
  },
  text_success: {
    color: colors.green,
  },
  text_warning: {
    color: colors.orange,
  },
  text_info: {
    color: colors.blue,
  },
  textDisabled: {
    opacity: 0.6,
  },
})
