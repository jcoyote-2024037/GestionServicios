import React from 'react'
import { Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../src/theme'
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute'

const iconMap: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  index: { focused: 'home', unfocused: 'home-outline' },
  services: { focused: 'grid', unfocused: 'grid-outline' },
  solicitudes: { focused: 'document-text', unfocused: 'document-text-outline' },
  'favorites/index': { focused: 'heart', unfocused: 'heart-outline' },
  'profile/index': { focused: 'person', unfocused: 'person-outline' },
}

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = iconMap[route.name]
            if (!icons) return null
            return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />
          },
          tabBarStyle: {
            backgroundColor: 'rgba(12,12,20,0.92)',
            borderTopColor: 'rgba(255,255,255,0.06)',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingTop: 6,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          },
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
          tabBarItemStyle: { gap: 2 },
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarLabel: 'Inicio' }} />
        <Tabs.Screen name="services" options={{ title: 'Servicios', tabBarLabel: 'Servicios' }} />
        <Tabs.Screen name="solicitudes" options={{ title: 'Solicitudes', tabBarLabel: 'Solicitudes' }} />
        <Tabs.Screen name="favorites/index" options={{ title: 'Favoritos', tabBarLabel: 'Favoritos' }} />
        <Tabs.Screen name="profile/index" options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
      </Tabs>
    </ProtectedRoute>
  )
}
