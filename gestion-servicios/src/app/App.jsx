import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './router/AppRoutes'
import { useAuthStore } from '../features/auth/store/authStore'

export const App = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '0.875rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: 'var(--success)', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: 'var(--error)', secondary: '#fff' }
          }
        }}
      />
      <AppRoutes />
    </>
  )
}
