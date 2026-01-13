/**
 * Checkout Page
 * MYM-24: Display booking summary and initiate Stripe Checkout
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServer } from '@/lib/supabase/server'
import { BookingSummaryCard } from '@/components/checkout/booking-summary-card'
import { CheckoutButton } from '@/components/checkout/checkout-button'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { CHECKOUT_MESSAGES } from '@/types/payments'

// Platform fee percentage (20%)
const PLATFORM_FEE_PERCENTAGE = 0.20

interface CheckoutPageProps {
  params: Promise<{ bookingId: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { bookingId } = await params
  const supabase = await createServer()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/login?redirect=/checkout/${bookingId}`)
  }

  // Fetch booking with mentor details
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      id,
      student_id,
      mentor_id,
      session_date,
      duration_minutes,
      total_cost,
      status,
      mentor:profiles!bookings_mentor_id_fkey (
        id,
        name,
        email
      )
    `)
    .eq('id', bookingId)
    .single()

  // Handle booking not found
  if (bookingError || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Booking Not Found</h1>
          <p className="text-muted-foreground">{CHECKOUT_MESSAGES.error.booking_not_found}</p>
          <Button asChild>
            <Link href="/mentors">Browse Mentors</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Verify user is the student (mentee) of this booking
  if (booking.student_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You are not authorized to view this checkout.</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Check booking status
  if (booking.status !== 'pending_payment') {
    const isConfirmed = booking.status === 'confirmed'
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className={`h-12 w-12 mx-auto ${isConfirmed ? 'text-green-500' : 'text-destructive'}`} />
          <h1 className="text-2xl font-bold">
            {isConfirmed ? 'Already Paid' : 'Payment Not Available'}
          </h1>
          <p className="text-muted-foreground">
            {isConfirmed
              ? 'This session has already been paid for.'
              : CHECKOUT_MESSAGES.error.booking_not_pending
            }
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Check mentor has Stripe Connect
  const { data: stripeAccount } = await supabase
    .from('stripe_accounts')
    .select('payouts_enabled')
    .eq('mentor_id', booking.mentor_id)
    .single()

  if (!stripeAccount?.payouts_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h1 className="text-2xl font-bold">Payment Not Available</h1>
          <p className="text-muted-foreground">{CHECKOUT_MESSAGES.error.mentor_not_connected}</p>
          <Button asChild variant="outline">
            <Link href="/mentors">Browse Other Mentors</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get mentor info
  const mentor = booking.mentor as unknown as { id: string; name: string | null; email: string }
  const mentorName = mentor?.name || 'Mentor'
  const platformFee = booking.total_cost * PLATFORM_FEE_PERCENTAGE

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {/* Back link */}
        <Link
          href={`/mentors/${booking.mentor_id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to mentor profile
        </Link>

        {/* Page title */}
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        {/* Checkout content */}
        <div className="flex flex-col items-center space-y-6">
          <BookingSummaryCard
            mentorName={mentorName}
            sessionDate={booking.session_date}
            durationMinutes={booking.duration_minutes}
            totalCost={booking.total_cost}
            platformFee={platformFee}
          />

          <div className="w-full max-w-md">
            <CheckoutButton
              bookingId={booking.id}
              amount={booking.total_cost}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
