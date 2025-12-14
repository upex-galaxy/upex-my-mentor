'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { markConversationAsRead } from '@/lib/actions/messaging';
import type { ConversationThreadProps } from '@/types';

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

  // Mark conversation as read when mounting
  useEffect(() => {
    markConversationAsRead(conversationId);
  }, [conversationId]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [initialMessages]);

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
        {initialMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay mensajes en esta conversación aún.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {initialMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
