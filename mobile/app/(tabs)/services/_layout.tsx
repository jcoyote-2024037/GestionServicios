import React from 'react'
import { Stack } from 'expo-router'
import { colors } from '../../../src/theme'

export default function ServicesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="[id]/edit" />
    </Stack>
  )
}
