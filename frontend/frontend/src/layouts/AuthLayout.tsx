import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet2, TrendingUp, ShieldCheck } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand to-transfer font-display text-base font-bold text-white shadow-sm">
              E
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">Expensely</span>
          </div>
          <Outlet />
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0d0e14] via-[#141625] to-[#1b1533] lg:block">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.5),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(251,191,36,0.35),transparent_35%)]" />
        <div className="relative flex h-full flex-col justify-center px-14 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono-num text-xs uppercase tracking-[0.2em] text-white/50">Ledger, reimagined</p>
            <h2 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight text-white">
              Every rupee, accounted for &mdash; automatically.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Track spending, understand cash flow, and let AI turn a one-line note into a categorized transaction.
            </p>
          </motion.div>

          <div className="mt-14 space-y-5">
            {[
              { icon: TrendingUp, text: 'Real-time cash flow & category analytics' },
              { icon: Wallet2, text: 'Accounts, cards & wallets in one view' },
              { icon: ShieldCheck, text: 'JWT-secured, tenant-isolated by design' },
            ].map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-white/75"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
