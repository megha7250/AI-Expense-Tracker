import { apiClient } from './client'
import type {
  AiInsightResponseDto,
  CategoryDistributionDto,
  DailyCashFlowProjection,
  MonthlyCashFlowProjection,
} from '@/types/api'

export const analyticsApi = {
  getDailyCashFlow: (startDate: string, endDate: string) =>
    apiClient
      .get<DailyCashFlowProjection[]>(`/api/analytics/cashflow/daily?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.data),

  getMonthlyCashFlow: (startDate: string, endDate: string) =>
    apiClient
      .get<MonthlyCashFlowProjection[]>(`/api/analytics/cashflow/monthly?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.data),

  getInsights: () => apiClient.get<AiInsightResponseDto[]>('/api/analytics/insights').then((r) => r.data),

  getCategoryDistribution: (startDate: string, endDate: string) =>
    apiClient
      .get<CategoryDistributionDto[]>(`/api/analytics/category-distribution?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.data),
}
