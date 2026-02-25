'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import type { NotificationContextValue, NewMessagePayload } from '@/types'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

const NotificationContext = createContext<NotificationContextValue | null>(null)

interface NotificationProviderProps {
  children: ReactNode
}

/**
 * MYM-58: Notification Provider
 *
 * Manages global notification state including:
 * - Unread message count
 * - Active conversation tracking (to suppress toasts)
 * - Supabase Realtime subscription for new messages
 * - Toast notifications for new messages
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [unreadCount, setUnreadCount] = useState(0)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  // MYM-96: Key that increments when new messages arrive, triggering widget refresh
  const [conversationsRefreshKey, setConversationsRefreshKey] = useState(0)

  /**
   * Fetch unread message count from API
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    try {
      const response = await fetch('/api/messages/unread-count')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count ?? 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [user])

  /**
   * Fetch sender info for toast notification
   */
  const fetchSenderInfo = useCallback(
    async (senderId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('name, photo_url')
        .eq('id', senderId)
        .single()

      return {
        name: data?.name ?? 'Usuario',
        avatar: data?.photo_url ?? null,
      }
    },
    [supabase]
  )

  /**
   * Check if user is participant in conversation
   */
  const isUserInConversation = useCallback(
    async (conversationId: string) => {
      if (!user) return false

      const { data } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .single()

      return !!data
    },
    [supabase, user]
  )

  /**
   * Handle new message from Realtime
   */
  const handleNewMessage = useCallback(
    async (payload: RealtimePostgresInsertPayload<NewMessagePayload>) => {
      const newMessage = payload.new

      // Ignore messages sent by current user
      if (!user || newMessage.sender_id === user.id) return

      // Check if user is in this conversation
      const isParticipant = await isUserInConversation(newMessage.conversation_id)
      if (!isParticipant) return

      // MYM-91: Refetch unread count from server instead of optimistic +1
      // This ensures synchronization even with network issues or duplicate events
      await refreshUnreadCount()

      // MYM-96: Trigger widget refresh
      setConversationsRefreshKey((prev) => prev + 1)

      // Don't show toast if viewing this conversation
      if (activeConversationId === newMessage.conversation_id) return

      // Fetch sender info for toast
      const sender = await fetchSenderInfo(newMessage.sender_id)

      // Show toast notification using Sonner
      const messagePreview =
        newMessage.content.length > 50
          ? newMessage.content.substring(0, 50) + '...'
          : newMessage.content

      // MYM-92: Use toast.info() for better visibility with richColors
      toast.info(`Nuevo mensaje de ${sender.name}`, {
        description: messagePreview,
        duration: 5000,
        action: {
          label: 'Ver',
          onClick: () => router.push(`/dashboard/messages/${newMessage.conversation_id}`),
        },
      })
    },
    [user, activeConversationId, fetchSenderInfo, isUserInConversation, router, refreshUnreadCount]
  )

  // Fetch initial unread count on mount and when user changes
  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  // Subscribe to new messages via Realtime
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        handleNewMessage
      )
      .subscribe((status) => {
        // MYM-96: Log subscription status for debugging
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to message notifications')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error - falling back to polling')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, handleNewMessage])

  // MYM-96: Fallback polling for environments where Realtime may not work
  // Polls every 10 seconds when tab is visible for better responsiveness
  useEffect(() => {
    if (!user) return

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount()
        setConversationsRefreshKey((prev) => prev + 1)
      }
    }, 10000) // 10 seconds for better UX

    return () => clearInterval(pollInterval)
  }, [user, refreshUnreadCount])

  // Refetch count when tab becomes visible (handle offline/background scenarios)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshUnreadCount])

  const value: NotificationContextValue = {
    unreadCount,
    activeConversationId,
    setActiveConversation: setActiveConversationId,
    refreshUnreadCount,
    conversationsRefreshKey,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

/**
 * Hook to access notification context
 */
export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }

  return context
}
