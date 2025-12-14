'use server';

import { createServer } from '@/lib/supabase/server';
import type {
  SendMessageRequest,
  SendMessageResponse,
  ConversationCheck,
  ConversationWithDetails,
  MessageWithSender,
  ConversationParticipant,
} from '@/types';
import { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } from '@/types';

/**
 * MYM-56: Check if a conversation exists between the current user and a mentor
 * Returns the conversation ID if it exists
 */
export async function checkExistingConversation(
  mentorId: string
): Promise<ConversationCheck> {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { exists: false };
  }

  // Order the IDs to match our constraint (smaller UUID first)
  const [participant1, participant2] = [user.id, mentorId].sort();

  // Look for existing conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1_id', participant1)
    .eq('participant_2_id', participant2)
    .single();

  if (conversation) {
    return { exists: true, conversationId: conversation.id };
  }

  return { exists: false };
}

/**
 * MYM-56: Send a message to a mentor
 * Creates a conversation if one doesn't exist, then sends the message
 * Uses atomic operation via database function
 */
export async function sendMessageToMentor(
  data: SendMessageRequest
): Promise<SendMessageResponse> {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para enviar mensajes' };
  }

  // Validate message content
  const content = data.content.trim();

  if (content.length < MIN_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `El mensaje debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`,
    };
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres`,
    };
  }

  // Verify mentor exists and is verified
  const { data: mentor, error: mentorError } = await supabase
    .from('profiles')
    .select('id, role, is_verified')
    .eq('id', data.mentorId)
    .single();

  if (mentorError || !mentor) {
    return { success: false, error: 'Mentor no encontrado' };
  }

  if (mentor.role !== 'mentor') {
    return { success: false, error: 'El destinatario no es un mentor' };
  }

  if (!mentor.is_verified) {
    return { success: false, error: 'El mentor no está verificado' };
  }

  // Prevent sending message to yourself
  if (user.id === data.mentorId) {
    return { success: false, error: 'No puedes enviarte un mensaje a ti mismo' };
  }

  // Get or create conversation using the database function
  const { data: conversationData, error: conversationError } = await supabase
    .rpc('get_or_create_conversation', {
      user_a_id: user.id,
      user_b_id: data.mentorId,
    });

  if (conversationError || !conversationData) {
    console.error('Error getting/creating conversation:', conversationError);
    return { success: false, error: 'Error al crear la conversación' };
  }

  const conversationId = conversationData;

  // Insert the message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content,
    })
    .select('id')
    .single();

  if (messageError) {
    console.error('Error creating message:', messageError);

    // Handle minimum length constraint
    if (messageError.code === '23514') {
      return {
        success: false,
        error: `El mensaje debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`,
      };
    }

    return { success: false, error: 'Error al enviar el mensaje' };
  }

  // Update conversation's updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return {
    success: true,
    conversationId,
    messageId: message.id,
  };
}

/**
 * MYM-56: Get current user info for messaging context
 * Returns null if not authenticated
 */
export async function getCurrentUserForMessaging(): Promise<{
  id: string;
  name: string | null;
  role: string;
} | null> {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    name: profile.name,
    role: profile.role ?? 'student',
  };
}

/**
 * MYM-57: Get all conversations for the current user
 * Returns conversations with the other participant's info and last message
 */
export async function getConversations(): Promise<ConversationWithDetails[]> {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get all conversations where user is a participant
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1:profiles!conversations_participant_1_id_fkey(id, name, photo_url, role),
      participant_2:profiles!conversations_participant_2_id_fkey(id, name, photo_url, role)
    `)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  if (error || !conversations) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Process each conversation to add other participant, last message, and unread count
  const conversationsWithDetails: ConversationWithDetails[] = await Promise.all(
    conversations.map(async (conv) => {
      // Determine the other participant
      const isParticipant1 = conv.participant_1_id === user.id;
      const otherParticipantData = isParticipant1 ? conv.participant_2 : conv.participant_1;

      const other_participant: ConversationParticipant = {
        id: otherParticipantData?.id || '',
        name: otherParticipantData?.name || 'Usuario eliminado',
        photo_url: otherParticipantData?.photo_url || null,
        role: otherParticipantData?.role || 'student',
      };

      // Get the last message
      const { data: lastMessageData } = await supabase
        .from('messages')
        .select('content, created_at, is_read, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Count unread messages (not sent by current user and not read)
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      return {
        id: conv.id,
        participant_1_id: conv.participant_1_id,
        participant_2_id: conv.participant_2_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        other_participant,
        last_message: lastMessageData || undefined,
        unread_count: unreadCount || 0,
      };
    })
  );

  return conversationsWithDetails;
}

