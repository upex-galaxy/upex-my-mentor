/**
 * POST /api/checkout/session
 * MYM-24: Create Stripe Checkout Session for booking payment
 *
 * Creates a Stripe Checkout Session that:
 * - Links to a specific booking
 * - Transfers 80% to mentor's Stripe Connect account
 * - Keeps 20% as platform fee
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { getBaseUrl } from '@/lib/urls'
import type { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, PaymentAPIError } from '@/types/payments'

// Platform fee percentage (20%)
const PLATFORM_FEE_PERCENTAGE = 0.20

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreateCheckoutSessionRequest = await request.json()
    const { booking_id } = body

    if (!booking_id) {
      return NextResponse.json(
        { error: 'booking_id is required' } as PaymentAPIError,
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' } as PaymentAPIError,
        { status: 401 }
      )
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
          email,
          hourly_rate
        )
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('[Checkout] Booking not found:', bookingError)
      return NextResponse.json(
        { error: 'Booking not found' } as PaymentAPIError,
        { status: 404 }
      )
    }

    // Verify user is the student (mentee) of this booking
    if (booking.student_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to pay for this booking' } as PaymentAPIError,
        { status: 403 }
      )
    }

    // Verify booking is in pending_payment status
    if (booking.status !== 'pending_payment') {
      return NextResponse.json(
        { error: `Booking is not awaiting payment. Current status: ${booking.status}` } as PaymentAPIError,
        { status: 400 }
      )
    }

    // Get mentor's Stripe Connect account
    const { data: stripeAccount, error: stripeAccountError } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id, payouts_enabled')
      .eq('mentor_id', booking.mentor_id)
      .single()

    if (stripeAccountError || !stripeAccount) {
      console.error('[Checkout] Mentor Stripe account not found:', stripeAccountError)
      return NextResponse.json(
        { error: 'Mentor has not connected a payment account' } as PaymentAPIError,
        { status: 400 }
      )
    }

    if (!stripeAccount.payouts_enabled) {
      return NextResponse.json(
        { error: 'Mentor payment account is not fully verified' } as PaymentAPIError,
        { status: 400 }
      )
    }

    // Calculate amounts (in cents for Stripe)
    const grossAmountCents = Math.round(booking.total_cost * 100)
    const platformFeeCents = Math.round(grossAmountCents * PLATFORM_FEE_PERCENTAGE)

    // Format session date for display
    const sessionDate = new Date(booking.session_date)
    const dateFormatted = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const timeFormatted = sessionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Get mentor info (handle the type properly)
    const mentor = booking.mentor as unknown as { id: string; name: string | null; email: string }
    const mentorName = mentor?.name || 'Mentor'

    // Build success and cancel URLs
    const baseUrl = getBaseUrl()
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/checkout/cancel?booking_id=${booking_id}`

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: grossAmountCents,
            product_data: {
              name: `Mentoring Session with ${mentorName}`,
              description: `${booking.duration_minutes} minute session on ${dateFormatted} at ${timeFormatted}`,
            },
          },
          quantity: 1,
        },
      ],
      // Transfer to mentor's Connect account (minus platform fee)
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: stripeAccount.stripe_account_id,
        },
        metadata: {
          booking_id: booking.id,
          mentee_id: booking.student_id,
          mentor_id: booking.mentor_id,
        },
      },
      // Session metadata for webhook
      metadata: {
        booking_id: booking.id,
        mentee_id: booking.student_id,
        mentor_id: booking.mentor_id,
        gross_amount: booking.total_cost.toString(),
        platform_fee: (booking.total_cost * PLATFORM_FEE_PERCENTAGE).toFixed(2),
        net_amount: (booking.total_cost * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Pre-fill customer email
      customer_email: user.email,
      // Expire after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })

    console.log(`[Checkout] Session created: ${checkoutSession.id} for booking ${booking_id}`)

    const response: CreateCheckoutSessionResponse = {
      checkout_url: checkoutSession.url!,
      session_id: checkoutSession.id,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Checkout] Error creating session:', error)

    // Handle Stripe-specific errors
    if (error instanceof Error && 'type' in error) {
      return NextResponse.json(
        { error: 'Payment service error. Please try again.' } as PaymentAPIError,
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' } as PaymentAPIError,
      { status: 500 }
    )
  }
}
