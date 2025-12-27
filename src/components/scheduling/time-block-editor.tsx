'use client'

/**
 * TimeBlockEditor Component - MYM-19
 *
 * Inline editor for creating/editing availability time blocks.
 * Validates time order and overlap with existing slots.
 */

import { useState, useMemo } from 'react'
import { X, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { validateTimeOrder, validateSlotOverlap } from '@/lib/validations/availability'
import type { TimeBlockEditorProps, AvailabilitySlot } from '@/types/scheduling'

/**
 * Generate time options in 30-minute increments (00:00 to 23:30)
 */
function generateTimeOptions(): string[] {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      options.push(`${h}:${m}`)
    }
  }
  return options
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 */
function formatTimeDisplay(time: string): string {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

const TIME_OPTIONS = generateTimeOptions()

export function TimeBlockEditor({
  slot,
  dayOfWeek,
  onSave,
  onCancel,
  onDelete,
  existingSlots,
}: TimeBlockEditorProps) {
  const [startTime, setStartTime] = useState(slot?.start_time || '09:00')
  const [endTime, setEndTime] = useState(slot?.end_time || '10:00')
  const [error, setError] = useState<string | null>(null)

  // Validate and save
  const handleSave = () => {
    // Check time order
    const orderValidation = validateTimeOrder(startTime, endTime)
    if (!orderValidation.valid) {
      setError(orderValidation.error || 'Horario inválido')
      return
    }

    // Check for overlaps
    const newSlot: AvailabilitySlot = {
      id: slot?.id,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
    }

    const overlapValidation = validateSlotOverlap(
      newSlot,
      existingSlots,
      slot?.id
    )
    if (!overlapValidation.valid) {
      setError(overlapValidation.error || 'Horario solapado')
      return
    }

    setError(null)
    onSave(newSlot)
  }

  // Filter end time options to only show times after start time
  const filteredEndOptions = useMemo(() => {
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
    return TIME_OPTIONS.filter((time) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m > startMinutes
    })
  }, [startTime])

  return (
    <div
      data-testid="time_block_editor"
      className="p-3 bg-muted rounded-lg space-y-3"
    >
      <div className="flex items-center gap-2">
        {/* Start Time */}
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger className="w-[110px]" data-testid="start_time_select">
            <SelectValue placeholder="Inicio" />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.slice(0, -1).map((time) => (
              <SelectItem key={`start-${time}`} value={time}>
                {formatTimeDisplay(time)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">a</span>

        {/* End Time */}
        <Select value={endTime} onValueChange={setEndTime}>
          <SelectTrigger className="w-[110px]" data-testid="end_time_select">
            <SelectValue placeholder="Fin" />
          </SelectTrigger>
          <SelectContent>
            {filteredEndOptions.map((time) => (
              <SelectItem key={`end-${time}`} value={time}>
                {formatTimeDisplay(time)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleSave}
            className="h-8 w-8 text-primary hover:text-primary"
            data-testid="save_time_block"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onCancel}
            className="h-8 w-8"
            data-testid="cancel_time_block"
          >
            <X className="h-4 w-4" />
          </Button>
          {onDelete && slot?.id && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
              data-testid="delete_time_block"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p data-testid="time_block_error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
