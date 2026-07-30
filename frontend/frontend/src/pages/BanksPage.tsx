import { motion } from 'framer-motion'
import { Landmark } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { NotImplemented } from '@/components/common/NotImplemented'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useBanks } from '@/hooks/useBanks'

export default function BanksPage() {
  const { data, isLoading, isError, refetch } = useBanks()

  return (
    <div>
      <PageHeader
        title="Supported Banks"
        description="Banks available when linking an account during onboarding."
        actions={<NotImplemented label="Bank management not available in this API" />}
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : !data?.length ? (
        <EmptyState icon={Landmark} title="No banks found" description="None are seeded on the backend yet." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-ink">{b.name}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
