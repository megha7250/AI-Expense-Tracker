import { apiClient } from './client'
import type { AiActiveTaskDto, AiInputDto, AiTaskDto } from '@/types/api'

export const aiApi = {
  submitRawText: (payload: AiInputDto) => apiClient.post<AiTaskDto>('/api/ai-input', payload).then((r) => r.data),
  getActiveTasks: () => apiClient.get<AiActiveTaskDto[]>('/api/ai-input/active').then((r) => r.data),
}
