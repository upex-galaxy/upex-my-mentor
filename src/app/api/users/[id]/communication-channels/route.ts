/**
 * GET /api/users/[id]/communication-channels
 * MYM-30: Get active communication channels for a user
 *
 * Public endpoint used during booking flow to show mentor's available channels.
 * Only returns active channels.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerFromRequest } from '@/lib/supabase/server'
import {
  mapChannelRowToDomain,
  type CommunicationChannel,
} from '@/types/communication'

interface SuccessResponse {
  success: true
  channels: CommunicationChannel[]
}

interface ErrorResponse {
  success: false
  error: string
  message: string
}

type ApiResponse = SuccessResponse | ErrorResponse

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id: userId } = await params
    const supabase = await createServerFromRequest(request)

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_USER_ID',
          message: 'ID de usuario inválido',
        },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado',
        },
        { status: 404 }
      )
    }

    // Get active channels for the user
    const { data: channels, error: channelsError } = await supabase
      .from('communication_channels')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (channelsError) {
      console.error('[Communication Channels API] Error fetching channels:', channelsError)
      return NextResponse.json(
        {
          success: false,
          error: 'FETCH_ERROR',
          message: 'Error al obtener los canales de comunicación',
        },
        { status: 500 }
      )
    }

    // Map to domain objects
    const mappedChannels = (channels ?? []).map(mapChannelRowToDomain)

    return NextResponse.json({
      success: true,
      channels: mappedChannels,
    })
  } catch (error) {
    console.error('[Communication Channels API] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
