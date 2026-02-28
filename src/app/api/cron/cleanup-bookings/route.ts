/**
 * Cron Job: Cleanup Abandoned Bookings
 *
 * This endpoint is triggered by Vercel Cron to clean up abandoned bookings.
 * It runs hourly and cancels bookings in `pending_payment` status that:
 * - Were created more than 24 hours ago, OR
 * - Have a session_date that has already passed
 *
 * Security: Requires CRON_SECRET authorization header
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

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

interface CleanupResult {
  id: string
  reason: 'expired_24h' | 'session_passed'
  created_at: string
  session_date: string
}

interface CleanupSummary {
  started_at: string
  completed_at: string
  total_cleaned: number
  expired_24h_count: number
  session_passed_count: number
  results: CleanupResult[]
  errors: string[]
}

/**
 * POST /api/cron/cleanup-bookings
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
      console.error('[CronCleanup] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CronCleanup] Unauthorized request attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  const summary: CleanupSummary = {
    started_at: new Date().toISOString(),
    completed_at: '',
    total_cleaned: 0,
    expired_24h_count: 0,
    session_passed_count: 0,
    results: [],
    errors: [],
  }

  try {
    console.log('[CronCleanup] Starting booking cleanup job')

    const supabase = getServiceClient()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find all pending_payment bookings
    const { data: pendingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, created_at, session_date')
      .eq('status', 'pending_payment')

    if (fetchError) {
      console.error('[CronCleanup] Error fetching bookings:', fetchError)
      summary.errors.push(`Fetch error: ${fetchError.message}`)
      summary.completed_at = new Date().toISOString()
      return NextResponse.json({ success: false, summary }, { status: 500 })
    }

    if (!pendingBookings || pendingBookings.length === 0) {
      console.log('[CronCleanup] No pending bookings to clean up')
      summary.completed_at = new Date().toISOString()
      return NextResponse.json({ success: true, summary })
    }

    console.log(`[CronCleanup] Found ${pendingBookings.length} pending bookings to evaluate`)

    // Categorize bookings to clean up
    const toCancel: { id: string; reason: 'expired_24h' | 'session_passed' }[] = []

    for (const booking of pendingBookings) {
      // Skip bookings without valid dates
      if (!booking.created_at) continue

      const createdAt = new Date(booking.created_at)
      const sessionDate = new Date(booking.session_date)

      // Check if session date has passed
      if (sessionDate < now) {
        toCancel.push({ id: booking.id, reason: 'session_passed' })
        summary.session_passed_count++
        summary.results.push({
          id: booking.id,
          reason: 'session_passed',
          created_at: booking.created_at,
          session_date: booking.session_date,
        })
      }
      // Check if created more than 24 hours ago
      else if (createdAt < twentyFourHoursAgo) {
        toCancel.push({ id: booking.id, reason: 'expired_24h' })
        summary.expired_24h_count++
        summary.results.push({
          id: booking.id,
          reason: 'expired_24h',
          created_at: booking.created_at,
          session_date: booking.session_date,
        })
      }
    }

    if (toCancel.length === 0) {
      console.log('[CronCleanup] No bookings require cleanup')
      summary.completed_at = new Date().toISOString()
      return NextResponse.json({ success: true, summary })
    }

    console.log(`[CronCleanup] Cancelling ${toCancel.length} bookings`)

    // Cancel the bookings
    const idsToCancel = toCancel.map(b => b.id)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        notes: 'Auto-cancelled: payment not completed within time limit',
      })
      .in('id', idsToCancel)

    if (updateError) {
      console.error('[CronCleanup] Error cancelling bookings:', updateError)
      summary.errors.push(`Update error: ${updateError.message}`)
      summary.completed_at = new Date().toISOString()
      return NextResponse.json({ success: false, summary }, { status: 500 })
    }

    summary.total_cleaned = toCancel.length
    summary.completed_at = new Date().toISOString()

    console.log('[CronCleanup] Job completed:', {
      total: summary.total_cleaned,
      expired_24h: summary.expired_24h_count,
      session_passed: summary.session_passed_count,
    })

    return NextResponse.json({
      success: true,
      summary: {
        started_at: summary.started_at,
        completed_at: summary.completed_at,
        total_cleaned: summary.total_cleaned,
        expired_24h_count: summary.expired_24h_count,
        session_passed_count: summary.session_passed_count,
      },
      // Include detailed results in dev for debugging
      ...(isDev && { results: summary.results }),
    })
  } catch (error) {
    console.error('[CronCleanup] Job failed:', error)

    summary.completed_at = new Date().toISOString()
    summary.errors.push(error instanceof Error ? error.message : 'Unknown error')

    return NextResponse.json(
      {
        success: false,
        error: 'Booking cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        summary,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/cleanup-bookings
 *
 * Health check endpoint for the cron job
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    job: 'cleanup-bookings',
    schedule: '0 * * * *', // Hourly
    description: 'Cancels pending_payment bookings older than 24h or with passed session dates',
  })
}
