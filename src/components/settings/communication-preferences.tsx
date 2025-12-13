'use client'

/**
 * MYM-30: Communication Preferences Component
 *
 * Allows mentors to configure their preferred communication channels.
 * Each channel can be enabled/disabled with an optional handle (phone, link, etc.)
 */

import { useState, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  Hash,
  Mail,
  Video,
  Headphones,
  Users,
  Phone,
  Send,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CHANNEL_CONFIG,
  CHANNEL_TYPES,
  type CommunicationChannel,
  type CommunicationChannelType,
} from '@/types/communication'

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle className="h-5 w-5" />,
  Hash: <Hash className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  Video: <Video className="h-5 w-5" />,
  Headphones: <Headphones className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Phone: <Phone className="h-5 w-5" />,
  Send: <Send className="h-5 w-5" />,
}

interface ChannelState {
  enabled: boolean
  handle: string
}

type ChannelsState = Record<CommunicationChannelType, ChannelState>

const initialState: ChannelsState = CHANNEL_TYPES.reduce(
  (acc, type) => ({
    ...acc,
    [type]: { enabled: false, handle: '' },
  }),
  {} as ChannelsState
)

export function CommunicationPreferences() {
  const [channels, setChannels] = useState<ChannelsState>(initialState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch current channels on mount
  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch('/api/users/me/communication-channels')
        const data = await response.json()

        if (data.success) {
          const newState = { ...initialState }
          data.channels.forEach((channel: CommunicationChannel) => {
            if (channel.channelType in newState) {
              newState[channel.channelType] = {
                enabled: channel.isActive,
                handle: channel.handle ?? '',
              }
            }
          })
          setChannels(newState)
        } else {
          setError(data.message || 'Error al cargar canales')
        }
      } catch (err) {
        console.error('Error fetching channels:', err)
        setError('Error de conexión')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannels()
  }, [])

  const handleToggle = useCallback((type: CommunicationChannelType) => {
    setChannels((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled },
    }))
    setSuccess(false)
    setError(null)
  }, [])

  const handleHandleChange = useCallback((type: CommunicationChannelType, value: string) => {
    setChannels((prev) => ({
      ...prev,
      [type]: { ...prev[type], handle: value },
    }))
    setSuccess(false)
    setError(null)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Build channels array from state
      const channelsToSave = CHANNEL_TYPES.filter((type) => channels[type].enabled).map((type) => ({
        type,
        handle: channels[type].handle || null,
        isActive: true,
      }))

      const response = await fetch('/api/users/me/communication-channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: channelsToSave }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Auto-hide success after 3s
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.message || 'Error al guardar')
      }
    } catch (err) {
      console.error('Error saving channels:', err)
      setError('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  const enabledCount = Object.values(channels).filter((c) => c.enabled).length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de Comunicación</CardTitle>
        <CardDescription>
          Selecciona cómo te gustaría comunicarte con tus mentees. Puedes habilitar múltiples
          canales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel list */}
        <div className="space-y-4">
          {CHANNEL_TYPES.map((type) => {
            const config = CHANNEL_CONFIG[type]
            const state = channels[type]

            return (
              <div
                key={type}
                className={`rounded-lg border p-4 transition-colors ${
                  state.enabled ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <Checkbox
                    id={`channel-${type}`}
                    checked={state.enabled}
                    onCheckedChange={() => handleToggle(type)}
                    className="mt-1"
                  />

                  {/* Icon and label */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={state.enabled ? 'text-primary' : 'text-muted-foreground'}>
                        {iconMap[config.icon]}
                      </span>
                      <Label
                        htmlFor={`channel-${type}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {config.label}
                      </Label>
                    </div>

                    <p className="text-sm text-muted-foreground">{config.description}</p>

                    {/* Handle input (only when enabled) */}
                    {state.enabled && (
                      <div className="pt-2">
                        <Label htmlFor={`handle-${type}`} className="text-sm text-muted-foreground">
                          {config.handleLabel} (opcional)
                        </Label>
                        <Input
                          id={`handle-${type}`}
                          placeholder={config.handlePlaceholder}
                          value={state.handle}
                          onChange={(e) => handleHandleChange(type, e.target.value)}
                          className="mt-1"
                        />
                        {config.requiresLink && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Podrás agregar el link específico para cada sesión desde el dashboard.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Validation message */}
        {enabledCount === 0 && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Selecciona al menos un canal para recibir reservas.</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Preferencias guardadas correctamente.</span>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving || enabledCount === 0}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Preferencias
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
