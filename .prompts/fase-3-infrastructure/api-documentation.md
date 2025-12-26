# Prompt: API Documentation Infrastructure with OpenAPI

> **Phase:** 3 - Infrastructure (ejecutar DESPUÉS de Fase 7 si hay endpoints)
> **Category:** API Documentation
> **Reusability:** Generic (works for any Next.js + Supabase project)
> **Version:** 2.0
> **Dependencies:**
>
> - `backend-setup.md` (Fase 3) - Infraestructura base
> - Custom API endpoints (Fase 7) - Al menos 1 endpoint para documentar

---

## Table of Contents

1. [Prerequisites Check](#prerequisites-check)
2. [The Prompt](#the-prompt)
3. [Implementation Reference](#implementation-reference)
4. [Extending Documentation](#extending-documentation)
5. [Troubleshooting](#troubleshooting)
6. [Version History](#version-history)

---

## Prerequisites Check

**CRITICAL: This prompt requires TWO things:**

1. **Backend infrastructure** (from `backend-setup.md`)
2. **Custom API endpoints** (from Fase 7: Implementation)

### Verification Commands

```bash
# Check if backend-setup output exists
ls -la src/lib/supabase/client.ts src/lib/supabase/server.ts src/lib/config.ts 2>/dev/null

# Check for custom API endpoints
find src/app/api -name "route.ts" 2>/dev/null | head -5

# Check if Zod is installed and version
grep '"zod"' package.json
```

### Decision Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    START VERIFICATION                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ STEP 1: Backend Infrastructure │
              │ Do these files exist?          │
              │ • src/lib/supabase/client.ts   │
              │ • src/lib/supabase/server.ts   │
              │ • src/lib/config.ts            │
              └───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
         ┌────────┐                     ┌────────┐
         │  YES   │                     │   NO   │
         └────────┘                     └────────┘
              │                               │
              ▼                               ▼
   ┌──────────────────────┐     ┌──────────────────────────────┐
   │ STEP 2: API Endpoints │     │ ⛔ STOP                       │
   │ Do custom API routes  │     │ Run backend-setup.md first   │
   │ exist in src/app/api? │     │                              │
   └──────────────────────┘     │ Path: .prompts/              │
              │                 │ fase-3-infrastructure/       │
   ┌──────────┴──────────┐      │ backend-setup.md             │
   ▼                     ▼      └──────────────────────────────┘
┌──────┐            ┌──────┐
│ YES  │            │  NO  │
└──────┘            └──────┘
   │                     │
   ▼                     ▼
┌──────────────┐    ┌───────────────────────────────────────┐
│ ✅ PROCEED   │    │ ⏸️  WAIT                               │
│ with this    │    │ API endpoints are created in Fase 7.  │
│ prompt       │    │ Return after you have endpoints.      │
└──────────────┘    └───────────────────────────────────────┘
```

### When to Run This Prompt?

```
TIMELINE:
─────────────────────────────────────────────────────────────────────

Fase 3: Infrastructure
  ├── backend-setup.md ✅ (creates DB, clients, types)
  └── api-documentation.md ❌ (NO endpoints yet!)

         ... features implemented in Fase 7 ...

Fase 7: Implementation
  ├── Feature 1: Creates /api/checkout/
  ├── Feature 2: Creates /api/bookings/
  └── Feature N: Creates /api/[domain]/

RETURN TO Fase 3:
  └── api-documentation.md ✅ (NOW we have endpoints!)

─────────────────────────────────────────────────────────────────────
```

---

## The Prompt

````markdown
I need you to implement an OpenAPI documentation infrastructure for my Next.js API endpoints.

## Pre-Execution Verification

BEFORE doing anything, verify these prerequisites:

### Step 0.1: Check Backend Infrastructure

Run these commands and analyze output:

```bash
# Check Supabase clients exist
ls -la src/lib/supabase/client.ts src/lib/supabase/server.ts 2>/dev/null

# Check config exists
ls -la src/lib/config.ts 2>/dev/null

# Check for custom API endpoints
find src/app/api -name "route.ts" 2>/dev/null | wc -l
```
````

**Decision:**

- IF any Supabase client files are MISSING:
  → STOP and inform: "Backend infrastructure not found. Run backend-setup.md first."
  → Path: `.prompts/fase-3-infrastructure/backend-setup.md`

- IF no API routes found (count = 0):
  → WARN: "No custom API endpoints found."
  → ASK: "Create a basic health check endpoint first, or do you have endpoints elsewhere?"

- IF all checks pass:
  → PROCEED with implementation

### Step 0.2: Install Dependencies

⚠️ **CRITICAL VERSION REQUIREMENTS:**

```bash
# Install with EXACT versions to avoid compatibility issues
bun add @asteasolutions/zod-to-openapi@7.3.4

# Ensure zod is pinned to 3.24.x (NOT 3.25.x)
# In package.json, zod should be: "zod": "~3.24.1"
```

**Why these versions?**

- `zod-to-openapi@8.x` has breaking changes with `zod@3.25.x`
- `zod@3.25.x` changed internal APIs that break `extendZodWithOpenApi()`
- The combination `7.3.4 + ~3.24.1` is tested and stable

---

## Project Context

- Framework: Next.js 15 (App Router)
- Backend: Supabase (database) + Custom API routes (business logic)
- Validation: Zod schemas
- Package Manager: Detect from lockfile (bun.lock → bun, package-lock.json → npm)

---

## Requirements

### 1. Discovery Phase

Analyze all API routes in `src/app/api/`:

- List each endpoint with HTTP method
- Identify request body schemas
- Identify query parameters
- Identify response schemas (success + error cases)
- Determine authentication requirements:
  - `public` - No auth required
  - `cookieAuth` - Supabase session cookie
  - `apiKeyAuth` - X-API-Key header
  - `cronAuth` - Bearer token for cron jobs
  - `stripeSignature` - Stripe webhook signature

### 2. Implementation Phase

**Create directory structure:**

```
src/lib/openapi/
├── registry.ts          # Central OpenAPI configuration
├── schemas/
│   ├── index.ts         # Export all schemas
│   ├── common.ts        # Reusable schemas
│   └── [domain].ts      # Domain-specific schemas
└── index.ts             # Main entry point
```

**Key files to implement:**

#### 2.1 registry.ts

Must include:

- `extendZodWithOpenApi(z)` call at the top
- Security schemes for all 4 auth methods
- Server URLs for dev/staging/prod
- `generateOpenAPIDocument()` function
- Comprehensive API description with auth examples

#### 2.2 schemas/common.ts

Reusable schemas:

- `UUIDSchema` with UUID format
- `TimestampSchema` for ISO dates
- `ErrorResponseSchema` (standard error format)
- `SuccessMessageSchema`

#### 2.3 schemas/[domain].ts

For each API domain:

- Request schemas with `.openapi({ description, example })`
- Response schemas for success and error cases
- `registry.registerPath()` for each endpoint
- Export TypeScript types via `z.infer<>`

#### 2.4 API Route: /api/openapi/route.ts

- Serve OpenAPI spec as JSON
- Add CORS headers for external tools
- Cache in production, no-cache in development

#### 2.5 Documentation Page: /api-docu/page.tsx

- Use Redoc to render the spec
- **CRITICAL:** Redoc must be a client component with dynamic import (no SSR)
- Add API selector if project has multiple APIs (e.g., Next.js + Supabase REST)
- **SECURITY:** Return 404 in production environment

### 3. Best Practices

**Schema Design:**

- Include realistic examples for all fields
- Document all error responses with HTTP status codes
- Use `z.enum()` for fixed options

**Security:**

- Define all security schemes in registry
- Mark each endpoint with correct security
- Hide /api-docu in production

**Maintainability:**

- Schemas are the single source of truth
- Types are auto-exported for tests
- Spec is always generated, never hand-edited

---

## Expected Output

After implementation:

1. `/api-docu` - Interactive API documentation (dev/staging only)
2. `/api/openapi` - OpenAPI JSON spec
3. `@/lib/openapi` - TypeScript types for testing
4. `docs/api-testing/openapi-guide.md` - Developer documentation

---

## Additional Request

Create documentation in `docs/api-testing/openapi-guide.md` explaining:

- How the OpenAPI system works
- How to add documentation for new endpoints
- How to use types in automated tests

````

---

## Implementation Reference

These are concrete examples based on real implementation. Use as reference, adapt to the specific project.

### Version Pinning (package.json)

```json
{
  "dependencies": {
    "@asteasolutions/zod-to-openapi": "7.3.4",
    "zod": "~3.24.1"
  }
}
````

### Registry Configuration (registry.ts)

```typescript
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// MUST call this before any schema definitions
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// ============================================================================
// Security Schemes (4 types)
// ============================================================================

// 1. Cookie Auth - Most user-facing endpoints
registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'sb-{project-ref}-auth-token',
  description: 'Supabase session cookie. Set automatically after login.',
});

// 2. API Key Auth - Internal/testing endpoints
registry.registerComponent('securitySchemes', 'apiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key for internal endpoints. Use "dev-api-key" in development.',
});

// 3. Cron Auth - Scheduled jobs
registry.registerComponent('securitySchemes', 'cronAuth', {
  type: 'http',
  scheme: 'bearer',
  description: 'CRON_SECRET token for scheduled job endpoints.',
});

// 4. Stripe Signature - Webhooks
registry.registerComponent('securitySchemes', 'stripeSignature', {
  type: 'apiKey',
  in: 'header',
  name: 'Stripe-Signature',
  description: 'Stripe webhook signature. Only Stripe can call these.',
});

// ============================================================================
// OpenAPI Document Generator
// ============================================================================

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Project Name - API',
      version: '1.0.0',
      description: `
## Authentication Methods

### 1. Cookie Auth (Most Endpoints)
Supabase session cookies are sent automatically from the browser.

**Testing with cURL:**
\`\`\`bash
curl -X POST http://localhost:3000/api/endpoint \\
  -H "Cookie: sb-xxx-auth-token=YOUR_TOKEN"
\`\`\`

### 2. API Key (Testing/Internal)
\`\`\`bash
curl http://localhost:3000/api/testing/endpoint \\
  -H "X-API-Key: dev-api-key"
\`\`\`

### 3. Cron Auth (Scheduled Jobs)
\`\`\`bash
curl -X POST http://localhost:3000/api/cron/job \\
  -H "Authorization: Bearer CRON_SECRET"
\`\`\`
      `.trim(),
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Development' },
      { url: 'https://staging.example.com/api', description: 'Staging' },
      { url: 'https://example.com/api', description: 'Production' },
    ],
  });
}

export { z };
```

### Domain Schema Example (schemas/checkout.ts)

```typescript
import { z } from 'zod';
import { registry } from '../registry';
import { UUIDSchema, ErrorResponseSchema } from './common';

// ============================================================================
// Request Schemas
// ============================================================================

export const CreateCheckoutSessionRequestSchema = z
  .object({
    booking_id: UUIDSchema.openapi({
      description: 'The booking ID to create a checkout session for',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
  })
  .openapi('CreateCheckoutSessionRequest');

// ============================================================================
// Response Schemas
// ============================================================================

export const CreateCheckoutSessionResponseSchema = z
  .object({
    url: z.string().url().openapi({
      description: 'Stripe Checkout URL to redirect the user',
      example: 'https://checkout.stripe.com/c/pay/cs_test_...',
    }),
  })
  .openapi('CreateCheckoutSessionResponse');

// ============================================================================
// Register Endpoint
// ============================================================================

registry.registerPath({
  method: 'post',
  path: '/checkout/session',
  tags: ['Payments'],
  summary: 'Create Stripe checkout session',
  description: 'Creates a Stripe Checkout session for a pending booking.',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateCheckoutSessionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Checkout session created successfully',
      content: {
        'application/json': {
          schema: CreateCheckoutSessionResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// ============================================================================
// Export Types
// ============================================================================

export type CreateCheckoutSessionRequest = z.infer<typeof CreateCheckoutSessionRequestSchema>;
export type CreateCheckoutSessionResponse = z.infer<typeof CreateCheckoutSessionResponseSchema>;
```

### OpenAPI Route (/api/openapi/route.ts)

```typescript
import { NextResponse } from 'next/server';
import { generateOpenAPIDocument } from '@/lib/openapi';

export async function GET() {
  const spec = generateOpenAPIDocument();

  return NextResponse.json(spec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': process.env.NODE_ENV === 'production' ? 'public, max-age=3600' : 'no-cache',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

### Redoc Viewer (Client Component)

```typescript
// src/app/api-docu/redoc-viewer.tsx
'use client'

import dynamic from 'next/dynamic'

// CRITICAL: Redoc must be loaded with no SSR
const RedocStandalone = dynamic(
  () => import('redoc').then((mod) => mod.RedocStandalone),
  { ssr: false }
)

interface RedocViewerProps {
  specUrl: string
}

export function RedocViewer({ specUrl }: RedocViewerProps) {
  return (
    <RedocStandalone
      specUrl={specUrl}
      options={{
        theme: {
          colors: { primary: { main: '#7c3aed' } },
        },
        hideDownloadButton: false,
        expandResponses: '200',
      }}
    />
  )
}
```

### Production Protection (page.tsx)

```typescript
// src/app/api-docu/page.tsx
import { notFound } from 'next/navigation'
import { RedocViewer } from './redoc-viewer'

function isAllowedEnvironment(): boolean {
  // VERCEL_ENV: 'production' | 'preview' | 'development'
  const vercelEnv = process.env.VERCEL_ENV

  if (vercelEnv) {
    return vercelEnv !== 'production'
  }

  return process.env.NODE_ENV === 'development'
}

export default function ApiDocuPage() {
  // Return 404 in production
  if (!isAllowedEnvironment()) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <RedocViewer specUrl="/api/openapi" />
    </div>
  )
}
```

---

## Extending Documentation

### Adding a New Endpoint

When you create a new API endpoint, follow these steps:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADDING NEW ENDPOINT DOCS                      │
└─────────────────────────────────────────────────────────────────┘

1. CREATE the API route
   └── src/app/api/[domain]/route.ts

2. CREATE or UPDATE schema file
   └── src/lib/openapi/schemas/[domain].ts

   Include:
   ├── Request schema with .openapi() metadata
   ├── Response schema(s) for success and errors
   ├── registry.registerPath() call
   └── Export TypeScript types

3. UPDATE schemas/index.ts
   └── Add export for new schema file

4. TEST the documentation
   └── Visit /api-docu and verify endpoint appears

5. VERIFY types work
   └── Import types in test file, ensure autocomplete works
```

### Schema Checklist

For each new endpoint, ensure:

- [ ] Request schema has `.openapi({ description, example })`
- [ ] Response schemas cover success AND error cases
- [ ] `registry.registerPath()` includes:
  - [ ] Correct HTTP method
  - [ ] Path matches actual route
  - [ ] Appropriate tag for grouping
  - [ ] Security requirement specified
  - [ ] All response status codes documented
- [ ] TypeScript types are exported

### Example PR Checklist

```markdown
## API Documentation

- [ ] Added/updated schema in `src/lib/openapi/schemas/`
- [ ] Registered endpoint with `registry.registerPath()`
- [ ] Verified endpoint appears in /api-docu
- [ ] Types are exported and usable in tests
```

---

## Troubleshooting

### Common Errors

#### Error: "Cannot read properties of undefined (reading 'parent')"

**Cause:** Version incompatibility between zod and zod-to-openapi

**Solution:**

```bash
# Check current versions
grep -E '"zod"|"@asteasolutions/zod-to-openapi"' package.json

# Fix versions
bun add @asteasolutions/zod-to-openapi@7.3.4

# Ensure zod is pinned in package.json
"zod": "~3.24.1"  # NOT ^3.24.1

# Clear cache and reinstall
rm -rf .next node_modules
bun install
```

#### Error: Redoc "window is not defined"

**Cause:** Redoc trying to render on server

**Solution:** Use dynamic import with `ssr: false`:

```typescript
const RedocStandalone = dynamic(() => import('redoc').then(mod => mod.RedocStandalone), {
  ssr: false,
});
```

#### Error: CORS when fetching /api/openapi from external tool

**Solution:** Add CORS headers to the route:

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}
```

#### /api-docu shows in production

**Solution:** Add environment check:

```typescript
if (process.env.VERCEL_ENV === 'production') {
  notFound();
}
```

#### Error: "Package path ./v4/core is not exported from package zod"

**Cause:** Version conflict between `@hookform/resolvers` and `zod`

- `@hookform/resolvers@5.x` requires `zod@3.25+` (uses v4 exports like `./v4/core`)
- `zod-to-openapi@7.3.4` requires `zod@~3.24.x`
- These two packages have incompatible zod version requirements

**Solution:** Downgrade `@hookform/resolvers` to 3.x:

```bash
# Check current version
grep '"@hookform/resolvers"' package.json

# Downgrade to compatible version
bun add @hookform/resolvers@3.10.0

# Verify build passes
bun run build
```

**Compatible versions matrix:**

| Package               | Version | Zod Requirement |
| --------------------- | ------- | --------------- |
| `zod`                 | ~3.24.1 | -               |
| `zod-to-openapi`      | 7.3.4   | ~3.24.x         |
| `@hookform/resolvers` | 3.10.0  | any 3.x         |

> **Note:** If using react-hook-form with zod validation, always check `@hookform/resolvers` compatibility when pinning zod versions.

### Debugging Tips

```bash
# Verify OpenAPI spec is valid
curl http://localhost:3000/api/openapi | jq .

# Check all registered paths
curl http://localhost:3000/api/openapi | jq '.paths | keys'

# Validate with online tool
# Copy spec to https://editor.swagger.io/
```

---

## Dependency Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 3 - INFRASTRUCTURE                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │    backend-setup.md         │
              │    Creates:                 │
              │    • src/lib/supabase/*     │
              │    • src/lib/config.ts      │
              │    • src/types/supabase.ts  │
              └─────────────────────────────┘
                              │
                              │ (prerequisite 1)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 7 - IMPLEMENTATION                       │
│                                                                  │
│    Creates API endpoints: /api/checkout/, /api/stripe/, etc.    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (prerequisite 2)
                              ▼
         ┌────────────────────────────────────────┐
         │    api-documentation.md                │  ◄── THIS PROMPT
         │                                        │
         │   OUTPUT:                              │
         │   • src/lib/openapi/                   │
         │   • src/app/api/openapi/route.ts       │
         │   • src/app/api-docu/                  │
         │   • docs/api-testing/openapi-guide.md  │
         └────────────────────────────────────────┘
```

---

## Version History

| Version | Date    | Changes                                                                                                                  |
| ------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2024-12 | Initial version                                                                                                          |
| 1.1     | 2024-12 | Added prerequisite verification                                                                                          |
| 2.0     | 2024-12 | Major update: version pinning, concrete examples, troubleshooting, Redoc SSR fix, production protection, extending guide |
