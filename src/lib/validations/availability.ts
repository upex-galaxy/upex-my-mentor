import { z } from 'zod'

/**
 * MYM-19: Validation schemas for mentor availability
 */

// Time format validation (HH:MM)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * Single availability slot schema
 */
export const availabilitySlotSchema = z.object({
  id: z.string().uuid().optional(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(timeRegex, 'Formato de hora inválido (use HH:MM)'),
  end_time: z.string().regex(timeRegex, 'Formato de hora inválido (use HH:MM)'),
}).refine(
  (data) => {
    // Ensure end_time is after start_time
    const [startH, startM] = data.start_time.split(':').map(Number)
    const [endH, endM] = data.end_time.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    return endMinutes > startMinutes
  },
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['end_time'],
  }
)

/**
 * Check if two time slots overlap on the same day
 */
function slotsOverlap(
  slot1: { start_time: string; end_time: string },
  slot2: { start_time: string; end_time: string }
): boolean {
  const [s1Start, s1End] = [
    timeToMinutes(slot1.start_time),
    timeToMinutes(slot1.end_time),
  ]
  const [s2Start, s2End] = [
    timeToMinutes(slot2.start_time),
    timeToMinutes(slot2.end_time),
  ]

  // Overlap if one starts before the other ends
  return s1Start < s2End && s2Start < s1End
}

/**
 * Convert HH:MM to minutes for comparison
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Save availability input schema with overlap validation
 */
export const saveAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema),
  timezone: z.string().min(1, 'Zona horaria requerida'),
}).refine(
  (data) => {
    // Check for overlapping slots on the same day
    const slotsByDay = new Map<number, typeof data.slots>()

    for (const slot of data.slots) {
      const daySlots = slotsByDay.get(slot.day_of_week) || []

      // Check against existing slots on same day
      for (const existing of daySlots) {
        if (slotsOverlap(slot, existing)) {
          return false
        }
      }

      daySlots.push(slot)
      slotsByDay.set(slot.day_of_week, daySlots)
    }

    return true
  },
  {
    message: 'Los horarios no pueden solaparse en el mismo día',
    path: ['slots'],
  }
)

/**
 * Type inference from schemas
 */
export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>
export type SaveAvailabilitySchemaInput = z.infer<typeof saveAvailabilitySchema>

/**
 * Helper to validate a single slot for overlap against existing slots
 */
export function validateSlotOverlap(
  newSlot: { start_time: string; end_time: string; day_of_week: number },
  existingSlots: Array<{ start_time: string; end_time: string; day_of_week: number; id?: string }>,
  excludeId?: string
): { valid: boolean; error?: string } {
  const sameDaySlots = existingSlots.filter(
    (s) => s.day_of_week === newSlot.day_of_week && s.id !== excludeId
  )

  for (const existing of sameDaySlots) {
    if (slotsOverlap(newSlot, existing)) {
      return {
        valid: false,
        error: 'Este horario se solapa con otro existente',
      }
    }
  }

  return { valid: true }
}

/**
 * Validate time order (end > start)
 */
export function validateTimeOrder(
  startTime: string,
  endTime: string
): { valid: boolean; error?: string } {
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return { valid: false, error: 'Formato de hora inválido' }
  }

  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  if (endMinutes <= startMinutes) {
    return { valid: false, error: 'La hora de fin debe ser posterior a la de inicio' }
  }

  return { valid: true }
}
