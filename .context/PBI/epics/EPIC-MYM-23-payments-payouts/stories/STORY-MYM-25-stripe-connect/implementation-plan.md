# Implementation Plan: STORY-MYM-25 - Stripe Connect Onboarding

**Fecha:** 2025-12-08
**Story Jira Key:** MYM-25
**Epic:** MYM-23 - Payments & Payouts
**Status:** Ready for Implementation

---

## Overview

Implementar el flujo de onboarding de Stripe Connect Express para que los mentores puedan conectar su cuenta bancaria y recibir payouts.

**Acceptance Criteria a cumplir:**

1. ✅ Mentor navega a `/dashboard/payouts` y ve botón "Connect Bank Account"
2. ✅ Al hacer click, se redirige a Stripe Connect onboarding
3. ✅ Al completar, regresa a la plataforma con mensaje de éxito
4. ✅ El estado de la cuenta se actualiza vía webhook `account.updated`
5. ✅ El botón cambia a "Account Connected ✓" cuando está verificado

---

## Technical Approach

**Chosen approach:** Stripe Connect Express con Account Links

**Alternatives considered:**

- **Stripe Connect Standard:** Requiere que mentores gestionen su propio Stripe Dashboard - demasiado complejo para MVP
- **Stripe Connect Custom:** Control total pero complejidad de KYC/compliance muy alta

**Why this approach:**

- ✅ Stripe maneja KYC/identity verification automáticamente
- ✅ Onboarding white-labeled (mentors no salen del contexto de la plataforma)
- ✅ Bank account validation manejada por Stripe
- ✅ Cumplimiento legal simplificado
- ❌ Trade-off: Control limitado sobre UI del onboarding (es de Stripe)

---

## UI/UX Design

**Design System:** `.context/design-system.md` (Estilo: Moderno/Bold)

### Componentes del Design System a usar:

- ✅ **Button** → `variant="default"` para CTA principal, `variant="outline"` para acciones secundarias
- ✅ **Card** → Container principal para el área de payouts
- ✅ **Badge** → Estados de cuenta (Connected, Pending, Not Connected)
- ✅ **Alert** → Mensajes de success/warning/info

### Componentes custom a crear:

**1. ConnectBankAccountCard**

- **Propósito:** Mostrar estado de conexión y CTA para conectar
- **Props:**
  ```typescript
  interface ConnectBankAccountCardProps {
    status: StripeConnectStatus | null
    onConnect: () => void
    isLoading: boolean
  }
  ```
- **Ubicación:** `src/components/payments/connect-bank-account-card.tsx`

**2. StripeConnectStatusBadge**

- **Propósito:** Badge semántico para estado de Stripe Connect
- **Props:**
  ```typescript
  interface StripeConnectStatusBadgeProps {
    connected: boolean
    payoutsEnabled: boolean
  }
  ```
- **Ubicación:** `src/components/payments/stripe-connect-status-badge.tsx`

### Wireframe - /dashboard/payouts:

```
┌──────────────────────────────────────────────────────────┐
│ Header: "Payouts" + Status Badge                         │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ConnectBankAccountCard                                │ │
│ │                                                       │ │
│ │  [Icon] Bank Account                                 │ │
│ │                                                       │ │
│ │  Status: Not Connected | Pending | Connected ✓       │ │
│ │                                                       │ │
│ │  [Connect Bank Account] or [Account Connected ✓]     │ │
│ │                                                       │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Alert (conditonal based on query params)              │ │
│ │ ?stripe_onboarding=success → Success message          │ │
│ │ ?stripe_onboarding=cancel → Info message              │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Estados de UI:

| Estado | Visual | Mensaje |
|--------|--------|---------|
| **Loading** | Skeleton card | - |
| **Not Connected** | Button "Connect Bank Account" | "Connect your bank account to receive payouts" |
| **Pending Verification** | Warning alert | "Stripe requires additional information..." |
| **Connected** | Green badge "✓ Connected" | "Your account is ready to receive payouts" |
| **Error** | Red alert + retry | "Failed to load status. Try again." |

### Personalidad UI/UX (Bold/Moderno):

- Sombras: `shadow-lg` en cards, `hover:shadow-xl` en hover
- Bordes: `rounded-xl`
- Espaciado: `p-6`, `gap-6`
- Gradiente sutil en header: `bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50`

---

## Types & Type Safety

**Archivo:** `src/types/payments.ts` (crear nuevo)

```typescript
// Stripe Connect Status
export interface StripeConnectStatus {
  connected: boolean
  stripe_account_id: string | null
  onboarding_complete: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
}

// API Request Types
export interface StripeConnectOnboardRequest {
  return_url: string
  refresh_url: string
}

export interface StripeConnectOnboardResponse {
  onboarding_url: string
}

