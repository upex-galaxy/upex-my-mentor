/**
 * MYM-56: Messaging Types
 * Types for the messaging system between mentors and mentees
 */

import type { Database } from './supabase'

// ============================================
// Database Row Types (from Supabase schema)
// ============================================

export type ConversationRow = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type MessageRow = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

// ============================================
// Extended Types for UI
// ============================================

/**
 * Participant info for conversation display
 */
export interface ConversationParticipant {
  id: string
  name: string | null
  photo_url: string | null
  role: 'student' | 'mentor' | 'admin'
}

/**
 * Conversation with additional UI data
 */
export interface ConversationWithDetails extends ConversationRow {
  other_participant: ConversationParticipant
  last_message?: Pick<MessageRow, 'content' | 'created_at' | 'is_read' | 'sender_id'>
  unread_count: number
}

/**
 * Message with sender info for display
 */
export interface MessageWithSender extends MessageRow {
  sender: Pick<ConversationParticipant, 'id' | 'name' | 'photo_url'>
}

// ============================================
// API Request/Response Types
// ============================================

/**
 * Request to send a message to a mentor
 */
export interface SendMessageRequest {
  mentorId: string
  content: string
}

/**
 * Response from sending a message
 */
export interface SendMessageResponse {
  success: boolean
  conversationId?: string
  messageId?: string
  error?: string
}

/**
 * Check if conversation exists between current user and a mentor
 */
export interface ConversationCheck {
  exists: boolean
  conversationId?: string
}

// ============================================
// Component Props Types
// ============================================

export interface SendMessageButtonProps {
  mentorId: string
  mentorName: string
}

export interface MessageComposerModalProps {
  mentorId: string
  mentorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ============================================
// Constants
// ============================================

export const MIN_MESSAGE_LENGTH = 10
export const MAX_MESSAGE_LENGTH = 5000

// ============================================
// MYM-57: Component Props Types
// ============================================

export interface ConversationListProps {
  conversations: ConversationWithDetails[]
}

export interface ConversationListItemProps {
  conversation: ConversationWithDetails
  isActive?: boolean
}

export interface ConversationThreadProps {
  conversationId: string
  initialMessages: MessageWithSender[]
  currentUserId: string
  otherParticipant: ConversationParticipant
}

export interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
}

export interface EmptyConversationsProps {
  userRole: 'student' | 'mentor' | 'admin'
}

// ============================================
// MYM-58: Notification Types
// ============================================

/**
 * Context value for notification state management
 */
export interface NotificationContextValue {
  unreadCount: number
  activeConversationId: string | null
  setActiveConversation: (id: string | null) => void
  refreshUnreadCount: () => Promise<void>
}

/**
 * Payload from Supabase Realtime for new messages
 */
export interface NewMessagePayload {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

/**
 * Extended payload with sender info for toast display
 */
export interface NewMessageWithSenderPayload extends NewMessagePayload {
  sender_name: string
  sender_avatar: string | null
}

/**
 * Props for NotificationBadge component
 */
export interface NotificationBadgeProps {
  count: number
  maxDisplay?: number // Default 99
}
