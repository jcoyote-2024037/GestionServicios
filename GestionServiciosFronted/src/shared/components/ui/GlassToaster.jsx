import { Toaster } from 'react-hot-toast'

export const GlassToaster = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3500,
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        fontSize: '0.875rem',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06) inset',
        padding: '14px 18px',
        background: 'rgba(17, 25, 40, 0.92)',
        color: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      },
      success: {
        iconTheme: { primary: '#10B981', secondary: '#fff' },
        style: { borderColor: 'rgba(16,185,129,0.2)' },
      },
      error: {
        iconTheme: { primary: '#EF4444', secondary: '#fff' },
        style: { borderColor: 'rgba(239,68,68,0.2)' },
      },
    }}
  />
)
