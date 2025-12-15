import { z } from 'zod'

/**
 * Schema de validación para el formulario de perfil de mentor
 * Incluye validaciones client-side con mensajes contextuales en español
 */
export const mentorProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre es requerido para que los estudiantes te identifiquen')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  description: z
    .string()
    .min(10, 'Cuéntanos más sobre ti (mínimo 10 caracteres)')
    .max(500, 'La biografía no puede exceder 500 caracteres'),

  specialties: z
    .array(z.string().min(1).max(50))
    .min(1, 'Añade al menos una especialidad para que los estudiantes te encuentren')
    .max(20, 'Máximo 20 especialidades permitidas'),

  years_of_experience: z
    .number()
    .int('Los años de experiencia deben ser un número entero')
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .max(50, 'Máximo 50 años de experiencia'),

  hourly_rate: z
    .number()
    .positive('La tarifa por hora debe ser un número positivo')
    .max(1000, 'La tarifa máxima es $1,000 por hora'),

  linkedin_url: z
    .string()
    .url('Introduce una URL de LinkedIn válida')
    .refine(
      (url) => url === '' || url.includes('linkedin.com'),
      'La URL debe ser de LinkedIn'
    )
    .optional()
    .or(z.literal('')),

  github_url: z
    .string()
    .url('Introduce una URL de GitHub válida')
    .refine(
      (url) => url === '' || url.includes('github.com'),
      'La URL debe ser de GitHub'
    )
    .optional()
    .or(z.literal('')),
})

export type MentorProfileFormData = z.infer<typeof mentorProfileSchema>

/**
 * Opciones para el select de años de experiencia
 * Agrupados en rangos para mejor UX
 */
export const experienceOptions = [
  { value: 0, label: '0-1 años (Junior)' },
  { value: 2, label: '2-4 años (Mid)' },
  { value: 5, label: '5-9 años (Senior)' },
  { value: 10, label: '10-14 años (Staff/Principal)' },
  { value: 15, label: '15-19 años (Director)' },
  { value: 20, label: '20+ años (Executive)' },
] as const
