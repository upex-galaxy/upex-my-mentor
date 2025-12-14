'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationBadge } from '@/components/messaging/notification-badge'
import { useNotification } from '@/contexts/notification-context'

/**
 * MYM-58: Messages icon for Navbar with notification badge
 *
 * Displays a message icon that links to the messages dashboard.
 * Shows a notification badge when there are unread messages.
 */
export function MessagesNavIcon() {
  const { unreadCount } = useNotification()

  return (
    <Link href="/dashboard/messages" data-testid="messages_nav_icon">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        title={unreadCount > 0 ? `${unreadCount} mensajes sin leer` : 'Mensajes'}
      >
        <MessageCircle className="h-5 w-5" />
        <NotificationBadge count={unreadCount} />
      </Button>
    </Link>
  )
}
