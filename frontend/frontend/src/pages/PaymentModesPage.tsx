import { motion } from 'framer-motion'
import { CreditCard, Landmark, Smartphone, Wallet, Banknote } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { NotImplemented } from '@/components/common/NotImplemented'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaymentModes } from '@/hooks/usePaymentModes'

const MODE_ICON: Record<string, typeof CreditCard> = {
  'Credit Card': CreditCard,
  'Debit Card': CreditCard,
  'Net Banking': Landmark,
  UPI: Smartphone,
  Cash: Banknote,
  'Digital Wallet': Wallet,
}

export default function PaymentModesPage() {
  const { data, isLoading, isError, refetch } = usePaymentModes()

  return (
    <div>
      <PageHeader
        title="Payment Modes"
        description="How you pay \u2014 used when logging transactions."
        actions={<NotImplemented label="Custom payment modes not available in this API" />}
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : !data?.length ? (
        <EmptyState icon={CreditCard} title="No payment modes" description="None are configured on the backend yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((pm, i) => {
            const Icon = MODE_ICON[pm.name] || CreditCard
            return (
              <motion.div key={pm.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-soft text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{pm.name}</p>
                      <Badge variant={pm.type === 'LIABILITY' ? 'expense' : 'income'} className="mt-1 text-[10px]">
                        {pm.type === 'LIABILITY' ? 'Liability' : 'Asset'}
                      </Badge>
                    </div>
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
