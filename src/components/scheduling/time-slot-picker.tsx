'use client'

/**
 * TimeSlotPicker Component - MYM-21
 *
 * Displays available time slots for a selected day.
 * Users can click on an available slot to select it for booking.
 */

import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import type { TimeSlotPickerProps, TimeSlot } from '@/types/scheduling'

/**
 * Grid of time slots for a specific day
 *
 * @example
 * ```tsx
 * <TimeSlotPicker
 *   slots={availableSlots}
 *   selectedSlot={selected}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  isLoading = false,
}: TimeSlotPickerProps) {
  if (isLoading) {
    return <TimeSlotPickerSkeleton />
  }

  if (slots.length === 0) {
    return (
      <div
        data-testid="no_slots_message"
        className="text-center py-8 text-muted-foreground"
      >
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No hay horarios disponibles para este día</p>
        <p className="text-sm mt-1">Selecciona otra fecha</p>
      </div>
    )
  }

  return (
    <div data-testid="time_slot_picker" className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Horarios disponibles
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => (
          <TimeSlotButton
            key={slot.datetime.toISOString()}
            slot={slot}
            isSelected={
              selectedSlot?.datetime.toISOString() === slot.datetime.toISOString()
            }
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual time slot button
 */
function TimeSlotButton({
  slot,
  isSelected,
  onSelect,
}: {
  slot: TimeSlot
  isSelected: boolean
  onSelect: (slot: TimeSlot) => void
}) {
  const handleClick = () => {
    if (slot.isAvailable) {
      onSelect(slot)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!slot.isAvailable}
      data-testid={`time_slot_${slot.displayTime.replace(/[:\s]/g, '')}`}
      className={cn(
        'relative px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        slot.isAvailable
          ? isSelected
            ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
            : 'bg-background hover:bg-primary/10 border-primary/30 hover:border-primary hover:shadow-md'
          : 'bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50'
      )}
    >
      <span className="block">{slot.displayTime}</span>
      {!slot.isAvailable && (
        <span className="block text-xs opacity-70">Reservado</span>
      )}
    </button>
  )
}

/**
 * Skeleton loader for TimeSlotPicker
 */
export function TimeSlotPickerSkeleton() {
  return (
    <div data-testid="time_slots_loading" className="space-y-3">
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    </div>
  )
}
