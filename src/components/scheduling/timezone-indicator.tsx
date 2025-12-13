'use client'

/**
 * TimezoneIndicator Component - MYM-20
 *
 * Displays the current timezone with optional mentor timezone comparison.
 * Uses the design system Badge component with accent styling.
 */

import { Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getTimezoneAbbreviation, getTimezoneOffset } from '@/lib/timezone'
import type { TimezoneIndicatorProps } from '@/types/scheduling'

/**
 * Visual indicator showing timezone information
 *
 * @example
 * ```tsx
 * // Basic usage with auto-detected timezone
 * <TimezoneIndicator userTimezone="America/New_York" />
 *
 * // With mentor timezone comparison
 * <TimezoneIndicator
 *   userTimezone="America/New_York"
 *   mentorTimezone="Europe/London"
 *   showBothTimezones
 * />
 * ```
 */
export function TimezoneIndicator({
  userTimezone,
  mentorTimezone,
  showBothTimezones = false,
  className,
}: TimezoneIndicatorProps) {
  const userAbbrev = getTimezoneAbbreviation(userTimezone)
  const userOffset = getTimezoneOffset(userTimezone)

  const mentorAbbrev = mentorTimezone
    ? getTimezoneAbbreviation(mentorTimezone)
    : null
  const mentorOffset = mentorTimezone ? getTimezoneOffset(mentorTimezone) : null

  return (
    <div
      data-testid="timezone_indicator"
      className={cn('flex items-center gap-2 flex-wrap', className)}
    >
      <div className="flex items-center gap-1.5">
        <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Badge
          variant="outline"
          className="bg-accent/10 text-accent-foreground border-accent/20"
        >
          {userAbbrev} ({userOffset})
        </Badge>
      </div>

      {showBothTimezones && mentorTimezone && mentorAbbrev !== userAbbrev && (
        <span className="text-xs text-muted-foreground">
          • Mentor: {mentorAbbrev} ({mentorOffset})
        </span>
      )}
    </div>
  )
}

/**
 * Skeleton loader for TimezoneIndicator
 */
export function TimezoneIndicatorSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
      <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
    </div>
  )
}
