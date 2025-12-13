'use client'

/**
 * MYM-31: Cancel Session Button Component
 *
 * Button with 24-hour rule logic that opens confirmation modal.
 * Disabled state with tooltip when cancellation window is closed.
 */

import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CancelSessionModal } from './cancel-session-modal'
import { canCancelSession, getHoursUntilSession } from '@/lib/date-utils'

interface CancelSessionButtonProps {
  /** Booking ID to cancel */
  bookingId: string
  /** Session date in ISO format */
  sessionDate: string
  /** Name of the other participant for modal display */
  participantName: string
  /** Callback when cancellation succeeds (for list refresh) */
  onCancelSuccess?: () => void
  /** Additional CSS classes */
  className?: string
}

export function CancelSessionButton({
  bookingId,
  sessionDate,
  participantName,
  onCancelSuccess,
  className,
}: CancelSessionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const canCancel = canCancelSession(sessionDate)
  const hoursUntil = getHoursUntilSession(sessionDate)

  // Don't show button for past sessions
  if (hoursUntil < 0) {
    return null
  }

  // Calculate remaining hours for tooltip
  const hoursRemaining = Math.max(0, Math.floor(hoursUntil))

  return (
    <>
      {canCancel ? (
        // Enabled button - opens modal
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className={className}
          data-testid="cancel_session_button"
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      ) : (
        // Disabled button with tooltip
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className={className}
                  data-testid="cancel_session_button_disabled"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">
                No es posible cancelar con menos de 24h de anticipacion.
                {hoursRemaining > 0 && (
                  <span className="block text-muted-foreground">
                    Faltan {hoursRemaining}h para la sesion.
                  </span>
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <CancelSessionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        bookingId={bookingId}
        participantName={participantName}
        sessionDate={sessionDate}
        onCancelSuccess={onCancelSuccess}
      />
    </>
  )
}
