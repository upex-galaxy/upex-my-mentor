'use client'

/**
 * MYM-29/MYM-30: Session Card Component
 * MYM-20: Updated with timezone conversion
 * MYM-30: Added communication channel display
 *
 * Displays a session booking with participant info, date/time,
 * communication channel, and action buttons (Join Call, Cancel).
 */

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, MessageCircle, Link as LinkIcon, ExternalLink, Star, CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JoinCallButton } from './join-call-button'
import {
  formatSessionDateShortInTimezone,
  getRelativeSessionTime,
} from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { useTimezone } from '@/hooks/use-timezone'
import {
  TimezoneIndicator,
  TimezoneIndicatorSkeleton,
} from '@/components/scheduling/timezone-indicator'
import type { BookingWithParticipants, SessionDisplayStatus } from '@/types/sessions'
import { getSessionDisplayStatus } from '@/types/sessions'
import { CHANNEL_CONFIG, type CommunicationChannelType } from '@/types/communication'

interface SessionCardProps {
  /** Booking data with participant info */
  booking: BookingWithParticipants
  /** Current user's ID to determine which participant to display */
  currentUserId: string
  /** Callback when mentor wants to add meeting link (MYM-30) */
  onAddMeetingLink?: (bookingId: string) => void
  /** MYM-33: Whether the current user has already reviewed this session */
  hasReviewed?: boolean
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
  onAddMeetingLink,
  hasReviewed = false,
  className,
}: SessionCardProps) {
  // MYM-20: Timezone handling
  const { timezone, isLoading: timezoneLoading } = useTimezone()

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

  // Format date in user's timezone (MYM-20)
  const formattedDate = timezone
    ? formatSessionDateShortInTimezone(booking.session_date, timezone)
    : ''

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
        {/* Timezone indicator - MYM-20 */}
        {timezoneLoading ? (
          <TimezoneIndicatorSkeleton className="mb-2" />
        ) : (
          <TimezoneIndicator userTimezone={timezone} className="mb-2" />
        )}

        {/* Session details */}
        <div className="space-y-2">
          {/* Date and time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="session_date">
              {timezoneLoading ? 'Cargando...' : formattedDate}
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

          {/* MYM-30: Communication Channel */}
          {booking.communication_channels && Array.isArray(booking.communication_channels) && booking.communication_channels.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span data-testid="session_channel">
                {(() => {
                  const channelData = booking.communication_channels[0] as { type: CommunicationChannelType }
                  const channelType = channelData?.type
                  const config = channelType ? CHANNEL_CONFIG[channelType] : null
                  return config ? config.label : 'Canal de comunicación'
                })()}
              </span>
            </div>
          )}

          {/* MYM-30: Meeting Link (if set) or Add Link button (for mentor) */}
          {booking.session_meeting_link ? (
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-primary" />
              <a
                href={booking.session_meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
                data-testid="session_meeting_link"
              >
                Link de la sesión
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : isMentor && !isPast && onAddMeetingLink ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddMeetingLink(booking.id)}
              className="w-fit"
              data-testid="add_meeting_link_button"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Agregar link de sesión
            </Button>
          ) : null}
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

        {/* MYM-33: Leave Review action for completed sessions */}
        {displayStatus === 'completed' && (
          <div className="flex items-center gap-2 pt-2">
            {hasReviewed ? (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
                data-testid="review_submitted_badge"
              >
                <CheckCircle2 className="h-3 w-3" />
                Valoración enviada
              </Badge>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                data-testid="leave_review_button"
              >
                <Link href={`/review/submit?booking=${booking.id}`}>
                  <Star className="h-4 w-4 mr-2" />
                  Dejar valoración
                </Link>
              </Button>
            )}
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
