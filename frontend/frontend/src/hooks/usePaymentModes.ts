import { useQuery } from '@tanstack/react-query'
import { paymentModesApi } from '@/api/paymentModes'

export function usePaymentModes() {
  return useQuery({ queryKey: ['payment-modes'], queryFn: paymentModesApi.getAll, staleTime: 1000 * 60 * 30 })
}
