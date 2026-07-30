import { apiClient } from './client'
import type { PageResponse, TransactionDto, TransactionFilters, TransactionRequestDto } from '@/types/api'

function buildParams(filters: TransactionFilters) {
  const params = new URLSearchParams()
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.minAmount != null) params.append('minAmount', String(filters.minAmount))
  if (filters.maxAmount != null) params.append('maxAmount', String(filters.maxAmount))
  filters.types?.forEach((t) => params.append('types', t))
  filters.categoryIds?.forEach((id) => params.append('categoryIds', String(id)))
  filters.accountIds?.forEach((id) => params.append('accountIds', String(id)))
  filters.paymentModeIds?.forEach((id) => params.append('paymentModeIds', String(id)))
  if (filters.search) params.append('search', filters.search)
  params.append('page', String(filters.page ?? 0))
  params.append('size', String(filters.size ?? 10))
  if (filters.sort) params.append('sort', filters.sort)
  return params
}

export const transactionsApi = {
  getAll: (filters: TransactionFilters) =>
    apiClient.get<PageResponse<TransactionDto>>(`/api/transactions?${buildParams(filters).toString()}`).then((r) => r.data),

  getRecent: () => apiClient.get<TransactionDto[]>('/api/transactions/recent').then((r) => r.data),

  create: (payload: TransactionRequestDto) =>
    apiClient.post<TransactionDto>('/api/transactions', payload).then((r) => r.data),

  update: (payload: TransactionRequestDto) =>
    apiClient.patch<TransactionDto>('/api/transactions', payload).then((r) => r.data),

  remove: (transactionId: string | number) =>
    apiClient.delete<void>(`/api/transactions/${transactionId}`).then((r) => r.data),
}
