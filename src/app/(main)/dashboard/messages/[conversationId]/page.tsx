import { redirect, notFound } from 'next/navigation';
import { createServer } from '@/lib/supabase/server';
import { ConversationThread } from '@/components/messaging/conversation-thread';
import { getConversationMessages } from '@/lib/actions/messaging';

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

/**
 * MYM-57: Individual conversation thread page
 * Shows full message history with a participant
 */
export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  const supabase = await createServer();

  // Check authentication
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect('/login');
  }

  // Fetch conversation messages
  const conversationData = await getConversationMessages(conversationId);

  if (!conversationData) {
    notFound();
  }

  const { messages, otherParticipant, currentUserId } = conversationData;

  return (
    <div data-testid="conversation_page" className="bg-muted/30">
        <div className="container mx-auto px-4 py-6 h-[calc(100vh-200px)]">
          <ConversationThread
            conversationId={conversationId}
            initialMessages={messages}
            currentUserId={currentUserId}
            otherParticipant={otherParticipant}
          />
        </div>
    </div>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  const conversationData = await getConversationMessages(conversationId);

  if (!conversationData) {
    return {
      title: 'Conversación no encontrada | MyMentor',
    };
  }

  return {
    title: `Conversación con ${conversationData.otherParticipant.name || 'Usuario'} | MyMentor`,
    description: 'Tu historial de mensajes',
  };
}
