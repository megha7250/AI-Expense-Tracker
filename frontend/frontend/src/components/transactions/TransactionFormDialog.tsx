import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { transactionSchema, type TransactionFormValues } from '@/utils/schemas'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { usePaymentModes } from '@/hooks/usePaymentModes'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import type { TransactionDto, TransactionRequestDto, TransactionType } from '@/types/api'

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  transaction?: TransactionDto | null
}

function isoToInputDate(iso: string) {
  return iso?.slice(0, 10) || ''
}
function inputDateToBackend(input: string) {
  const [y, m, d] = input.split('-')
  return `${d}-${m}-${y}`
}

export function TransactionFormDialog({ open, onOpenChange, mode, transaction }: TransactionFormDialogProps) {
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const { data: paymentModes } = usePaymentModes()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const submitting = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      description: '',
      amount: undefined,
      transactionDate: new Date().toISOString().slice(0, 10),
      paymentModeId: undefined,
      accountId: undefined,
      categoryId: null,
      toAccountId: null,
    },
  })

  const type = watch('type')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && transaction) {
      reset({
        transactionId: Number(transaction.transactionId),
        type: transaction.type as TransactionType,
        description: transaction.description || '',
        amount: Math.abs(transaction.amount),
        transactionDate: isoToInputDate(transaction.transactionDate),
        paymentModeId: undefined,
        accountId: undefined,
        categoryId: transaction.category?.id ?? null,
        toAccountId: null,
      })
    } else {
      reset({
        type: 'EXPENSE',
        description: '',
        amount: undefined,
        transactionDate: new Date().toISOString().slice(0, 10),
        paymentModeId: undefined,
        accountId: undefined,
        categoryId: null,
        toAccountId: null,
      })
    }
  }, [open, mode, transaction, reset])

  function onSubmit(values: TransactionFormValues) {
    const payload: TransactionRequestDto = {
      transactionId: mode === 'edit' ? values.transactionId : undefined,
      type: values.type,
      description: values.description,
      amount: values.amount,
      transactionDate: inputDateToBackend(values.transactionDate),
      paymentModeId: values.paymentModeId,
      accountId: values.accountId,
      categoryId: values.categoryId ?? null,
      toAccountId: values.type === 'TRANSFER' ? values.toAccountId : null,
    }

    const mutation = mode === 'edit' ? updateMutation : createMutation
    mutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit transaction' : 'Add transaction'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update the details below.' : 'Log a new expense, income, or transfer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
                  <TabsTrigger value="INCOME">Income</TabsTrigger>
                  <TabsTrigger value="TRANSFER">Transfer</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="e.g. Groceries at DMart" rows={2} {...register('description')} />
            {errors.description && <p className="text-xs text-expense">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
              {errors.amount && <p className="text-xs text-expense">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transactionDate">Date</Label>
              <Input id="transactionDate" type="date" {...register('transactionDate')} />
              {errors.transactionDate && <p className="text-xs text-expense">{errors.transactionDate.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{type === 'TRANSFER' ? 'From account' : 'Account'}</Label>
            <Controller
              control={control}
              name="accountId"
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {accounts?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.bankName} ••{a.lastFour}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountId && <p className="text-xs text-expense">{errors.accountId.message}</p>}
          </div>

          {type === 'TRANSFER' && (
            <div className="space-y-1.5">
              <Label>To account</Label>
              <Controller
                control={control}
                name="toAccountId"
                render={({ field }) => (
                  <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Select destination account" /></SelectTrigger>
                    <SelectContent>
                      {accounts?.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.bankName} ••{a.lastFour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.toAccountId && <p className="text-xs text-expense">{errors.toAccountId.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Payment mode</Label>
            <Controller
              control={control}
              name="paymentModeId"
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                  <SelectContent>
                    {paymentModes?.map((pm) => (
                      <SelectItem key={pm.id} value={String(pm.id)}>{pm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentModeId && <p className="text-xs text-expense">{errors.paymentModeId.message}</p>}
          </div>

          {type !== 'TRANSFER' && (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value != null ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}{!c.isSystem && ' (custom)'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'edit' ? 'Save changes' : 'Add transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
