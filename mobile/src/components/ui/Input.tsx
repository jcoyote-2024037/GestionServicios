import React, { useState } from 'react'
import { View, TextInput as RNTextInput, Text, StyleSheet, TextInputProps } from 'react-native'
import { colors, radii, typography } from '../../theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export function Input({ label, error, leftIcon, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, focused && styles.focused, error && styles.errorBorder]}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <RNTextInput
          style={[styles.input, leftIcon ? styles.inputWithIcon : null, style].filter(Boolean)}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  focused: {
    borderColor: colors.brand,
  },
  errorBorder: {
    borderColor: colors.red,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    paddingVertical: 14,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  error: {
    color: colors.red,
    fontSize: typography.sizes.xs,
  },
})
