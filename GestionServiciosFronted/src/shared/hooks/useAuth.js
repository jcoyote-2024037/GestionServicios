import { useAuthStore } from '../../features/auth/store/authStore'

export const useAuth = () => {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const checkAuth = useAuthStore((s) => s.checkAuth)

  const isAdmin = user?.role === 'ADMIN_ROLE'
  const isDueno = user?.role === 'DUENO_ROLE'
  const isUser = user?.role === 'USER_ROLE'

  return {
    user,
    token,
    isAuthenticated,
    isLoadingAuth,
    isAdmin,
    isDueno,
    isUser,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  }
}
