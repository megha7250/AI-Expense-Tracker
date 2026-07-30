import { apiClient } from './client'
import type { PaymentModeResponseDto } from '@/types/api'

export const paymentModesApi = {
  getAll: () => apiClient.get<PaymentModeResponseDto[]>('/api/payment-modes').then((r) => r.data),
}
