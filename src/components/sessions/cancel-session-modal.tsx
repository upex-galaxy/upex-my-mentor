'use client'

/**
 * MYM-31: Cancel Session Modal Component
 *
 * Confirmation dialog for session cancellation with:
 * - Session details display
 * - Warning about irreversibility
 * - Refund information
 * - Loading state during API call
 * - Toast notifications for success/error
 */

import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatSessionDateShortInTimezone } from '@/lib/date-utils'
import { useTimezone } from '@/hooks/use-timezone'
import type { CancelSessionResponse } from '@/types/sessions'

interface CancelSessionModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void
  /** Booking ID to cancel */
  bookingId: string
  /** Name of the other participant (mentor or student) */
  participantName: string
  /** Session date in ISO format */
  sessionDate: string
  /** Callback when cancellation succeeds */
  onCancelSuccess?: () => void
}

export function CancelSessionModal({
  open,
  onOpenChange,
  bookingId,
  participantName,
  sessionDate,
  onCancelSuccess,
}: CancelSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { timezone } = useTimezone()

  const formattedDate = timezone
    ? formatSessionDateShortInTimezone(sessionDate, timezone)
    : new Date(sessionDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

  async function handleCancel() {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data: CancelSessionResponse = await response.json()

      if (data.success) {
        toast({
          title: 'Sesión cancelada',
          description: data.message,
          variant: 'default',
        })
        onOpenChange(false)
        onCancelSuccess?.()
      } else {
        // Handle specific error codes
        let errorMessage = data.message

        switch (data.error) {
          case 'CANCELLATION_WINDOW_CLOSED':
            errorMessage = 'No es posible cancelar con menos de 24 horas de anticipación.'
            break
          case 'SESSION_ALREADY_CANCELLED':
            errorMessage = 'Esta sesión ya ha sido cancelada.'
            break
          case 'REFUND_FAILED':
            errorMessage = 'Error al procesar el reembolso. Por favor, contacta a soporte.'
            break
        }

        toast({
          title: 'Error al cancelar',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[CancelSessionModal] Error:', error)
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="cancel_session_modal">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Cancelar esta sesion?</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Esta accion no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session details */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-medium text-foreground">
              Sesion con {participantName}
            </p>
            <p className="text-sm text-muted-foreground">
              {formattedDate}
            </p>
          </div>

          {/* Refund info */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-green-600 font-medium">
              Recibiras un reembolso completo.
            </span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            data-testid="cancel_modal_back_button"
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
            data-testid="cancel_modal_confirm_button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Cancelar sesion'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
