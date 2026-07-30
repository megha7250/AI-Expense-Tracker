import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type RegisterFormValues = z.infer<typeof registerSchema>

export const onboardingSchema = z.object({
  bankId: z.coerce.number({ invalid_type_error: 'Select a bank' }).min(1, 'Select a bank'),
  lastFourDigits: z.string().min(4, 'Enter last 4 digits').max(4, 'Enter last 4 digits'),
  bankBalance: z.coerce.number().min(0, 'Balance cannot be negative'),
  hasCard: z.boolean(),
  cardType: z.enum(['CREDIT_CARD', 'DEBIT_CARD']).optional(),
  cardLastFourDigits: z.string().max(4).optional(),
  cardLimit: z.coerce.number().optional(),
  cashBalance: z.coerce.number().min(0, 'Balance cannot be negative'),
  defaultPaymentModeId: z.coerce.number({ invalid_type_error: 'Select a default payment mode' }).min(1, 'Select a default payment mode'),
  languagePreference: z.enum(['ENGLISH', 'HINDI']),
})
export type OnboardingFormValues = z.infer<typeof onboardingSchema>

export const transactionSchema = z
  .object({
    transactionId: z.number().nullable().optional(),
    type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
    description: z.string().min(1, 'Add a short description'),
    amount: z.coerce.number({ invalid_type_error: 'Enter an amount' }).positive('Amount must be greater than 0'),
    transactionDate: z.string().min(1, 'Pick a date'),
    paymentModeId: z.coerce.number({ invalid_type_error: 'Select a payment mode' }).min(1, 'Select a payment mode'),
    accountId: z.coerce.number({ invalid_type_error: 'Select an account' }).min(1, 'Select an account'),
    categoryId: z.coerce.number().nullable().optional(),
    toAccountId: z.coerce.number().nullable().optional(),
  })
  .refine((data) => data.type !== 'TRANSFER' || !!data.toAccountId, {
    message: 'Select a destination account for transfers',
    path: ['toAccountId'],
  })
  .refine((data) => data.type !== 'TRANSFER' || data.toAccountId !== data.accountId, {
    message: 'Source and destination accounts must be different',
    path: ['toAccountId'],
  })
export type TransactionFormValues = z.infer<typeof transactionSchema>