// API Response Types
export interface StripeConnectStatusResponse {
  status: StripeConnectStatus
}
```

**Directiva:**

- ✅ Importar tipos desde `@/types/payments`
- ✅ Tipar todas las responses de API routes
- ✅ Props de componentes tipadas

---

## Content Writing

**Vocabulario del dominio (Upex My Mentor):**

| Contexto | Texto |
|----------|-------|
| Page title | "Payouts" |
| CTA button | "Connect Bank Account" |
| Connected state | "Account Connected ✓" |
| Success message | "Your account has been successfully connected for payouts." |
| Cancel message | "The bank account connection was cancelled. You can try again anytime." |
| Verification needed | "Stripe requires additional information to enable payouts. Please complete your profile on Stripe." |
| Description | "Connect your bank account to receive payments from your mentoring sessions." |
| Button (pending) | "Complete Verification on Stripe" |

---

## Implementation Steps

### **Step 1: Database Migration - Create stripe_accounts table**

**Task:** Crear tabla `stripe_accounts` en Supabase

**Details:**

- Crear tabla con columnas: id, mentor_id, stripe_account_id, onboarding_complete, charges_enabled, payouts_enabled, created_at, updated_at
- Agregar UNIQUE constraint en mentor_id (un mentor = una cuenta)
- Agregar UNIQUE constraint en stripe_account_id
- Configurar RLS policies:
  - SELECT: Mentor puede ver solo su propia cuenta
  - INSERT/UPDATE: Solo via service_role (backend)

**SQL via Supabase MCP:**

```sql
-- Crear tabla stripe_accounts
CREATE TABLE public.stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para queries frecuentes
CREATE INDEX idx_stripe_accounts_mentor_id ON public.stripe_accounts(mentor_id);

