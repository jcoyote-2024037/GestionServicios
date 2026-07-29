import React from 'react'
import { Tabs } from 'expo-router'
import { colors } from '../../src/theme'
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute'

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surfaceOverlay,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarLabel: 'Inicio',
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: 'Servicios',
            tabBarLabel: 'Servicios',
          }}
        />
        <Tabs.Screen
          name="solicitudes"
          options={{
            title: 'Solicitudes',
            tabBarLabel: 'Solicitudes',
          }}
        />
        <Tabs.Screen
          name="favorites/index"
          options={{
            title: 'Favoritos',
            tabBarLabel: 'Favoritos',
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarLabel: 'Admin',
            href: null,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  )
}
