import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MessageBubbleProps } from '@/types';

/**
 * MYM-57: Format message timestamp
 * Shows relative time for recent messages, absolute for older ones
 */
function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }

  if (isYesterday(date)) {
    return `Ayer ${format(date, 'HH:mm')}`;
  }

  // For older messages, show the full date
  return format(date, 'dd/MM/yyyy HH:mm');
}

/**
 * MYM-57: Message bubble component
 * Displays a single message with proper alignment and styling based on sender
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      data-testid={`message_bubble_${message.id}`}
      className={cn(
        'flex flex-col max-w-[75%] mb-3',
        isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      {/* Sender name for other's messages */}
      {!isOwn && message.sender?.name && (
        <span
          data-testid="message_sender_name"
          className="text-xs text-muted-foreground mb-1 px-1"
        >
          {message.sender.name}
        </span>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'px-4 py-2 rounded-lg break-words',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* Timestamp */}
      <span
        data-testid="message_timestamp"
        className="text-xs text-muted-foreground mt-1 px-1"
      >
        {formatMessageTime(message.created_at || '')}
      </span>
    </div>
  );
}
