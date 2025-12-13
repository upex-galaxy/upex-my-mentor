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

// =============================================================================
// MYM-20: Timezone Conversion Types
// =============================================================================

/**
 * Information about a timezone
 */
export interface TimezoneInfo {
  timezone: string        // IANA timezone (e.g., "America/New_York")
  abbreviation: string    // e.g., "EST", "PST"
  offset: string          // e.g., "UTC-5", "UTC+0"
  displayName: string     // e.g., "Eastern Standard Time"
}

/**
 * Time display with timezone information
 */
export interface TimeDisplay {
  utcTime: Date              // Original UTC time
  localTime: string          // Formatted in user's timezone
  timezone: string           // User's timezone
  mentorTime?: string        // Formatted in mentor's timezone (optional)
  mentorTimezone?: string    // Mentor's timezone (optional)
}

/**
 * Props for the TimezoneIndicator component
 */
export interface TimezoneIndicatorProps {
  userTimezone: string
  mentorTimezone?: string
  showBothTimezones?: boolean
  className?: string
}

/**
 * Return type for useTimezone hook
 */
export interface UseTimezoneReturn {
  timezone: string
  abbreviation: string
  offset: string
  isLoading: boolean
  setTimezone: (tz: string) => void
}
