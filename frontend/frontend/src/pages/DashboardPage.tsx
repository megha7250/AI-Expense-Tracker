import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, Plus, Sparkles, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAccounts } from '@/hooks/useAccounts'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useAiInsights, useCategoryDistribution, useMonthlyCashFlow } from '@/hooks/useAnalytics'
import { formatCurrency, formatDate, toApiDate } from '@/lib/utils'
import { TransactionFormDialog } from '@/components/transactions/TransactionFormDialog'

const CHART_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#c084fc', '#fb923c']

function useDateRange(monthsBack: number) {
  return useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - monthsBack)
    return { startDate: toApiDate(start), endDate: toApiDate(end) }
  }, [monthsBack])
}

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { startDate, endDate } = useDateRange(6)
  const { startDate: monthStart, endDate: monthEnd } = useDateRange(1)

  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: recent, isLoading: recentLoading } = useRecentTransactions()
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyCashFlow(startDate, endDate)
  const { data: categoryDist, isLoading: catLoading } = useCategoryDistribution(monthStart, monthEnd)
  const { data: insights, isLoading: insightsLoading } = useAiInsights()

  const totalBalance = accounts?.reduce((sum, a) => sum + (a.type === 'Credit' ? 0 : a.amount), 0) ?? 0
  const thisMonth = monthly?.[monthly.length - 1]
  const income = thisMonth?.income ?? 0
  const expense = thisMonth?.expense ?? 0
  const net = income - expense

  const monthlyChartData = monthly?.map((m) => ({
    label: new Date(m.year, m.month - 1).toLocaleDateString('en-IN', { month: 'short' }),
    Income: m.income,
    Expense: m.expense,
  }))

  const pieData = categoryDist?.filter((c) => c.amount > 0).map((c) => ({ name: c.label, value: c.amount }))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your financial overview at a glance."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total balance"
          value={totalBalance}
          icon={Wallet}
          loading={accountsLoading}
          tone="brand"
          delay={0}
        />
        <StatCard label="Income this month" value={income} icon={ArrowUpRight} loading={monthlyLoading} tone="income" delay={0.05} />
        <StatCard label="Expenses this month" value={expense} icon={ArrowDownRight} loading={monthlyLoading} tone="expense" delay={0.1} />
        <StatCard label="Net cash flow" value={net} icon={TrendingUp} loading={monthlyLoading} tone={net >= 0 ? 'income' : 'expense'} delay={0.15} showSign />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Income vs Expense trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs. expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : !monthlyChartData?.length ? (
              <EmptyState icon={TrendingUp} title="No cash flow data yet" description="Add a few transactions to see your trends here." />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--color-ink-faint)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-ink-faint)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `\u20b9${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Income" stroke="var(--color-income)" fill="url(#incomeGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expense" stroke="var(--color-expense)" fill="url(#expenseGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : !pieData?.length ? (
              <EmptyState icon={Wallet} title="Nothing to show" description="Categorized expenses this month will appear here." />
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : !recent?.length ? (
              <EmptyState icon={Wallet} title="No transactions yet" description="Your recent activity will show up here once you add a transaction." actionLabel="Add transaction" onAction={() => setAddOpen(true)} />
            ) : (
              recent.map((t, i) => (
                <motion.div
                  key={t.transactionId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-[var(--radius-md)] px-2 py-2.5 hover:bg-surface-2"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.amount < 0 ? 'bg-expense-soft text-expense' : 'bg-income-soft text-income'}`}>
                      {t.amount < 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{t.description || t.category?.name || 'Transaction'}</p>
                      <p className="text-xs text-ink-faint">{t.category?.name ?? t.type} \u00b7 {formatDate(t.transactionDate)}</p>
                    </div>
                  </div>
                  <span className={`font-mono-num text-sm font-semibold ${t.amount < 0 ? 'text-expense' : 'text-income'}`}>
                    {formatCurrency(t.amount, { showSign: true })}
                  </span>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand" /> AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insightsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : !insights?.length ? (
              <EmptyState icon={Sparkles} title="No insights yet" description="AI-generated weekly and monthly insights will appear here as they're produced." />
            ) : (
              insights.slice(0, 4).map((insight) => (
                <div key={insight.id} className="rounded-[var(--radius-md)] border border-border bg-surface-2/60 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase">{insight.type}</Badge>
                  </div>
                  <p className="text-sm text-ink-muted">{insight.insightText}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionFormDialog open={addOpen} onOpenChange={setAddOpen} mode="create" />
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, loading, tone, delay = 0, showSign = false,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  loading?: boolean
  tone: 'brand' | 'income' | 'expense'
  delay?: number
  showSign?: boolean
}) {
  const toneClasses = {
    brand: 'bg-brand-soft text-brand',
    income: 'bg-income-soft text-income',
    expense: 'bg-expense-soft text-expense',
  }[tone]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>
      <Card className="glass">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-ink-muted">{label}</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${toneClasses}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="font-mono-num text-2xl font-semibold text-ink">{formatCurrency(value, { showSign })}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
