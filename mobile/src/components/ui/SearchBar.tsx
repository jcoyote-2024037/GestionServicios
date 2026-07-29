import React, { useState, useCallback, useRef } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { colors, radii, typography } from '../../theme'

interface SearchBarProps {
  onSearch: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchBar({ onSearch, placeholder = 'Buscar...', debounceMs = 300 }: SearchBarProps) {
  const [value, setValue] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (text: string) => {
      setValue(text)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        onSearch(text)
      }, debounceMs)
    },
    [onSearch, debounceMs]
  )

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    paddingVertical: 12,
  },
})
