/**
 * Checkout API Schemas
 *
 * POST /api/checkout/session - Create Stripe Checkout Session
 */

import { registry, z } from '../registry'
import { UUIDSchema, ErrorResponseSchema } from './common'

// ============================================================================
// Request Schema
// ============================================================================

export const CreateCheckoutSessionRequestSchema = z.object({
  booking_id: UUIDSchema.openapi({
    description: 'ID of the booking to create a checkout session for',
  }),
}).openapi('CreateCheckoutSessionRequest')

// ============================================================================
// Response Schema
// ============================================================================

export const CreateCheckoutSessionResponseSchema = z.object({
  checkout_url: z.string().url().openapi({
    description: 'Stripe-hosted checkout page URL. Redirect the user to this URL.',
    example: 'https://checkout.stripe.com/c/pay/cs_test_...',
  }),
  session_id: z.string().openapi({
    description: 'Stripe Checkout Session ID',
    example: 'cs_test_a1b2c3d4...',
  }),
}).openapi('CreateCheckoutSessionResponse')

// ============================================================================
// Register Path
// ============================================================================

registry.registerPath({
  method: 'post',
  path: '/checkout/session',
  summary: 'Create Stripe Checkout Session',
  description: `
Creates a Stripe Checkout Session for booking payment.

**Flow:**
1. Student creates a booking (status: provisional → pending_payment)
2. Student calls this endpoint to get a checkout URL
3. Student is redirected to Stripe's hosted checkout page
4. After payment, Stripe webhook updates booking status to 'confirmed'

**Payment Split:**
- 80% goes to the mentor's Stripe Connect account
- 20% is retained as platform fee

**Requirements:**
- User must be authenticated
- User must be the student (mentee) of the booking
- Booking must be in 'pending_payment' status
- Mentor must have a verified Stripe Connect account
  `.trim(),
  tags: ['Payments'],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateCheckoutSessionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Checkout session created successfully',
      content: {
        'application/json': {
          schema: CreateCheckoutSessionResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - booking_id missing, wrong status, or mentor not verified',
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
      description: 'Forbidden - user is not the student of this booking',
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
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    502: {
      description: 'Payment service error (Stripe)',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// Export types for use in route handlers
export type CreateCheckoutSessionRequest = z.infer<typeof CreateCheckoutSessionRequestSchema>
export type CreateCheckoutSessionResponse = z.infer<typeof CreateCheckoutSessionResponseSchema>
