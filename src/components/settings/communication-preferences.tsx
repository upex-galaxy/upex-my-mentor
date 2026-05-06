'use client'

/**
 * MYM-30: Communication Preferences Component
 *
 * Allows mentors to configure their preferred communication channels.
 * Each channel can be enabled/disabled with an optional handle (phone, link, etc.)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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

// Channel categories for better organization
const CHANNEL_CATEGORIES = {
  video: {
    title: 'Videollamadas',
    description: 'Plataformas para sesiones en vivo',
    icon: <Video className="h-5 w-5" />,
    channels: ['google_meet', 'zoom', 'teams', 'skype'] as CommunicationChannelType[],
  },
  messaging: {
    title: 'Mensajería',
    description: 'Apps de mensajería instantánea',
    icon: <MessageCircle className="h-5 w-5" />,
    channels: ['slack', 'whatsapp', 'discord', 'telegram'] as CommunicationChannelType[],
  },
  other: {
    title: 'Otros',
    description: 'Canales adicionales',
    icon: <Mail className="h-5 w-5" />,
    channels: ['email'] as CommunicationChannelType[],
  },
}

// Popular channels to highlight
const POPULAR_CHANNELS: CommunicationChannelType[] = ['google_meet', 'zoom', 'slack', 'whatsapp']

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

  // Quick select popular channels
  const handleSelectPopular = useCallback(() => {
    setChannels((prev) => {
      const newState = { ...prev }
      POPULAR_CHANNELS.forEach((type) => {
        newState[type] = { ...newState[type], enabled: true }
      })
      return newState
    })
    setSuccess(false)
    setError(null)
  }, [])

  // Clear all channels
  const handleClearAll = useCallback(() => {
    setChannels(initialState)
    setSuccess(false)
    setError(null)
  }, [])

  // Render a single channel item
  const renderChannelItem = (type: CommunicationChannelType) => {
    const config = CHANNEL_CONFIG[type]
    const state = channels[type]
    const isPopular = POPULAR_CHANNELS.includes(type)

    return (
      <div
        key={type}
        data-testid="channel_item"
        className={`group relative rounded-xl border-2 p-4 transition-all duration-200 ${
          state.enabled
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-4">
          <Checkbox
            id={`channel-${type}`}
            checked={state.enabled}
            onCheckedChange={() => handleToggle(type)}
            data-testid="channel_checkbox"
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`transition-colors ${state.enabled ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
              >
                {iconMap[config.icon]}
              </span>
              <Label
                htmlFor={`channel-${type}`}
                data-testid="channel_label"
                className="text-base font-medium cursor-pointer"
              >
                {config.label}
              </Label>
              {isPopular && (
                <Badge data-testid="popular_badge" variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>

            <p data-testid="channel_description" className="text-sm text-muted-foreground mt-1">{config.description}</p>

            {state.enabled && (
              <div data-testid="handle_input_section" className="mt-3 animate-in slide-in-from-top-2 duration-200">
                <Label htmlFor={`handle-${type}`} className="text-sm text-muted-foreground">
                  {config.handleLabel} (opcional)
                </Label>
                <Input
                  id={`handle-${type}`}
                  data-testid="handle_input"
                  placeholder={config.handlePlaceholder}
                  value={state.handle}
                  onChange={(e) => handleHandleChange(type, e.target.value)}
                  className="mt-1.5"
                />
                {config.requiresLink && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Podrás agregar el link específico para cada sesión desde el dashboard.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card data-testid="communicationPreferences" className="border-2">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 data-testid="preferences_loading" className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando preferencias...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div data-testid="communicationPreferences" className="space-y-6">
      {/* Header Card with Stats */}
      <Card data-testid="header_card" className="border-2 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Preferencias de Comunicación
              </CardTitle>
              <CardDescription className="mt-1">
                Configura los canales que tus mentees podrán usar para contactarte.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                data-testid="active_channels_badge"
                variant={enabledCount > 0 ? 'default' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {enabledCount} {enabledCount === 1 ? 'canal activo' : 'canales activos'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectPopular} data-testid="select_popular_button">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Seleccionar populares
            </Button>
            {enabledCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} data-testid="clear_all_button">
                Limpiar selección
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Channel Categories */}
      {Object.entries(CHANNEL_CATEGORIES).map(([key, category]) => {
        const categoryEnabledCount = category.channels.filter((t) => channels[t].enabled).length

        return (
          <Card key={key} data-testid="channel_category_card" className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                {categoryEnabledCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {categoryEnabledCount} seleccionado{categoryEnabledCount !== 1 && 's'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                {category.channels.map(renderChannelItem)}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Footer with Messages and Save Button */}
      <Card data-testid="footer_actions_card" className="border-2">
        <CardContent className="pt-6">
          {/* Messages */}
          <div className="space-y-3 mb-6">
            {enabledCount === 0 && (
              <div data-testid="no_channels_warning" className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Selecciona al menos un canal para que tus mentees puedan reservar sesiones.
                </span>
              </div>
            )}

            {error && (
              <div data-testid="error_message" className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div data-testid="success_message" className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-500">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Preferencias guardadas correctamente.</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || enabledCount === 0}
              size="lg"
              className="min-w-[200px]"
              data-testid="save_preferences_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Guardar Preferencias
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
