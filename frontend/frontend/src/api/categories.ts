import { apiClient } from './client'
import type { CategoryDto } from '@/types/api'

// NOTE: Backend only exposes GET /api/categories (system + user categories combined).
// There are no POST/PATCH/DELETE endpoints for categories in this backend version.
export const categoriesApi = {
  getAll: () => apiClient.get<CategoryDto[]>('/api/categories').then((r) => r.data),
}
