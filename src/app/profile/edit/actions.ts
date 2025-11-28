'use server'

import { revalidatePath } from 'next/cache'
import { createServer } from '@/lib/supabase/server'
import {
  mentorProfileSchema,
  type MentorProfileFormData,
} from '@/lib/validations/profile'

export interface ActionResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

/**
 * Server Action para actualizar el perfil de un mentor
 * Valida los datos con Zod, verifica autenticación y rol, luego persiste en Supabase
 */
export async function updateMentorProfile(
  formData: MentorProfileFormData
): Promise<ActionResult> {
  try {
    // 1. Validar datos con Zod
    const validationResult = mentorProfileSchema.safeParse(formData)

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      validationResult.error.errors.forEach((err) => {
        const field = err.path[0] as string
        fieldErrors[field] = err.message
      })
      return {
        success: false,
        error: 'Por favor, corrige los errores en el formulario',
        fieldErrors,
      }
    }

    const validatedData = validationResult.data

    // 2. Obtener sesión del usuario
    const supabase = await createServer()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para actualizar tu perfil',
      }
    }

    // 3. Verificar que el usuario tiene rol mentor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'No se encontró tu perfil. Por favor, contacta soporte.',
      }
    }

    if (profile.role !== 'mentor') {
      return {
        success: false,
        error: 'Solo los mentores pueden editar este tipo de perfil',
      }
    }

    // 4. Normalizar skills a lowercase para consistencia en búsquedas
    const normalizedSpecialties = validatedData.specialties.map((skill) =>
      skill.trim()
    )

    // 5. Preparar datos para actualización
    const updateData = {
      name: validatedData.name,
      description: validatedData.description,
      specialties: normalizedSpecialties,
      years_of_experience: validatedData.years_of_experience,
      hourly_rate: validatedData.hourly_rate,
      linkedin_url: validatedData.linkedin_url || null,
      github_url: validatedData.github_url || null,
      updated_at: new Date().toISOString(),
    }

    // 6. Ejecutar UPDATE en Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return {
        success: false,
        error: 'No pudimos actualizar tu perfil. Por favor, intenta de nuevo.',
      }
    }

    // 7. Revalidar páginas que muestran el perfil
    revalidatePath('/profile/edit')
    revalidatePath('/mentors')
    revalidatePath(`/mentors/${user.id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error in updateMentorProfile:', error)
    return {
      success: false,
      error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
    }
  }
}
