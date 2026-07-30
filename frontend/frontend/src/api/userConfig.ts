import { apiClient } from './client'
import type { UserConfigDto } from '@/types/api'

export const userConfigApi = {
  get: () => apiClient.get<UserConfigDto>('/api/user/config').then((r) => r.data),
  update: (payload: Partial<UserConfigDto>) => apiClient.patch<UserConfigDto>('/api/user/config', payload).then((r) => r.data),
}
