/**
 * Payout Service
 * MYM-27: Automated payout processing for mentors
 *
 * This service handles:
 * - Finding eligible sessions for payout (>24h after completion)
 * - Processing Stripe Transfers to mentor Connect accounts
 * - Recording payouts and handling failures
 */

import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/server'
import type { Database } from '@/types/supabase'
import type {
  EligiblePayout,
  PayoutProcessResult,
  PayoutJobSummary,
  PayoutFailureReason,
  PayoutInsert,
  PayoutItemInsert,
  FailedPayoutInsert,
} from '@/types/payments'

// Service role client for cron job (bypasses RLS)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Find all bookings eligible for payout
 *
 * Criteria:
 * - booking.status = 'completed'
 * - booking.completed_at < NOW() - 24 hours
 * - transaction exists with status = 'succeeded'
 * - transaction NOT in payout_items (prevents duplicates)
 * - mentor has stripe_account with payouts_enabled = true
 */
export async function findEligiblePayouts(): Promise<EligiblePayout[]> {
  const supabase = getServiceClient()

  // Calculate 24 hours ago
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Query for eligible payouts
  // We need to join bookings -> transactions -> stripe_accounts
  // and exclude transactions already in payout_items
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      mentor_id,
      completed_at,
      transactions!inner (
        id,
        net_amount,
        status
      ),
      profiles!bookings_mentor_id_fkey (
        stripe_accounts (
          stripe_account_id,
          payouts_enabled
        )
      )
    `)
    .eq('status', 'completed')
    .lt('completed_at', twentyFourHoursAgo)
    .eq('transactions.status', 'succeeded')
    .not('completed_at', 'is', null)

  if (error) {
    console.error('[PayoutService] Error finding eligible payouts:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return []
  }

  // Get all transaction IDs that are already paid out
  const transactionIds = data
    .map((b) => (b.transactions as unknown as { id: string }[])?.[0]?.id)
    .filter(Boolean)

  const { data: existingPayoutItems } = await supabase
    .from('payout_items')
    .select('transaction_id')
    .in('transaction_id', transactionIds)

  const paidOutTransactionIds = new Set(
    existingPayoutItems?.map((pi) => pi.transaction_id) ?? []
  )

  // Filter and transform to EligiblePayout
  const eligible: EligiblePayout[] = []

  for (const booking of data) {
    const transaction = (booking.transactions as unknown as { id: string; net_amount: number; status: string }[])?.[0]

    if (!transaction) continue

    // Skip if already paid out
    if (paidOutTransactionIds.has(transaction.id)) continue

    // Get stripe account info
    const profile = booking.profiles as unknown as {
      stripe_accounts: { stripe_account_id: string; payouts_enabled: boolean | null }[] | null
    } | null

    const stripeAccount = profile?.stripe_accounts?.[0]

    if (!stripeAccount) {
      // No Stripe account - will be handled as failure
      eligible.push({
        booking_id: booking.id,
        transaction_id: transaction.id,
        mentor_id: booking.mentor_id,
        net_amount: transaction.net_amount,
        stripe_account_id: '',
        payouts_enabled: false,
      })
      continue
    }

    eligible.push({
      booking_id: booking.id,
      transaction_id: transaction.id,
      mentor_id: booking.mentor_id,
      net_amount: transaction.net_amount,
      stripe_account_id: stripeAccount.stripe_account_id,
      payouts_enabled: stripeAccount.payouts_enabled ?? false,
    })
  }

  return eligible
}

/**
 * Process a single payout
 *
 * Steps:
 * 1. Validate mentor can receive payouts
 * 2. Create Stripe Transfer
 * 3. Create payout record in DB
 * 4. Create payout_item linking payout to transaction
 */
export async function processPayout(
  eligible: EligiblePayout
): Promise<PayoutProcessResult> {
  const supabase = getServiceClient()

  // Skip zero amount transactions
  if (eligible.net_amount <= 0) {
    console.log(`[PayoutService] Skipping zero amount for booking ${eligible.booking_id}`)
    return {
      booking_id: eligible.booking_id,
      success: false,
      error: 'ZERO_AMOUNT',
      error_details: 'Transaction has zero or negative net amount',
    }
  }

  // Check if mentor has valid Stripe account
  if (!eligible.stripe_account_id) {
    await recordFailedPayout(supabase, eligible, 'MENTOR_ACCOUNT_NOT_FOUND')
    return {
      booking_id: eligible.booking_id,
      success: false,
      error: 'MENTOR_ACCOUNT_NOT_FOUND',
      error_details: 'Mentor does not have a connected Stripe account',
    }
  }

  // Check if payouts are enabled
  if (!eligible.payouts_enabled) {
    await recordFailedPayout(supabase, eligible, 'MENTOR_ACCOUNT_RESTRICTED')
    return {
      booking_id: eligible.booking_id,
      success: false,
      error: 'MENTOR_ACCOUNT_RESTRICTED',
      error_details: 'Mentor Stripe account cannot receive payouts',
    }
  }

  try {
    // Create Stripe Transfer
    // Amount in cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(eligible.net_amount * 100)

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: eligible.stripe_account_id,
      metadata: {
        booking_id: eligible.booking_id,
        transaction_id: eligible.transaction_id,
        mentor_id: eligible.mentor_id,
      },
    })

    // Create payout record
    const payoutData: PayoutInsert = {
      mentor_id: eligible.mentor_id,
      stripe_transfer_id: transfer.id,
      amount: eligible.net_amount,
      currency: 'usd',
      status: 'pending', // Will be updated by webhook when funds arrive
      processed_at: new Date().toISOString(),
    }

    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert(payoutData)
      .select('id')
      .single()

    if (payoutError) {
      console.error('[PayoutService] Error creating payout record:', payoutError)
      // Transfer was created but DB record failed - log for reconciliation
      return {
        booking_id: eligible.booking_id,
        success: true, // Transfer succeeded
        stripe_transfer_id: transfer.id,
        error_details: 'Transfer succeeded but failed to create DB record',
      }
    }

    // Create payout_item linking payout to transaction
    const payoutItemData: PayoutItemInsert = {
      payout_id: payout.id,
      transaction_id: eligible.transaction_id,
    }

    const { error: itemError } = await supabase
      .from('payout_items')
      .insert(payoutItemData)

    if (itemError) {
      console.error('[PayoutService] Error creating payout_item:', itemError)
      // Payout record exists, item failed - this is a data consistency issue
      // But the payout was processed, so return success
    }

    console.log(
      `[PayoutService] Payout processed: ${payout.id} for booking ${eligible.booking_id} - $${eligible.net_amount}`
    )

    return {
      booking_id: eligible.booking_id,
      success: true,
      payout_id: payout.id,
      stripe_transfer_id: transfer.id,
    }
  } catch (stripeError) {
    console.error('[PayoutService] Stripe Transfer failed:', stripeError)

    await recordFailedPayout(
      supabase,
      eligible,
      'STRIPE_API_ERROR',
      stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
    )

    return {
      booking_id: eligible.booking_id,
      success: false,
      error: 'STRIPE_API_ERROR',
      error_details: stripeError instanceof Error ? stripeError.message : 'Unknown error',
    }
  }
}

/**
 * Record a failed payout attempt for admin review
 */
async function recordFailedPayout(
  supabase: ReturnType<typeof getServiceClient>,
  eligible: EligiblePayout,
  reason: PayoutFailureReason,
  details?: string
): Promise<void> {
  const failedPayoutData: FailedPayoutInsert = {
    booking_id: eligible.booking_id,
    transaction_id: eligible.transaction_id,
    mentor_id: eligible.mentor_id,
    reason,
    error_details: details ? { message: details } : null,
  }

  const { error } = await supabase.from('failed_payouts').insert(failedPayoutData)

  if (error) {
    console.error('[PayoutService] Error recording failed payout:', error)
  }
}

/**
 * Main entry point for the payout cron job
 *
 * - Finds all eligible payouts
 * - Processes each independently (one failure doesn't stop others)
 * - Returns summary of results
 */
export async function processPayouts(): Promise<PayoutJobSummary> {
  const startedAt = new Date().toISOString()

  console.log(`[PayoutService] Starting payout job at ${startedAt}`)

  // Find eligible payouts
  let eligiblePayouts: EligiblePayout[]
  try {
    eligiblePayouts = await findEligiblePayouts()
  } catch (error) {
    console.error('[PayoutService] Failed to find eligible payouts:', error)
    return {
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      eligible_count: 0,
      processed_count: 0,
      success_count: 0,
      failed_count: 0,
      skipped_count: 0,
      results: [],
    }
  }

  console.log(`[PayoutService] Found ${eligiblePayouts.length} eligible payouts`)

  if (eligiblePayouts.length === 0) {
    return {
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      eligible_count: 0,
      processed_count: 0,
      success_count: 0,
      failed_count: 0,
      skipped_count: 0,
      results: [],
    }
  }

  // Process each payout independently
  // Limit to 50 per run to avoid timeouts
  const MAX_PAYOUTS_PER_RUN = 50
  const payoutsToProcess = eligiblePayouts.slice(0, MAX_PAYOUTS_PER_RUN)
  const skippedCount = Math.max(0, eligiblePayouts.length - MAX_PAYOUTS_PER_RUN)

  const results: PayoutProcessResult[] = []
  let successCount = 0
  let failedCount = 0

  for (const eligible of payoutsToProcess) {
    const result = await processPayout(eligible)
    results.push(result)

    if (result.success) {
      successCount++
    } else {
      failedCount++
    }
  }

  const completedAt = new Date().toISOString()

  console.log(
    `[PayoutService] Job completed: ${successCount} success, ${failedCount} failed, ${skippedCount} skipped`
  )

  return {
    started_at: startedAt,
    completed_at: completedAt,
    eligible_count: eligiblePayouts.length,
    processed_count: payoutsToProcess.length,
    success_count: successCount,
    failed_count: failedCount,
    skipped_count: skippedCount,
    results,
  }
}
