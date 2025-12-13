'use client'

/**
 * BookingSummaryCard
 * MYM-24: Displays booking details before checkout
 * MYM-20: Updated with timezone conversion
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, DollarSign, User } from 'lucide-react'
import { useTimezone } from '@/hooks/use-timezone'
import { formatInTimezone } from '@/lib/timezone'
import {
  TimezoneIndicator,
  TimezoneIndicatorSkeleton,
} from '@/components/scheduling/timezone-indicator'

interface BookingSummaryCardProps {
  mentorName: string
  sessionDate: string
  durationMinutes: number
  totalCost: number
  platformFee: number
  mentorTimezone?: string
}

export function BookingSummaryCard({
  mentorName,
  sessionDate,
  durationMinutes,
  totalCost,
  platformFee,
  mentorTimezone,
}: BookingSummaryCardProps) {
  const { timezone, isLoading } = useTimezone()

  // Format date in user's timezone (MYM-20)
  const date = new Date(sessionDate)
  const dateFormatted = timezone
    ? formatInTimezone(date, timezone, "EEEE, d 'de' MMMM, yyyy")
    : ''
  const timeFormatted = timezone
    ? formatInTimezone(date, timezone, 'h:mm a')
    : ''

  return (
    <Card data-testid="bookingSummaryCard" className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Session with {mentorName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timezone indicator - MYM-20 */}
        {isLoading ? (
          <TimezoneIndicatorSkeleton />
        ) : (
          <TimezoneIndicator
            userTimezone={timezone}
            mentorTimezone={mentorTimezone}
            showBothTimezones={!!mentorTimezone}
          />
        )}

        {/* Session details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="session_date">
              {isLoading ? 'Cargando...' : dateFormatted}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span data-testid="session_time">
              {isLoading ? 'Cargando...' : `${timeFormatted} (${durationMinutes} minutos)`}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session cost</span>
            <span data-testid="session_cost">${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Platform fee (included)</span>
            <span>${platformFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span data-testid="total_amount" className="text-xl font-bold text-primary">
            ${totalCost.toFixed(2)}
          </span>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <DollarSign className="h-3 w-3" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </CardContent>
    </Card>
  )
}
