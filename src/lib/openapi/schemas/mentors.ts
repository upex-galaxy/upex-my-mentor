/**
 * Mentors API Schemas
 *
 * GET /api/mentors - List all verified mentors (paginated)
 * GET /api/mentors/[id]/availability - Get mentor availability and bookings
 */

import { registry, z } from '../registry'
import { UUIDSchema, TimestampSchema, EmailSchema } from './common'

// ============================================================================
// Mentor Schema (for listing)
// ============================================================================

export const MentorSchema = z.object({
  id: UUIDSchema,
  name: z.string().nullable().openapi({
    description: 'Mentor display name',
    example: 'John Doe',
  }),
  email: EmailSchema,
  photoUrl: z.string().url().nullable().openapi({
    description: 'Profile photo URL',
  }),
  description: z.string().nullable().openapi({
    description: 'Mentor bio/description',
  }),
  specialties: z.array(z.string()).openapi({
    description: 'List of mentor specialties',
    example: ['React', 'TypeScript', 'Node.js'],
  }),
  hourlyRate: z.number().openapi({
    description: 'Hourly rate in USD',
    example: 50,
  }),
  linkedinUrl: z.string().url().nullable().openapi({
    description: 'LinkedIn profile URL',
  }),
  githubUrl: z.string().url().nullable().openapi({
    description: 'GitHub profile URL',
  }),
  isVerified: z.boolean().openapi({
    description: 'Whether mentor is verified',
  }),
  averageRating: z.number().openapi({
    description: 'Average rating (0-5)',
    example: 4.5,
  }),
  totalReviews: z.number().int().openapi({
    description: 'Total number of reviews',
    example: 12,
  }),
  yearsOfExperience: z.number().int().openapi({
    description: 'Years of professional experience',
    example: 5,
  }),
}).openapi('Mentor')

// ============================================================================
// Pagination Schema
// ============================================================================

export const MentorsPaginationSchema = z.object({
  hasNextPage: z.boolean().openapi({
    description: 'Whether more results are available',
  }),
  nextCursor: z.string().optional().openapi({
    description: 'Cursor for the next page (format: rating:id)',
    example: '4.5:550e8400-e29b-41d4-a716-446655440000',
  }),
  pageSize: z.number().int().openapi({
    description: 'Number of results per page',
    example: 20,
  }),
}).openapi('MentorsPagination')

// ============================================================================
// List Mentors Response Schema
// ============================================================================

export const ListMentorsResponseSchema = z.object({
  mentors: z.array(MentorSchema).openapi({
    description: 'List of verified mentors',
  }),
  pagination: MentorsPaginationSchema,
}).openapi('ListMentorsResponse')

// ============================================================================
// Register Path: GET /api/mentors
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/mentors',
  summary: 'List all verified mentors',
  description: `
Returns a paginated list of all verified mentors with optional filtering.

**Pagination:**
Uses cursor-based pagination for efficient navigation. The cursor format is "rating:id".

**Filtering:**
- \`keyword\`: Search across name, description, and specialties (case-insensitive)
- \`skill\`: Filter by specialty (can be repeated for multiple skills)

**Sorting:**
Results are sorted by:
1. \`average_rating\` DESC (highest rated first, nulls last)
2. \`id\` ASC (for consistent ordering within same rating)

**No Authentication Required:**
This is a public endpoint - anyone can browse mentors.
  `.trim(),
  tags: ['Mentors'],
  request: {
    query: z.object({
      keyword: z.string().optional().openapi({
        description: 'Search term for name, description, or specialties',
        example: 'react',
      }),
      skill: z.array(z.string()).optional().openapi({
        description: 'Filter by specialty (can be repeated)',
        example: ['React', 'TypeScript'],
      }),
      cursor: z.string().optional().openapi({
        description: 'Pagination cursor from previous response',
        example: '4.5:550e8400-e29b-41d4-a716-446655440000',
      }),
      limit: z.string().optional().openapi({
        description: 'Number of results per page (default: 20, max: 50)',
        example: '20',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Mentors retrieved successfully',
      content: {
        'application/json': {
          schema: ListMentorsResponseSchema,
        },
      },
    },
    500: {
      description: 'Server error fetching mentors',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
            details: z.string().optional(),
          }),
        },
      },
    },
  },
})

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
