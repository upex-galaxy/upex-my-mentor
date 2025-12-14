'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ConversationListItemProps } from '@/types';

/**
 * MYM-57: Format relative timestamp for conversation list
 */
function formatConversationTime(dateString: string | null | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }

  if (isYesterday(date)) {
    return 'Ayer';
  }

  // Check if within the last week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date > weekAgo) {
    return formatDistanceToNow(date, { addSuffix: false, locale: es });
  }

  // For older conversations
  return format(date, 'dd/MM/yyyy');
}

/**
 * MYM-57: Truncate message preview to max chars
 */
function truncateMessage(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * MYM-57: Individual conversation item in the list
 */
export function ConversationListItem({
  conversation,
  isActive = false,
}: ConversationListItemProps) {
  const { other_participant, last_message, unread_count } = conversation;

  // Build the message preview
  let messagePreview = 'Nueva conversación';
  if (last_message?.content) {
    const isOwnMessage = last_message.sender_id !== other_participant.id;
    const prefix = isOwnMessage ? 'Tú: ' : '';
    messagePreview = prefix + truncateMessage(last_message.content);
  }

  return (
    <Link
      href={`/dashboard/messages/${conversation.id}`}
      data-testid={`conversation_item_${conversation.id}`}
      className={cn(
        'flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0',
        isActive && 'bg-muted/50'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {other_participant.photo_url ? (
          <div className="relative h-12 w-12 rounded-full overflow-hidden">
            <Image
              src={other_participant.photo_url}
              alt={other_participant.name || 'Usuario'}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            {other_participant.name?.charAt(0) || 'U'}
          </div>
        )}

        {/* Unread indicator */}
        {unread_count > 0 && (
          <span
            data-testid="unread_indicator"
            className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            data-testid="participant_name"
            className={cn(
              'font-medium truncate',
              unread_count > 0 && 'font-semibold'
            )}
          >
            {other_participant.name || 'Usuario'}
          </span>

          <span
            data-testid="conversation_timestamp"
            className="text-xs text-muted-foreground flex-shrink-0"
          >
            {formatConversationTime(last_message?.created_at || conversation.updated_at)}
          </span>
        </div>

        <p
          data-testid="message_preview"
          className={cn(
            'text-sm truncate mt-0.5',
            unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {messagePreview}
        </p>
      </div>
    </Link>
  );
}
