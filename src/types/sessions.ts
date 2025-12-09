/**
 * MYM-30: Session Management Types
 *
 * Types for session dashboard, video call, and session cards.
 */

import type { Database } from './supabase'

// Base booking type from Supabase schema
// Note: Using specific names to avoid conflict with domain Booking type in index.ts
export type BookingRow = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']

// Profile subset for participant display
export interface ParticipantInfo {
  id: string
  name: string | null
  email: string
  photo_url: string | null
}

// Booking with participant details for session display
export interface BookingWithParticipants extends BookingRow {
  mentor: ParticipantInfo
  student: ParticipantInfo
}

// Session tab options
export type SessionTab = 'upcoming' | 'past'

// Session filters for dashboard
export interface SessionFilters {
  tab: SessionTab
  search?: string
  limit?: number
  offset?: number
}

// Video link API response types
export type VideoLinkErrorCode =
  | 'UNAUTHORIZED'
  | 'BOOKING_NOT_FOUND'
  | 'NOT_A_PARTICIPANT'
  | 'TOO_EARLY_TO_JOIN'
  | 'SESSION_EXPIRED'
  | 'LINK_NOT_AVAILABLE'
  | 'INTERNAL_ERROR'

export interface VideoLinkSuccessResponse {
  success: true
  url: string
}

export interface VideoLinkErrorResponse {
  success: false
  error: VideoLinkErrorCode
  message: string
}

export type VideoLinkResponse = VideoLinkSuccessResponse | VideoLinkErrorResponse

// Session status for display
export type SessionDisplayStatus =
  | 'upcoming'      // Future session, confirmed
  | 'joinable'      // Within 15 min window
  | 'in_progress'   // Currently happening
  | 'completed'     // Session finished
  | 'cancelled'     // User cancelled

// Helper to determine display status
export function getSessionDisplayStatus(
  sessionDate: string,
  durationMinutes: number,
  bookingStatus: string
): SessionDisplayStatus {
  if (bookingStatus === 'cancelled') return 'cancelled'
  if (bookingStatus === 'completed') return 'completed'

  const now = new Date()
  const start = new Date(sessionDate)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  const joinWindow = new Date(start.getTime() - 15 * 60000)

  if (now >= start && now <= end) return 'in_progress'
  if (now >= joinWindow && now < start) return 'joinable'
  if (now > end) return 'completed'

  return 'upcoming'
}
