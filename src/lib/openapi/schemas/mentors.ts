/**
 * Mentors API Schemas
 *
 * GET /api/mentors/[id]/availability - Get mentor availability and bookings
 */

import { registry, z } from '../registry'
import { UUIDSchema, TimestampSchema } from './common'

// ============================================================================
// Availability Slot Schema
// ============================================================================

export const AvailabilitySlotSchema = z.object({
  id: UUIDSchema,
  mentor_id: UUIDSchema,
  day_of_week: z.number().int().min(0).max(6).openapi({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    example: 1,
  }),
  start_time: z.string().openapi({
    description: 'Start time in HH:MM format',
    example: '09:00',
  }),
  end_time: z.string().openapi({
    description: 'End time in HH:MM format',
    example: '17:00',
  }),
  is_active: z.boolean().openapi({
    description: 'Whether this slot is currently active',
  }),
}).openapi('AvailabilitySlot')

// ============================================================================
// Booked Session Schema
// ============================================================================

export const BookedSessionSchema = z.object({
  session_date: TimestampSchema.openapi({
    description: 'Date and time of the booked session',
  }),
}).openapi('BookedSession')

// ============================================================================
// Availability Response Schema
// ============================================================================

export const MentorAvailabilityResponseSchema = z.object({
  availability: z.array(AvailabilitySlotSchema).openapi({
    description: 'List of recurring weekly availability slots',
  }),
  bookings: z.array(BookedSessionSchema).openapi({
    description: 'List of existing bookings for the next 30 days',
  }),
}).openapi('MentorAvailabilityResponse')

// ============================================================================
// Register Path
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/mentors/{id}/availability',
  summary: 'Get mentor availability',
  description: `
Returns the mentor's weekly recurring availability slots and existing bookings for the next 30 days.

**Use Case:**
When a student wants to book a session, they need to see:
1. What time slots the mentor is generally available (weekly schedule)
2. Which slots are already booked (to avoid double-booking)

**Availability Slots:**
- Represent the mentor's weekly recurring schedule
- Stored by day_of_week (0-6) and time range

**Bookings:**
- Only returns session_date for non-cancelled bookings
- Limited to the next 30 days
- Used to gray out already-booked times in the calendar

**No Authentication Required:**
This is a public endpoint - anyone can view a mentor's availability.
  `.trim(),
  tags: ['Mentors'],
  request: {
    params: z.object({
      id: UUIDSchema.openapi({ description: 'Mentor user ID' }),
    }),
  },
  responses: {
    200: {
      description: 'Availability retrieved successfully',
      content: {
        'application/json': {
          schema: MentorAvailabilityResponseSchema,
        },
      },
    },
  },
})

// Export types for use in route handlers
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>
export type BookedSession = z.infer<typeof BookedSessionSchema>
export type MentorAvailabilityResponse = z.infer<typeof MentorAvailabilityResponseSchema>
