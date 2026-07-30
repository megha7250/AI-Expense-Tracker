import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api'

export const authApi = {
  login: (payload: LoginRequest) => apiClient.post<AuthResponse>('/api/auth/login', payload).then((r) => r.data),
  register: (payload: RegisterRequest) => apiClient.post<AuthResponse>('/api/auth/register', payload).then((r) => r.data),
}
