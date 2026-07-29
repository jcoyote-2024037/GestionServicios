import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors } from '../../theme'

interface StarProps {
  filled: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizeMap = { xs: 12, sm: 16, md: 20, lg: 24 }

function StarIcon({ filled, size = 'sm' }: StarProps) {
  const s = sizeMap[size] || sizeMap.sm
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? colors.accent : 'none'}>
      <Path
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        stroke={filled ? colors.accent : 'rgba(255,255,255,0.2)'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export { StarIcon }

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export function StarRating({ value = 0, onChange, size = 'md', readonly = false }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity
          key={s}
          onPress={() => onChange?.(s)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.6}
        >
          <StarIcon filled={s <= value} size={size} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2, alignItems: 'center' },
})
