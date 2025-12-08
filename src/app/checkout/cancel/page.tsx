/**
 * Checkout Cancel Page
 * MYM-24: Display cancellation message when user exits Stripe Checkout
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft } from 'lucide-react'
import { CHECKOUT_MESSAGES } from '@/types/payments'

interface CheckoutCancelPageProps {
  searchParams: Promise<{ booking_id?: string }>
}

export default async function CheckoutCancelPage({ searchParams }: CheckoutCancelPageProps) {
  const { booking_id } = await searchParams
  const supabase = await createServer()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check if booking still exists and is still pending
  let canRetry = false
  if (booking_id) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', booking_id)
      .eq('student_id', user.id)
      .single()

    canRetry = booking?.status === 'pending_payment'
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card data-testid="checkoutCancelCard" className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <XCircle className="h-10 w-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl" data-testid="cancel_title">
            {CHECKOUT_MESSAGES.cancel.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground" data-testid="cancel_message">
            {CHECKOUT_MESSAGES.cancel.message}
          </p>

          <div className="flex flex-col gap-3 pt-4">
            {canRetry && booking_id && (
              <Button asChild data-testid="retry_button">
                <Link href={`/checkout/${booking_id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
            )}
            <Button asChild variant={canRetry ? 'ghost' : 'default'} data-testid="browse_mentors_button">
              <Link href="/mentors">
                Browse Mentors
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
