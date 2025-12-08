// MYM-22: Email Confirmation and Calendar Invite Types

/**
 * Data required to generate and send booking confirmation emails
 */
export interface BookingConfirmationData {
  booking: {
    id: string
    session_date: string        // ISO datetime UTC
    duration_minutes: number
    total_cost: number
    videocall_url: string | null
  }
  mentor: {
    id: string
    name: string
    email: string
    timezone: string           // IANA timezone (e.g., "America/New_York")
  }
  mentee: {
    id: string
    name: string
    email: string
    timezone: string           // IANA timezone (e.g., "America/New_York")
  }
}

/**
 * Data required to generate an ICS calendar event
 */
export interface CalendarEventData {
  title: string
  description: string
  start: Date
  end: Date
  location?: string
  organizer: { name: string; email: string }
  attendees: { name: string; email: string }[]
}

/**
 * Result of an email send operation
 */
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  retryCount: number
}

/**
 * Props for the booking confirmation email template
 */
export interface BookingConfirmationEmailProps {
  recipientName: string
  recipientRole: 'mentor' | 'mentee'
  otherPartyName: string
  sessionDate: string          // Formatted date (e.g., "Monday, December 15, 2025")
  sessionTime: string          // Formatted time (e.g., "2:00 PM")
  timezone: string             // Display timezone (e.g., "America/New_York")
  durationMinutes: number
  videocallUrl: string | null
}

/**
 * Internal email data structure for Resend
 */
export interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: {
    filename: string
    content: string | Buffer
    contentType?: string
  }[]
}

/**
 * API request body for booking confirmation endpoint
 */
export interface BookingConfirmationRequest {
  bookingId: string
}

/**
 * API response for booking confirmation endpoint
 */
export interface BookingConfirmationResponse {
  success: boolean
  menteeEmail?: EmailSendResult
  mentorEmail?: EmailSendResult
  error?: string
}
