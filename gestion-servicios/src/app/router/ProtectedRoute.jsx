import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store/authStore'
import { Spinner } from '../../shared/components/ui/Spinner'

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoadingAuth, user } = useAuthStore()

  if (isLoadingAuth) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN_ROLE') return <Navigate to="/" replace />

  return children
}
