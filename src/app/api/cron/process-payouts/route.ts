/**
 * Cron Job: Process Payouts
 * MYM-27: Automated payout processing endpoint
 *
 * This endpoint is triggered by Vercel Cron to process mentor payouts.
 * It runs hourly and processes sessions completed more than 24 hours ago.
 *
 * Security: Requires CRON_SECRET authorization header
 */

import { NextRequest, NextResponse } from 'next/server'
import { processPayouts } from '@/lib/payments/payout-service'

/**
 * POST /api/cron/process-payouts
 *
 * Triggered by Vercel Cron scheduler (hourly)
 * Can also be triggered manually for testing (with CRON_SECRET)
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In development, allow requests without secret
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    if (!cronSecret) {
      console.error('[CronPayouts] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CronPayouts] Unauthorized request attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  try {
    console.log('[CronPayouts] Starting payout processing job')

    const summary = await processPayouts()

    console.log('[CronPayouts] Job completed:', {
      eligible: summary.eligible_count,
      processed: summary.processed_count,
      success: summary.success_count,
      failed: summary.failed_count,
    })

    return NextResponse.json({
      success: true,
      summary: {
        started_at: summary.started_at,
        completed_at: summary.completed_at,
        eligible_count: summary.eligible_count,
        processed_count: summary.processed_count,
        success_count: summary.success_count,
        failed_count: summary.failed_count,
        skipped_count: summary.skipped_count,
      },
      // Include detailed results in dev for debugging
      ...(isDev && { results: summary.results }),
    })
  } catch (error) {
    console.error('[CronPayouts] Job failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Payout processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/process-payouts
 *
 * Health check endpoint for the cron job
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    job: 'process-payouts',
    schedule: '0 * * * *', // Every hour
    description: 'Processes mentor payouts for completed sessions (24h+ ago)',
  })
}
