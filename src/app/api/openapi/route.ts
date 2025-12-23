/**
 * GET /api/openapi
 *
 * Serves the OpenAPI specification for the Next.js custom API endpoints.
 * This spec is auto-generated from Zod schemas and always up-to-date.
 *
 * Usage:
 * - Redoc/Swagger UI: Point to this URL
 * - Postman: Import from this URL
 * - MCP OpenAPI Server: Use this as OPENAPI_SPEC_PATH
 */

import { NextResponse } from 'next/server'
import { generateOpenAPIDocument } from '@/lib/openapi'

export async function GET() {
  try {
    const document = generateOpenAPIDocument()

    return NextResponse.json(document, {
      headers: {
        // Allow CORS for documentation tools
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        // Cache for 1 hour in development, 1 day in production
        'Cache-Control': process.env.NODE_ENV === 'production'
          ? 'public, max-age=86400, s-maxage=86400'
          : 'no-cache',
      },
    })
  } catch (error) {
    console.error('[OpenAPI] Failed to generate document:', error)

    return NextResponse.json(
      { error: 'Failed to generate OpenAPI specification' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
