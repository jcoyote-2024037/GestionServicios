import React from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth()

  if (isLoadingAuth) {
    return <Spinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Redirect href="/(tabs)" />
  }

  return <>{children}</>
}
