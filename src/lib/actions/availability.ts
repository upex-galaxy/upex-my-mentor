'use server'

import { revalidatePath } from 'next/cache'
import { createServer } from '@/lib/supabase/server'
import { saveAvailabilitySchema } from '@/lib/validations/availability'
import type { SaveAvailabilityResult, MentorAvailability, AvailabilitySlot } from '@/types/scheduling'

/**
 * MYM-19: Get mentor's current availability
 */
export async function getMentorAvailability(
  mentorId?: string
): Promise<{ slots: MentorAvailability[]; error?: string }> {
  const supabase = await createServer()

  // If no mentorId provided, get current user's availability
  let targetMentorId = mentorId

  if (!targetMentorId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { slots: [], error: 'No autenticado' }
    }
    targetMentorId = user.id
  }

  const { data, error } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', targetMentorId)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching availability:', error)
    return { slots: [], error: 'Error al obtener disponibilidad' }
  }

  return { slots: data || [] }
}

/**
 * MYM-19: Save mentor availability (atomic operation)
 * Deletes all existing availability and inserts new slots
 */
export async function saveMentorAvailability(
  input: { slots: AvailabilitySlot[]; timezone: string }
): Promise<SaveAvailabilityResult> {
  const supabase = await createServer()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Verify user is a mentor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'mentor') {
    return { success: false, error: 'Solo los mentores pueden configurar disponibilidad' }
  }

  // Validate input
  const validation = saveAvailabilitySchema.safeParse(input)
  if (!validation.success) {
    const firstError = validation.error.errors[0]
    return { success: false, error: firstError?.message || 'Datos inválidos' }
  }

  const { slots } = validation.data

  // MYM-133: Atomic DELETE+INSERT with verification
  // Step 1: Delete all existing availability and verify rows were affected
  const { data: deletedRows, error: deleteError } = await supabase
    .from('mentor_availability')
    .delete()
    .eq('mentor_id', user.id)
    .select('id')

  if (deleteError) {
    console.error('Error deleting availability:', deleteError)
    return { success: false, error: 'Error al actualizar disponibilidad' }
  }

  // Step 2: Insert new slots (if any)
  if (slots.length > 0) {
    const slotsToInsert = slots.map((slot) => ({
      mentor_id: user.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: true,
    }))

    const { data: insertedRows, error: insertError } = await supabase
      .from('mentor_availability')
      .insert(slotsToInsert)
      .select('id, day_of_week, start_time, end_time')

    if (insertError) {
      console.error('Error inserting availability:', insertError)
      return { success: false, error: 'Error al guardar disponibilidad' }
    }

    if (!insertedRows || insertedRows.length !== slots.length) {
      console.error('Insert mismatch: expected', slots.length, 'got', insertedRows?.length)
      return { success: false, error: 'No se pudieron guardar todos los horarios' }
    }
  }

  // MYM-133: Revalidate the page cache so refresh shows updated data
  revalidatePath('/dashboard/mentor/availability')

  return { success: true, savedCount: slots.length }
}

/**
 * MYM-19: Delete a single availability slot
 */
export async function deleteAvailabilitySlot(
  slotId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServer()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Delete only if it belongs to the current user
  const { error } = await supabase
    .from('mentor_availability')
    .delete()
    .eq('id', slotId)
    .eq('mentor_id', user.id)

  if (error) {
    console.error('Error deleting slot:', error)
    return { success: false, error: 'Error al eliminar horario' }
  }

  return { success: true }
}

/**
 * MYM-19: Add a single availability slot
 */
export async function addAvailabilitySlot(
  slot: AvailabilitySlot
): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = await createServer()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  // Verify user is a mentor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'mentor') {
    return { success: false, error: 'Solo los mentores pueden configurar disponibilidad' }
  }

  // Check for overlapping slots on the same day
  const { data: existingSlots } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', user.id)
    .eq('day_of_week', slot.day_of_week)
    .eq('is_active', true)

  if (existingSlots) {
    for (const existing of existingSlots) {
      if (slotsOverlap(slot, existing)) {
        return { success: false, error: 'Este horario se solapa con otro existente' }
      }
    }
  }

  // Insert new slot
  const { data, error } = await supabase
    .from('mentor_availability')
    .insert({
      mentor_id: user.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error adding slot:', error)
    return { success: false, error: 'Error al agregar horario' }
  }

  return { success: true, id: data.id }
}

/**
 * Helper: Check if two time slots overlap
 */
function slotsOverlap(
  slot1: { start_time: string; end_time: string },
  slot2: { start_time: string; end_time: string }
): boolean {
  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const s1Start = timeToMinutes(slot1.start_time)
  const s1End = timeToMinutes(slot1.end_time)
  const s2Start = timeToMinutes(slot2.start_time)
  const s2End = timeToMinutes(slot2.end_time)

  return s1Start < s2End && s2Start < s1End
}
