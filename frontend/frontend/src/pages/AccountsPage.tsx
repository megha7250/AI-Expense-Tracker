import { motion } from 'framer-motion'
import { Landmark, Wallet, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { NotImplemented } from '@/components/common/NotImplemented'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/hooks/useAccounts'
import { formatCurrency } from '@/lib/utils'

const TYPE_ICON: Record<string, typeof Wallet> = { Savings: Landmark, Cash: Wallet, Credit: CreditCard }
const TYPE_TONE: Record<string, string> = {
  Savings: 'from-brand to-transfer',
  Cash: 'from-income to-emerald-400',
  Credit: 'from-transfer to-amber-400',
}

export default function AccountsPage() {
  const { data, isLoading, isError, refetch } = useAccounts()

  const totalAssets = data?.filter((a) => a.type !== 'Credit').reduce((s, a) => s + a.amount, 0) ?? 0

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Bank accounts, cash, and cards linked to your profile."
        actions={<NotImplemented label="Linking new accounts not available in this API" />}
      />

      {!isLoading && !isError && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-brand-soft to-transparent p-5">
          <p className="text-xs font-medium text-ink-muted">Total assets (excludes credit)</p>
          <p className="mt-1 font-mono-num text-3xl font-semibold text-ink">{formatCurrency(totalAssets)}</p>
        </div>
      )}

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : !data?.length ? (
        <EmptyState icon={Wallet} title="No accounts found" description="Accounts are created during onboarding." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a, i) => {
            const Icon = TYPE_ICON[a.type] || Wallet
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Card className="overflow-hidden">
                  <div className={`h-24 bg-gradient-to-br ${TYPE_TONE[a.type] || 'from-brand to-transfer'} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 opacity-90" />
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">{a.type}</span>
                    </div>
                    <p className="mt-4 font-mono-num text-sm tracking-widest opacity-90">\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 {a.lastFour}</p>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-ink">{a.bankName}</p>
                    <p className="mt-1 font-mono-num text-xl font-semibold text-ink">
                      {formatCurrency(a.amount)}
                      {a.type === 'Credit' && <span className="ml-1 text-xs font-normal text-ink-faint">limit</span>}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
