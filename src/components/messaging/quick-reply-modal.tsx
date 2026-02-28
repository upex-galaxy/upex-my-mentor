'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Loader2, Send, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import {
  getConversationMessages,
  markConversationAsRead,
  sendReplyToConversation,
} from '@/lib/actions/messaging';
import { useNotification } from '@/contexts/notification-context';
import { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } from '@/types';
import type { QuickReplyModalProps, MessageWithSender } from '@/types';

/**
 * MYM-59: Quick Reply Modal for Dashboard Widget
 * Opens a conversation in an overlay with reply capability
 */
export function QuickReplyModal({
  conversationId,
  open,
  onOpenChange,
  otherParticipant,
  currentUserId,
  onMessageSent,
  onConversationRead,
}: QuickReplyModalProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setActiveConversation, refreshUnreadCount } = useNotification();

  const charCount = content.length;
  const isValidLength = charCount >= MIN_MESSAGE_LENGTH && charCount <= MAX_MESSAGE_LENGTH;

  // MYM-58: Set active conversation to suppress toast notifications
  useEffect(() => {
    if (open) {
      setActiveConversation(conversationId);
    }
    return () => {
      if (open) {
        setActiveConversation(null);
      }
    };
  }, [open, conversationId, setActiveConversation]);

  // Fetch messages when modal opens
  useEffect(() => {
    if (open && conversationId) {
      setIsLoading(true);
      getConversationMessages(conversationId)
        .then((data) => {
          if (data) {
            setMessages(data.messages);
            // Mark as read and notify widget to update unread dot
            markConversationAsRead(conversationId).then(() => {
              refreshUnreadCount();
              // MYM-96: Notify widget to refresh conversations (clears unread dot)
              onConversationRead?.();
            });
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, conversationId, refreshUnreadCount, onConversationRead]);

  // Scroll to bottom when messages change
  // Note: We access the Viewport element (data-radix-scroll-area-viewport)
  // because ScrollArea Root has overflow-hidden and doesn't scroll
  useEffect(() => {
    // MYM-155: Use requestAnimationFrame to ensure DOM has updated
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    // Schedule after paint for reliable scroll position
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToBottom);
    });
  }, [messages]);

  const handleSubmit = () => {
    if (!isValidLength) {
      setError(`El mensaje debe tener entre ${MIN_MESSAGE_LENGTH} y ${MAX_MESSAGE_LENGTH} caracteres`);
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const result = await sendReplyToConversation(conversationId, content);

        if (result.success) {
          // Optimistic UI: add message immediately
          const newMessage: MessageWithSender = {
            id: result.messageId || crypto.randomUUID(),
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: content.trim(),
            is_read: false,
            created_at: new Date().toISOString(),
            sender: {
              id: currentUserId,
              name: 'Tú',
              photo_url: null,
            },
          };

          setMessages((prev) => [...prev, newMessage]);
          setContent('');
          onMessageSent?.();
        } else {
          setError(result.error || 'Error al enviar el mensaje');
        }
      } catch {
        // MYM-132: Handle network errors gracefully
        setError('Error de conexión. Verifica tu red e intenta de nuevo.');
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isValidLength && !isPending) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isPending) {
      onOpenChange(isOpen);
      if (!isOpen) {
        setContent('');
        setError(null);
      }
    }
  };

  // MYM-97: Profile link for both mentors and students
  const profileLink = otherParticipant.role === 'mentor'
    ? `/mentors/${otherParticipant.id}`
    : otherParticipant.role === 'student'
    ? `/students/${otherParticipant.id}`
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-testid="quick_reply_modal"
        className="sm:max-w-lg h-[80vh] flex flex-col p-0"
      >
        {/* Header with participant info */}
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {otherParticipant.photo_url ? (
              <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={otherParticipant.photo_url}
                  alt={otherParticipant.name || 'Usuario'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                {otherParticipant.name?.charAt(0) || 'U'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <span className="truncate" data-testid="participant_name">
                  {otherParticipant.name || 'Usuario'}
                </span>
                {profileLink && (
                  <Link
                    href={profileLink}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Ver perfil completo"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </DialogTitle>
              <p className="text-xs text-muted-foreground capitalize">
                {otherParticipant.role === 'mentor' ? 'Mentor' : 'Estudiante'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay mensajes en esta conversación aún.
              </p>
            </div>
          ) : (
            <ScrollArea
              ref={scrollRef}
              className="h-full p-4"
              data-testid="messages_container"
            >
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === currentUserId}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Reply input area */}
        <div className="p-4 border-t flex-shrink-0 space-y-2">
          {error && (
            <p data-testid="error_message" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Textarea
              data-testid="reply_textarea"
              placeholder="Escribe tu respuesta... (mínimo 10 caracteres)"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isPending}
              className="min-h-[60px] max-h-[120px] resize-none flex-1"
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <Button
              data-testid="send_reply_button"
              onClick={handleSubmit}
              disabled={isPending || !isValidLength}
              size="icon"
              className="h-auto aspect-square self-end"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {charCount < MIN_MESSAGE_LENGTH && (
                <>Mínimo {MIN_MESSAGE_LENGTH - charCount} caracteres más</>
              )}
            </span>
            <span>
              {charCount}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
