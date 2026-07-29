import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'auth-token'
const USER_KEY = 'auth-user'

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY)
    } catch {
      return null
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  },

  async getUser(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(USER_KEY)
    } catch {
      return null
    }
  },

  async setUser(user: string): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, user)
  },

  async removeUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY)
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_KEY)
  },
}

export function decodeToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function extractUser(payload: Record<string, unknown> | null) {
  if (!payload) return null
  return {
    id: payload.sub as string,
    role: payload.role as string,
    name: (payload.name as string) || '',
    surname: (payload.surname as string) || '',
    username: (payload.username as string) || '',
    email: (payload.email as string) || '',
  }
}
