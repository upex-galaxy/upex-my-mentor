/**
 * GET/PUT /api/users/me/communication-channels
 * MYM-30: Manage communication channels for authenticated user
 *
 * GET: Get all channels (active and inactive) for current user
 * PUT: Update/replace all channels for current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import {
  mapChannelRowToDomain,
  isValidChannelType,
  type CommunicationChannel,
  type CommunicationChannelType,
} from '@/types/communication'

interface ChannelInput {
  type: string
  handle?: string | null
  isActive?: boolean
}

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

/**
 * GET: Get all channels for authenticated user (includes inactive)
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createServer()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para acceder a esta función',
        },
        { status: 401 }
      )
    }

    // Get all channels for the user (including inactive)
    const { data: channels, error: channelsError } = await supabase
      .from('communication_channels')
      .select('*')
      .eq('user_id', user.id)
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

/**
 * PUT: Update/replace all channels for authenticated user
 * Expects body: { channels: [{ type: 'zoom', handle: '...', isActive: true }] }
 */
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = await createServer()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para actualizar tus canales',
        },
        { status: 401 }
      )
    }

    // Parse request body
    let body: { channels: ChannelInput[] }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_JSON',
          message: 'El cuerpo de la solicitud no es JSON válido',
        },
        { status: 400 }
      )
    }

    const { channels } = body

    // Validate channels array
    if (!Array.isArray(channels)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Se esperaba un array de canales',
        },
        { status: 400 }
      )
    }

    // Validate each channel
    const validatedChannels: Array<{
      type: CommunicationChannelType
      handle: string | null
      isActive: boolean
    }> = []

    for (const channel of channels) {
      if (!channel.type || !isValidChannelType(channel.type)) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_CHANNEL_TYPE',
            message: `Tipo de canal inválido: ${channel.type}`,
          },
          { status: 400 }
        )
      }

      validatedChannels.push({
        type: channel.type as CommunicationChannelType,
        handle: channel.handle ?? null,
        isActive: channel.isActive ?? true,
      })
    }

    // Check for duplicate channel types
    const types = validatedChannels.map((c) => c.type)
    const uniqueTypes = new Set(types)
    if (types.length !== uniqueTypes.size) {
      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_CHANNEL',
          message: 'No puedes tener canales duplicados del mismo tipo',
        },
        { status: 400 }
      )
    }

    // Get existing channels
    const { data: existingChannels, error: fetchError } = await supabase
      .from('communication_channels')
      .select('id, channel_type')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('[Communication Channels API] Error fetching existing:', fetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'FETCH_ERROR',
          message: 'Error al obtener canales existentes',
        },
        { status: 500 }
      )
    }

    const existingByType = new Map(
      (existingChannels ?? []).map((c) => [c.channel_type, c.id])
    )

    // Prepare upsert data - MYM-87: Don't include id if it doesn't exist
    const upsertData = validatedChannels.map((channel) => {
      const existingId = existingByType.get(channel.type);
      return {
        // Only include id if channel already exists (for update)
        ...(existingId && { id: existingId }),
        user_id: user.id,
        channel_type: channel.type,
        handle: channel.handle,
        is_active: channel.isActive,
        updated_at: new Date().toISOString(),
      };
    })

    // Determine which channels to delete (types not in new list)
    const newTypes = new Set(validatedChannels.map((c) => c.type))
    const typesToDelete = [...existingByType.keys()].filter(
      (type) => !newTypes.has(type as CommunicationChannelType)
    )

    // Delete removed channels
    if (typesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('communication_channels')
        .delete()
        .eq('user_id', user.id)
        .in('channel_type', typesToDelete)

      if (deleteError) {
        console.error('[Communication Channels API] Error deleting channels:', deleteError)
        return NextResponse.json(
          {
            success: false,
            error: 'DELETE_ERROR',
            message: 'Error al eliminar canales',
          },
          { status: 500 }
        )
      }
    }

    // Upsert new/updated channels
    if (upsertData.length > 0) {
      const { error: upsertError } = await supabase
        .from('communication_channels')
        .upsert(upsertData, {
          onConflict: 'user_id,channel_type',
        })

      if (upsertError) {
        console.error('[Communication Channels API] Error upserting channels:', upsertError)
        return NextResponse.json(
          {
            success: false,
            error: 'UPSERT_ERROR',
            message: 'Error al guardar canales',
          },
          { status: 500 }
        )
      }
    }

    // Fetch updated channels
    const { data: updatedChannels, error: refetchError } = await supabase
      .from('communication_channels')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (refetchError) {
      console.error('[Communication Channels API] Error refetching:', refetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'REFETCH_ERROR',
          message: 'Canales guardados pero error al recuperar datos actualizados',
        },
        { status: 500 }
      )
    }

    const mappedChannels = (updatedChannels ?? []).map(mapChannelRowToDomain)

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
