'use client'

/**
 * MYM-30: Channel Selector Component
 *
 * Allows mentees to select their preferred communication channel during booking.
 * Fetches mentor's active channels and displays them for selection.
 */

import { useState, useEffect } from 'react'
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
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  CHANNEL_CONFIG,
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

interface ChannelSelectorProps {
  mentorId: string
  selectedChannel: CommunicationChannelType | null
  onChannelSelect: (channel: CommunicationChannelType) => void
  className?: string
}

export function ChannelSelector({
  mentorId,
  selectedChannel,
  onChannelSelect,
  className,
}: ChannelSelectorProps) {
  const [channels, setChannels] = useState<CommunicationChannel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChannels() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/users/${mentorId}/communication-channels`)
        const data = await response.json()

        if (data.success) {
          setChannels(data.channels)
          // Auto-select first channel if none selected and channels available
          if (!selectedChannel && data.channels.length > 0) {
            onChannelSelect(data.channels[0].channelType)
          }
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

    if (mentorId) {
      fetchChannels()
    }
  }, [mentorId, selectedChannel, onChannelSelect])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center gap-2 py-6 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </CardContent>
      </Card>
    )
  }

  if (channels.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">
              El mentor no ha configurado canales de comunicación.
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Canal de Comunicación</CardTitle>
        <CardDescription>
          Selecciona cómo te gustaría comunicarte durante la sesión
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedChannel || undefined}
          onValueChange={(value) => onChannelSelect(value as CommunicationChannelType)}
          className="space-y-2"
        >
          {channels.map((channel) => {
            const config = CHANNEL_CONFIG[channel.channelType]
            const isSelected = selectedChannel === channel.channelType

            return (
              <div
                key={channel.channelType}
                className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => onChannelSelect(channel.channelType)}
              >
                <RadioGroupItem
                  value={channel.channelType}
                  id={`channel-${channel.channelType}`}
                />
                <Label
                  htmlFor={`channel-${channel.channelType}`}
                  className="flex flex-1 items-center gap-3 cursor-pointer"
                >
                  <span className={isSelected ? 'text-primary' : 'text-muted-foreground'}>
                    {iconMap[config.icon]}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
