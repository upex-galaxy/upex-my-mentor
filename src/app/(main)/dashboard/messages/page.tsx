import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { createServer } from '@/lib/supabase/server';
import { ConversationList } from '@/components/messaging/conversation-list';
import { getConversations } from '@/lib/actions/messaging';

export const metadata = {
  title: 'Mensajes | MyMentor',
  description: 'Tu bandeja de mensajes con mentores y estudiantes',
};

/**
 * MYM-57: Messages list page
 * Shows all conversations for the current user
 */
export default async function MessagesPage() {
  const supabase = await createServer();

  // Get authenticated user
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect('/login');
  }

  // Fetch user profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Fetch conversations
  const conversations = await getConversations();

  return (
    <div data-testid="messages_page" className="bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mensajes</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Tus conversaciones con {profile.role === 'mentor' ? 'estudiantes' : 'mentores'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          <ConversationList
            conversations={conversations}
            userRole={profile.role}
          />
        </div>
    </div>
  );
}