-- RLS
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Mentor can read own record
CREATE POLICY "Mentors can view own stripe account" ON public.stripe_accounts
  FOR SELECT USING (auth.uid() = mentor_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access" ON public.stripe_accounts
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger para updated_at
CREATE TRIGGER set_stripe_accounts_updated_at
  BEFORE UPDATE ON public.stripe_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Testing:**

- Verificar tabla creada correctamente
- Verificar RLS permite SELECT solo a owner
- Verificar UNIQUE constraints funcionan

**Estimated time:** 15 mins

---

### **Step 2: Install Stripe SDK and Configure Environment**

**Task:** Instalar dependencias y configurar variables de entorno

**Details:**

```bash
bun add stripe @stripe/stripe-js
```

**Files to create/modify:**

1. `.env.local` - agregar variables:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. `src/lib/stripe/client.ts` - Stripe server client:
   ```typescript
   import Stripe from 'stripe'

   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: '2024-11-20.acacia',
     typescript: true,
   })
   ```

3. `src/lib/stripe/client-side.ts` - Client-side Stripe:
   ```typescript
   import { loadStripe } from '@stripe/stripe-js'

   export const getStripe = () => {
     return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
   }
   ```

**Testing:**

- Verificar import de stripe no da errores
- Verificar env vars están disponibles

**Estimated time:** 15 mins

---

### **Step 3: Create Types File**

**Task:** Crear archivo de tipos para payments

**File:** `src/types/payments.ts`

**Content:**

```typescript
// Stripe Connect Status (from database)
export interface StripeConnectStatus {
  connected: boolean
  stripe_account_id: string | null
  onboarding_complete: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
}

// API Request Types
export interface StripeConnectOnboardRequest {
  return_url: string
  refresh_url: string
}

export interface StripeConnectOnboardResponse {
  onboarding_url: string
}

// API Error Response
export interface APIErrorResponse {
  error: string
  details?: string
}
```

**Also update:** `src/types/index.ts` - re-export payment types

**Testing:**

- TypeScript compila sin errores

**Estimated time:** 10 mins

---

### **Step 4: Create API Route - Get Connect Status**

**Task:** Crear endpoint para obtener estado de Stripe Connect

**File:** `src/app/api/stripe/connect/status/route.ts`

**Logic:**

1. Verificar autenticación
2. Verificar usuario es mentor
3. Query `stripe_accounts` table por mentor_id
4. Si no existe registro, retornar `{ connected: false, ... }`
5. Si existe, retornar estado actual

**Response:**

```typescript
// Success
{ status: StripeConnectStatus }

// Error
{ error: string }
```

**Edge cases:**

- Usuario no autenticado → 401
- Usuario no es mentor → 403
- No tiene cuenta Stripe → `{ connected: false }`

**Testing:**

- GET sin auth → 401
- GET con student → 403
- GET con mentor sin cuenta → connected: false
- GET con mentor con cuenta → devuelve datos

**Estimated time:** 30 mins

---

### **Step 5: Create API Route - Start Onboarding**

**Task:** Crear endpoint para iniciar Stripe Connect onboarding

**File:** `src/app/api/stripe/connect/onboard/route.ts`

**Logic:**

1. Verificar autenticación
2. Verificar usuario es mentor
3. Verificar si ya tiene cuenta Stripe:
   - Si existe y onboarding_complete → retornar error "Already connected"
   - Si existe pero onboarding_complete = false → generar nueva Account Link
   - Si no existe → crear nuevo Express account + generar Account Link
4. Crear Account Link con return_url y refresh_url
5. Retornar onboarding_url

**Stripe API calls:**

```typescript
// Crear cuenta Express
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  email: mentor.email,
  metadata: {
    mentor_id: mentor.id,
  },
})

// Crear Account Link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${baseUrl}/dashboard/payouts?stripe_onboarding=refresh`,
  return_url: `${baseUrl}/dashboard/payouts?stripe_onboarding=success`,
  type: 'account_onboarding',
})
```

**Edge cases:**

- Ya tiene cuenta completa → 400 "Account already connected"
- Error de Stripe → 500 con mensaje

**Testing:**

- POST sin auth → 401
- POST con mentor nuevo → crea cuenta + retorna URL
- POST con mentor que ya tiene cuenta incompleta → retorna nueva URL
- POST con mentor que ya tiene cuenta completa → 400

**Estimated time:** 45 mins

---

### **Step 6: Create Webhook Handler - account.updated**

**Task:** Crear webhook handler para eventos de Stripe Connect

**File:** `src/app/api/stripe/webhook/route.ts`

**Logic:**

1. Verificar firma del webhook (STRIPE_WEBHOOK_SECRET)
2. Parsear evento
3. Manejar `account.updated`:
   - Extraer account_id y metadata
   - Buscar stripe_accounts por stripe_account_id
   - Actualizar onboarding_complete, charges_enabled, payouts_enabled

**Stripe Signature Verification:**

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

**Events to handle:**

- `account.updated` - Actualiza estado en DB

**Edge cases:**

- Firma inválida → 400
- Account no encontrado en DB → Log warning, skip
- Evento duplicado → Idempotente (actualiza mismo valor)

**Testing:**

- POST sin signature → 400
- POST con signature inválida → 400
- POST con account.updated válido → actualiza DB
- Verificar con Stripe CLI: `stripe trigger account.updated`

**Estimated time:** 45 mins

---

### **Step 7: Create UI Components**

**Task:** Crear componentes de UI para la página de payouts

**Files:**

1. `src/components/payments/stripe-connect-status-badge.tsx`
2. `src/components/payments/connect-bank-account-card.tsx`

**Component 1: StripeConnectStatusBadge**

```typescript
interface StripeConnectStatusBadgeProps {
  connected: boolean
  payoutsEnabled: boolean
}
```

- Not connected → Badge variant="outline" "Not Connected"
- Connected but not enabled → Badge variant="secondary" "Pending Verification"
- Connected and enabled → Badge variant="default" "Connected ✓"

**Component 2: ConnectBankAccountCard**

```typescript
interface ConnectBankAccountCardProps {
  status: StripeConnectStatus | null
  onConnect: () => void
  isLoading: boolean
}
```

- Loading → Skeleton
- Not connected → Card con CTA button
- Pending → Card con warning + button "Complete Verification"
- Connected → Card con success indicator

**Design:**

- Card con `shadow-lg rounded-xl p-6`
- Button variant="default" para CTA
- Badge para status
- Icon: Lucide `Building2` o `CreditCard`

**Testing:**

- Render con cada estado
- Click en button dispara callback

**Estimated time:** 60 mins

---

### **Step 8: Create Dashboard Payouts Page**

**Task:** Crear página /dashboard/payouts

**File:** `src/app/dashboard/payouts/page.tsx`

**Logic:**

1. Server Component: Fetch initial status
2. Client Component wrapper para interactividad
3. Manejar query params:
   - `?stripe_onboarding=success` → Show success alert
   - `?stripe_onboarding=cancel` → Show info alert
   - `?stripe_onboarding=refresh` → Re-fetch status
4. "Connect Bank Account" button → POST to /api/stripe/connect/onboard → redirect to Stripe

**Structure:**

```
/dashboard/payouts/
├── page.tsx (Server Component - fetch status)
└── payouts-client.tsx (Client Component - interactivity)
```

**States:**

- Loading → Skeleton
- Not connected → Show CTA
- Connected → Show success state
- Error → Show error + retry

**Testing:**

- Navegar a /dashboard/payouts
- Click "Connect Bank Account"
- Redirect a Stripe
- Volver con ?stripe_onboarding=success

**Estimated time:** 60 mins

---

### **Step 9: Update Middleware and Navigation**

**Task:** Agregar ruta a middleware y navegación

**Files to modify:**

1. `middleware.ts` - Agregar `/dashboard/payouts` a rutas protegidas (si no está ya)
2. Dashboard sidebar/navigation - Agregar link a "Payouts" (solo visible para mentors)

**Testing:**

- Usuario no auth → redirect a /login
- Student → redirect o hide link
- Mentor → puede acceder

**Estimated time:** 15 mins

---

### **Step 10: Integration Testing**

**Task:** Test completo del flujo end-to-end

**Flow:**

1. Mentor navega a /dashboard/payouts
2. Ve estado "Not Connected"
3. Click "Connect Bank Account"
4. Se redirige a Stripe (en test mode, skip)
5. Vuelve con ?stripe_onboarding=success
6. Webhook actualiza estado en DB
7. UI muestra "Account Connected ✓"

**Stripe Test Mode:**

- Usar stripe CLI para simular webhooks
- `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- `stripe trigger account.updated`

