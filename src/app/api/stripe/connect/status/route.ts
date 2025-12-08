/**
 * GET /api/stripe/connect/status
 * MYM-25: Get Stripe Connect account status for the authenticated mentor
 */

import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import type { StripeConnectStatus, StripeConnectStatusResponse, PaymentAPIError } from '@/types/payments'

export async function GET(): Promise<NextResponse<StripeConnectStatusResponse | PaymentAPIError>> {
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
      .select('role')
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
        { error: 'Only mentors can access this endpoint' },
        { status: 403 }
      )
    }

    // Get Stripe Connect account status
    const { data: stripeAccount, error: stripeError } = await supabase
      .from('stripe_accounts')
      .select('*')
      .eq('mentor_id', user.id)
      .single()

    // No account found - return not connected status
    if (stripeError || !stripeAccount) {
      const status: StripeConnectStatus = {
        connected: false,
        stripe_account_id: null,
        onboarding_complete: false,
        charges_enabled: false,
        payouts_enabled: false,
      }

      return NextResponse.json({ status })
    }

    // Return account status
    const status: StripeConnectStatus = {
      connected: true,
      stripe_account_id: stripeAccount.stripe_account_id,
      onboarding_complete: stripeAccount.onboarding_complete ?? false,
      charges_enabled: stripeAccount.charges_enabled ?? false,
      payouts_enabled: stripeAccount.payouts_enabled ?? false,
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error('[Stripe Connect Status] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
