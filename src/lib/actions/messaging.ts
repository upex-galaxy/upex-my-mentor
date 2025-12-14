'use server';

import { createServer } from '@/lib/supabase/server';
import type {
  SendMessageRequest,
  SendMessageResponse,
  ConversationCheck,
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
