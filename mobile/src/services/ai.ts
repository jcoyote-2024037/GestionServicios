import { api } from '../lib/api'

export const aiService = {
  chat: (message: string) =>
    api.post<{ mensaje_ia?: string; response?: string; message?: string }>('/ai/chat', { message }),
}
