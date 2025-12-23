/**
 * System API Schemas
 *
 * POST /api/cron/process-payouts - Process pending payouts (cron job)
 * POST /api/email/booking-confirmation - Send booking confirmation email
 * POST /api/testing/trigger-confirmation - Trigger email for testing
 */

import { registry, z } from '../registry'
import { UUIDSchema, TimestampSchema, ErrorResponseSchema } from './common'

// ============================================================================
// Payout Processing Schemas
// ============================================================================

export const PayoutProcessResultSchema = z.object({
  booking_id: UUIDSchema,
  success: z.boolean(),
  payout_id: z.string().optional().openapi({
    description: 'Internal payout record ID (if successful)',
  }),
  stripe_transfer_id: z.string().optional().openapi({
    description: 'Stripe transfer ID (if successful)',
    example: 'tr_1234567890',
  }),
  error: z.string().optional().openapi({
    description: 'Error code (if failed)',
  }),
  error_details: z.string().optional().openapi({
    description: 'Detailed error message (if failed)',
  }),
}).openapi('PayoutProcessResult')

export const PayoutJobSummarySchema = z.object({
  started_at: TimestampSchema,
  completed_at: TimestampSchema,
  eligible_count: z.number().int().openapi({
    description: 'Number of sessions eligible for payout',
  }),
  processed_count: z.number().int().openapi({
    description: 'Number of payouts attempted',
  }),
  success_count: z.number().int().openapi({
    description: 'Number of successful payouts',
  }),
  failed_count: z.number().int().openapi({
    description: 'Number of failed payouts',
  }),
  skipped_count: z.number().int().openapi({
    description: 'Number of skipped payouts (already processed, etc.)',
  }),
  results: z.array(PayoutProcessResultSchema),
}).openapi('PayoutJobSummary')

// ============================================================================
// Email Schemas
// ============================================================================

export const BookingConfirmationRequestSchema = z.object({
  bookingId: UUIDSchema.openapi({
    description: 'Booking ID to send confirmation for',
  }),
}).openapi('BookingConfirmationRequest')

export const BookingConfirmationResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional().openapi({
    description: 'Resend email message ID',
  }),
  error: z.string().optional(),
}).openapi('BookingConfirmationResponse')

// ============================================================================
// Testing Trigger Schema
// ============================================================================

export const TriggerConfirmationRequestSchema = z.object({
  bookingId: UUIDSchema.openapi({
    description: 'Booking ID to trigger confirmation for',
  }),
}).openapi('TriggerConfirmationRequest')

// ============================================================================
// Register Paths
// ============================================================================

// POST /api/cron/process-payouts
registry.registerPath({
  method: 'post',
  path: '/cron/process-payouts',
  summary: 'Process pending payouts',
  description: `
Processes payouts for completed mentoring sessions.

**Schedule:**
This endpoint is called daily by Vercel Cron at midnight UTC.

**Payout Logic:**
1. Find all completed sessions that haven't been paid out
2. For each session, transfer 80% of payment to mentor's Stripe Connect account
3. Record the payout in the database
4. Handle failures gracefully (record in failed_payouts table)

**Requirements:**
- Must be authenticated with CRON_SECRET bearer token
- Only available in production/staging (blocked in development unless forced)

**Manual Trigger:**
Can be called manually for testing with the correct CRON_SECRET.
  `.trim(),
  tags: ['System'],
  security: [{ cronAuth: [] }],
  responses: {
    200: {
      description: 'Payout job completed',
      content: {
        'application/json': {
          schema: PayoutJobSummarySchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - invalid or missing CRON_SECRET',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// POST /api/email/booking-confirmation
registry.registerPath({
  method: 'post',
  path: '/email/booking-confirmation',
  summary: 'Send booking confirmation email',
  description: `
Sends a booking confirmation email to both the student and mentor.

**Email Content:**
- Session date and time
- Mentor/student information
- Meeting link (if available)
- Calendar attachment (.ics file)

**Use Case:**
Called after a successful payment to notify both parties.

**Authentication:**
Uses X-API-Key header instead of session cookie.
In development, use "dev-api-key".
  `.trim(),
  tags: ['System'],
  security: [{ apiKeyAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: BookingConfirmationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Email sent successfully',
      content: {
        'application/json': {
          schema: BookingConfirmationResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - missing bookingId',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - invalid or missing X-API-Key',
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
    500: {
      description: 'Internal server error or email service error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// POST /api/testing/trigger-confirmation
registry.registerPath({
  method: 'post',
  path: '/testing/trigger-confirmation',
  summary: 'Trigger confirmation email (QA testing)',
  description: `
Triggers a booking confirmation email for QA testing purposes.

**Environment:**
Only available in development and staging environments.
Returns 404 in production.

**Use Case:**
Allows QA team to test email functionality without going through the full payment flow.

**Authentication:**
Uses X-API-Key header. In development, use "dev-api-key".
  `.trim(),
  tags: ['System'],
  security: [{ apiKeyAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: TriggerConfirmationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Email triggered successfully',
      content: {
        'application/json': {
          schema: BookingConfirmationResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - missing bookingId',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - invalid or missing X-API-Key',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Not found - endpoint disabled in production OR booking not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// Export types for use in route handlers
export type PayoutProcessResult = z.infer<typeof PayoutProcessResultSchema>
export type PayoutJobSummary = z.infer<typeof PayoutJobSummarySchema>
export type BookingConfirmationRequest = z.infer<typeof BookingConfirmationRequestSchema>
export type BookingConfirmationResponse = z.infer<typeof BookingConfirmationResponseSchema>
export type TriggerConfirmationRequest = z.infer<typeof TriggerConfirmationRequestSchema>
