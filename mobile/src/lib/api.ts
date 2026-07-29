import axios from 'axios'
import { tokenStorage, decodeToken, extractUser } from '../utils/token'
import { API_BASE_URL } from '../constants'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await tokenStorage.clear()
    }
    return Promise.reject(err)
  }
)

export async function checkStoredAuth() {
  const token = await tokenStorage.getToken()
  if (!token) return null

  const payload = decodeToken(token)
  if (!payload) {
    await tokenStorage.clear()
    return null
  }

  const expMs = payload.exp * 1000
  if (Date.now() >= expMs) {
    await tokenStorage.clear()
    return null
  }

  return { user: extractUser(payload), token }
}
