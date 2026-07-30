import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark, Wallet, CreditCard, Check, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { onboardingSchema, type OnboardingFormValues } from '@/utils/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBanks } from '@/hooks/useBanks'
import { usePaymentModes } from '@/hooks/usePaymentModes'
import { onboardingApi } from '@/api/onboarding'
import { useAuthStore } from '@/store/authStore'
import { extractErrorMessage } from '@/api/client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const STEPS = ['Bank account', 'Card (optional)', 'Cash & preferences'] as const

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const setOnboarded = useAuthStore((s) => s.setOnboarded)

  const { data: banks, isLoading: banksLoading } = useBanks()
  const { data: paymentModes, isLoading: modesLoading } = usePaymentModes()

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { hasCard: false, cashBalance: 0, bankBalance: 0, languagePreference: 'ENGLISH' },
  })

  const hasCard = watch('hasCard')

  async function goNext() {
    const fieldsByStep: (keyof OnboardingFormValues)[][] = [
      ['bankId', 'lastFourDigits', 'bankBalance'],
      [],
      ['cashBalance', 'defaultPaymentModeId', 'languagePreference'],
    ]
    const valid = await trigger(fieldsByStep[step])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  async function onSubmit(values: OnboardingFormValues) {
    setSubmitting(true)
    try {
      await onboardingApi.onboard({
        bankId: values.bankId,
        lastFourDigits: values.lastFourDigits,
        bankBalance: values.bankBalance,
        cardType: values.hasCard ? values.cardType ?? null : null,
        cardLastFourDigits: values.hasCard ? values.cardLastFourDigits ?? null : null,
        cardLimit: values.hasCard ? values.cardLimit ?? null : null,
        cashBalance: values.cashBalance,
        defaultPaymentModeId: values.defaultPaymentModeId,
        languagePreference: values.languagePreference,
      })
      setOnboarded(true)
      toast.success('You\u2019re all set!', { description: 'Your accounts are ready.' })
      navigate('/dashboard')
    } catch (err) {
      toast.error('Couldn\u2019t finish onboarding', { description: extractErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand to-transfer font-display text-base font-bold text-white shadow-sm">
            E
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">Expensely</span>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  i < step ? 'border-brand bg-brand text-brand-ink' : i === step ? 'border-brand text-brand' : 'border-border-strong text-ink-faint'
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn('h-px flex-1', i < step ? 'bg-brand' : 'bg-border')} />}
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-sm sm:p-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">Step {step + 1} of {STEPS.length}</p>
          <h1 className="mb-6 font-display text-xl font-semibold text-ink">{STEPS[step]}</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Landmark className="h-4 w-4" />
                    <p className="text-sm">Tell us about your primary bank account.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Bank</Label>
                    {banksLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Controller
                        control={control}
                        name="bankId"
                        render={({ field }) => (
                          <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Select your bank" /></SelectTrigger>
                            <SelectContent>
                              {banks?.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    {errors.bankId && <p className="text-xs text-expense">{errors.bankId.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="lastFourDigits">Account last 4 digits</Label>
                      <Input id="lastFourDigits" maxLength={4} placeholder="1234" {...register('lastFourDigits')} />
                      {errors.lastFourDigits && <p className="text-xs text-expense">{errors.lastFourDigits.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bankBalance">Current balance</Label>
                      <Input id="bankBalance" type="number" step="0.01" placeholder="25000" {...register('bankBalance')} />
                      {errors.bankBalance && <p className="text-xs text-expense">{errors.bankBalance.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                  <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface-2 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-ink-muted" />
                      <span className="text-sm font-medium text-ink">Add a credit or debit card</span>
                    </div>
                    <Controller control={control} name="hasCard" render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )} />
                  </div>

                  <AnimatePresence>
                    {hasCard && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                        <div className="space-y-1.5">
                          <Label>Card type</Label>
                          <Controller
                            control={control}
                            name="cardType"
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger><SelectValue placeholder="Select card type" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="cardLastFourDigits">Card last 4 digits</Label>
                            <Input id="cardLastFourDigits" maxLength={4} placeholder="5678" {...register('cardLastFourDigits')} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="cardLimit">Credit limit</Label>
                            <Input id="cardLimit" type="number" step="0.01" placeholder="100000" {...register('cardLimit')} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!hasCard && (
                    <p className="text-sm text-ink-faint">No worries — you can always add transactions with cash or bank transfer instead.</p>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Wallet className="h-4 w-4" />
                    <p className="text-sm">A few last details to personalize your dashboard.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cashBalance">Cash on hand</Label>
                    <Input id="cashBalance" type="number" step="0.01" placeholder="1500" {...register('cashBalance')} />
                    {errors.cashBalance && <p className="text-xs text-expense">{errors.cashBalance.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Default payment mode</Label>
                    {modesLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Controller
                        control={control}
                        name="defaultPaymentModeId"
                        render={({ field }) => (
                          <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Select a payment mode" /></SelectTrigger>
                            <SelectContent>
                              {paymentModes?.map((pm) => (
                                <SelectItem key={pm.id} value={String(pm.id)}>{pm.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    {errors.defaultPaymentModeId && <p className="text-xs text-expense">{errors.defaultPaymentModeId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Controller
                      control={control}
                      name="languagePreference"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ENGLISH">English</SelectItem>
                            <SelectItem value="HINDI">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button type="button" variant="ghost" className="gap-1.5" disabled={step === 0} onClick={() => setStep((s) => Math.max(s - 1, 0))}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" className="gap-1.5" onClick={goNext}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="gap-1.5" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Finish setup
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
