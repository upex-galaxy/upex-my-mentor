/**
 * POST /api/stripe/webhook
 * MYM-25: Handle Stripe webhooks for Connect events
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

      // Future events for MYM-24, MYM-26, MYM-27:
      // case 'checkout.session.completed':
      // case 'payment_intent.succeeded':
      // case 'transfer.created':

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
