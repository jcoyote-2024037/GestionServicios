import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoadingAuth, user, checkAuth } = useAuth()
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(user?.role)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}
