/**
 * MYM-30: Date utilities for session management
 *
 * Provides helper functions for calculating session time windows,
 * formatting dates, and determining join eligibility.
 */

import {
  differenceInMinutes,
  addMinutes,
  addHours,
  format,
  formatDistanceToNow,
  isBefore,
  isAfter,
  parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'

// Constants for session timing
const JOIN_WINDOW_MINUTES_BEFORE = 15
const LINK_EXPIRES_HOURS_AFTER = 1

/**
 * Checks if the current time is within the join window for a session.
 * Join window: 15 minutes before session start until 1 hour after session end.
 *
 * @param sessionDate - The start date/time of the session
 * @param durationMinutes - The duration of the session in minutes
 * @returns true if currently within the join window
 */
export function isWithinJoinWindow(
  sessionDate: Date | string,
  durationMinutes: number
): boolean {
  const now = new Date()
  const session = typeof sessionDate === 'string' ? parseISO(sessionDate) : sessionDate

  // Calculate window boundaries
  const windowStart = addMinutes(session, -JOIN_WINDOW_MINUTES_BEFORE)
  const sessionEnd = addMinutes(session, durationMinutes)
  const windowEnd = addHours(sessionEnd, LINK_EXPIRES_HOURS_AFTER)

  return isAfter(now, windowStart) && isBefore(now, windowEnd)
}

/**
 * Checks if a session has expired (1 hour after session end).
 *
 * @param sessionDate - The start date/time of the session
 * @param durationMinutes - The duration of the session in minutes
 * @returns true if the session has expired
 */
export function isSessionExpired(
  sessionDate: Date | string,
  durationMinutes: number
): boolean {
  const now = new Date()
  const session = typeof sessionDate === 'string' ? parseISO(sessionDate) : sessionDate

  const sessionEnd = addMinutes(session, durationMinutes)
  const expirationTime = addHours(sessionEnd, LINK_EXPIRES_HOURS_AFTER)

  return isAfter(now, expirationTime)
}

/**
 * Checks if a session can be joined (within 15 minutes before start).
 *
 * @param sessionDate - The start date/time of the session
 * @returns true if it's time to join (15 min before or later)
 */
export function canJoinNow(sessionDate: Date | string): boolean {
  const now = new Date()
  const session = typeof sessionDate === 'string' ? parseISO(sessionDate) : sessionDate

  const windowStart = addMinutes(session, -JOIN_WINDOW_MINUTES_BEFORE)

  return isAfter(now, windowStart)
}

/**
 * Gets a human-readable string for time until the join window opens.
 * Returns null if the window is already open.
 *
 * @param sessionDate - The start date/time of the session
 * @returns Human-readable time until join, or null if joinable now
 */
export function getTimeUntilJoinable(sessionDate: Date | string): string | null {
  const session = typeof sessionDate === 'string' ? parseISO(sessionDate) : sessionDate
  const windowStart = addMinutes(session, -JOIN_WINDOW_MINUTES_BEFORE)
  const now = new Date()

  if (isAfter(now, windowStart)) {
    return null // Already joinable
  }

  const minutesUntil = differenceInMinutes(windowStart, now)

  if (minutesUntil < 60) {
    return `en ${minutesUntil} minutos`
  }

  return formatDistanceToNow(windowStart, {
    addSuffix: true,
    locale: es
  })
}

/**
 * Formats a session date for display in the UI.
 * Example: "Viernes, 15 de noviembre de 2025 a las 10:00"
 *
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatSessionDate(date: Date | string): string {
  const sessionDate = typeof date === 'string' ? parseISO(date) : date

  return format(sessionDate, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
    locale: es
  })
}

/**
 * Formats a session date in a short format.
 * Example: "15 nov, 10:00"
 *
 * @param date - The date to format
 * @returns Short formatted date string
 */
export function formatSessionDateShort(date: Date | string): string {
  const sessionDate = typeof date === 'string' ? parseISO(date) : date

  return format(sessionDate, "d MMM, HH:mm", { locale: es })
}

/**
 * Gets a relative time string for upcoming sessions.
 * Example: "en 2 horas", "mañana", "en 3 días"
 *
 * @param date - The date to format
 * @returns Relative time string
 */
export function getRelativeSessionTime(date: Date | string): string {
  const sessionDate = typeof date === 'string' ? parseISO(date) : date

  return formatDistanceToNow(sessionDate, {
    addSuffix: true,
    locale: es
  })
}

/**
 * Checks if a session can be cancelled (more than 24 hours before start).
 *
 * @param sessionDate - The start date/time of the session
 * @returns true if cancellation is allowed
 */
export function canCancelSession(sessionDate: Date | string): boolean {
  const now = new Date()
  const session = typeof sessionDate === 'string' ? parseISO(sessionDate) : sessionDate

  const hoursUntilSession = differenceInMinutes(session, now) / 60

  return hoursUntilSession > 24
}

/**
 * Gets hours remaining until a session starts.
 *
 * @param sessionDate - The start date/time of the session
 * @returns Hours until session (can be negative if past)
 */
export function getHoursUntilSession(sessionDate: Date | string): number {
  const now = new Date()
  const session = typeof sessionDate === 'string' ? parseISO(sessionDate) : sessionDate

  return differenceInMinutes(session, now) / 60
}
