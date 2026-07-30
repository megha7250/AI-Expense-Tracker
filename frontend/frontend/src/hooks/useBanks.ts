import { useQuery } from '@tanstack/react-query'
import { banksApi } from '@/api/banks'

export function useBanks() {
  return useQuery({ queryKey: ['banks'], queryFn: banksApi.getAll, staleTime: 1000 * 60 * 30 })
}
