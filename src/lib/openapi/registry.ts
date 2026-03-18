/**
 * OpenAPI Registry Configuration
 *
 * Central configuration for generating OpenAPI documentation
 * from Zod schemas. This is the source of truth for the API spec.
 *
 * @see https://github.com/asteasolutions/zod-to-openapi
 */

import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

// Extend Zod with OpenAPI methods
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

// Bearer token authentication (Supabase JWT)
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: `Supabase access_token for API testing (Postman, mobile apps, etc.).

**How to obtain:**
1. POST to \`https://ionevzckjyxtpmyenbxc.supabase.co/auth/v1/token?grant_type=password\`
2. Headers: \`apikey: SUPABASE_ANON_KEY\`, \`Content-Type: application/json\`
3. Body: \`{"email": "user@example.com", "password": "password"}\`
4. Use the \`access_token\` from the response

**Note:** Token expires in 1 hour. Use \`refresh_token\` to renew.`,
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

---

## Authentication Methods

This API uses **4 different authentication methods** depending on the endpoint type:

### 1. Cookie Auth (Most Endpoints)
**Used by:** User-facing endpoints (checkout, bookings, messages, etc.)

The primary authentication method uses **Supabase session cookies**. When a user logs in through the web app, Supabase sets authentication cookies automatically.

**Cookie name:** \`sb-ionevzckjyxtpmyenbxc-auth-token\`

**How to test:**
1. Open browser DevTools → Application → Cookies
2. Login to the app at \`/login\`
3. Copy the \`sb-ionevzckjyxtpmyenbxc-auth-token\` cookie value
4. In Postman/cURL, add the cookie to your request

**Example with cURL:**
\`\`\`bash
curl -X POST http://localhost:3000/api/checkout/session \\
  -H "Content-Type: application/json" \\
  -H "Cookie: sb-ionevzckjyxtpmyenbxc-auth-token=YOUR_TOKEN_HERE" \\
  -d '{"booking_id": "uuid-here"}'
\`\`\`

### 2. API Key Auth (Testing/Internal)
**Used by:** Testing endpoints, some internal operations

For development and testing, some endpoints accept an API key header.

**Header:** \`X-API-Key: dev-api-key\`

**Example:**
\`\`\`bash
curl http://localhost:3000/api/testing/cleanup \\
  -H "X-API-Key: dev-api-key"
\`\`\`

### 3. Cron Auth (Scheduled Jobs)
**Used by:** \`/api/cron/*\` endpoints

Cron endpoints are protected by a Bearer token that only Vercel Cron can provide.

**Header:** \`Authorization: Bearer CRON_SECRET\`

**Note:** These endpoints cannot be called manually in production.

### 4. Stripe Signature (Webhooks)
**Used by:** \`/api/stripe/webhook\`

Stripe webhooks are verified using the \`Stripe-Signature\` header. Only Stripe's servers can call these endpoints.

---

## Quick Start Testing

### Option A: Browser Session (Recommended)
1. Login at \`http://localhost:3000/login\`
2. Open DevTools → Network tab
3. Make an action (book a session, etc.)
4. Copy the request as cURL from DevTools
5. Modify and replay in your testing tool

### Option B: Postman/Insomnia
1. Login via browser and copy the auth cookie
2. Create a new request in Postman
3. Add cookie: \`sb-ionevzckjyxtpmyenbxc-auth-token=YOUR_TOKEN\`
4. Send requests to endpoints

### Option C: Automated Tests
Use the provided TypeScript types:
\`\`\`typescript
import { CreateCheckoutSessionRequest } from '@/lib/openapi'
// Types are auto-generated from this spec
\`\`\`

---

## Detailed Documentation

For comprehensive guides including Postman collections and Playwright integration, see the \`docs/api-testing/\` directory in the repository:
- **authentication-guide.md** - Complete auth guide with examples
- **postman-guide.md** - Ready-to-use Postman collection
- **playwright-integration.md** - Automated testing setup
- **api-architecture.md** - Full system architecture diagrams

---

## Base URLs

| Environment | URL |
|------------|-----|
| Development | \`http://localhost:3000/api\` |
| Staging | \`https://staging-upexmymentor.vercel.app/api\` |
| Production | \`https://upexmymentor.vercel.app/api\` |
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
        url: 'https://staging-upexmymentor.vercel.app/api',
        description: 'Staging server',
      },
      {
        url: 'https://upexmymentor.vercel.app/api',
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
