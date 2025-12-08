/**
 * StripeConnectStatusBadge
 * MYM-25: Displays the current Stripe Connect status as a badge
 */

import { Badge } from '@/components/ui/badge'
import type { StripeConnectState } from '@/types/payments'
import { cn } from '@/lib/utils'

interface StripeConnectStatusBadgeProps {
  state: StripeConnectState
  className?: string
}

const statusConfig: Record<StripeConnectState, {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  className: string
}> = {
  not_connected: {
    label: 'No Conectado',
    variant: 'outline',
    className: 'border-muted-foreground text-muted-foreground',
  },
  pending_verification: {
    label: 'Verificación Pendiente',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  connected: {
    label: 'Conectado',
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
}

export function StripeConnectStatusBadge({ state, className }: StripeConnectStatusBadgeProps) {
  const config = statusConfig[state]

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
