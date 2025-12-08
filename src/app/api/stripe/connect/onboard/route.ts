/**
 * POST /api/stripe/connect/onboard
 * MYM-25: Start Stripe Connect onboarding for a mentor
 *
 * Creates a Stripe Express account if needed and returns an Account Link
 * for the mentor to complete their onboarding.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServer } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import type { Database } from '@/types/supabase'
import type { StripeConnectOnboardResponse, PaymentAPIError } from '@/types/payments'

// Service role client for writing to stripe_accounts (bypasses RLS)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(): Promise<NextResponse<StripeConnectOnboardResponse | PaymentAPIError>> {
  try {
    const supabase = await createServer()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to verify they're a mentor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Only mentors can connect bank accounts' },
        { status: 403 }
      )
    }

    // Check if mentor already has a Stripe account
    const { data: existingAccount } = await supabase
      .from('stripe_accounts')
      .select('*')
      .eq('mentor_id', user.id)
      .single()

    let stripeAccountId: string

    if (existingAccount) {
      // Account exists - check if already fully connected
      if (existingAccount.payouts_enabled) {
        return NextResponse.json(
          { error: 'Your account is already connected for payouts' },
          { status: 400 }
        )
      }

      // Use existing account ID for new onboarding link
      stripeAccountId = existingAccount.stripe_account_id
    } else {
      // Create new Stripe Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // MVP: US only per CEO decision
        email: profile.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          mentor_id: user.id,
          platform: 'upex-my-mentor',
        },
      })

      stripeAccountId = account.id

      // Store account in database
      const { error: insertError } = await supabaseAdmin
        .from('stripe_accounts')
        .insert({
          mentor_id: user.id,
          stripe_account_id: stripeAccountId,
          onboarding_complete: false,
          charges_enabled: false,
          payouts_enabled: false,
        })

      if (insertError) {
        console.error('[Stripe Connect Onboard] Failed to save account:', insertError)
        // Continue anyway - we have the Stripe account, we can sync later
      }
    }

    // Generate Account Link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard/payouts?stripe_onboarding=refresh`,
      return_url: `${baseUrl}/dashboard/payouts?stripe_onboarding=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      onboarding_url: accountLink.url,
    })
  } catch (error) {
    console.error('[Stripe Connect Onboard] Error:', error)

    // Handle specific Stripe errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        { error: 'Failed to create Stripe account. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
