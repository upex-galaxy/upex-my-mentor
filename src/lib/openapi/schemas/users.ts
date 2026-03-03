/**
 * Users API Schemas
 *
 * GET /api/users/[id]/communication-channels - Get public channels
 * GET /api/users/me/communication-channels - Get my channels
 * PUT /api/users/me/communication-channels - Update my channels
 *
 * IMPORTANT: These schemas MUST match the actual implementation in:
 * - src/app/api/users/me/communication-channels/route.ts
 * - src/app/api/users/[id]/communication-channels/route.ts
 * - src/types/communication.ts
 */

import { registry, z } from '../registry'
import { UUIDSchema } from './common'

// ============================================================================
// Communication Channel Types (from src/types/communication.ts)
// ============================================================================

/**
 * All supported communication channel types.
 * MUST match CHANNEL_TYPES in src/types/communication.ts
 */
export const CommunicationChannelTypeSchema = z.enum([
  'whatsapp',
  'slack',
  'email',
  'google_meet',
  'zoom',
  'discord',
  'teams',
  'skype',
  'telegram',
]).openapi('CommunicationChannelType')

// ============================================================================
// Response Schema (what the API returns)
// Matches CommunicationChannel interface in src/types/communication.ts
// ============================================================================

export const CommunicationChannelSchema = z.object({
  id: UUIDSchema.openapi({ description: 'Channel unique identifier' }),
  userId: UUIDSchema.openapi({ description: 'Owner user ID' }),
  channelType: CommunicationChannelTypeSchema.openapi({
    description: 'Type of communication channel',
  }),
  handle: z.string().nullable().openapi({
    description: 'Channel-specific identifier (URL, username, phone, etc.)',
    example: 'https://meet.google.com/abc-defg-hij',
  }),
  isActive: z.boolean().openapi({
    description: 'Whether this channel is currently active',
  }),
  createdAt: z.string().datetime().openapi({
    description: 'When the channel was created',
  }),
  updatedAt: z.string().datetime().openapi({
    description: 'When the channel was last updated',
  }),
}).openapi('CommunicationChannel')

// ============================================================================
// API Response Schemas
// ============================================================================

export const CommunicationChannelsSuccessResponseSchema = z.object({
  success: z.literal(true),
  channels: z.array(CommunicationChannelSchema),
}).openapi('CommunicationChannelsSuccessResponse')

export const CommunicationChannelsErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().openapi({
    description: 'Error code',
    example: 'UNAUTHORIZED',
  }),
  message: z.string().openapi({
    description: 'Human-readable error message',
    example: 'Debes iniciar sesión para acceder a esta función',
  }),
}).openapi('CommunicationChannelsErrorResponse')

// ============================================================================
// Request Schema (what the API expects)
// Matches ChannelInput interface in route.ts
// ============================================================================

export const ChannelInputSchema = z.object({
  type: CommunicationChannelTypeSchema.openapi({
    description: 'Type of communication channel',
    example: 'google_meet',
  }),
  handle: z.string().nullable().optional().openapi({
    description: 'Channel-specific identifier (URL, username, phone, etc.)',
    example: 'https://meet.google.com/abc-defg-hij',
  }),
  isActive: z.boolean().optional().default(true).openapi({
    description: 'Whether this channel is active (defaults to true)',
  }),
}).openapi('ChannelInput')

export const UpdateCommunicationChannelsRequestSchema = z.object({
  channels: z.array(ChannelInputSchema).openapi({
    description: 'List of communication channels to set (full replacement)',
  }),
}).openapi('UpdateCommunicationChannelsRequest')

// ============================================================================
// Register Paths
// ============================================================================

// GET /api/users/[id]/communication-channels
registry.registerPath({
  method: 'get',
  path: '/users/{id}/communication-channels',
  summary: 'Get user public communication channels',
  description: `
Returns the active communication channels for a specific user (typically a mentor).

**Use Case:**
When a student views a mentor's profile or during booking flow to see available contact methods.

**Visibility:**
Only returns channels where \`isActive = true\`.

**No Authentication Required:**
This is a public endpoint.
  `.trim(),
  tags: ['Users'],
  request: {
    params: z.object({
      id: UUIDSchema.openapi({ description: 'User ID' }),
    }),
  },
  responses: {
    200: {
      description: 'Channels retrieved successfully',
      content: {
        'application/json': {
          schema: CommunicationChannelsSuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid user ID format',
      content: {
        'application/json': {
          schema: CommunicationChannelsErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: CommunicationChannelsErrorResponseSchema,
        },
      },
    },
  },
})

// GET /api/users/me/communication-channels
registry.registerPath({
  method: 'get',
  path: '/users/me/communication-channels',
  summary: 'Get my communication channels',
  description: `
Returns all communication channels for the authenticated user.

**Use Case:**
Used in the mentor's settings page to manage their communication preferences.

**Returns All Channels:**
Unlike the public endpoint, this returns ALL channels including inactive ones.

**Authentication:**
Requires valid session cookie or Bearer token.
  `.trim(),
  tags: ['Users'],
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  responses: {
    200: {
      description: 'Channels retrieved successfully',
      content: {
        'application/json': {
          schema: CommunicationChannelsSuccessResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - user not authenticated',
      content: {
        'application/json': {
          schema: CommunicationChannelsErrorResponseSchema,
        },
      },
    },
  },
})

// PUT /api/users/me/communication-channels
registry.registerPath({
  method: 'put',
  path: '/users/me/communication-channels',
  summary: 'Update my communication channels',
  description: `
Replaces all communication channels for the authenticated user.

**Behavior:**
- Deletes channels not in the new list
- Creates/updates channels from the request body
- This is a full replacement, not a partial update

**Use Case:**
Used when a mentor saves their communication preferences in settings.

**Authorization:**
Only mentors can have communication channels. Students will receive a 403 error.

**Example Request Body:**
\`\`\`json
{
  "channels": [
    { "type": "google_meet", "handle": null, "isActive": true },
    { "type": "zoom", "handle": "https://zoom.us/j/123456", "isActive": true },
    { "type": "slack", "handle": "workspace.slack.com", "isActive": false }
  ]
}
\`\`\`
  `.trim(),
  tags: ['Users'],
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateCommunicationChannelsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Channels updated successfully',
      content: {
        'application/json': {
          schema: CommunicationChannelsSuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - invalid channel data or duplicate channel types',
      content: {
        'application/json': {
          schema: CommunicationChannelsErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - user not authenticated',
      content: {
        'application/json': {
          schema: CommunicationChannelsErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - only mentors can configure communication channels',
      content: {
        'application/json': {
          schema: CommunicationChannelsErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Profile not found',
      content: {
        'application/json': {
          schema: CommunicationChannelsErrorResponseSchema,
        },
      },
    },
  },
})

// ============================================================================
// Export types for use in route handlers
// ============================================================================

export type CommunicationChannelType = z.infer<typeof CommunicationChannelTypeSchema>
export type CommunicationChannel = z.infer<typeof CommunicationChannelSchema>
export type ChannelInput = z.infer<typeof ChannelInputSchema>
export type CommunicationChannelsSuccessResponse = z.infer<typeof CommunicationChannelsSuccessResponseSchema>
export type CommunicationChannelsErrorResponse = z.infer<typeof CommunicationChannelsErrorResponseSchema>
export type UpdateCommunicationChannelsRequest = z.infer<typeof UpdateCommunicationChannelsRequestSchema>
