'use client'

/**
 * useTimezone Hook - MYM-20
 *
 * React hook for managing user timezone detection and state.
 * Automatically detects the user's browser timezone on mount.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  detectUserTimezone,
  getTimezoneAbbreviation,
  getTimezoneOffset,
} from '@/lib/timezone'
import type { UseTimezoneReturn } from '@/types/scheduling'

/**
 * Hook for managing timezone state with automatic detection
 *
 * @returns Object containing timezone info and loading state
 *
 * @example
 * ```tsx
 * const { timezone, abbreviation, isLoading } = useTimezone()
 *
 * if (isLoading) return <Spinner />
 *
 * return <div>Your timezone: {timezone} ({abbreviation})</div>
 * ```
 */
export function useTimezone(): UseTimezoneReturn {
  const [timezone, setTimezoneState] = useState<string>('')
  const [abbreviation, setAbbreviation] = useState<string>('')
  const [offset, setOffset] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Update derived values when timezone changes
  const updateTimezoneInfo = useCallback((tz: string) => {
    setAbbreviation(getTimezoneAbbreviation(tz))
    setOffset(getTimezoneOffset(tz))
  }, [])

  // Set timezone and update derived values
  const setTimezone = useCallback(
    (tz: string) => {
      setTimezoneState(tz)
      updateTimezoneInfo(tz)
    },
    [updateTimezoneInfo]
  )

  // Auto-detect timezone on mount
  useEffect(() => {
    const detected = detectUserTimezone()
    setTimezoneState(detected)
    updateTimezoneInfo(detected)
    setIsLoading(false)
  }, [updateTimezoneInfo])

  return {
    timezone,
    abbreviation,
    offset,
    isLoading,
    setTimezone,
  }
}
