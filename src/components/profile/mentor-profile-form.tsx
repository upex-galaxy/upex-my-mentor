'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  mentorProfileSchema,
  experienceOptions,
  type MentorProfileFormData,
} from '@/lib/validations/profile'
import { updateMentorProfile } from '@/app/profile/edit/actions'
import type { Database } from '@/types/supabase'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SkillsInput } from './skills-input'

type Profile = Database['public']['Tables']['profiles']['Row']

interface MentorProfileFormProps {
  initialData?: Profile
  onSuccess?: () => void
}

export function MentorProfileForm({
  initialData,
  onSuccess,
}: MentorProfileFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
  } = useForm<MentorProfileFormData>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      specialties: initialData?.specialties ?? [],
      years_of_experience: initialData?.years_of_experience ?? 0,
      hourly_rate: initialData?.hourly_rate ?? 0,
      linkedin_url: initialData?.linkedin_url ?? '',
      github_url: initialData?.github_url ?? '',
    },
  })

  const onSubmit = async (data: MentorProfileFormData) => {
    setIsSubmitting(true)
    setServerError(null)
    setSuccessMessage(null)

    try {
      const result = await updateMentorProfile(data)

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof MentorProfileFormData, {
              type: 'server',
              message,
            })
          })
        }
        setServerError(result.error ?? 'Error desconocido')
        return
      }

      setSuccessMessage('¡Perfil actualizado! Ya puedes recibir solicitudes de mentoría.')
      onSuccess?.()
    } catch {
      setServerError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Construye tu perfil profesional</CardTitle>
        <CardDescription>
          Tu perfil es tu carta de presentación ante estudiantes que buscan crecer
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Server error alert */}
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Success alert */}
          {successMessage && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Nombre completo */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Carlos Ramírez"
              {...register('name')}
              className={cn(errors.name && 'border-destructive')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Biografía */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Sobre ti <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Cuéntanos sobre tu experiencia, logros y qué te motiva a ser mentor..."
              rows={4}
              {...register('description')}
              className={cn(errors.description && 'border-destructive')}
              aria-invalid={!!errors.description}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mínimo 10 caracteres</span>
              <span>Máximo 500 caracteres</span>
            </div>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Especialidades */}
          <div className="space-y-2">
            <Label>
              Especialidades técnicas <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="specialties"
              control={control}
              render={({ field }) => (
                <SkillsInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.specialties?.message}
                  placeholder="Escribe una habilidad y presiona Enter"
                />
              )}
            />
          </div>

          {/* Años de experiencia */}
          <div className="space-y-2">
            <Label htmlFor="years_of_experience">
              Años de experiencia <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="years_of_experience"
              control={control}
              render={({ field }) => (
                <Select
                  id="years_of_experience"
                  value={String(field.value)}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={cn(errors.years_of_experience && 'border-destructive')}
                >
                  <option value="" disabled>
                    Selecciona
                  </option>
                  {experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.years_of_experience && (
              <p className="text-sm text-destructive">
                {errors.years_of_experience.message}
              </p>
            )}
          </div>

          {/* Tarifa por hora */}
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">
              Tarifa por hora (USD) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Controller
                name="hourly_rate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1000"
                    placeholder="85.00"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? 0 : parseFloat(value))
                    }}
                    className={cn(
                      'pl-7',
                      errors.hourly_rate && 'border-destructive'
                    )}
                    aria-invalid={!!errors.hourly_rate}
                  />
                )}
              />
            </div>
            {errors.hourly_rate && (
              <p className="text-sm text-destructive">{errors.hourly_rate.message}</p>
            )}
          </div>

          {/* URLs sociales */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">URL de LinkedIn</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/tu-perfil"
                {...register('linkedin_url')}
                className={cn(errors.linkedin_url && 'border-destructive')}
                aria-invalid={!!errors.linkedin_url}
              />
              {errors.linkedin_url && (
                <p className="text-sm text-destructive">
                  {errors.linkedin_url.message}
                </p>
              )}
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <Label htmlFor="github_url">URL de GitHub</Label>
              <Input
                id="github_url"
                type="url"
                placeholder="https://github.com/tu-usuario"
                {...register('github_url')}
                className={cn(errors.github_url && 'border-destructive')}
                aria-invalid={!!errors.github_url}
              />
              {errors.github_url && (
                <p className="text-sm text-destructive">
                  {errors.github_url.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando perfil...
              </>
            ) : (
              'Guardar perfil'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
