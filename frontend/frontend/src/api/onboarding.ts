import { apiClient } from './client'
import type { OnboardingRequestDto } from '@/types/api'

export const onboardingApi = {
  onboard: (payload: OnboardingRequestDto) => apiClient.post<void>('/api/onboarding', payload).then((r) => r.data),
}
