/**
 * Checkout Resume Page
 *
 * Redirects users from session dashboard to the checkout page
 * for completing payment on a pending booking.
 */

import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CheckoutResumePageProps {
  searchParams: Promise<{ booking_id?: string }>
}

export default async function CheckoutResumePage({ searchParams }: CheckoutResumePageProps) {
  const { booking_id } = await searchParams

  if (!booking_id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Enlace inválido</h1>
          <p className="text-muted-foreground">
            No se proporcionó un ID de reserva válido.
          </p>
          <Button asChild>
            <Link href="/dashboard/sessions">Ir a Mis Sesiones</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Verify the booking exists and belongs to the user
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/checkout/resume?booking_id=${booking_id}`)
  }

  // Verify the booking is pending payment
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, student_id, status')
    .eq('id', booking_id)
    .single()

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Reserva no encontrada</h1>
          <p className="text-muted-foreground">
            La reserva solicitada no existe.
          </p>
          <Button asChild>
            <Link href="/dashboard/sessions">Ir a Mis Sesiones</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (booking.student_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Acceso denegado</h1>
          <p className="text-muted-foreground">
            No tienes permiso para acceder a esta reserva.
          </p>
          <Button asChild>
            <Link href="/dashboard/sessions">Ir a Mis Sesiones</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (booking.status !== 'pending_payment') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold">Pago no disponible</h1>
          <p className="text-muted-foreground">
            Esta reserva no requiere pago. Estado actual: {booking.status}
          </p>
          <Button asChild>
            <Link href="/dashboard/sessions">Ir a Mis Sesiones</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Redirect to the checkout page
  redirect(`/checkout/${booking_id}`)
}
