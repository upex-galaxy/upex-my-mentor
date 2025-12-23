/**
 * Messages API Schemas
 *
 * GET /api/messages/unread-count - Get count of unread messages
 */

import { registry, z } from '../registry'
import { ErrorResponseSchema } from './common'

// ============================================================================
// Unread Count Schema
// ============================================================================

export const UnreadCountResponseSchema = z.object({
  count: z.number().int().min(0).openapi({
    description: 'Number of unread messages',
    example: 5,
  }),
}).openapi('UnreadCountResponse')

// ============================================================================
// Register Path
// ============================================================================

registry.registerPath({
  method: 'get',
  path: '/messages/unread-count',
  summary: 'Get unread message count',
  description: `
Returns the count of unread messages for the authenticated user.

**Unread Message Definition:**
A message is considered unread if:
- It belongs to a conversation the user is part of
- It was NOT sent by the user themselves
- It has \`is_read = false\`

**Use Case:**
Used to display a notification badge in the UI (e.g., "3 unread messages").

**Real-time Updates:**
For real-time updates, use Supabase Realtime subscriptions on the messages table.
This endpoint is for initial page load or polling.
  `.trim(),
  tags: ['Messages'],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Unread count retrieved successfully',
      content: {
        'application/json': {
          schema: UnreadCountResponseSchema,
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
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
})

// Export types for use in route handlers
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>
