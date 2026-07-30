import { apiClient } from './client'
import type { Bank } from '@/types/api'

export const banksApi = {
  getAll: () => apiClient.get<Bank[]>('/api/banks').then((r) => r.data),
}
