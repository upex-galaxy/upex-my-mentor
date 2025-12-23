/**
 * OpenAPI Registry Configuration
 *
 * Central configuration for generating OpenAPI documentation
 * from Zod schemas. This is the source of truth for the API spec.
 *
 * @see https://github.com/asteasolutions/zod-to-openapi
 */

import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

// Extend Zod with OpenAPI methods
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z)

// Create the registry instance
export const registry = new OpenAPIRegistry()

// ============================================================================
// Security Schemes
// ============================================================================

// Cookie-based authentication (Supabase session)
registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'sb-ionevzckjyxtpmyenbxc-auth-token',
  description: 'Supabase session cookie. Obtained automatically after login via the web app.',
})

// API Key authentication (for internal endpoints)
registry.registerComponent('securitySchemes', 'apiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key for internal/testing endpoints. Use "dev-api-key" in development.',
})

// Bearer token (for cron jobs)
registry.registerComponent('securitySchemes', 'cronAuth', {
  type: 'http',
  scheme: 'bearer',
  description: 'CRON_SECRET token for scheduled job endpoints.',
})

// Stripe webhook signature
registry.registerComponent('securitySchemes', 'stripeSignature', {
  type: 'apiKey',
  in: 'header',
  name: 'Stripe-Signature',
  description: 'Stripe webhook signature. Only Stripe can call these endpoints.',
})

// ============================================================================
// OpenAPI Document Generator
// ============================================================================

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Upex My Mentor - Next.js API',
      version: '1.0.0',
      description: `
## Custom API Endpoints

This documentation covers the **14 custom Next.js API endpoints** that handle business logic beyond simple CRUD operations.

These endpoints are responsible for:
- **Stripe Payments**: Checkout sessions, Connect onboarding, webhooks
- **Session Management**: Cancellations, meeting links, video calls
- **Mentor Features**: Availability, communication channels
- **Messaging**: Unread message counts
- **System**: Payout processing, email notifications

### Authentication

Most endpoints require authentication via **Supabase session cookies**. The cookie is automatically set when a user logs in through the web application.

For testing, you can:
1. Login via the web app to get the session cookie
2. Use the cookie value in your API testing tool
3. Some endpoints accept \`X-API-Key\` header for testing purposes

### Base URLs

| Environment | URL |
|------------|-----|
| Development | \`http://localhost:3000/api\` |
| Staging | \`https://upex-my-mentor-staging.vercel.app/api\` |
| Production | \`https://upex-my-mentor.vercel.app/api\` |
      `.trim(),
      contact: {
        name: 'Upex QA Team',
        url: 'https://github.com/upex-galaxy/upex-my-mentor',
      },
      license: {
        name: 'Private',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://upex-my-mentor.vercel.app/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Payments',
        description: 'Stripe checkout and payment processing',
      },
      {
        name: 'Stripe Connect',
        description: 'Mentor payment account onboarding and status',
      },
      {
        name: 'Bookings',
        description: 'Session booking management (cancel, meeting links)',
      },
      {
        name: 'Mentors',
        description: 'Mentor-specific endpoints (availability)',
      },
      {
        name: 'Messages',
        description: 'Messaging and notifications',
      },
      {
        name: 'Users',
        description: 'User profile and communication channels',
      },
      {
        name: 'System',
        description: 'Internal system endpoints (cron, testing)',
      },
    ],
  })
}

// Re-export z with OpenAPI extensions for use in schemas
export { z }
