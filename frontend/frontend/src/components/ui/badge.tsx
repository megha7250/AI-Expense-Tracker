import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-soft text-brand',
        secondary: 'border-transparent bg-surface-2 text-ink-muted',
        income: 'border-transparent bg-income-soft text-income',
        expense: 'border-transparent bg-expense-soft text-expense',
        transfer: 'border-transparent bg-transfer-soft text-transfer',
        outline: 'border-border-strong text-ink-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
