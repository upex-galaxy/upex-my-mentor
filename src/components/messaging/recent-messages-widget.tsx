'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotification } from '@/contexts/notification-context';
import { QuickReplyModal } from './quick-reply-modal';
import type { RecentMessagesWidgetProps, ConversationWithDetails, ConversationParticipant } from '@/types';

/**
 * MYM-59: Format relative timestamp for widget display
 */
function formatWidgetTime(dateString: string | null | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }

  if (isYesterday(date)) {
    return 'Ayer';
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date > weekAgo) {
    return formatDistanceToNow(date, { addSuffix: false, locale: es });
  }

  return format(date, 'dd/MM');
}

/**
 * MYM-59: Truncate message preview
 */
function truncateMessage(content: string, maxLength: number = 50): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * MYM-59: Widget item for a single conversation
 */
function WidgetConversationItem({
  conversation,
  onClick,
}: {
  conversation: ConversationWithDetails;
  onClick: () => void;
}) {
  const { other_participant, last_message, unread_count } = conversation;

  let messagePreview = 'Nueva conversación';
  if (last_message?.content) {
    const isOwnMessage = last_message.sender_id !== other_participant.id;
    const prefix = isOwnMessage ? 'Tú: ' : '';
    messagePreview = prefix + truncateMessage(last_message.content);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`widget_conversation_${conversation.id}`}
      className={cn(
        'w-full flex items-center gap-3 p-3 text-left',
        'hover:bg-muted/50 transition-colors rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {other_participant.photo_url ? (
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={other_participant.photo_url}
              alt={other_participant.name || 'Usuario'}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
            {other_participant.name?.charAt(0) || 'U'}
          </div>
        )}

        {/* Unread indicator dot */}
        {unread_count > 0 && (
          <span
            data-testid="unread_dot"
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            data-testid="participant_name"
            className={cn(
              'font-medium truncate text-sm',
              unread_count > 0 && 'font-semibold'
            )}
          >
            {other_participant.name || 'Usuario'}
          </span>

          <span
            data-testid="timestamp"
            className="text-xs text-muted-foreground flex-shrink-0"
          >
            {formatWidgetTime(last_message?.created_at || conversation.updated_at)}
          </span>
        </div>

        <p
          data-testid="message_preview"
          className={cn(
            'text-xs truncate mt-0.5',
            unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {messagePreview}
        </p>
      </div>

      {/* Arrow indicator */}
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

/**
 * MYM-59: Empty state for widget when mentor has no messages
 */
function WidgetEmptyState({ userRole }: { userRole: 'student' | 'mentor' | 'admin' }) {
  return (
    <div
      data-testid="widget_empty_state"
      className="flex flex-col items-center justify-center py-8 px-4 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
      </div>

      <p className="text-sm text-muted-foreground max-w-xs">
        {userRole === 'mentor'
          ? 'No tienes mensajes aún. Completa tu perfil para atraer estudiantes.'
          : 'No tienes conversaciones aún. Explora mentores para comenzar.'}
      </p>
    </div>
  );
}

/**
 * MYM-59: Recent Messages Widget for Mentor Dashboard
 * Shows up to 5 recent conversations with quick reply capability
 */
export function RecentMessagesWidget({
  userId,
  userRole,
  initialConversations,
}: RecentMessagesWidgetProps) {
  const { unreadCount } = useNotification();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(initialConversations);

  // Modal state
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    participant: ConversationParticipant;
  } | null>(null);

  // Limit to 5 conversations
  const displayConversations = conversations.slice(0, 5);

  const handleConversationClick = useCallback((conversation: ConversationWithDetails) => {
    setSelectedConversation({
      id: conversation.id,
      participant: conversation.other_participant,
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  const handleMessageSent = useCallback(() => {
    // After sending a message, we could refresh the list
    // For now, the real-time subscription will handle updates
  }, []);

  return (
    <>
      <Card data-testid="recent_messages_widget" className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Mensajes Recientes
                {unreadCount > 0 && (
                  <Badge
                    data-testid="unread_badge"
                    variant="default"
                    className="h-5 min-w-[20px] px-1.5 text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {userRole === 'mentor'
                  ? 'Consultas de estudiantes'
                  : 'Tus conversaciones con mentores'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {displayConversations.length === 0 ? (
            <WidgetEmptyState userRole={userRole} />
          ) : (
            <div className="space-y-1">
              {displayConversations.map((conversation) => (
                <WidgetConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  onClick={() => handleConversationClick(conversation)}
                />
              ))}
            </div>
          )}

          {/* View All Messages Link */}
          <div className="mt-4 pt-4 border-t">
            <Link href="/dashboard/messages">
              <Button
                variant="ghost"
                className="w-full justify-center text-primary hover:text-primary"
                data-testid="view_all_messages_button"
              >
                Ver todos los mensajes
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reply Modal */}
      {selectedConversation && (
        <QuickReplyModal
          conversationId={selectedConversation.id}
          open={!!selectedConversation}
          onOpenChange={(open) => !open && handleModalClose()}
          otherParticipant={selectedConversation.participant}
          currentUserId={userId}
          onMessageSent={handleMessageSent}
        />
      )}
    </>
  );
}
