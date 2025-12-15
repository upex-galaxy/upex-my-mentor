import { createEvent, type EventAttributes, type DateArray } from 'ics'
import type { CalendarEventData } from '@/types/scheduling'

/**
 * Converts a Date object to the DateArray format required by the ics library
 * Format: [year, month, day, hour, minute]
 * Note: ics library expects month to be 1-indexed (January = 1)
 */
function dateToArray(date: Date): DateArray {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1, // ics expects 1-indexed months
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ]
}

/**
 * Calculates duration between two dates
 */
function calculateDuration(start: Date, end: Date): { hours: number; minutes: number } {
  const diffMs = end.getTime() - start.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  return {
    hours: Math.floor(diffMinutes / 60),
    minutes: diffMinutes % 60,
  }
}

/**
 * Generates an ICS calendar invite string
 *
 * @param data - Calendar event data
 * @returns ICS file content as a string
 * @throws Error if ICS generation fails
 *
 * @example
 * const icsContent = generateCalendarInvite({
 *   title: 'Mentorship Session with John',
 *   description: 'Your 60-minute session',
 *   start: new Date('2025-01-15T14:00:00Z'),
 *   end: new Date('2025-01-15T15:00:00Z'),
 *   location: 'https://meet.google.com/xyz',
 *   organizer: { name: 'MyMentor', email: 'confirmations@mymentor.com' },
 *   attendees: [
 *     { name: 'John Doe', email: 'john@example.com' },
 *     { name: 'Jane Smith', email: 'jane@example.com' }
 *   ]
 * })
 */
export function generateCalendarInvite(data: CalendarEventData): string {
  const duration = calculateDuration(data.start, data.end)

  const event: EventAttributes = {
    title: data.title,
    description: data.description,
    start: dateToArray(data.start),
    startInputType: 'utc',
    startOutputType: 'utc',
    duration,
    location: data.location,
    organizer: {
      name: data.organizer.name,
      email: data.organizer.email,
    },
    attendees: data.attendees.map((attendee) => ({
      name: attendee.name,
      email: attendee.email,
      rsvp: true,
      partstat: 'ACCEPTED' as const,
      role: 'REQ-PARTICIPANT' as const,
    })),
    status: 'CONFIRMED' as const,
    busyStatus: 'BUSY' as const,
    productId: 'mymentor/ics',
    classification: 'PUBLIC' as const,
  }

  const { error, value } = createEvent(event)

  if (error) {
    throw new Error(`Failed to generate ICS: ${error.message}`)
  }

  if (!value) {
    throw new Error('Failed to generate ICS: No value returned')
  }

  return value
}

/**
 * Creates calendar event data for a booking confirmation
 */
export function createBookingCalendarEvent(params: {
  mentorName: string
  menteeName: string
  sessionDate: Date
  durationMinutes: number
  videocallUrl: string | null
  recipientRole: 'mentor' | 'mentee'
}): CalendarEventData {
  const { mentorName, menteeName, sessionDate, durationMinutes, videocallUrl, recipientRole } = params

  const otherPartyName = recipientRole === 'mentor' ? menteeName : mentorName
  const endDate = new Date(sessionDate.getTime() + durationMinutes * 60 * 1000)

  const description = [
    `${durationMinutes}-minute mentorship session`,
    '',
    recipientRole === 'mentor'
      ? `Mentee: ${menteeName}`
      : `Mentor: ${mentorName}`,
    '',
    videocallUrl ? `Join the call: ${videocallUrl}` : 'Video call link will be provided separately',
    '',
    '---',
    'MyMentor - Connecting mentors with mentees',
  ].join('\n')

  return {
    title: `Mentorship Session with ${otherPartyName}`,
    description,
    start: sessionDate,
    end: endDate,
    location: videocallUrl ?? undefined,
    organizer: {
      name: 'MyMentor',
      email: 'confirmations@mymentor.com',
    },
    attendees: [
      { name: mentorName, email: 'mentor@placeholder.com' },
      { name: menteeName, email: 'mentee@placeholder.com' },
    ],
  }
}
