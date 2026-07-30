import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Tags } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { NotImplemented } from '@/components/common/NotImplemented'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/hooks/useCategories'

const ICON_PALETTE = ['bg-brand-soft text-brand', 'bg-income-soft text-income', 'bg-expense-soft text-expense', 'bg-transfer-soft text-transfer']

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useCategories()

  const filtered = data?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader
        title="Categories"
        description="System categories plus any custom categories on your account."
        actions={<NotImplemented label="Create / edit / delete not available in this API" />}
      />

      <div className="relative mb-5 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input placeholder="Search categories..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !filtered?.length ? (
        <EmptyState icon={Tags} title="No categories found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-start gap-3 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${ICON_PALETTE[i % ICON_PALETTE.length]}`}>
                    <Tags className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <Badge variant={c.isSystem ? 'secondary' : 'outline'} className="mt-1 text-[10px]">
                      {c.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
