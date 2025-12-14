'use client'

import { cn } from '@/lib/utils'
import type { NotificationBadgeProps } from '@/types'

/**
 * MYM-58: Notification badge showing unread message count
 *
 * Displays a circular badge with the number of unread messages.
 * Shows "99+" when count exceeds maxDisplay.
 * Hidden when count is 0.
 */
export function NotificationBadge({
  count,
  maxDisplay = 99,
}: NotificationBadgeProps) {
  // Don't render if no unread messages
  if (count === 0) return null

  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count.toString()

  return (
    <span
      data-testid="notification_badge"
      className={cn(
        'absolute -top-1 -right-1 flex items-center justify-center',
        'min-w-5 h-5 px-1 rounded-full',
        'bg-accent text-accent-foreground',
        'text-xs font-bold',
        'animate-in zoom-in-50 duration-200'
      )}
    >
      {displayCount}
    </span>
  )
}
