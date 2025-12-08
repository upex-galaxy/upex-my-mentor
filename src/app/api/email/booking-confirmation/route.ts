import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import type { Database } from '@/types/supabase'
import type {
  BookingConfirmationRequest,
  BookingConfirmationResponse,
  BookingConfirmationData,
  EmailSendResult,
} from '@/types/scheduling'
import { generateCalendarInvite, createBookingCalendarEvent } from '@/lib/calendar/generate-ics'
import { renderBookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation'
import { sendEmailWithRetry } from '@/lib/email/send-with-retry'

// Use service role for server-to-server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Default timezone when profile doesn't have one configured
 */
const DEFAULT_TIMEZONE = 'America/New_York'

/**
 * API Key for securing the endpoint
 */
const API_KEY = process.env.EMAIL_API_KEY || 'dev-api-key'

/**
 * Validates the API key from request headers
 */
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key')
  return apiKey === API_KEY
}

/**
 * Fetches booking data with mentor and mentee profiles
 */
async function fetchBookingData(
  bookingId: string
): Promise<BookingConfirmationData | null> {
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  // Fetch booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    console.error('[Email API] Booking not found:', bookingId)
    return null
  }

  // Fetch mentor profile
  const { data: mentor, error: mentorError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', booking.mentor_id)
    .single()

  if (mentorError || !mentor) {
    console.error('[Email API] Mentor not found:', booking.mentor_id)
    return null
  }

  // Fetch mentee profile
  const { data: mentee, error: menteeError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', booking.student_id)
    .single()

  if (menteeError || !mentee) {
    console.error('[Email API] Mentee not found:', booking.student_id)
    return null
  }

  return {
    booking: {
      id: booking.id,
      session_date: booking.session_date,
      duration_minutes: booking.duration_minutes,
      total_cost: booking.total_cost,
      videocall_url: booking.videocall_url,
    },
    mentor: {
      id: mentor.id,
      name: mentor.name || 'Mentor',
      email: mentor.email,
      timezone: DEFAULT_TIMEZONE, // TODO: Add timezone to profiles table
    },
    mentee: {
      id: mentee.id,
      name: mentee.name || 'Mentee',
      email: mentee.email,
      timezone: DEFAULT_TIMEZONE, // TODO: Add timezone to profiles table
    },
  }
}

/**
 * Formats session date/time in recipient's timezone
 */
function formatSessionDateTime(
  sessionDateUtc: string,
  timezone: string
): { date: string; time: string } {
  const utcDate = new Date(sessionDateUtc)
  const zonedDate = toZonedTime(utcDate, timezone)

  return {
    date: formatInTimeZone(utcDate, timezone, 'EEEE, MMMM d, yyyy'),
    time: formatInTimeZone(utcDate, timezone, 'h:mm a'),
  }
}

/**
 * Sends confirmation email to a single recipient
 */
async function sendConfirmationToRecipient(
  data: BookingConfirmationData,
  recipientRole: 'mentor' | 'mentee'
): Promise<EmailSendResult> {
  const recipient = recipientRole === 'mentor' ? data.mentor : data.mentee
  const otherParty = recipientRole === 'mentor' ? data.mentee : data.mentor

  // Format date/time in recipient's timezone
  const { date, time } = formatSessionDateTime(data.booking.session_date, recipient.timezone)

  // Generate ICS calendar invite
  const calendarData = createBookingCalendarEvent({
    mentorName: data.mentor.name,
    menteeName: data.mentee.name,
    sessionDate: new Date(data.booking.session_date),
    durationMinutes: data.booking.duration_minutes,
    videocallUrl: data.booking.videocall_url,
    recipientRole,
  })
  const icsContent = generateCalendarInvite(calendarData)

  // Render email template
  const emailHtml = await renderBookingConfirmationEmail({
    recipientName: recipient.name,
    recipientRole,
    otherPartyName: otherParty.name,
    sessionDate: date,
    sessionTime: time,
    timezone: recipient.timezone,
    durationMinutes: data.booking.duration_minutes,
    videocallUrl: data.booking.videocall_url,
  })

  // Determine email subject
  const subject = `Your session with ${otherParty.name} is confirmed!`

  // Send email with retry
  return sendEmailWithRetry({
    to: recipient.email,
    subject,
    html: emailHtml,
    attachments: [
      {
        filename: 'session-invite.ics',
        content: icsContent,
        contentType: 'text/calendar',
      },
    ],
  })
}

/**
 * Updates the booking record with confirmation timestamp
 */
async function updateBookingConfirmationSent(bookingId: string): Promise<boolean> {
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  const { error } = await supabase
    .from('bookings')
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) {
    console.error('[Email API] Failed to update confirmation_sent_at:', error)
    return false
  }

  console.log(`[Email API] Updated confirmation_sent_at for booking: ${bookingId}`)
  return true
}

/**
 * POST /api/email/booking-confirmation
 *
 * Sends booking confirmation emails to both mentor and mentee
 *
 * Headers:
 * - X-API-Key: Required API key for authorization
 *
 * Body:
 * - bookingId: string - The booking ID to send confirmations for
 *
 * Returns:
 * - 200: Emails sent successfully
 * - 400: Invalid request body
 * - 401: Unauthorized (invalid API key)
 * - 404: Booking not found
 * - 500: Internal server error
 */
export async function POST(request: NextRequest): Promise<NextResponse<BookingConfirmationResponse>> {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    let body: BookingConfirmationRequest
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

    // Fetch booking data
    const bookingData = await fetchBookingData(bookingId)

    if (!bookingData) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking is confirmed
    // Note: We're trusting the caller to only call this for confirmed bookings
    // In production, you might want to verify booking.status === 'confirmed'

    // Send emails to both parties
    const [menteeResult, mentorResult] = await Promise.all([
      sendConfirmationToRecipient(bookingData, 'mentee'),
      sendConfirmationToRecipient(bookingData, 'mentor'),
    ])

    // Update booking record if at least one email was sent
    if (menteeResult.success || mentorResult.success) {
      await updateBookingConfirmationSent(bookingId)
    }

    // Determine overall success
    const success = menteeResult.success && mentorResult.success

    return NextResponse.json(
      {
        success,
        menteeEmail: menteeResult,
        mentorEmail: mentorResult,
        error: success ? undefined : 'One or more emails failed to send',
      },
      { status: success ? 200 : 207 } // 207 Multi-Status for partial success
    )
  } catch (error) {
    console.error('[Email API] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
