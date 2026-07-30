import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userConfigApi } from '@/api/userConfig'
import type { UserConfigDto } from '@/types/api'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/api/client'

export function useUserConfig() {
  return useQuery({ queryKey: ['user-config'], queryFn: userConfigApi.get })
}

export function useUpdateUserConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<UserConfigDto>) => userConfigApi.update(payload),
    onSuccess: () => {
      toast.success('Preferences saved')
      qc.invalidateQueries({ queryKey: ['user-config'] })
    },
    onError: (err) => toast.error('Couldn\u2019t save preferences', { description: extractErrorMessage(err) }),
  })
}
