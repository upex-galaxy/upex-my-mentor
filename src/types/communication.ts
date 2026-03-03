/**
 * MYM-30: Communication Channel Types
 *
 * SINGLE SOURCE OF TRUTH for communication channels.
 * These Zod schemas are used for:
 * 1. Runtime validation in API route handlers
 * 2. OpenAPI documentation generation
 * 3. TypeScript type inference
 *
 * DO NOT define these types elsewhere - always import from here.
 */

import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import type { Database } from './supabase'

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z)

// ============================================================================
// Database Types (from Supabase)
// ============================================================================

export type CommunicationChannelRow = Database['public']['Tables']['communication_channels']['Row']
export type CommunicationChannelInsert = Database['public']['Tables']['communication_channels']['Insert']
export type CommunicationChannelUpdate = Database['public']['Tables']['communication_channels']['Update']

// ============================================================================
// Zod Schemas (Single Source of Truth)
// ============================================================================

/**
 * All supported communication channel types.
 * Used for validation and OpenAPI enum generation.
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

/**
 * Communication channel as returned by the API (domain object).
 * Matches the shape returned by mapChannelRowToDomain().
 */
export const CommunicationChannelSchema = z.object({
  id: z.string().uuid().openapi({ description: 'Channel unique identifier' }),
  userId: z.string().uuid().openapi({ description: 'Owner user ID' }),
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
  createdAt: z.string().openapi({
    description: 'When the channel was created',
  }),
  updatedAt: z.string().openapi({
    description: 'When the channel was last updated',
  }),
}).openapi('CommunicationChannel')

/**
 * Input schema for creating/updating a channel.
 * Used in PUT /api/users/me/communication-channels request body.
 */
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

/**
 * Request body for PUT /api/users/me/communication-channels
 */
export const UpdateCommunicationChannelsRequestSchema = z.object({
  channels: z.array(ChannelInputSchema).openapi({
    description: 'List of communication channels to set (full replacement)',
  }),
}).openapi('UpdateCommunicationChannelsRequest')

/**
 * Success response for communication channels endpoints.
 */
export const CommunicationChannelsSuccessResponseSchema = z.object({
  success: z.literal(true),
  channels: z.array(CommunicationChannelSchema),
}).openapi('CommunicationChannelsSuccessResponse')

/**
 * Error response for communication channels endpoints.
 */
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
// Inferred Types (from Zod schemas)
// ============================================================================

export type CommunicationChannelType = z.infer<typeof CommunicationChannelTypeSchema>
export type CommunicationChannel = z.infer<typeof CommunicationChannelSchema>
export type ChannelInput = z.infer<typeof ChannelInputSchema>
export type UpdateCommunicationChannelsRequest = z.infer<typeof UpdateCommunicationChannelsRequestSchema>
export type CommunicationChannelsSuccessResponse = z.infer<typeof CommunicationChannelsSuccessResponseSchema>
export type CommunicationChannelsErrorResponse = z.infer<typeof CommunicationChannelsErrorResponseSchema>

// ============================================================================
// Legacy Interface (for booking JSONB storage)
// ============================================================================

/**
 * Communication channel stored in booking (simplified for JSONB)
 */
export interface BookingCommunicationChannel {
  type: CommunicationChannelType
  handle?: string | null
}

// ============================================================================
// UI Configuration (not part of API schema)
// ============================================================================

/**
 * Configuration metadata for each channel type (UI display)
 */
export interface ChannelConfig {
  label: string
  icon: string // Lucide icon name
  handleLabel: string
  handlePlaceholder: string
  requiresLink: boolean // If true, mentor typically provides a meeting link
  description: string
}

/**
 * Channel configuration for UI rendering
 */
