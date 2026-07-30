import { Construction } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/** Used for UI that has no corresponding backend endpoint yet, per the API integration map. */
export function NotImplemented({ label = 'Backend not implemented yet' }: { label?: string }) {
  return (
    <Badge variant="outline" className="gap-1 border-transfer/30 text-transfer">
      <Construction className="h-3 w-3" />
      {label}
    </Badge>
  )
}
