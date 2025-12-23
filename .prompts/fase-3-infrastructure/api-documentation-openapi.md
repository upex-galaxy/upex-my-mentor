# Prompt: API Documentation Infrastructure with OpenAPI

> **Phase:** 3 - Infrastructure (ejecutar DESPUÉS de Fase 7 si hay endpoints)
> **Category:** API Documentation
> **Reusability:** Generic (works for any Next.js + Supabase project)
> **Dependencies:**
>   - `backend-setup.md` (Fase 3) - Infraestructura base
>   - Custom API endpoints (Fase 7) - Al menos 1 endpoint para documentar

---

## Prerequisites Check

**CRITICAL: This prompt requires TWO things:**

1. **Backend infrastructure** (from `backend-setup.md`)
2. **Custom API endpoints** (from Fase 7: Implementation)

### Why Two Dependencies?

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY EXPLANATION                        │
└─────────────────────────────────────────────────────────────────┘

backend-setup.md (Fase 3) generates:
  ✅ src/lib/supabase/client.ts    (DB client)
  ✅ src/lib/supabase/server.ts    (Server client)
  ✅ src/lib/config.ts             (Configuración)
  ✅ src/types/supabase.ts         (DB types)
  ✅ middleware.ts                 (Auth protection)
  ❌ src/app/api/*                 (NO GENERA ENDPOINTS)

Custom API endpoints are created during:
  • Fase 7: Implementation (when features need business logic)
  • Example: /api/checkout/, /api/bookings/, /api/stripe/

This prompt DOCUMENTS existing endpoints - it doesn't CREATE them.
```

### Required Files

**From backend-setup.md (Fase 3):**
```
src/
├── lib/
│   ├── config.ts                 # ← Configuración centralizada
│   └── supabase/
│       ├── client.ts             # ← Browser client
│       └── server.ts             # ← Server client
└── types/
    └── supabase.ts               # ← Tipos de DB generados
```

**From Fase 7: Implementation (o desarrollo previo):**
```
src/
└── app/
    └── api/                      # ← Al menos 1 endpoint custom
        └── [endpoint]/
            └── route.ts
```

### Verification Commands

```bash
# Check if backend-setup output exists
ls -la src/lib/supabase/client.ts src/lib/supabase/server.ts src/lib/config.ts 2>/dev/null

# Check for custom API endpoints
find src/app/api -name "route.ts" 2>/dev/null | head -5

# Check if Zod is installed
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
   │ STEP 2: API Endpoints │     │ ⛔ STOP - Run backend-setup  │
   │ Do custom API routes  │     │                              │
   │ exist in src/app/api? │     │ Path: .prompts/              │
   └──────────────────────┘     │ fase-3-infrastructure/       │
              │                 │ backend-setup.md             │
              │                 │                              │
   ┌──────────┴──────────┐      │ Creates:                     │
   │                     │      │ • Supabase clients           │
   ▼                     ▼      │ • Config centralizado        │
┌──────┐            ┌──────┐    │ • Types de database          │
│ YES  │            │  NO  │    │ • Auth integration           │
└──────┘            └──────┘    └──────────────────────────────┘
   │                     │
   │                     │
   ▼                     ▼
┌──────────────┐    ┌───────────────────────────────────────┐
│ ✅ PROCEED   │    │ ⏸️  WAIT - Create endpoints first      │
│ with this    │    │                                       │
│ prompt       │    │ API endpoints are created in:         │
└──────────────┘    │ • Fase 7: Implementation              │
                    │ • When features need business logic   │
                    │                                       │
                    │ Examples of custom endpoints:         │
                    │ • /api/checkout/ (payment flow)       │
                    │ • /api/bookings/ (business logic)     │
                    │ • /api/stripe/   (webhooks)           │
                    │                                       │
                    │ This prompt DOCUMENTS existing APIs.  │
                    │ Return after you have endpoints.      │
                    └───────────────────────────────────────┘
```

### When to Run This Prompt?

```
TIMELINE:
─────────────────────────────────────────────────────────────────────

Fase 3: Infrastructure
  │
  ├── backend-setup.md ✅ (creates DB, clients, types)
  │
  └── api-documentation-openapi.md ❌ (NO endpoints yet!)

         ... time passes, features implemented ...

Fase 7: Implementation
  │
  ├── Feature 1: Creates /api/checkout/
  ├── Feature 2: Creates /api/bookings/
  └── Feature N: Creates /api/[domain]/

         ... after several features with custom APIs ...

RETURN TO:
  │
  └── api-documentation-openapi.md ✅ (NOW we have endpoints!)

─────────────────────────────────────────────────────────────────────
```

---

## Purpose

This prompt guides an AI assistant to implement a professional, automated OpenAPI documentation system for custom Next.js API endpoints. The solution uses Zod schemas as the single source of truth for validation, TypeScript types, and documentation.

---

## The Prompt

```
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

**Decision:**
- IF any Supabase client files are MISSING:
  → STOP and inform user: "Backend infrastructure not found. Please run backend-setup.md first."
  → Provide path: `.prompts/fase-3-infrastructure/backend-setup.md`

- IF no API routes found (count = 0):
  → WARN user: "No custom API endpoints found. This prompt documents existing APIs."
  → ASK: "Would you like me to create a basic health check endpoint first, or do you have endpoints elsewhere?"

- IF all checks pass:
  → PROCEED with implementation

### Step 0.2: Check Zod Installation
```bash
grep '"zod"' package.json
```

- IF Zod not found → Install: `bun add zod`

---

## Project Context

- Framework: Next.js 15 (App Router)
- Backend: Supabase (for database, but custom endpoints for business logic)
- Validation: Zod schemas
- Package Manager: [bun/npm/pnpm]

## Requirements

### 1. Discovery Phase
First, analyze my API routes to understand:
- List all custom endpoints in `src/app/api/`
- For each endpoint, identify:
  - HTTP method (GET, POST, PUT, DELETE, PATCH)
  - Request body schema (if any)
  - Query parameters (if any)
  - Response schemas (success and error cases)
  - Authentication requirements (public, authenticated, admin, cron)

### 2. Implementation Phase
Implement OpenAPI documentation using `@asteasolutions/zod-to-openapi`:

**Install dependency:**
```bash
bun add @asteasolutions/zod-to-openapi
```

**Create directory structure:**
```
src/lib/openapi/
├── registry.ts          # Central OpenAPI configuration
├── schemas/
│   ├── index.ts         # Export all schemas
│   ├── common.ts        # Reusable schemas (UUID, timestamps, errors)
│   └── [domain].ts      # Domain-specific schemas
└── index.ts             # Main entry point
```

**Key files to create:**

1. **registry.ts** - OpenAPI configuration with:
   - Project title, version, description
   - Server URLs (development, staging, production)
   - Security schemes (cookie auth, API key, cron auth, webhooks)
   - The `generateOpenAPIDocument()` function

2. **schemas/common.ts** - Reusable schemas:
   - UUIDSchema
   - TimestampSchema
   - PaginationSchema
   - ErrorResponseSchema (standard error format)
   - SuccessResponseSchema

3. **schemas/[domain].ts** - For each API domain:
   - Request body schemas with `.openapi()` metadata
   - Response schemas for success and error cases
   - `registry.registerPath()` calls to document each endpoint
   - Export TypeScript types using `z.infer<>`

4. **API endpoint** at `/api/openapi`:
   - Serve the generated OpenAPI spec as JSON
   - Include CORS headers for documentation tools
   - Add proper caching headers

### 3. Documentation Page
Create or update an API documentation page at `/api-docu`:
- Use Redoc or Swagger UI to render the OpenAPI spec
- If the project has both Supabase REST and custom APIs, add a selector

### 4. Best Practices to Follow

**Schema Design:**
- Use descriptive `.openapi({ description, example })` metadata
- Include realistic examples for all fields
- Document all possible error responses with HTTP status codes
- Use `z.enum()` for fields with fixed options

**Security:**
- Define appropriate security schemes
- Mark each endpoint with correct security requirements
- Document which endpoints are public vs authenticated

**Maintainability:**
- Schemas live next to or are derived from the actual validation logic
- Types are exported for use in tests and client code
- The spec is always auto-generated from code, never manually edited

## Expected Output

After implementation, I should be able to:
1. Visit `/api-docu` to see interactive API documentation
2. Fetch `/api/openapi` to get the OpenAPI JSON spec
3. Import TypeScript types from `@/lib/openapi` for type-safe testing
4. Configure an MCP OpenAPI server with the spec URL

## Additional Request
Create a documentation file in `docs/api-testing/` explaining:
- How the OpenAPI system works
- How to add documentation for new endpoints
- How to use the types in automated tests
- Include ASCII diagrams showing the architecture
```

---

## Relationship with Other Prompts

### Dependency Chain (Cross-Phase)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 3 - INFRASTRUCTURE                       │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────┐              ┌─────────────────────────────┐
│ frontend-setup.md   │              │    backend-setup.md         │
│ (Design System)     │              │    (Supabase, Auth, DB)     │
└─────────────────────┘              │                             │
                                     │    OUTPUT:                  │
                                     │    • src/lib/supabase/*     │
                                     │    • src/lib/config.ts      │
                                     │    • src/types/supabase.ts  │
                                     │    • middleware.ts          │
                                     │                             │
                                     │    ❌ NO API ENDPOINTS      │
                                     └─────────────────────────────┘
                                                   │
                                                   │ (prerequisite 1)
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 7 - IMPLEMENTATION                       │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────┐              ┌─────────────────────────────┐
│ Story: Checkout     │              │ Story: Stripe Connect       │
│ Creates:            │              │ Creates:                    │
│ /api/checkout/      │              │ /api/stripe/connect/        │
└─────────────────────┘              │ /api/stripe/webhook/        │
         │                           └─────────────────────────────┘
         │                                         │
         └────────────────────┬────────────────────┘
                              │ (prerequisite 2)
                              ▼
         ┌────────────────────────────────────────┐
         │    api-documentation-openapi.md        │  ◄── THIS PROMPT
         │   (OpenAPI, Zod schemas, Docs)         │
         │                                        │
         │   INPUT:                               │
         │   • Existing API endpoints             │
         │   • Backend infrastructure             │
         │                                        │
         │   OUTPUT:                              │
         │   • src/lib/openapi/                   │
         │   • src/app/api/openapi/route.ts       │
         │   • src/app/api-docu/ (updated)        │
         │   • docs/api-testing/openapi-guide.md  │
         └────────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │         [Future Prompts]               │
         │   • mcp-openapi-setup.md               │
         │   • api-testing-strategy.md            │
         └────────────────────────────────────────┘
```

### Key Insight

```
┌─────────────────────────────────────────────────────────────────┐
│ This prompt is in fase-3-infrastructure/ but should be         │
│ executed AFTER fase-7 creates custom API endpoints.             │
│                                                                 │
│ It lives here because:                                          │
│ • It's infrastructure (documentation system)                   │
│ • It's a one-time setup (not per-feature)                      │
│ • It reuses backend-setup output                                │
│                                                                 │
│ Think of it as: "Infrastructure for documenting APIs"           │
│ NOT: "Infrastructure that creates APIs"                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Example Output Structure

After running this prompt, you should have:

```
src/
├── app/
│   ├── api/
│   │   └── openapi/
│   │       └── route.ts          # Serves OpenAPI spec
│   └── api-docu/
│       ├── page.tsx              # Documentation page
│       └── api-doc-selector.tsx  # (Optional) Selector component
│
└── lib/
    └── openapi/
        ├── index.ts              # Main entry point
        ├── registry.ts           # OpenAPI configuration
        └── schemas/
            ├── index.ts          # Export all schemas
            ├── common.ts         # Reusable schemas
            └── [your-domains].ts # Domain-specific schemas

docs/
└── api-testing/
    └── openapi-zod-guide.md      # Developer documentation
```

---

## Customization Points

When using this prompt in different projects, adjust:

| Aspect | Example Variations |
|--------|-------------------|
| **Auth Method** | Supabase cookies, JWT Bearer, API keys |
| **Server URLs** | Your deployment environments |
| **API Prefix** | `/api/v1/`, `/api/`, custom prefix |
| **Documentation Route** | `/docs`, `/api-docs`, `/api-docu` |
| **Rendering Library** | Redoc, Swagger UI, Stoplight |

---

## Integration with Testing

### Same Repository Testing

```typescript
// tests/api/checkout.test.ts
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse
} from '@/lib/openapi'

const request: CreateCheckoutSessionRequest = {
  booking_id: 'uuid-here'
}

// TypeScript ensures request matches schema
const response = await fetch('/api/checkout/session', {
  method: 'POST',
  body: JSON.stringify(request)
})
const data: CreateCheckoutSessionResponse = await response.json()
```

### Separate QA Repository Testing

```bash
# In QA repository
bunx openapi-typescript https://your-staging.com/api/openapi -o ./src/types/api.d.ts
```

```typescript
// qa-repo/src/tests/checkout.test.ts
import type { paths, components } from '../types/api'

type CheckoutRequest = components['schemas']['CreateCheckoutSessionRequest']
type CheckoutResponse = components['schemas']['CreateCheckoutSessionResponse']
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12 | Initial version |
| 1.1 | 2024-12 | Added prerequisite verification from backend-setup.md |

