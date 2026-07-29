import { useAuthContext } from '../providers/AuthProvider'

export function useAuth() {
  const auth = useAuthContext()
  return {
    ...auth,
    isAdmin: auth.user?.role === 'ADMIN_ROLE',
    isUser: auth.user?.role === 'USER_ROLE',
  }
}
