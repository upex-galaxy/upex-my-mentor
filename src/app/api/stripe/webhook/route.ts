/**
 * POST /api/stripe/webhook
 * MYM-25: Handle Stripe webhooks for Connect events
 * MYM-24: Handle Stripe Checkout completion events
 *
 * This endpoint receives webhook events from Stripe and updates
 * the local database accordingly.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, verifyWebhookSignature } from '@/lib/stripe/server'
import type { Database } from '@/types/supabase'
import type Stripe from 'stripe'

// Service role client for updating stripe_accounts (bypasses RLS)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = verifyWebhookSignature(body, signature)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break

      // MYM-24: Payment checkout completed
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      // Future events for MYM-26, MYM-27:
      // case 'transfer.created':
      // case 'transfer.paid':

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle account.updated event
 * Updates the stripe_accounts table when a Connect account's status changes
 */
async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  console.log(`[Stripe Webhook] account.updated for ${account.id}`)

  // Get the mentor_id from metadata
  const mentorId = account.metadata?.mentor_id

  if (!mentorId) {
    console.warn(`[Stripe Webhook] No mentor_id in account metadata for ${account.id}`)
    // Try to find by stripe_account_id as fallback
    const { data: existingAccount, error: findError } = await supabaseAdmin
      .from('stripe_accounts')
      .select('mentor_id')
      .eq('stripe_account_id', account.id)
      .single()

    if (findError || !existingAccount) {
      console.error(`[Stripe Webhook] Could not find account ${account.id} in database`)
      return
    }
  }

  // Determine onboarding status
  const chargesEnabled = account.charges_enabled ?? false
  const payoutsEnabled = account.payouts_enabled ?? false
  const detailsSubmitted = account.details_submitted ?? false

  // Onboarding is complete when the account has submitted details
  // and has both charges and payouts enabled
  const onboardingComplete = detailsSubmitted && chargesEnabled && payoutsEnabled

  // Update the database
  const { error: updateError } = await supabaseAdmin
    .from('stripe_accounts')
    .update({
      onboarding_complete: onboardingComplete,
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', account.id)

  if (updateError) {
    console.error(`[Stripe Webhook] Failed to update account ${account.id}:`, updateError)
    throw updateError
  }

  console.log(`[Stripe Webhook] Updated account ${account.id}:`, {
    onboarding_complete: onboardingComplete,
    charges_enabled: chargesEnabled,
    payouts_enabled: payoutsEnabled,
  })
}

/**
 * MYM-24: Handle checkout.session.completed event
 * Creates transaction record and updates booking status to 'confirmed'
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`[Stripe Webhook] checkout.session.completed for ${session.id}`)

  // Extract metadata
  const { booking_id, mentee_id, mentor_id, gross_amount, platform_fee, net_amount } = session.metadata || {}

  if (!booking_id || !mentee_id || !mentor_id) {
    console.error('[Stripe Webhook] Missing required metadata in checkout session:', session.metadata)
    return
  }

  // Idempotency check: Skip if transaction already exists for this session
  const { data: existingTransaction } = await supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .single()

  if (existingTransaction) {
    console.log(`[Stripe Webhook] Transaction already exists for session ${session.id}, skipping`)
    return
  }

  // Get payment intent for additional details
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id || null

  // Create transaction record
  const { error: transactionError } = await supabaseAdmin
    .from('transactions')
    .insert({
      booking_id,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      mentee_id,
      mentor_id,
      gross_amount: parseFloat(gross_amount || '0'),
      platform_fee: parseFloat(platform_fee || '0'),
      net_amount: parseFloat(net_amount || '0'),
      currency: session.currency || 'usd',
      status: 'succeeded',
      payment_method: session.payment_method_types?.[0] || 'card',
      paid_at: new Date().toISOString(),
    })

  if (transactionError) {
    console.error(`[Stripe Webhook] Failed to create transaction for session ${session.id}:`, transactionError)
    throw transactionError
  }

  console.log(`[Stripe Webhook] Transaction created for session ${session.id}`)

  // Update booking status to 'confirmed'
  const { error: bookingError } = await supabaseAdmin
    .from('bookings')
    .update({
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking_id)

  if (bookingError) {
    console.error(`[Stripe Webhook] Failed to update booking ${booking_id}:`, bookingError)
    throw bookingError
  }

  console.log(`[Stripe Webhook] Booking ${booking_id} confirmed`)
}
