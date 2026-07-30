import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '@/api/transactions'
import type { TransactionFilters, TransactionRequestDto } from '@/types/api'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/api/client'

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
    placeholderData: (prev) => prev,
  })
}

export function useRecentTransactions() {
  return useQuery({ queryKey: ['transactions', 'recent'], queryFn: transactionsApi.getRecent })
}

function useInvalidateTransactions() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['transactions'] })
    qc.invalidateQueries({ queryKey: ['accounts'] })
    qc.invalidateQueries({ queryKey: ['analytics'] })
  }
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: (payload: TransactionRequestDto) => transactionsApi.create(payload),
    onSuccess: () => {
      toast.success('Transaction added')
      invalidate()
    },
    onError: (err) => toast.error('Couldn\u2019t add transaction', { description: extractErrorMessage(err) }),
  })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: (payload: TransactionRequestDto) => transactionsApi.update(payload),
    onSuccess: () => {
      toast.success('Transaction updated')
      invalidate()
    },
    onError: (err) => toast.error('Couldn\u2019t update transaction', { description: extractErrorMessage(err) }),
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions()
  return useMutation({
    mutationFn: (id: string | number) => transactionsApi.remove(id),
    onSuccess: () => {
      toast.success('Transaction deleted')
      invalidate()
    },
    onError: (err) => toast.error('Couldn\u2019t delete transaction', { description: extractErrorMessage(err) }),
  })
}
