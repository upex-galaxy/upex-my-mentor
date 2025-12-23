/**
 * Common OpenAPI Schemas
 *
 * Reusable schemas for error responses, common types, etc.
 * These are registered once and referenced across multiple endpoints.
 */

import { registry, z } from '../registry'

// ============================================================================
// Common Type Schemas
// ============================================================================

export const UUIDSchema = z.string().uuid().openapi({
  description: 'UUID v4 identifier',
  example: '550e8400-e29b-41d4-a716-446655440000',
})

export const TimestampSchema = z.string().datetime().openapi({
  description: 'ISO 8601 timestamp',
  example: '2024-01-15T10:30:00Z',
})

export const EmailSchema = z.string().email().openapi({
  description: 'Email address',
  example: 'user@example.com',
})

export const URLSchema = z.string().url().openapi({
  description: 'Valid URL',
  example: 'https://example.com',
})

// ============================================================================
// Error Response Schemas
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({ description: 'Error message' }),
  details: z.string().optional().openapi({ description: 'Additional error details' }),
}).openapi('ErrorResponse')

export const ValidationErrorSchema = z.object({
  error: z.string().openapi({ description: 'Validation error message' }),
  field: z.string().optional().openapi({ description: 'Field that failed validation' }),
}).openapi('ValidationError')

// ============================================================================
// Success Response Schemas
// ============================================================================

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().openapi({ description: 'Success message' }),
}).openapi('SuccessResponse')

// ============================================================================
// Participant Info (used in bookings)
// ============================================================================

export const ParticipantInfoSchema = z.object({
  id: UUIDSchema,
  name: z.string().nullable().openapi({ description: 'User display name' }),
  email: EmailSchema,
  photo_url: z.string().url().nullable().openapi({ description: 'Profile photo URL' }),
}).openapi('ParticipantInfo')

// ============================================================================
// Register Common Schemas
// ============================================================================

registry.register('UUID', UUIDSchema)
registry.register('Timestamp', TimestampSchema)
registry.register('Email', EmailSchema)
registry.register('URL', URLSchema)
registry.register('ErrorResponse', ErrorResponseSchema)
registry.register('ValidationError', ValidationErrorSchema)
registry.register('SuccessResponse', SuccessResponseSchema)
registry.register('ParticipantInfo', ParticipantInfoSchema)
