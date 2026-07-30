import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, CheckCircle2, XCircle, Clock, Wifi, WifiOff, Lightbulb } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useActiveAiTasks, useNotificationsStream, useSubmitAiInput } from '@/hooks/useAi'

const SUGGESTIONS = [
  'Paid 450 for lunch with the team today',
  'Received salary of 65000 yesterday',
  'Spent 1200 on groceries at the supermarket',
  'Paid electricity bill 2300 on 2 July',
]

const STATUS_META: Record<string, { icon: typeof Clock; className: string; label: string }> = {
  PENDING: { icon: Clock, className: 'text-transfer bg-transfer-soft', label: 'Queued' },
  PROCESSING: { icon: Loader2, className: 'text-brand bg-brand-soft', label: 'Processing' },
  COMPLETED: { icon: CheckCircle2, className: 'text-income bg-income-soft', label: 'Completed' },
  FAILED: { icon: XCircle, className: 'text-expense bg-expense-soft', label: 'Failed' },
}

export default function AiAssistantPage() {
  const [rawText, setRawText] = useState('')
  const submitMutation = useSubmitAiInput()
  const { data: activeTasks } = useActiveAiTasks()
  const { notifications, connected } = useNotificationsStream()
  const [submittedLog, setSubmittedLog] = useState<{ id: string; text: string; time: number }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [submittedLog, notifications])

  function handleSubmit(text?: string) {
    const value = (text ?? rawText).trim()
    if (!value) return
    submitMutation.mutate(
      { rawText: value },
      {
        onSuccess: (res) => {
          setSubmittedLog((prev) => [...prev, { id: res.id, text: value, time: Date.now() }])
          setRawText('')
        },
      }
    )
  }

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        description="Describe a transaction in plain English or Hindi \u2014 AI will parse it and log it for you."
        actions={
          <span className="flex items-center gap-1.5 text-xs text-ink-faint">
            {connected ? <Wifi className="h-3.5 w-3.5 text-income" /> : <WifiOff className="h-3.5 w-3.5 text-expense" />}
            {connected ? 'Live updates on' : 'Reconnecting...'}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="flex h-[560px] flex-col">
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
              {submittedLog.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="font-display text-base font-semibold text-ink">Tell me what happened</p>
                  <p className="mt-1 max-w-xs text-sm text-ink-muted">
                    Try something like &ldquo;Paid 500 for dinner yesterday&rdquo; and I&apos;ll turn it into a transaction.
                  </p>
                </div>
              )}

              {submittedLog.map((entry) => {
                const notif = notifications.find((n) => {
                  try {
                    const parsed = JSON.parse(n.data)
                    return parsed.jobId === entry.id
                  } catch {
                    return false
                  }
                })
                const isDone = notif?.event === 'AI_TASK_COMPLETED'
                const isFailed = notif?.event === 'AI_TASK_FAILED' || notif?.event === 'AI_TASK_ERROR'

                return (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[85%]">
                    <div className="rounded-2xl rounded-tr-sm bg-brand px-4 py-2.5 text-sm text-brand-ink shadow-sm">
                      {entry.text}
                    </div>
                    <div className="mt-1.5 flex items-center justify-end gap-1.5 text-xs">
                      {isDone ? (
                        <span className="flex items-center gap-1 text-income"><CheckCircle2 className="h-3.5 w-3.5" /> Added to transactions</span>
                      ) : isFailed ? (
                        <span className="flex items-center gap-1 text-expense"><XCircle className="h-3.5 w-3.5" /> Couldn&apos;t parse this one</span>
                      ) : (
                        <span className="flex items-center gap-1 text-ink-faint"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing...</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSubmit(s)}
                    className="rounded-full border border-border-strong px-3 py-1 text-xs text-ink-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit()
                }}
                className="flex items-end gap-2"
              >
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="e.g. Spent 800 on fuel today"
                  rows={1}
                  className="max-h-32 min-h-11 flex-1 resize-none"
                />
                <Button type="submit" size="icon" disabled={!rawText.trim() || submitMutation.isPending}>
                  {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <p className="font-display text-sm font-semibold text-ink">Active jobs</p>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {!activeTasks?.length ? (
                    <p className="text-xs text-ink-faint">No jobs are currently processing.</p>
                  ) : (
                    activeTasks.map((task) => {
                      const meta = STATUS_META[task.status] ?? STATUS_META.PENDING
                      const Icon = meta.icon
                      return (
                        <motion.div
                          key={task.jobId}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2"
                        >
                          <span className="truncate text-xs text-ink-muted">Job {task.jobId.slice(0, 8)}</span>
                          <Badge className={`gap-1 ${meta.className}`}>
                            <Icon className={`h-3 w-3 ${task.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                            {meta.label}
                          </Badge>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 text-sm text-ink-muted">
              <p className="mb-2 font-display text-sm font-semibold text-ink">How it works</p>
              <ol className="list-decimal space-y-1.5 pl-4 text-xs">
                <li>Your note is sent to <code className="rounded bg-surface-2 px-1 py-0.5">POST /api/ai-input</code></li>
                <li>An async job parses type, amount, category & date</li>
                <li>On success it&apos;s saved using your default account & payment mode</li>
                <li>You get notified instantly over a live connection</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
