import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'

export function useDailyCashFlow(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'cashflow-daily', startDate, endDate],
    queryFn: () => analyticsApi.getDailyCashFlow(startDate, endDate),
  })
}

export function useMonthlyCashFlow(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'cashflow-monthly', startDate, endDate],
    queryFn: () => analyticsApi.getMonthlyCashFlow(startDate, endDate),
  })
}

export function useCategoryDistribution(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'category-distribution', startDate, endDate],
    queryFn: () => analyticsApi.getCategoryDistribution(startDate, endDate),
  })
}

export function useAiInsights() {
  return useQuery({ queryKey: ['analytics', 'insights'], queryFn: analyticsApi.getInsights })
}
