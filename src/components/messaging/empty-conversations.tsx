import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EmptyConversationsProps } from '@/types';

/**
 * MYM-57: Empty state for conversations list
 * Shows when user has no conversations yet
 */
export function EmptyConversations({ userRole }: EmptyConversationsProps) {
  return (
    <div
      data-testid="empty_conversations"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">
        No tienes conversaciones aún
      </h3>

      <p className="text-muted-foreground mb-6 max-w-sm">
        {userRole === 'student'
          ? 'Encuentra un mentor y rompe el hielo. Tu primera conversación puede ser el inicio de un gran aprendizaje.'
          : 'Cuando los estudiantes te contacten, sus mensajes aparecerán aquí.'}
      </p>

      {userRole === 'student' && (
        <Link href="/mentors">
          <Button data-testid="explore_mentors_button">
            Explorar mentores
          </Button>
        </Link>
      )}
    </div>
  );
}
