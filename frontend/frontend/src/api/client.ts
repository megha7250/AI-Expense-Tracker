import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const { accessToken, tokenType } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `${tokenType || 'Bearer'} ${accessToken}`
  }
  return config
})

let hasNotifiedExpiry = false

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const isAuthRoute = error.config?.url?.includes('/api/auth/')

    if (status === 401 && !isAuthRoute) {
      // Backend issues short-lived access tokens with no refresh endpoint.
      // A 401 here means the session has genuinely expired or the token is invalid.
      const { logout } = useAuthStore.getState()
      logout()
      if (!hasNotifiedExpiry) {
        hasNotifiedExpiry = true
        toast.error('Your session has expired', {
          description: 'Please sign in again to continue.',
        })
        setTimeout(() => {
          hasNotifiedExpiry = false
        }, 3000)
      }
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?expired=1')
      }
    }

    return Promise.reject(error)
  }
)

/** Extracts a human-readable message from backend error responses.
 *  Most exceptions return a raw string body; auth errors return ApiResponse JSON. */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object' && 'message' in data && typeof (data as any).message === 'string') {
      return (data as any).message
    }
    if (error.message) return error.message
  }
  return fallback
}
