'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './message-bubble';
import { markConversationAsRead, sendReplyToConversation } from '@/lib/actions/messaging';
import { useNotification } from '@/contexts/notification-context';
import { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } from '@/types';
import type { ConversationThreadProps, MessageWithSender } from '@/types';

/**
 * MYM-57: Conversation thread component
 * Displays the full message history with a participant
 */
export function ConversationThread({
  conversationId,
  initialMessages,
  currentUserId,
  otherParticipant,
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setActiveConversation, refreshUnreadCount } = useNotification();

  // MYM-85: State for message input
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const charCount = content.length;
  const isValidLength = charCount >= MIN_MESSAGE_LENGTH && charCount <= MAX_MESSAGE_LENGTH;

  // MYM-58: Set active conversation to suppress toast notifications
  useEffect(() => {
    setActiveConversation(conversationId);
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation]);

  // Mark conversation as read when mounting and refresh unread count
  useEffect(() => {
    const markAsRead = async () => {
      await markConversationAsRead(conversationId);
      // MYM-58: Update badge count after marking as read
      await refreshUnreadCount();
    };
    markAsRead();
  }, [conversationId, refreshUnreadCount]);

  // Scroll to bottom on initial load or when messages change
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

  // MYM-85: Handle sending a reply
  const handleSubmit = () => {
    if (!isValidLength) {
      setError(`El mensaje debe tener entre ${MIN_MESSAGE_LENGTH} y ${MAX_MESSAGE_LENGTH} caracteres`);
      return;
    }

    setError(null);

    startTransition(async () => {
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
      } else {
        setError(result.error || 'Error al enviar el mensaje');
      }
    });
  };

  // MYM-85: Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isValidLength && !isPending) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card data-testid="conversation_thread" className="flex flex-col h-full">
      {/* Header */}
      <div
        data-testid="thread_header"
        className="flex items-center gap-3 p-4 border-b"
      >
        <Link href="/dashboard/messages">
          <Button
            variant="ghost"
            size="icon"
            data-testid="back_button"
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        {/* Participant info */}
        <Link
          href={otherParticipant.role === 'mentor' ? `/mentors/${otherParticipant.id}` : '#'}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {otherParticipant.photo_url ? (
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={otherParticipant.photo_url}
                alt={otherParticipant.name || 'Usuario'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {otherParticipant.name?.charAt(0) || 'U'}
            </div>
          )}

          <div>
            <p
              data-testid="participant_name"
              className="font-medium"
            >
              {otherParticipant.name || 'Usuario'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {otherParticipant.role === 'mentor' ? 'Mentor' : 'Estudiante'}
            </p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4"
        data-testid="messages_container"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay mensajes en esta conversación aún.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* MYM-85: Reply input area */}
      <div className="p-4 border-t flex-shrink-0 space-y-2">
        {error && (
          <p data-testid="error_message" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Textarea
            data-testid="reply_textarea"
            placeholder="Escribe tu mensaje... (mínimo 10 caracteres)"
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
            data-testid="send_button"
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
    </Card>
  );
}
