import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './router/AppRoutes'
import { ChatWidget } from '../features/chat/components/ChatWidget'

export const App = () => (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 500,
          fontSize: '0.875rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: '12px 16px',
          background: 'rgba(17, 25, 40, 0.95)',
          color: 'white',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#fff' }
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#fff' }
        }
      }}
    />
    <AppRoutes />
    <ChatWidget />
  </>
)
