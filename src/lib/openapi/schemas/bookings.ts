/**
 * Bookings API Schemas
 *
 * POST /api/bookings/[id]/cancel - Cancel a session with refund
 * PATCH /api/bookings/[id]/meeting-link - Mentor adds meeting link
 * GET /api/bookings/[id]/video-link - Get video call URL
 */

import { registry, z } from '../registry'
import { UUIDSchema, ErrorResponseSchema, URLSchema } from './common'

// ============================================================================
// Cancel Session Schemas
// ============================================================================

export const CancelErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'BOOKING_NOT_FOUND',
  'NOT_A_PARTICIPANT',
  'CANCELLATION_WINDOW_CLOSED',
  'SESSION_ALREADY_CANCELLED',
  'SESSION_NOT_CONFIRMED',
  'REFUND_FAILED',
  'INTERNAL_ERROR',
]).openapi('CancelErrorCode')

export const CancelSessionSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().openapi({
    description: 'Success message',
    example: 'Sesión cancelada exitosamente. Se ha procesado tu reembolso.',
  }),
  refundId: z.string().optional().openapi({
    description: 'Stripe refund ID (if payment was processed)',
    example: 're_1234567890',
  }),
}).openapi('CancelSessionSuccessResponse')

export const CancelSessionErrorResponseSchema = z.object({
  success: z.literal(false),
  error: CancelErrorCodeSchema,
  message: z.string().openapi({
    description: 'Human-readable error message',
  }),
}).openapi('CancelSessionErrorResponse')

export const CancelSessionResponseSchema = z.union([
  CancelSessionSuccessResponseSchema,
  CancelSessionErrorResponseSchema,
]).openapi('CancelSessionResponse')

// ============================================================================
// Meeting Link Schemas
// ============================================================================

export const UpdateMeetingLinkRequestSchema = z.object({
  meeting_link: URLSchema.openapi({
    description: 'Video call URL (Zoom, Google Meet, etc.)',
    example: 'https://zoom.us/j/1234567890',
  }),
}).openapi('UpdateMeetingLinkRequest')

export const UpdateMeetingLinkResponseSchema = z.object({
  success: z.literal(true),
  booking: z.object({
    id: UUIDSchema,
    video_call_url: URLSchema,
    updated_at: z.string().datetime(),
  }),
}).openapi('UpdateMeetingLinkResponse')

// ============================================================================
// Video Link Schemas
// ============================================================================

export const VideoLinkErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'BOOKING_NOT_FOUND',
  'NOT_A_PARTICIPANT',
  'TOO_EARLY_TO_JOIN',
  'SESSION_EXPIRED',
  'LINK_NOT_AVAILABLE',
  'INTERNAL_ERROR',
]).openapi('VideoLinkErrorCode')

export const VideoLinkSuccessResponseSchema = z.object({
  success: z.literal(true),
  url: URLSchema.openapi({
    description: 'Video call URL to join the session',
    example: 'https://zoom.us/j/1234567890',
  }),
}).openapi('VideoLinkSuccessResponse')

export const VideoLinkErrorResponseSchema = z.object({
  success: z.literal(false),
  error: VideoLinkErrorCodeSchema,
  message: z.string().openapi({
    description: 'Human-readable error message',
  }),
}).openapi('VideoLinkErrorResponse')

export const VideoLinkResponseSchema = z.union([
  VideoLinkSuccessResponseSchema,
  VideoLinkErrorResponseSchema,
]).openapi('VideoLinkResponse')

// ============================================================================
// Register Paths
// ============================================================================

// POST /api/bookings/[id]/cancel
registry.registerPath({
  method: 'post',
  path: '/bookings/{id}/cancel',
  summary: 'Cancel a session',
  description: `
Cancels a confirmed session and processes a full refund.

**Cancellation Policy:**
- Must be more than 24 hours before session start
- Booking must be in 'confirmed' status
- User must be a participant (mentor or student)

**Actions on Success:**
1. Updates booking status to 'cancelled'
2. Processes full refund via Stripe
3. Updates transaction status to 'refunded'
4. Sends email notifications to both parties
  `.trim(),
  tags: ['Bookings'],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: UUIDSchema.openapi({ description: 'Booking ID to cancel' }),
    }),
  },
  responses: {
    200: {
      description: 'Session cancelled successfully',
      content: {
        'application/json': {
          schema: CancelSessionSuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - cancellation window closed, wrong status, or already cancelled',
      content: {
        'application/json': {
          schema: CancelSessionErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - user not authenticated',
      content: {
        'application/json': {
          schema: CancelSessionErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - user is not a participant of this booking',
      content: {
        'application/json': {
          schema: CancelSessionErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Booking not found',
      content: {
        'application/json': {
          schema: CancelSessionErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error or refund failed',
      content: {
        'application/json': {
          schema: CancelSessionErrorResponseSchema,
        },
      },
    },
  },
})

// PATCH /api/bookings/[id]/meeting-link
registry.registerPath({
  method: 'patch',
  path: '/bookings/{id}/meeting-link',
  summary: 'Add/update meeting link',
  description: `
Allows the mentor to add or update the video call meeting link for a session.

**Requirements:**
- User must be authenticated
- User must be the mentor of this booking
- Booking must be in 'confirmed' status
  `.trim(),
  tags: ['Bookings'],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: UUIDSchema.openapi({ description: 'Booking ID' }),
    }),
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateMeetingLinkRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Meeting link updated successfully',
      content: {
        'application/json': {
          schema: UpdateMeetingLinkResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - invalid URL or wrong booking status',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - user not authenticated',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - user is not the mentor of this booking',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Booking not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// GET /api/bookings/[id]/video-link
registry.registerPath({
  method: 'get',
  path: '/bookings/{id}/video-link',
  summary: 'Get video call link',
  description: `
Returns the video call URL for joining a session.

**Join Window:**
- Can join 15 minutes before session start
- Link expires when session ends + buffer time

**Requirements:**
- User must be authenticated
- User must be a participant (mentor or student)
- Must be within the join window
- Meeting link must have been set by mentor
  `.trim(),
  tags: ['Bookings'],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: UUIDSchema.openapi({ description: 'Booking ID' }),
    }),
  },
  responses: {
    200: {
      description: 'Video link retrieved successfully',
      content: {
        'application/json': {
          schema: VideoLinkSuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - too early to join, session expired, or link not available',
      content: {
        'application/json': {
          schema: VideoLinkErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - user not authenticated',
      content: {
        'application/json': {
          schema: VideoLinkErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - user is not a participant',
      content: {
        'application/json': {
          schema: VideoLinkErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Booking not found',
      content: {
        'application/json': {
          schema: VideoLinkErrorResponseSchema,
        },
      },
    },
  },
})

// Export types for use in route handlers
export type CancelSessionResponse = z.infer<typeof CancelSessionResponseSchema>
export type UpdateMeetingLinkRequest = z.infer<typeof UpdateMeetingLinkRequestSchema>
export type UpdateMeetingLinkResponse = z.infer<typeof UpdateMeetingLinkResponseSchema>
export type VideoLinkResponse = z.infer<typeof VideoLinkResponseSchema>
