/**
 * Users API OpenAPI Paths Registration
 *
 * GET /api/users/[id]/communication-channels - Get public channels
 * GET /api/users/me/communication-channels - Get my channels
 * PUT /api/users/me/communication-channels - Update my channels
 *
 * IMPORTANT: Schemas are imported from @/types/communication.ts (Single Source of Truth).
 * DO NOT define schemas here - only register paths.
 */

import { z } from 'zod'
import { registry } from '../registry'

// Import schemas from Single Source of Truth
import {
  CommunicationChannelTypeSchema,
  CommunicationChannelSchema,
  ChannelInputSchema,
  UpdateCommunicationChannelsRequestSchema,
  CommunicationChannelsSuccessResponseSchema,
  CommunicationChannelsErrorResponseSchema,
} from '@/types/communication'

// Re-export types for convenience
export type {
  CommunicationChannelType,
  CommunicationChannel,
  ChannelInput,
  UpdateCommunicationChannelsRequest,
  CommunicationChannelsSuccessResponse,
  CommunicationChannelsErrorResponse,
} from '@/types/communication'

// ============================================================================
// Common Schemas (local to this file)
// ============================================================================

const UUIDSchema = z.string().uuid().openapi({
  description: 'UUID v4 identifier',
  example: '550e8400-e29b-41d4-a716-446655440000',
})

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
