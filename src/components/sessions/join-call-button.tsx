'use client'

/**
 * MYM-30: Join Video Call Button
 *
 * A button component that allows users to join their session's video call.
 * The button state changes based on the session timing:
 * - Disabled (outline): More than 15 minutes before session
 * - Active (primary): Within join window (15 min before to 1h after end)
 * - Hidden: Session has expired
 */

import { useState, useEffect, useCallback } from 'react'
import { Video, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  isWithinJoinWindow,
  isSessionExpired,
  canJoinNow,
  getTimeUntilJoinable,
} from '@/lib/date-utils'
import { cn } from '@/lib/utils'

export interface JoinCallButtonProps {
  /** The booking ID to fetch the video link */
  bookingId: string
  /** The session start date/time */
  sessionDate: Date | string
  /** Session duration in minutes */
  durationMinutes: number
  /** Pre-fetched video call URL (optional, for optimistic UI) */
  videocallUrl?: string | null
  /** Additional CSS classes */
  className?: string
}

export function JoinCallButton({
  bookingId,
  sessionDate,
  durationMinutes,
  videocallUrl,
  className,
}: JoinCallButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // Update time every minute for UI reactivity
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [])

  // Calculate button state based on current time
  const expired = isSessionExpired(sessionDate, durationMinutes)
  const canJoin = canJoinNow(sessionDate)
  const inWindow = isWithinJoinWindow(sessionDate, durationMinutes)
  const timeUntilJoin = getTimeUntilJoinable(sessionDate)
  const hasLink = Boolean(videocallUrl)

  // Handle click - validate via API and open in new tab
  const handleJoinClick = useCallback(async () => {
    if (!canJoin || isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/video-link`)
      const data = await response.json()

      if (data.success) {
        // Open video call in new tab
        window.open(data.url, '_blank', 'noopener,noreferrer')
        toast.success('Abriendo videollamada...')
      } else {
        // Handle specific error codes
        switch (data.error) {
          case 'TOO_EARLY_TO_JOIN':
            toast.error('Aún es muy temprano para unirse', {
              description: 'Podrás acceder 15 minutos antes de la sesión.',
            })
            break
          case 'SESSION_EXPIRED':
            toast.error('Esta sesión ya finalizó')
            break
          case 'NOT_A_PARTICIPANT':
            toast.error('No tienes acceso a esta sesión')
            break
          case 'LINK_NOT_AVAILABLE':
            toast.error('Enlace no disponible', {
              description: 'Por favor, contacta a soporte.',
            })
            break
          default:
            toast.error(data.message || 'Error al obtener el enlace')
        }
      }
    } catch (error) {
      console.error('[JoinCallButton] Error:', error)
      toast.error('Error de conexión', {
        description: 'Por favor, intenta de nuevo.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [bookingId, canJoin, isLoading])

  // Don't render if session has expired
  if (expired) {
    return null
  }

  // Render disabled state (too early to join)
  if (!canJoin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn('inline-block', className)}>
              <Button
                variant="outline"
                disabled
                data-testid="join_call_button_disabled"
                className="cursor-not-allowed"
              >
                <Video className="h-4 w-4 mr-2" />
                Unirse a la Llamada
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disponible {timeUntilJoin}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Render error state (no video link available)
  if (!hasLink && inWindow) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn('inline-block', className)}>
              <Button
                variant="outline"
                disabled
                data-testid="join_call_button_error"
                className="cursor-not-allowed border-destructive text-destructive"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Enlace no disponible
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Contacta a soporte para obtener el enlace</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Render active state (can join now)
  return (
    <Button
      onClick={handleJoinClick}
      disabled={isLoading}
      data-testid="join_call_button"
      className={cn(
        'transition-all duration-200',
        inWindow && 'shadow-md hover:shadow-lg',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Video className="h-4 w-4 mr-2" />
          Unirse a la Llamada
        </>
      )}
    </Button>
  )
}
