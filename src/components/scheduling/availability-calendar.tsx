'use client'

/**
 * AvailabilityCalendar Component - MYM-19
 *
 * Weekly calendar for mentors to configure their recurring availability.
 * Shows 7 columns (Sun-Sat) with time blocks that can be added/edited/deleted.
 */

import { useState, useTransition, useCallback } from 'react'
import { Plus, Clock, Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { TimeBlockEditor } from './time-block-editor'
import { saveMentorAvailability } from '@/lib/actions/availability'
import type { AvailabilityCalendarProps, AvailabilitySlot, MentorAvailability } from '@/types/scheduling'

/**
 * Day names in Spanish
 */
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/**
 * Format time for display (e.g., "09:00" -> "9:00")
 */
function formatTime(time: string): string {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

/**
 * Convert MentorAvailability[] to AvailabilitySlot[] for local state
 * Normalizes time format from DB (HH:MM:SS) to UI format (HH:MM)
 */
function toSlots(data: MentorAvailability[]): AvailabilitySlot[] {
  return data.map((item) => ({
    id: item.id,
    day_of_week: item.day_of_week,
    // Normalize "09:00:00" -> "09:00" (remove seconds if present)
    start_time: item.start_time.substring(0, 5),
    end_time: item.end_time.substring(0, 5),
  }))
}

export function AvailabilityCalendar({
  mentorId,
  initialSlots,
  mentorTimezone,
}: AvailabilityCalendarProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Local state for slots
  const [slots, setSlots] = useState<AvailabilitySlot[]>(toSlots(initialSlots))
  const [hasChanges, setHasChanges] = useState(false)

  // Editing state: which day is being edited (null = none, 0-6 = day index)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null)

  // Get slots for a specific day
  const getSlotsForDay = useCallback(
    (dayOfWeek: number): AvailabilitySlot[] => {
      return slots
        .filter((s) => s.day_of_week === dayOfWeek)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
    },
    [slots]
  )

  // Add new slot
  const handleAddSlot = (dayOfWeek: number) => {
    setEditingDay(dayOfWeek)
    setEditingSlot(null)
  }

  // Edit existing slot
  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingDay(slot.day_of_week)
    setEditingSlot(slot)
  }

  // Save slot from editor
  const handleSaveSlot = (newSlot: AvailabilitySlot) => {
    setSlots((prev) => {
      // If editing existing slot, replace it
      if (editingSlot?.id) {
        return prev.map((s) => (s.id === editingSlot.id ? newSlot : s))
      }
      // Otherwise add new slot (with temp id)
      return [...prev, { ...newSlot, id: `temp-${Date.now()}` }]
    })
    setEditingDay(null)
    setEditingSlot(null)
    setHasChanges(true)
  }

  // Delete slot
  const handleDeleteSlot = () => {
    if (!editingSlot?.id) return
    setSlots((prev) => prev.filter((s) => s.id !== editingSlot.id))
    setEditingDay(null)
    setEditingSlot(null)
    setHasChanges(true)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDay(null)
    setEditingSlot(null)
  }

  // Save all changes
  const handleSave = () => {
    startTransition(async () => {
      const result = await saveMentorAvailability({
        slots: slots.map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
        timezone: mentorTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (result.success) {
        toast({
          title: 'Disponibilidad guardada',
          description: `Se guardaron ${result.savedCount} horarios correctamente.`,
        })
        setHasChanges(false)
      } else {
        toast({
          title: 'Error al guardar',
          description: result.error || 'Ocurrió un error. Intenta de nuevo.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Card data-testid="availability_calendar" className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Configura tu Disponibilidad
            </CardTitle>
            <CardDescription>
              Define los horarios en que estás disponible para sesiones de mentoría
            </CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={isPending || !hasChanges}
            data-testid="save_availability_button"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Weekly Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const daySlots = getSlotsForDay(dayIndex)
            const isEditing = editingDay === dayIndex

            return (
              <div
                key={dayIndex}
                data-testid={`day_column_${dayIndex}`}
                className="border rounded-lg p-3 min-h-[150px] bg-card"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="font-semibold">
                    {dayName}
                  </Badge>
                  {daySlots.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {daySlots.length} horario{daySlots.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Existing Slots */}
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleEditSlot(slot)}
                      data-testid={`slot_${slot.id}`}
                      className="w-full text-left p-2 rounded bg-primary/10 hover:bg-primary/20 transition-colors text-sm"
                    >
                      <span className="font-medium">
                        {formatTime(slot.start_time)}
                      </span>
                      <span className="text-muted-foreground mx-1">-</span>
                      <span className="font-medium">
                        {formatTime(slot.end_time)}
                      </span>
                    </button>
                  ))}

                  {/* Editor (when adding/editing on this day) */}
                  {isEditing && (
                    <TimeBlockEditor
                      slot={editingSlot || undefined}
                      dayOfWeek={dayIndex}
                      onSave={handleSaveSlot}
                      onCancel={handleCancelEdit}
                      onDelete={editingSlot ? handleDeleteSlot : undefined}
                      existingSlots={daySlots.filter((s) => s.id !== editingSlot?.id)}
                    />
                  )}

                  {/* Add Button */}
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleAddSlot(dayIndex)}
                      data-testid={`add_slot_${dayIndex}`}
                      className="w-full flex items-center justify-center gap-1 p-2 rounded border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Agregar</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {slots.length === 0 && editingDay === null && (
          <div
            data-testid="empty_availability"
            className="text-center py-8 text-muted-foreground"
          >
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Sin disponibilidad configurada</p>
            <p className="text-sm mt-1">
              Haz clic en &quot;Agregar&quot; en cualquier día para agregar tu primer horario
            </p>
          </div>
        )}

        {/* Timezone Info */}
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground text-center">
          Los horarios se muestran en tu zona horaria local:{' '}
          <strong>{mentorTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>
        </div>
      </CardContent>
    </Card>
  )
}
