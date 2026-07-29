import React from 'react'
import { Stack } from 'expo-router'
import { colors } from '../../src/theme'
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute'

export default function AdminLayout() {
  return (
    <ProtectedRoute requiredRole="ADMIN_ROLE">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="locations" />
        <Stack.Screen name="users" />
        <Stack.Screen name="badges" />
        <Stack.Screen name="tags" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="logs" />
        <Stack.Screen name="services" />
      </Stack>
    </ProtectedRoute>
  )
}
