'use client'

/**
 * BookingCalendar Component - MYM-21, MYM-30
 *
 * Main booking interface that combines:
 * - Month calendar for date selection
 * - Time slots for the selected day
 * - Communication channel selection (MYM-30)
 * - Booking summary for confirmation
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimezoneIndicator } from '@/components/scheduling/timezone-indicator'
import { TimeSlotPicker, TimeSlotPickerSkeleton } from '@/components/scheduling/time-slot-picker'
import { BookingSummary } from '@/components/scheduling/booking-summary'
import { ChannelSelector } from '@/components/booking/channel-selector'
import { toast } from 'sonner'
import { detectUserTimezone, formatInTimezone } from '@/lib/timezone'
import { createBooking } from '@/app/mentors/[id]/book/actions'
import {
  addDays,
  startOfDay,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
  getDay,
} from 'date-fns'
import type {
  BookingCalendarProps,
  TimeSlot,
  MentorAvailability,
} from '@/types/scheduling'
import type { CommunicationChannelType } from '@/types/communication'

// Default mentor timezone (will be replaced with actual mentor timezone from profile)
const DEFAULT_TIMEZONE = 'America/New_York'

/**
 * Full booking interface for selecting and confirming a session
 *
 * @example
 * ```tsx
 * <BookingCalendar
 *   mentorId="123"
 *   mentorName="Carlos"
 *   mentorTimezone="America/New_York"
 *   hourlyRate={100}
 * />
 * ```
 */
export function BookingCalendar({
  mentorId,
  mentorName,
  mentorTimezone = DEFAULT_TIMEZONE,
  hourlyRate,
  mentorPhotoUrl,
}: BookingCalendarProps) {
  const router = useRouter()

  // State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannelType | null>(null)
  const [availability, setAvailability] = useState<MentorAvailability[]>([])
  const [existingBookings, setExistingBookings] = useState<Date[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userTimezone, setUserTimezone] = useState<string>('UTC')

  // Detect user timezone on mount
  useEffect(() => {
    setUserTimezone(detectUserTimezone())
  }, [])

  // Fetch mentor availability on mount
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/mentors/${mentorId}/availability`)
        if (response.ok) {
          const data = await response.json()
          setAvailability(data.availability || [])
          setExistingBookings(
            (data.bookings || []).map((b: { session_date: string }) =>
              new Date(b.session_date)
            )
          )
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error)
      }
    }
    fetchAvailability()
  }, [mentorId])

  // Generate slots for selected date
  const generateSlotsForDate = useCallback(
    (date: Date): TimeSlot[] => {
      const dayOfWeek = getDay(date)
      const dayAvailability = availability.filter(
        (a) => a.day_of_week === dayOfWeek && a.is_active
      )

      if (dayAvailability.length === 0) {
        return []
      }

      const generatedSlots: TimeSlot[] = []

      for (const avail of dayAvailability) {
        const [startHour, startMin] = avail.start_time.split(':').map(Number)
        const [endHour, endMin] = avail.end_time.split(':').map(Number)

        // Generate 1-hour slots
        let currentHour = startHour
        let currentMin = startMin

        while (
          currentHour < endHour ||
          (currentHour === endHour && currentMin < endMin)
        ) {
          const slotDate = setMinutes(
            setHours(startOfDay(date), currentHour),
            currentMin
          )

          // Check if slot is in the past
          if (isBefore(slotDate, new Date())) {
            currentHour += 1
            continue
          }

          // Check if slot is already booked
          const isBooked = existingBookings.some(
            (booking) =>
              Math.abs(booking.getTime() - slotDate.getTime()) < 60 * 60 * 1000
          )

          generatedSlots.push({
            datetime: slotDate,
            displayTime: formatInTimezone(slotDate, userTimezone, 'h:mm a'),
            mentorTime: formatInTimezone(slotDate, mentorTimezone, 'h:mm a'),
            isAvailable: !isBooked,
          })

          currentHour += 1
        }
      }

      return generatedSlots
    },
    [availability, existingBookings, userTimezone, mentorTimezone]
  )

  // Update slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingSlots(true)
      // Simulate async slot calculation
      setTimeout(() => {
        const generatedSlots = generateSlotsForDate(selectedDate)
        setSlots(generatedSlots)
        setIsLoadingSlots(false)
      }, 300)
    } else {
      setSlots([])
    }
    setSelectedSlot(null)
  }, [selectedDate, generateSlotsForDate])

  // Handle slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
  }

  // Handle booking confirmation
  const handleConfirm = async () => {
    if (!selectedSlot || !selectedChannel) return

    setIsSubmitting(true)

    try {
      const result = await createBooking({
        mentorId,
        sessionDate: selectedSlot.datetime,
        durationMinutes: 60,
        totalCost: hourlyRate,
        communicationChannel: selectedChannel,
      })

      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe Checkout
        router.push(result.checkoutUrl)
      } else {
        // Handle error
        if (result.errorCode === 'SLOT_TAKEN') {
          toast.error('Horario no disponible', {
            description:
              'Este horario ya no está disponible. Por favor, selecciona otro.',
          })
          // Refresh slots
          const newSlots = generateSlotsForDate(selectedDate!)
          setSlots(newSlots)
          setSelectedSlot(null)
        } else if (result.errorCode === 'UNAUTHORIZED') {
          toast.error('Sesión expirada', {
            description: 'Por favor, inicia sesión para continuar.',
          })
          router.push(`/login?returnTo=/mentors/${mentorId}/book`)
        } else {
          toast.error('Error', {
            description:
              result.error || 'Ocurrió un error. Por favor, intenta de nuevo.',
          })
        }
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Error', {
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setSelectedSlot(null)
  }

  // Disable dates before today and beyond 30 days
  const disabledDays = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 30),
  }

  // Check if a date has any availability
  const hasAvailability = (date: Date): boolean => {
    const dayOfWeek = getDay(date)
    return availability.some((a) => a.day_of_week === dayOfWeek && a.is_active)
  }

  // Modifier for dates with availability
  const modifiers = {
    available: (date: Date) =>
      hasAvailability(date) &&
      isAfter(date, addDays(new Date(), -1)) &&
      isBefore(date, addDays(new Date(), 31)),
  }

  const modifiersStyles = {
    available: {
      fontWeight: 'bold' as const,
    },
  }

  return (
    <div
      data-testid="booking_calendar"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Left: Calendar */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Selecciona una fecha</CardTitle>
          <TimezoneIndicator
            userTimezone={userTimezone}
            mentorTimezone={mentorTimezone}
            showBothTimezones
            className="mt-2"
          />
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
            data-testid="date_calendar"
          />
        </CardContent>
      </Card>

      {/* Right: Time Slots & Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {selectedDate
                ? 'Horarios disponibles'
                : 'Selecciona una fecha primero'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              isLoadingSlots ? (
                <TimeSlotPickerSkeleton />
              ) : (
                <TimeSlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelect={handleSlotSelect}
                />
              )
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Elige un día en el calendario para ver los horarios disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* MYM-30: Channel Selector - appears when slot is selected */}
        {selectedSlot && (
          <ChannelSelector
            mentorId={mentorId}
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
          />
        )}

        {/* Booking Summary - appears when slot AND channel are selected */}
        {selectedSlot && selectedChannel && (
          <BookingSummary
            mentor={{
              id: mentorId,
              name: mentorName,
              photoUrl: mentorPhotoUrl,
            }}
            selectedSlot={selectedSlot}
            totalCost={hourlyRate}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  )
}
