import { apiClient } from './client'
import type { AccountDto } from '@/types/api'

// NOTE: Backend only exposes GET /api/accounts. There is no create/edit/delete
// endpoint — accounts are created exclusively during onboarding.
export const accountsApi = {
  getAll: () => apiClient.get<AccountDto[]>('/api/accounts').then((r) => r.data),
}
