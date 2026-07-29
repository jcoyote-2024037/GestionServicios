import { AppRoutes } from './router/AppRoutes'
import { ChatWidget } from '../features/chat/components/ChatWidget'
import { GlassToaster } from '../shared/components/ui/GlassToaster'

export const App = () => (
  <>
    <GlassToaster />
    <AppRoutes />
    <ChatWidget />
  </>
)
