// ============================================================================
// Types mirrored 1:1 from backend DTOs (com.example.et_core.dto / model).
// DO NOT invent fields that aren't in the backend source.
// ============================================================================

// ---- Enums (backend model enums) ----
export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER'
export type TransactionBehavior = 'ASSET' | 'LIABILITY' // PaymentMode.type
export type CardType = 'CREDIT_CARD' | 'DEBIT_CARD'
export type LanguagePreference = 'ENGLISH' | 'HINDI'
export type AiTaskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type InsightType = 'WEEKLY' | 'MONTHLY'

// ---- Auth ----
export interface RegisterRequest {
  name: string
  email: string
  password: string
}
export interface LoginRequest {
  email: string
  password: string
}
export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  onboarded: boolean
}

// ---- Onboarding ----
export interface OnboardingRequestDto {
  bankId: number
  lastFourDigits: string
  bankBalance: number
  cardType?: CardType | null
  cardLastFourDigits?: string | null
  cardLimit?: number | null
  cashBalance?: number | null
  defaultPaymentModeId: number
  languagePreference?: LanguagePreference | null
}

// ---- User config (Settings > Preferences) ----
export interface UserConfigDto {
  language: string // "English" | "Hindi" (mapped by backend, not the enum)
  defaultPaymentModeId: number | null
}

// ---- Accounts (read-only) ----
export interface AccountDto {
  id: string
  bankName: string
  lastFour: string
  type: 'Savings' | 'Cash' | 'Credit' | string
  amount: number
}

// ---- Banks (read-only, seeded) ----
export interface Bank {
  id: number
  name: string
}

// ---- Payment modes (read-only, seeded) ----
export interface PaymentModeResponseDto {
  id: number
  name: string
  type: TransactionBehavior
}

// ---- Categories (read-only: system + user, no CUD endpoints exist) ----
export interface CategoryDto {
  id: number // negative id => user-defined category, positive => system category
  name: string
  isSystem: boolean
}

// ---- Transactions ----
export interface TransactionDto {
  transactionId: string
  type: string // EXPENSE | INCOME | TRANSFER
  description: string | null
  amount: number // SIGNED by backend: negative for expense/transfer-out
  transactionDate: string // ISO yyyy-MM-dd as serialized by backend
  transferId: string | null
  category: CategoryDto | null
}

export interface TransactionRequestDto {
  transactionId?: number | null // present only for updates
  type: TransactionType
  description: string
  amount: number // always POSITIVE magnitude when sending to backend
  transactionDate: string // "dd-MM-yyyy" per backend mapper
  paymentModeId: number
  accountId: number
  categoryId?: number | null
  toAccountId?: number | null // required when type === TRANSFER
  transferId?: string | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number // current page (0-indexed)
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  types?: TransactionType[]
  categoryIds?: number[]
  accountIds?: number[]
  paymentModeIds?: number[]
  search?: string
  page?: number
  size?: number
  sort?: string
}

// ---- AI Assistant ----
export interface AiInputDto {
  rawText: string
}
export interface AiTaskDto {
  id: string
  message: string
}
export interface AiActiveTaskDto {
  jobId: string
  status: AiTaskStatus
}

// ---- Analytics ----
export interface DailyCashFlowProjection {
  transactionDate: string
  income: number
  expense: number
}
export interface MonthlyCashFlowProjection {
  year: number
  month: number
  income: number
  expense: number
}
export interface CategoryDistributionDto {
  label: string
  amount: number
  limit: number
}
export interface AiInsightResponseDto {
  id: number
  type: string // WEEKLY | MONTHLY
  insightText: string
  createdAt: number
  status: string
}

// ---- Generic error shape used by CustomAuthEntryPoint (401 only) ----
export interface ApiErrorResponse {
  status: number
  message: string
  timestamp: string
}
