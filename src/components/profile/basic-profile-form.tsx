'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  basicProfileSchema,
  type BasicProfileFormData,
} from '@/lib/validations/profile'
import { updateBasicProfile } from '@/app/profile/edit/actions'
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
import { Alert, AlertDescription } from '@/components/ui/alert'

type Profile = Database['public']['Tables']['profiles']['Row']

interface BasicProfileFormProps {
  initialData?: Profile
  onSuccess?: () => void
}

export function BasicProfileForm({
  initialData,
  onSuccess,
}: BasicProfileFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
  } = useForm<BasicProfileFormData>({
    resolver: zodResolver(basicProfileSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      photo_url: initialData?.photo_url ?? '',
    },
  })

  const onSubmit = async (data: BasicProfileFormData) => {
    setIsSubmitting(true)
    setServerError(null)
    setSuccessMessage(null)

    try {
      const result = await updateBasicProfile(data)

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof BasicProfileFormData, {
              type: 'server',
              message,
            })
          })
        }
        setServerError(result.error ?? 'Error desconocido')
        return
      }

      setSuccessMessage('¡Perfil actualizado correctamente!')
      onSuccess?.()
    } catch {
      setServerError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card data-testid="basicProfileForm" className="shadow-lg">
      <CardHeader>
        <CardTitle data-testid="form_title" className="text-2xl">
          Edita tu perfil
        </CardTitle>
        <CardDescription data-testid="form_description">
          Actualiza tu información personal para que otros usuarios te conozcan
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Server error alert */}
          {serverError && (
            <Alert data-testid="server_error_alert" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Success alert */}
          {successMessage && (
            <Alert
              data-testid="success_alert"
              className="border-green-500 bg-green-50 text-green-700"
            >
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
              data-testid="name_input"
              placeholder="Ej: María García"
              {...register('name')}
              className={cn(errors.name && 'border-destructive')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p data-testid="name_error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Biografía */}
          <div className="space-y-2">
            <Label htmlFor="description">Sobre ti</Label>
            <Textarea
              id="description"
              data-testid="description_textarea"
              placeholder="Cuéntanos un poco sobre ti, tus intereses y objetivos..."
              rows={4}
              {...register('description')}
              className={cn(errors.description && 'border-destructive')}
              aria-invalid={!!errors.description}
            />
            <div
              data-testid="description_counter"
              className="flex justify-end text-xs text-muted-foreground"
            >
              <span>Máximo 500 caracteres</span>
            </div>
            {errors.description && (
              <p data-testid="description_error" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* URL de foto */}
          <div className="space-y-2">
            <Label htmlFor="photo_url">URL de foto de perfil</Label>
            <Input
              id="photo_url"
              data-testid="photo_url_input"
              type="url"
              placeholder="https://ejemplo.com/tu-foto.jpg"
              {...register('photo_url')}
              className={cn(errors.photo_url && 'border-destructive')}
              aria-invalid={!!errors.photo_url}
            />
            <p className="text-xs text-muted-foreground">
              Puedes usar una URL de imagen de Gravatar, LinkedIn u otro servicio
            </p>
            {errors.photo_url && (
              <p data-testid="photo_url_error" className="text-sm text-destructive">
                {errors.photo_url.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button
            data-testid="cancel_button"
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button
            data-testid="submit_button"
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
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
