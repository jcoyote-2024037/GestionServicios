import React, { useState, useCallback, useRef } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { colors, radii, typography, shadows } from '../../theme'

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
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Text style={styles.clearBtn} onPress={() => { setValue(''); onSearch('') }}>
          ✕
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    ...shadows.sm,
  },
  searchIcon: { fontSize: 14, marginRight: 8, opacity: 0.5 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    paddingVertical: 13,
  },
  clearBtn: { color: colors.textMuted, fontSize: 14, padding: 4, marginLeft: 4 },
})
