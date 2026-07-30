import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownRight, ArrowUpRight, ArrowLeftRight, Download, Loader2, MoreHorizontal, Pencil, Plus,
  Search, Trash2, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { TransactionFormDialog } from '@/components/transactions/TransactionFormDialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionDto, TransactionType } from '@/types/api'
import { useDebounce } from '@/hooks/useDebounce'

const PAGE_SIZE = 10

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [activeTxn, setActiveTxn] = useState<TransactionDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TransactionDto | null>(null)

  const { data: categories } = useCategories()
  const deleteMutation = useDeleteTransaction()

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      types: typeFilter === 'ALL' ? undefined : [typeFilter],
      categoryIds: categoryFilter === 'ALL' ? undefined : [Number(categoryFilter)],
      page,
      size: PAGE_SIZE,
      sort: 'transactionDate,desc',
    }),
    [debouncedSearch, typeFilter, categoryFilter, page]
  )

  const { data, isLoading, isError, refetch, isFetching } = useTransactions(filters)

  function openCreate() {
    setFormMode('create')
    setActiveTxn(null)
    setFormOpen(true)
  }
  function openEdit(t: TransactionDto) {
    setFormMode('edit')
    setActiveTxn(t)
    setFormOpen(true)
  }

  function toggleSelectAll() {
    if (!data?.content) return
    if (selected.size === data.content.length) setSelected(new Set())
    else setSelected(new Set(data.content.map((t) => t.transactionId)))
  }
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exportCsv() {
    const rows = data?.content.filter((t) => selected.size === 0 || selected.has(t.transactionId)) ?? []
    const header = ['Date', 'Type', 'Description', 'Category', 'Amount']
    const csvRows = rows.map((t) => [
      t.transactionDate,
      t.type,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.category?.name || '',
      t.amount,
    ])
    const csv = [header, ...csvRows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.transactionId)
    setDeleteTarget(null)
  }

  const totalPages = data?.totalPages ?? 0
  const hasFilters = !!debouncedSearch || typeFilter !== 'ALL' || categoryFilter !== 'ALL'

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="All your expenses, income, and transfers in one place."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv} disabled={!data?.content.length}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" className="gap-1.5" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
        </div>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as TransactionType | 'ALL'); setPage(0) }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0) }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="gap-1 text-ink-faint" onClick={() => { setSearch(''); setTypeFilter('ALL'); setCategoryFilter('ALL'); setPage(0) }}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}

        {selected.size > 0 && (
          <Badge variant="secondary" className="ml-auto">{selected.size} selected</Badge>
        )}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !data?.content.length ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            description={hasFilters ? 'Try adjusting your filters or search term.' : 'Add your first transaction to start tracking.'}
            actionLabel={hasFilters ? undefined : 'Add transaction'}
            onAction={hasFilters ? undefined : openCreate}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selected.size > 0 && selected.size === data.content.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((t, i) => (
                  <motion.tr
                    key={t.transactionId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="border-b border-border transition-colors hover:bg-surface-2/60"
                  >
                    <TableCell>
                      <Checkbox checked={selected.has(t.transactionId)} onCheckedChange={() => toggleSelect(t.transactionId)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          t.type === 'INCOME' ? 'bg-income-soft text-income' : t.type === 'TRANSFER' ? 'bg-transfer-soft text-transfer' : 'bg-expense-soft text-expense'
                        }`}>
                          {t.type === 'INCOME' ? <ArrowUpRight className="h-4 w-4" /> : t.type === 'TRANSFER' ? <ArrowLeftRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-medium text-ink">{t.description || '\u2014'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {t.category ? (
                        <Badge variant={t.category.isSystem ? 'secondary' : 'outline'}>{t.category.name}</Badge>
                      ) : (
                        <span className="text-xs text-ink-faint">\u2014</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-ink-muted">{formatDate(t.transactionDate)}</TableCell>
                    <TableCell className={`text-right font-mono-num text-sm font-semibold ${t.amount < 0 ? 'text-expense' : 'text-income'}`}>
                      {formatCurrency(t.amount, { showSign: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="iconSm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(t)}><Pencil /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(t)} className="text-expense focus:text-expense">
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-ink-faint">
                {isFetching ? <Loader2 className="inline h-3 w-3 animate-spin" /> : `${data.numberOfElements} of ${data.totalElements} transactions`}
              </p>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="iconSm" disabled={data.first} onClick={() => setPage((p) => Math.max(p - 1, 0))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs text-ink-muted">Page {page + 1} of {Math.max(totalPages, 1)}</span>
                <Button variant="outline" size="iconSm" disabled={data.last} onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} mode={formMode} transaction={activeTxn} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{deleteTarget?.description || 'this transaction'}&rdquo; and reverse its effect on your account balance. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
