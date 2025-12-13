'use client'

/**
 * BookingSummary Component - MYM-21
 *
 * Displays a summary of the booking before proceeding to payment.
 * Shows mentor info, selected time, and total cost.
 */

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, CreditCard, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { BookingSummaryProps } from '@/types/scheduling'

/**
 * Pre-checkout summary card
 *
 * @example
 * ```tsx
 * <BookingSummary
 *   mentor={{ id: '1', name: 'Carlos', photoUrl: '...' }}
 *   selectedSlot={slot}
 *   totalCost={100}
 *   isSubmitting={false}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function BookingSummary({
  mentor,
  selectedSlot,
  totalCost,
  isSubmitting,
  onConfirm,
  onCancel,
}: BookingSummaryProps) {
  const formattedDate = format(selectedSlot.datetime, "EEEE, d 'de' MMMM", {
    locale: es,
  })

  return (
    <Card
      data-testid="booking_summary"
      className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Resumen de tu sesión
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mentor Info */}
        <div className="flex items-center gap-3">
          {mentor.photoUrl ? (
            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary/20">
              <Image
                src={mentor.photoUrl}
                alt={mentor.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-bold">
              {mentor.name.charAt(0)}
            </div>
          )}
          <div>
            <p data-testid="mentor_name" className="font-semibold">
              {mentor.name}
            </p>
            <Badge variant="secondary" className="text-xs">
              Mentor verificado
            </Badge>
          </div>
        </div>

        {/* Session Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span data-testid="session_date" className="capitalize">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span data-testid="session_time">
              {selectedSlot.displayTime}
            </span>
            <span className="text-muted-foreground">• 1 hora</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-muted-foreground">Total a pagar</span>
          <span data-testid="total_cost" className="text-2xl font-bold text-primary">
            ${totalCost.toFixed(2)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
          data-testid="cancel_button"
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1"
          data-testid="confirm_button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            'Confirmar y Pagar'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
