/**
 * Stripe Connect API Schemas
 *
 * POST /api/stripe/connect/onboard - Start mentor onboarding
 * GET /api/stripe/connect/status - Get account status
 * POST /api/stripe/webhook - Handle Stripe webhooks
 */

import { registry, z } from '../registry'
import { URLSchema, ErrorResponseSchema } from './common'

// ============================================================================
// Stripe Connect Status Schema
// ============================================================================

export const StripeConnectStatusSchema = z.object({
  connected: z.boolean().openapi({
    description: 'Whether the mentor has started the Connect process',
  }),
  stripe_account_id: z.string().nullable().openapi({
    description: 'Stripe Express account ID (null if not connected)',
    example: 'acct_1234567890',
  }),
  onboarding_complete: z.boolean().openapi({
    description: 'Whether Stripe has completed identity verification',
  }),
  charges_enabled: z.boolean().openapi({
    description: 'Whether the account can accept charges',
  }),
  payouts_enabled: z.boolean().openapi({
    description: 'Whether the account can receive payouts',
  }),
}).openapi('StripeConnectStatus')

// ============================================================================
// Onboard Schemas
// ============================================================================

export const StripeConnectOnboardRequestSchema = z.object({
  return_url: URLSchema.openapi({
    description: 'URL to redirect after successful onboarding',
    example: 'http://localhost:3000/dashboard/payouts?stripe_onboarding=success',
  }),
  refresh_url: URLSchema.openapi({
    description: 'URL to redirect if user needs to refresh/retry',
    example: 'http://localhost:3000/dashboard/payouts?stripe_onboarding=refresh',
  }),
}).openapi('StripeConnectOnboardRequest')

export const StripeConnectOnboardResponseSchema = z.object({
  onboarding_url: URLSchema.openapi({
    description: 'Stripe-hosted onboarding URL. Redirect the user to this URL.',
    example: 'https://connect.stripe.com/setup/e/acct_xxx/xxx',
  }),
}).openapi('StripeConnectOnboardResponse')

// ============================================================================
// Status Response Schema
// ============================================================================

export const StripeConnectStatusResponseSchema = z.object({
  status: StripeConnectStatusSchema,
}).openapi('StripeConnectStatusResponse')

// ============================================================================
// Register Paths
// ============================================================================

// POST /api/stripe/connect/onboard
registry.registerPath({
  method: 'post',
  path: '/stripe/connect/onboard',
  summary: 'Start Stripe Connect onboarding',
  description: `
Initiates the Stripe Connect Express onboarding flow for a mentor.

**Flow:**
1. Mentor calls this endpoint
2. Backend creates/retrieves Stripe Express account
3. Returns a Stripe-hosted onboarding URL
4. Mentor completes identity verification on Stripe
5. Stripe redirects back to return_url

**Account Creation:**
- If mentor has no Stripe account, one is created
- If mentor has an incomplete account, a refresh link is generated
- If mentor is already fully verified, returns error

**Requirements:**
- User must be authenticated
- User must have role: 'mentor'
  `.trim(),
  tags: ['Stripe Connect'],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: StripeConnectOnboardRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Onboarding URL generated successfully',
      content: {
        'application/json': {
          schema: StripeConnectOnboardResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - user is not a mentor or already verified',
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
    500: {
      description: 'Internal server error or Stripe API error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// GET /api/stripe/connect/status
registry.registerPath({
  method: 'get',
  path: '/stripe/connect/status',
  summary: 'Get Stripe Connect account status',
  description: `
Returns the current status of the mentor's Stripe Connect Express account.

**Status Fields:**
- \`connected\`: Whether an account exists
- \`onboarding_complete\`: Whether identity verification is done
- \`charges_enabled\`: Whether the account can accept payments
- \`payouts_enabled\`: Whether the account can receive transfers

**Requirements:**
- User must be authenticated
- User must have role: 'mentor'
  `.trim(),
  tags: ['Stripe Connect'],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Account status retrieved successfully',
      content: {
        'application/json': {
          schema: StripeConnectStatusResponseSchema,
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
      description: 'Forbidden - user is not a mentor',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// POST /api/stripe/webhook
registry.registerPath({
  method: 'post',
  path: '/stripe/webhook',
  summary: 'Handle Stripe webhooks',
  description: `
Receives and processes Stripe webhook events.

**Handled Events:**
- \`checkout.session.completed\`: Payment successful → update booking to 'confirmed'
- \`account.updated\`: Connect account status changed
- \`transfer.created\`: Payout initiated

**Security:**
- Only Stripe can call this endpoint
- Requests are verified using the Stripe-Signature header
- Invalid signatures are rejected

**Note:** This endpoint is NOT meant to be called directly.
  `.trim(),
  tags: ['Stripe Connect'],
  security: [{ stripeSignature: [] }],
  request: {
    body: {
      required: true,
      description: 'Raw Stripe webhook event payload',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            type: z.string(),
            data: z.object({
              object: z.record(z.unknown()),
            }),
          }).openapi('StripeWebhookEvent'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Webhook processed successfully',
      content: {
        'application/json': {
          schema: z.object({ received: z.literal(true) }),
        },
      },
    },
    400: {
      description: 'Invalid webhook signature or payload',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// Export types for use in route handlers
export type StripeConnectStatus = z.infer<typeof StripeConnectStatusSchema>
export type StripeConnectOnboardRequest = z.infer<typeof StripeConnectOnboardRequestSchema>
export type StripeConnectOnboardResponse = z.infer<typeof StripeConnectOnboardResponseSchema>
export type StripeConnectStatusResponse = z.infer<typeof StripeConnectStatusResponseSchema>
