/**
 * Timezone Utilities - MYM-20
 *
 * Utilities for timezone detection, conversion, and formatting.
 * Uses date-fns-tz for reliable timezone handling.
 */

import { format } from 'date-fns'
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

/**
 * Detects the user's timezone from the browser
 * Falls back to 'UTC' if detection fails
 */
export function detectUserTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timezone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/**
 * Formats a date in a specific timezone
 *
 * @param date - The date to format (assumed to be in UTC)
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @param formatStr - date-fns format string (e.g., "h:mm a")
 * @returns Formatted date string
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string,
  formatStr: string
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatInTimeZone(dateObj, timezone, formatStr, { locale: es })
  } catch {
    // Fallback to UTC if timezone is invalid
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, formatStr, { locale: es })
  }
}

/**
 * Gets the abbreviated timezone name (e.g., "EST", "PST")
 *
 * @param timezone - IANA timezone string
 * @param date - Optional date to consider DST (defaults to now)
 * @returns Timezone abbreviation
 */
export function getTimezoneAbbreviation(
  timezone: string,
  date: Date = new Date()
): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(date)
    const tzPart = parts.find((part) => part.type === 'timeZoneName')
    return tzPart?.value || timezone
  } catch {
    return timezone
  }
}

/**
 * Gets the UTC offset string (e.g., "UTC-5", "UTC+9")
 *
 * @param timezone - IANA timezone string
 * @param date - Optional date to consider DST (defaults to now)
 * @returns UTC offset string
 */
export function getTimezoneOffset(
  timezone: string,
  date: Date = new Date()
): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
    })
    const parts = formatter.formatToParts(date)
    const tzPart = parts.find((part) => part.type === 'timeZoneName')
    const offset = tzPart?.value || 'UTC'
    // Convert "GMT-05:00" to "UTC-5"
    return offset
      .replace('GMT', 'UTC')
      .replace(':00', '')
      .replace(/([+-])0/, '$1')
  } catch {
    return 'UTC'
  }
}

/**
 * Gets a human-readable timezone display name
 *
 * @param timezone - IANA timezone string
 * @returns Display name (e.g., "Eastern Standard Time")
 */
export function getTimezoneDisplayName(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('es', {
      timeZone: timezone,
      timeZoneName: 'long',
    })
    const parts = formatter.formatToParts(new Date())
    const tzPart = parts.find((part) => part.type === 'timeZoneName')
    return tzPart?.value || timezone
  } catch {
    return timezone
  }
}

/**
 * Converts a date from one timezone to another
 *
 * @param date - The date to convert
 * @param fromTz - Source timezone
 * @param toTz - Target timezone
 * @returns Date object in the target timezone
 */
export function convertBetweenTimezones(
  date: Date | string,
  fromTz: string,
  toTz: string
): Date {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    // Convert from source timezone to UTC, then to target timezone
    const utcDate = fromZonedTime(dateObj, fromTz)
    return toZonedTime(utcDate, toTz)
  } catch {
    return typeof date === 'string' ? new Date(date) : date
  }
}

/**
 * Formats a date showing both user and mentor timezones
 *
 * @param date - The session date (in UTC)
 * @param userTimezone - User's timezone
 * @param mentorTimezone - Mentor's timezone
 * @param formatStr - Format string for time display
 * @returns Object with formatted times in both timezones
 */
export function formatDualTimezone(
  date: Date | string,
  userTimezone: string,
  mentorTimezone: string,
  formatStr: string = 'h:mm a'
): { userTime: string; mentorTime: string; userTz: string; mentorTz: string } {
  const userTime = formatInTimezone(date, userTimezone, formatStr)
  const mentorTime = formatInTimezone(date, mentorTimezone, formatStr)
  const userTz = getTimezoneAbbreviation(userTimezone)
  const mentorTz = getTimezoneAbbreviation(mentorTimezone)

  return {
    userTime,
    mentorTime,
    userTz,
    mentorTz,
  }
}

/**
 * Validates if a string is a valid IANA timezone
 *
 * @param timezone - String to validate
 * @returns boolean indicating if valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}
