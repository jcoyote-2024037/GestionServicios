import api from '../api'

export const chatService = {
  init: (solicitudId) => api.post(`/chat/init/${solicitudId}`),
  sendMessage: (roomId, text) => api.post(`/chat/${roomId}/message`, { text }),
  getMessages: (roomId, params) => api.get(`/chat/${roomId}/messages`, { params }),
  getMyChats: () => api.get('/chat'),
}
