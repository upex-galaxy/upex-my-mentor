import { Card } from '@/components/ui/card';
import { ConversationListItem } from './conversation-list-item';
import { EmptyConversations } from './empty-conversations';
import type { ConversationListProps } from '@/types';

interface ConversationListWithRoleProps extends ConversationListProps {
  userRole: 'student' | 'mentor' | 'admin';
  activeConversationId?: string;
}

/**
 * MYM-57: List of all user conversations
 */
export function ConversationList({
  conversations,
  userRole,
  activeConversationId,
}: ConversationListWithRoleProps) {
  if (conversations.length === 0) {
    return <EmptyConversations userRole={userRole} />;
  }

  return (
    <Card data-testid="conversations_list" className="divide-y">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
        />
      ))}
    </Card>
  );
}
