/**
 * Checkout Success Page
 * MYM-24: Display payment confirmation after successful Stripe Checkout
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import { CHECKOUT_MESSAGES } from '@/types/payments'

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id } = await searchParams
  const supabase = await createServer()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Try to find the most recent confirmed booking for this user
  // The webhook should have already updated the booking status
  const { data: recentBooking } = await supabase
    .from('bookings')
    .select(`
      id,
      session_date,
      duration_minutes,
      status,
      mentor:profiles!bookings_mentor_id_fkey (
        id,
        name
      )
    `)
    .eq('student_id', user.id)
    .eq('status', 'confirmed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const mentor = recentBooking?.mentor as unknown as { id: string; name: string | null } | null
  const mentorName = mentor?.name || 'your mentor'

  // Format session date if available
  let sessionDateFormatted = ''
  let sessionTimeFormatted = ''
  if (recentBooking?.session_date) {
    const date = new Date(recentBooking.session_date)
    sessionDateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    sessionTimeFormatted = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card data-testid="checkoutSuccessCard" className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl" data-testid="success_title">
            {CHECKOUT_MESSAGES.success.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground" data-testid="success_message">
            {CHECKOUT_MESSAGES.success.message}
          </p>

          {recentBooking && (
            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
              <p className="font-medium">Session with {mentorName}</p>
              {sessionDateFormatted && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{sessionDateFormatted} at {sessionTimeFormatted}</span>
                </div>
              )}
              {recentBooking.duration_minutes && (
                <p className="text-sm text-muted-foreground">
                  {recentBooking.duration_minutes} minutes
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button asChild data-testid="go_to_sessions_button">
              <Link href="/dashboard">
                Go to My Sessions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" data-testid="browse_mentors_button">
              <Link href="/mentors">
                Browse More Mentors
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