export const CHANNEL_CONFIG: Record<CommunicationChannelType, ChannelConfig> = {
  whatsapp: {
    label: 'WhatsApp',
    icon: 'MessageCircle',
    handleLabel: 'Número de teléfono',
    handlePlaceholder: '+1 234 567 8900',
    requiresLink: false,
    description: 'Popular para coordinación rápida',
  },
  slack: {
    label: 'Slack',
    icon: 'Hash',
    handleLabel: 'Workspace o canal',
    handlePlaceholder: 'team.slack.com o #channel',
    requiresLink: false,
    description: 'Común en equipos de tecnología',
  },
  email: {
    label: 'Email',
    icon: 'Mail',
    handleLabel: 'Correo electrónico',
    handlePlaceholder: 'Se usa el email del perfil',
    requiresLink: false,
    description: 'Siempre disponible desde tu perfil',
  },
  google_meet: {
    label: 'Google Meet',
    icon: 'Video',
    handleLabel: 'Link de reunión personal',
    handlePlaceholder: 'https://meet.google.com/xxx-xxxx-xxx',
    requiresLink: true,
    description: 'Gratuito y ampliamente usado',
  },
  zoom: {
    label: 'Zoom',
    icon: 'Video',
    handleLabel: 'ID de reunión personal o link',
    handlePlaceholder: 'https://zoom.us/j/1234567890',
    requiresLink: true,
    description: 'El más común para reuniones',
  },
  discord: {
    label: 'Discord',
    icon: 'Headphones',
    handleLabel: 'Servidor o nombre de usuario',
    handlePlaceholder: 'username#1234 o invitación al servidor',
    requiresLink: false,
    description: 'Popular en comunidades de desarrollo',
  },
  teams: {
    label: 'Microsoft Teams',
    icon: 'Users',
    handleLabel: 'Link de reunión',
    handlePlaceholder: 'https://teams.microsoft.com/...',
    requiresLink: true,
    description: 'Entornos empresariales',
  },
  skype: {
    label: 'Skype',
    icon: 'Phone',
    handleLabel: 'Nombre de usuario de Skype',
    handlePlaceholder: 'username',
    requiresLink: false,
    description: 'Opción legacy pero aún usada',
  },
  telegram: {
    label: 'Telegram',
    icon: 'Send',
    handleLabel: 'Nombre de usuario',
    handlePlaceholder: '@username',
    requiresLink: false,
    description: 'Opción enfocada en privacidad',
  },
}

/**
 * All available channel types as array (for iteration).
 * Derived from the Zod schema to ensure consistency.
 */
export const CHANNEL_TYPES: CommunicationChannelType[] = CommunicationChannelTypeSchema.options

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert database row to domain object
 */
export function mapChannelRowToDomain(row: CommunicationChannelRow): CommunicationChannel {
  return {
    id: row.id,
    userId: row.user_id,
    channelType: row.channel_type as CommunicationChannelType,
    handle: row.handle,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

/**
 * Get display label for a channel type
 */
export function getChannelLabel(type: CommunicationChannelType): string {
  return CHANNEL_CONFIG[type]?.label ?? type
}

/**
 * Get icon name for a channel type
 */
export function getChannelIcon(type: CommunicationChannelType): string {
  return CHANNEL_CONFIG[type]?.icon ?? 'MessageCircle'
}

/**
 * Check if a channel type requires a meeting link
 */
export function channelRequiresLink(type: CommunicationChannelType): boolean {
  return CHANNEL_CONFIG[type]?.requiresLink ?? false
}

/**
 * Validate that a string is a valid channel type.
 * Uses Zod schema for validation.
 */
export function isValidChannelType(type: string): type is CommunicationChannelType {
  return CommunicationChannelTypeSchema.safeParse(type).success
}

/**
 * Parse and validate channel input from request body.
 * Returns validated data or throws ZodError.
 */
export function parseChannelInput(data: unknown): ChannelInput {
  return ChannelInputSchema.parse(data)
}

/**
 * Safely parse channel input, returning null on failure.
 */
export function safeParseChannelInput(data: unknown): ChannelInput | null {
  const result = ChannelInputSchema.safeParse(data)
  return result.success ? result.data : null
}