/**
 * MYM-57: Get messages for a specific conversation
 * Also returns the other participant's info
 */
export async function getConversationMessages(
  conversationId: string
): Promise<{
  messages: MessageWithSender[];
  otherParticipant: ConversationParticipant;
  currentUserId: string;
} | null> {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get conversation to verify user is a participant
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1:profiles!conversations_participant_1_id_fkey(id, name, photo_url, role),
      participant_2:profiles!conversations_participant_2_id_fkey(id, name, photo_url, role)
    `)
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    console.error('Conversation not found:', convError);
    return null;
  }

  // Verify user is a participant
  if (
    conversation.participant_1_id !== user.id &&
    conversation.participant_2_id !== user.id
  ) {
    console.error('User is not a participant');
    return null;
  }

  // Determine the other participant
  const isParticipant1 = conversation.participant_1_id === user.id;
  const otherParticipantData = isParticipant1
    ? conversation.participant_2
    : conversation.participant_1;

  const otherParticipant: ConversationParticipant = {
    id: otherParticipantData?.id || '',
    name: otherParticipantData?.name || 'Usuario eliminado',
    photo_url: otherParticipantData?.photo_url || null,
    role: otherParticipantData?.role || 'student',
  };

  // Get all messages with sender info
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, name, photo_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgError) {
    console.error('Error fetching messages:', msgError);
    return null;
  }

  // Transform to MessageWithSender type
  const messagesWithSender: MessageWithSender[] = (messages || []).map((msg) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    content: msg.content,
    is_read: msg.is_read,
    created_at: msg.created_at,
    sender: {
      id: msg.sender?.id || msg.sender_id,
      name: msg.sender?.name || 'Usuario',
      photo_url: msg.sender?.photo_url || null,
    },
  }));

  return {
    messages: messagesWithSender,
    otherParticipant,
    currentUserId: user.id,
  };
}

/**
 * MYM-57: Mark all messages in a conversation as read
 * Only marks messages not sent by the current user
 */
export async function markConversationAsRead(
  conversationId: string
): Promise<void> {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  // Update all unread messages not sent by current user
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
}

/**
 * MYM-59: Send a reply to an existing conversation
 * Used for quick reply from dashboard widget
 */
export async function sendReplyToConversation(
  conversationId: string,
  content: string
): Promise<SendMessageResponse> {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para enviar mensajes' };
  }

  // Validate message content
  const trimmedContent = content.trim();

  if (trimmedContent.length < MIN_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `El mensaje debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`,
    };
  }

  if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres`,
    };
  }

  // Verify user is a participant in this conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id, participant_1_id, participant_2_id')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return { success: false, error: 'Conversación no encontrada' };
  }

  if (
    conversation.participant_1_id !== user.id &&
    conversation.participant_2_id !== user.id
  ) {
    return { success: false, error: 'No tienes acceso a esta conversación' };
  }

  // Insert the message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmedContent,
    })
    .select('id')
    .single();

  if (messageError) {
    console.error('Error creating message:', messageError);

    if (messageError.code === '23514') {
      return {
        success: false,
        error: `El mensaje debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`,
      };
    }

    return { success: false, error: 'Error al enviar el mensaje' };
  }

  // Update conversation's updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return {
    success: true,
    conversationId,
    messageId: message.id,
  };
}
