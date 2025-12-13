/**
 * MYM-30: Communication Channel Types
 *
 * Types and configuration for the Communication Channel Agreement feature.
 * Allows mentors to configure preferred communication methods and mentees
 * to select their preference during booking.
 */

import type { Database } from './supabase'

// Database row type
export type CommunicationChannelRow = Database['public']['Tables']['communication_channels']['Row']
export type CommunicationChannelInsert = Database['public']['Tables']['communication_channels']['Insert']
export type CommunicationChannelUpdate = Database['public']['Tables']['communication_channels']['Update']

/**
 * Supported communication channel types
 */
export type CommunicationChannelType =
  | 'whatsapp'
  | 'slack'
  | 'email'
  | 'google_meet'
  | 'zoom'
  | 'discord'
  | 'teams'
  | 'skype'
  | 'telegram'

/**
 * Communication channel configuration from database
 */
export interface CommunicationChannel {
  id: string
  userId: string
  channelType: CommunicationChannelType
  handle: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Communication channel stored in booking (simplified for JSONB)
 */
export interface BookingCommunicationChannel {
  type: CommunicationChannelType
  handle?: string | null
}

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
 * All available channel types as array (for iteration)
 */
export const CHANNEL_TYPES: CommunicationChannelType[] = [
  'google_meet',
  'zoom',
  'slack',
  'whatsapp',
  'discord',
  'teams',
  'email',
  'telegram',
  'skype',
]

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
 * Validate that a string is a valid channel type
 */
export function isValidChannelType(type: string): type is CommunicationChannelType {
  return CHANNEL_TYPES.includes(type as CommunicationChannelType)
}
