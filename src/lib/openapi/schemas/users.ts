/**
 * Users API Schemas
 *
 * GET /api/users/[id]/communication-channels - Get public channels
 * GET /api/users/me/communication-channels - Get my channels
 * PUT /api/users/me/communication-channels - Update my channels
 */

import { registry, z } from '../registry'
import { UUIDSchema, ErrorResponseSchema } from './common'

// ============================================================================
// Communication Channel Schema
// ============================================================================

export const CommunicationChannelTypeSchema = z.enum([
  'zoom',
  'google_meet',
  'discord',
  'slack',
  'microsoft_teams',
  'other',
]).openapi('CommunicationChannelType')

export const CommunicationChannelSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  channel_type: CommunicationChannelTypeSchema,
  channel_value: z.string().openapi({
    description: 'Channel-specific value (URL, username, etc.)',
    example: 'https://zoom.us/my/username',
  }),
  is_preferred: z.boolean().openapi({
    description: 'Whether this is the preferred communication channel',
  }),
  is_public: z.boolean().openapi({
    description: 'Whether this channel is visible to other users',
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}).openapi('CommunicationChannel')

// ============================================================================
// Response Schemas
// ============================================================================

export const CommunicationChannelsResponseSchema = z.object({
  channels: z.array(CommunicationChannelSchema),
}).openapi('CommunicationChannelsResponse')

// ============================================================================
// Update Request Schema
// ============================================================================

export const UpdateCommunicationChannelsRequestSchema = z.object({
  channels: z.array(z.object({
    channel_type: CommunicationChannelTypeSchema,
    channel_value: z.string().min(1).openapi({
      description: 'Channel-specific value',
    }),
    is_preferred: z.boolean().default(false),
    is_public: z.boolean().default(true),
  })).openapi({
    description: 'List of communication channels to set',
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
Returns the public communication channels for a specific user (mentor).

**Use Case:**
When a student views a mentor's profile, they can see how to contact the mentor
for scheduling or questions.

**Visibility:**
Only returns channels where \`is_public = true\`.

**No Authentication Required:**
This is a public endpoint - anyone can view a mentor's public channels.
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
          schema: CommunicationChannelsResponseSchema,
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
Used in the user's settings page to manage their communication preferences.

**Returns All Channels:**
Unlike the public endpoint, this returns ALL channels including private ones.
  `.trim(),
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Channels retrieved successfully',
      content: {
        'application/json': {
          schema: CommunicationChannelsResponseSchema,
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
- Deletes all existing channels
- Creates new channels from the request body
- This is a full replacement, not a partial update

**Use Case:**
Used when a user saves their communication preferences in settings.
  `.trim(),
  tags: ['Users'],
  security: [{ cookieAuth: [] }],
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
          schema: CommunicationChannelsResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - invalid channel data',
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
  },
})

// Export types for use in route handlers
export type CommunicationChannelType = z.infer<typeof CommunicationChannelTypeSchema>
export type CommunicationChannel = z.infer<typeof CommunicationChannelSchema>
export type CommunicationChannelsResponse = z.infer<typeof CommunicationChannelsResponseSchema>
export type UpdateCommunicationChannelsRequest = z.infer<typeof UpdateCommunicationChannelsRequestSchema>
