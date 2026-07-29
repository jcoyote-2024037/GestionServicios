import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { QueryProvider } from '../src/providers/QueryProvider'
import { AuthProvider } from '../src/providers/AuthProvider'
import { ToastProvider } from '../src/components/ui/Toast'
import { ChatWidget } from '../src/components/ui/ChatWidget'
import { useAuth } from '../src/hooks/useAuth'
import { colors } from '../src/theme'

SplashScreen.preventAutoHideAsync()

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return (
    <View style={styles.root}>
      {children}
      {!!user && <ChatWidget />}
    </View>
  )
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <LayoutContent>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.surface },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </LayoutContent>
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
})
