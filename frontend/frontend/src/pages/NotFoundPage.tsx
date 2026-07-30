import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Compass className="h-6 w-6" />
        </div>
        <p className="font-mono-num text-sm text-ink-faint">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">This page doesn&apos;t exist</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          The page you&apos;re looking for may have been moved or never existed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </motion.div>
    </div>
  )
}
