'use client'

/**
 * MYM-30: Meeting Link Modal
 *
 * Allows mentors to add or update the meeting link for a session.
 */

import { useState } from 'react'
import { Loader2, Link as LinkIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface MeetingLinkModalProps {
  bookingId: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: (bookingId: string, meetingLink: string) => void
}

export function MeetingLinkModal({
  bookingId,
  isOpen,
  onClose,
  onSuccess,
}: MeetingLinkModalProps) {
  const [meetingLink, setMeetingLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingId) return

    // Basic URL validation
    try {
      new URL(meetingLink)
    } catch {
      setError('Por favor, ingresa una URL válida')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/meeting-link`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingLink }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Link guardado', {
          description: 'El link de la sesión se ha guardado correctamente.',
        })
        onSuccess?.(bookingId, meetingLink)
        handleClose()
      } else {
        setError(data.message || 'Error al guardar el link')
      }
    } catch (err) {
      console.error('Error saving meeting link:', err)
      setError('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setMeetingLink('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Agregar Link de Sesión
          </DialogTitle>
          <DialogDescription>
            Ingresa el link de la videollamada o reunión para esta sesión.
            El mentee podrá ver este link cuando sea momento de unirse.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Link de la sesión</Label>
            <Input
              id="meetingLink"
              type="url"
              placeholder="https://zoom.us/j/... o meet.google.com/..."
              value={meetingLink}
              onChange={(e) => {
                setMeetingLink(e.target.value)
                setError(null)
              }}
              className={error ? 'border-destructive' : ''}
              data-testid="meeting_link_input"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Soportamos Zoom, Google Meet, Teams, Slack Huddles, y cualquier otra plataforma.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !meetingLink.trim()}
              data-testid="save_meeting_link_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Link'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
