import { NextRequest, NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/urls'

/**
 * Test endpoint for QA to trigger booking confirmation emails
 *
 * ONLY available in non-production environments
 *
 * Usage:
 * POST /api/testing/trigger-confirmation
 * Body: { "bookingId": "uuid" }
 * Headers: { "X-API-Key": "dev-api-key" }
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const API_KEY = process.env.EMAIL_API_KEY || 'dev-api-key'

interface TriggerRequest {
  bookingId: string
}

interface TriggerResponse {
  success: boolean
  message?: string
  error?: string
  result?: unknown
}

export async function POST(request: NextRequest): Promise<NextResponse<TriggerResponse>> {
  // Block in production
  if (IS_PRODUCTION) {
    return NextResponse.json(
      { success: false, error: 'This endpoint is not available in production' },
      { status: 403 }
    )
  }

  // Validate API key
  const apiKey = request.headers.get('X-API-Key')
  if (apiKey !== API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Parse request body
  let body: TriggerRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { bookingId } = body

  if (!bookingId || typeof bookingId !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid bookingId' },
      { status: 400 }
    )
  }

  // Call the main booking confirmation endpoint
  const baseUrl = getBaseUrl()
  const confirmationUrl = `${baseUrl}/api/email/booking-confirmation`

  try {
    const response = await fetch(confirmationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ bookingId }),
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Confirmation endpoint returned ${response.status}`,
          result,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Confirmation emails triggered for booking ${bookingId}`,
      result,
    })
  } catch (error) {
    console.error('[Test Endpoint] Failed to trigger confirmation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to trigger confirmation emails' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for simple health check and usage info
 */
export async function GET(): Promise<NextResponse<TriggerResponse>> {
  if (IS_PRODUCTION) {
    return NextResponse.json(
      { success: false, error: 'This endpoint is not available in production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Test endpoint for triggering booking confirmation emails',
    result: {
      usage: {
        method: 'POST',
        headers: { 'X-API-Key': 'your-api-key' },
        body: { bookingId: 'booking-uuid' },
      },
      note: 'This endpoint is only available in development/staging environments',
    },
  })
}
