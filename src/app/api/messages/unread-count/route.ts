import { createServerFromRequest } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * MYM-58: GET /api/messages/unread-count
 *
 * Returns the count of unread messages for the authenticated user.
 * A message is considered unread if:
 * - It belongs to a conversation the user is part of
 * - It was NOT sent by the user
 * - It has is_read = false
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerFromRequest(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Count unread messages
    // Messages where:
    // - conversation includes the user (participant_1 or participant_2)
    // - sender is NOT the current user
    // - is_read is false
    const { count, error } = await supabase
      .from('messages')
      .select('id, conversation:conversations!inner(participant_1_id, participant_2_id)', {
        count: 'exact',
        head: true,
      })
      .neq('sender_id', user.id)
      .eq('is_read', false)
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`, {
        referencedTable: 'conversations',
      })

    if (error) {
      console.error('Error fetching unread count:', error)
      return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    console.error('Unread count API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