**Edge cases to test:**

- Mentor cancela onboarding → returns with cancel param
- Mentor needs verification → shows warning
- Multiple clicks on button → single account created

**Estimated time:** 30 mins

---

## Technical Decisions (Story-specific)

### Decision 1: Account Link vs Embedded Onboarding

**Chosen:** Account Links (redirect to Stripe)

**Reasoning:**

- ✅ Simpler implementation
- ✅ Stripe handles all UI complexity
- ✅ Automatic compliance
- ❌ Trade-off: User leaves our domain temporarily

### Decision 2: Status Check Implementation

**Chosen:** API route + client fetch (not Server Action)

**Reasoning:**

- ✅ Can be reused from multiple places
- ✅ Easier to test independently
- ✅ Clear separation of concerns

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Supabase configurado
- [x] Auth funcionando (EPIC-001)
- [ ] Stripe account creado (manual setup)
- [ ] Stripe Connect enabled (manual setup)
- [ ] Environment variables configuradas

**Blockers:**

- ⚠️ Sin Stripe account, no se puede probar

---

## Risks & Mitigations

**Risk 1:** Stripe Connect onboarding takes too long (KYC verification)

- **Impact:** Medium - User frustration
- **Mitigation:** Clear messaging that verification may take 1-2 days

**Risk 2:** Webhook endpoint unreachable during development

- **Impact:** High - Status never updates
- **Mitigation:** Use Stripe CLI for local testing; add manual refresh button

**Risk 3:** Country restrictions on Stripe Connect

- **Impact:** Medium - Some mentors can't onboard
- **Mitigation:** MVP supports US only; expand later based on demand

---

## Estimated Effort

| Step | Task | Time |
|------|------|------|
| 1 | Database migration | 15 mins |
| 2 | Install Stripe + env | 15 mins |
| 3 | Types file | 10 mins |
| 4 | API: Get status | 30 mins |
| 5 | API: Start onboarding | 45 mins |
| 6 | Webhook handler | 45 mins |
| 7 | UI components | 60 mins |
| 8 | Dashboard page | 60 mins |
| 9 | Middleware/nav | 15 mins |
| 10 | Integration testing | 30 mins |
| **Total** | | **~5.5 hours** |

**Story points:** 5 (medium complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] Mentor ve botón "Connect Bank Account"
  - [ ] Redirect a Stripe funciona
  - [ ] Return URL maneja success/cancel
  - [ ] Webhook actualiza estado
  - [ ] UI refleja estado correcto
- [ ] **Tipos del backend usados correctamente**
  - [ ] `src/types/payments.ts` creado
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada (Bold/Moderno)**
  - [ ] Cards con `shadow-lg rounded-xl`
  - [ ] Spacing consistente `p-6 gap-6`
  - [ ] Hover effects en buttons
- [ ] **Content Writing contextual**
  - [ ] Mensajes específicos de payouts (no genéricos)
  - [ ] Tono profesional pero amigable
- [ ] **Protección de rutas**
  - [ ] `/dashboard/payouts` requiere auth
  - [ ] Solo mentors pueden acceder
- [ ] Tests pasando:
  - [ ] API routes funcionan correctamente
  - [ ] Webhook procesa eventos
  - [ ] UI renderiza estados correctos
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` pasa
  - [ ] `bun run build` pasa
- [ ] Deployed to staging
- [ ] Manual smoke test:
  - [ ] Flow completo funciona
  - [ ] UI responsive

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-25-stripe-connect/story.md`
- **Feature Plan:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/feature-implementation-plan.md`
- **Design System:** `.context/design-system.md`
- **Stripe Connect Docs:** https://stripe.com/docs/connect/express-accounts

---

**Última actualización:** 2025-12-08
**Generado por:** Claude Code (Fase 6 Planning)
