'use client'

/**
 * MYM-29/MYM-30: Session Card Component
 *
 * Displays a session booking with participant info, date/time,
 * and action buttons (Join Call, Cancel).
 */

import Image from 'next/image'
import { Calendar, Clock, User } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JoinCallButton } from './join-call-button'
import {
  formatSessionDate,
  formatSessionDateShort,
  getRelativeSessionTime,
} from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import type { BookingWithParticipants, SessionDisplayStatus } from '@/types/sessions'
import { getSessionDisplayStatus } from '@/types/sessions'

interface SessionCardProps {
  /** Booking data with participant info */
  booking: BookingWithParticipants
  /** Current user's ID to determine which participant to display */
  currentUserId: string
  /** Additional CSS classes */
  className?: string
}

// Status badge configuration
const statusConfig: Record<SessionDisplayStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  upcoming: { label: 'Próxima', variant: 'secondary' },
  joinable: { label: 'Unirse ahora', variant: 'default' },
  in_progress: { label: 'En curso', variant: 'default' },
  completed: { label: 'Completada', variant: 'outline' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

export function SessionCard({
  booking,
  currentUserId,
  className,
}: SessionCardProps) {
  // Determine which participant to show (the "other" person)
  const isMentor = booking.mentor_id === currentUserId
  const otherParticipant = isMentor ? booking.student : booking.mentor
  const participantRole = isMentor ? 'Mentee' : 'Mentor'

  // Calculate display status
  const displayStatus = getSessionDisplayStatus(
    booking.session_date,
    booking.duration_minutes,
    booking.status
  )

  const statusInfo = statusConfig[displayStatus]
  const isActive = displayStatus === 'joinable' || displayStatus === 'in_progress'
  const isPast = displayStatus === 'completed' || displayStatus === 'cancelled'

  return (
    <Card
      data-testid="sessionCard"
      className={cn(
        'transition-all duration-200',
        isActive && 'ring-2 ring-primary/50 shadow-md',
        !isPast && 'hover:shadow-lg',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          {/* Participant info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {otherParticipant.photo_url ? (
                <Image
                  src={otherParticipant.photo_url}
                  alt={otherParticipant.name || 'Participant'}
                  fill
                  className="object-cover"
                  data-testid="participant_avatar"
                />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div>
              <p
                className="font-semibold text-foreground"
                data-testid="participant_name"
              >
                {otherParticipant.name || 'Usuario'}
              </p>
              <p className="text-sm text-muted-foreground">
                {participantRole}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant={statusInfo.variant}
            data-testid="session_status_badge"
          >
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session details */}
        <div className="space-y-2">
          {/* Date and time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="session_date">
              {formatSessionDateShort(booking.session_date)}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span data-testid="session_relative_time">
              {getRelativeSessionTime(booking.session_date)}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span data-testid="session_duration">
              {booking.duration_minutes} minutos
            </span>
          </div>
        </div>

        {/* Actions */}
        {!isPast && (
          <div className="flex gap-2 pt-2">
            <JoinCallButton
              bookingId={booking.id}
              sessionDate={booking.session_date}
              durationMinutes={booking.duration_minutes}
              videocallUrl={booking.videocall_url}
            />
            {/* Cancel button will be added by MYM-31 */}
          </div>
        )}

        {/* Notes (if any) */}
        {booking.notes && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {booking.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
