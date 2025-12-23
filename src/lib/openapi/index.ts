/**
 * OpenAPI Generator
 *
 * Main entry point for generating OpenAPI documentation.
 *
 * Usage:
 *   import { generateOpenAPIDocument } from '@/lib/openapi'
 *   const spec = generateOpenAPIDocument()
 *
 * The spec can be:
 * - Served via API endpoint (/api/openapi)
 * - Used to generate static JSON file
 * - Consumed by Swagger UI, Redoc, etc.
 */

// Import all schemas to register them with the registry
import './schemas'

// Export the generator and registry
export { generateOpenAPIDocument, registry, z } from './registry'

// Export all types for use in route handlers
export * from './schemas'
