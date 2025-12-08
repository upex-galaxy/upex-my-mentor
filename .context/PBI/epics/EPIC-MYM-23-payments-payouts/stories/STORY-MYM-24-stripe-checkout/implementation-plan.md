# Implementation Plan: STORY-MYM-24 - Stripe Checkout Integration

**Fecha:** 2025-12-08
**Autor:** AI-Generated (Fase 6 Planning)
**Jira Key:** MYM-24
**Branch:** `feat/MYM-24/stripe-checkout`

---

## Overview

Implementar el flujo de pago para mentees usando Stripe Checkout. Cuando un mentee selecciona un slot de tiempo y confirma el booking, se le redirige a Stripe Checkout para completar el pago de forma segura.

**Acceptance Criteria a cumplir:**

- ✅ Mentee puede pagar por una sesión usando Stripe Checkout
- ✅ Sistema recibe webhook `checkout.session.completed` de Stripe
- ✅ Booking status se actualiza de `pending_payment` a `confirmed`
- ✅ Mentee es redirigido a página de confirmación tras pago exitoso
- ✅ Pagos fallidos muestran error y mantienen status `pending_payment`

---

## Technical Approach

**Chosen approach:** Stripe Checkout (hosted payment page)

**Alternatives considered:**

- **Stripe Elements (custom form):** Mayor control de UX pero requiere manejo de PCI compliance y más código
- **Stripe Payment Links:** Muy simple pero sin flexibilidad para metadata/booking reference

**Why this approach:**

- ✅ PCI-compliant sin manejo de datos de tarjeta (Stripe maneja todo)
- ✅ Fraud protection via Stripe Radar incluido
- ✅ 3D Secure automático para SCA compliance (EU)
- ✅ Mobile-optimized UX out of the box
- ✅ Rápida implementación (redirect flow)
- ❌ Trade-off: Menor control de UX (redirect a Stripe)

---

## Architecture

### Flow Diagram

```
[Mentee en /checkout/[bookingId]]
    ↓
[Click "Pay Now"]
    ↓
[POST /api/checkout/session] ← Creates Stripe Checkout Session
    ↓
[Redirect to Stripe Checkout]
    ↓
[Mentee completa pago en Stripe]
    ↓
[Stripe webhook: checkout.session.completed]
    ↓
[Webhook handler:]
    1. Crea registro en transactions table
    2. Actualiza booking.status → 'confirmed'
    ↓
[Mentee redirigido a /checkout/success?session_id=xxx]
```

### New Files to Create

```
src/
├── app/
│   ├── api/
│   │   └── checkout/
│   │       └── session/
│   │           └── route.ts          # POST: Create Stripe Checkout Session
│   └── checkout/
│       ├── [bookingId]/
│       │   └── page.tsx              # Checkout page with booking summary
│       ├── success/
│       │   └── page.tsx              # Payment success confirmation
│       └── cancel/
│           └── page.tsx              # Payment cancelled
│
├── components/
│   └── checkout/
│       ├── booking-summary-card.tsx  # Booking details display
│       └── checkout-button.tsx       # Pay Now button with loading state
```

### Files to Modify

```
src/
├── app/api/stripe/webhook/route.ts   # Add checkout.session.completed handler
├── types/payments.ts                 # Add Transaction types
└── middleware.ts                     # Protect checkout routes
```

---

## UI/UX Design

**Design System:** Moderno/Bold (Morado Creativo) - `.context/design-system.md`

### Checkout Page Layout (`/checkout/[bookingId]`)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to mentor profile                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [BookingSummaryCard]                                │   │
│  │                                                      │   │
│  │  Session with [Mentor Name]                          │   │
│  │  ───────────────────────────────────────────────     │   │
│  │  📅 Date: [session_date formatted]                   │   │
│  │  ⏱️ Duration: [duration_minutes] minutes             │   │
│  │  💰 Rate: $[hourly_rate]/hour                        │   │
│  │                                                      │   │
│  │  ───────────────────────────────────────────────     │   │
│  │  Subtotal:     $[total_cost]                         │   │
│  │  Platform Fee: $[platform_fee] (included)            │   │
│  │  ═══════════════════════════════════════════════     │   │
│  │  Total:        $[total_cost]                         │   │
│  │                                                      │   │
│  │  [🔒 Pay $XX.XX with Stripe] ← Primary Button        │   │
│  │                                                      │   │
│  │  🔒 Secure payment powered by Stripe                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Success Page Layout (`/checkout/success`)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ✓ Payment Successful!                          │
│                                                             │
│  Your session with [Mentor Name] has been confirmed.        │
│                                                             │
│  📅 [Date] at [Time]                                        │
│  ⏱️ [Duration] minutes                                      │
│                                                             │
│  Check your email for confirmation details.                 │
│                                                             │
│  [Go to My Sessions] ← Primary Button                       │
│  [Browse More Mentors] ← Ghost Button                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cancel Page Layout (`/checkout/cancel`)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ✕ Payment Cancelled                            │
│                                                             │
│  Your payment was not completed. Don't worry,               │
│  your booking is still held for 15 minutes.                 │
│                                                             │
│  [Try Again] ← Primary Button                               │
│  [Browse Mentors] ← Ghost Button                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Componentes del Design System a usar:

- ✅ **Button:** `variant="default"` para "Pay Now", `variant="ghost"` para acciones secundarias
- ✅ **Card:** Para BookingSummaryCard
- ✅ **Badge:** Para mostrar status confirmado
- ✅ **Loader/Spinner:** Durante redirect a Stripe

### Estados de UI:

- **Loading:** Skeleton loader mientras se carga booking data
- **Redirect:** Spinner con "Redirecting to secure checkout..."
- **Error:** Toast notification + mensaje inline
- **Success:** Checkmark animation + confetti (opcional)

### Responsividad:

- **Mobile (< 768px):** Card full-width con padding reducido
- **Desktop (> 768px):** Card centrada max-w-md

---

## Types & Type Safety

### Nuevos tipos a agregar en `src/types/payments.ts`:

```typescript
// ==========================================
// Transaction Types (MYM-24)
// ==========================================

export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface Transaction {
  id: string
  booking_id: string
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  mentee_id: string
  mentor_id: string
  gross_amount: number
  platform_fee: number
  net_amount: number
  currency: string
  status: TransactionStatus
  payment_method: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface TransactionInsert {
  booking_id: string
  stripe_payment_intent_id?: string | null
  stripe_checkout_session_id?: string | null
  mentee_id: string
  mentor_id: string
  gross_amount: number
  platform_fee: number
  net_amount: number
  currency?: string
  status: TransactionStatus
  payment_method?: string | null
  paid_at?: string | null
}

// ==========================================
// Checkout API Types (MYM-24)
// ==========================================

export interface CreateCheckoutSessionRequest {
  booking_id: string
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string
  session_id: string
}

export interface CheckoutSuccessParams {
  session_id?: string
}

// ==========================================
// Checkout UI Messages
// ==========================================

export const CHECKOUT_MESSAGES = {
  loading: 'Loading booking details...',
  redirecting: 'Redirecting to secure checkout...',
  success: {
    title: 'Payment Successful!',
    message: 'Your session has been confirmed. Check your email for details.',
  },
  cancel: {
    title: 'Payment Cancelled',
    message: 'Your payment was not completed. Your booking is held for 15 minutes.',
  },
  error: {
    booking_not_found: 'Booking not found. Please try again.',
    booking_expired: 'This booking has expired. Please create a new one.',
    payment_failed: 'Payment failed. Please try again or use a different card.',
    generic: 'Something went wrong. Please try again.',
  },
} as const
```

---

## Database Migration

### Nueva tabla: `transactions`

**Notas:**
- Se creará usando `mcp__supabase__apply_migration`
- La tabla almacena cada transacción de pago
- `UNIQUE` constraint en `booking_id` (1 transacción por booking)
- Idempotencia via `stripe_checkout_session_id`

**Esquema:**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT UNIQUE,
  mentee_id UUID NOT NULL REFERENCES profiles(id),
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  gross_amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd' NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_transactions_mentee ON transactions(mentee_id, status);
CREATE INDEX idx_transactions_mentor ON transactions(mentor_id, status);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);

-- RLS policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

-- Only service role can insert/update (via webhooks)
CREATE POLICY "Service role can manage transactions"
  ON transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## Implementation Steps

### **Step 1: Database Migration - Create transactions table**

**Task:** Crear la tabla `transactions` en Supabase

**Details:**
- Ejecutar migración usando MCP Supabase
- Verificar que RLS policies están activas
- Actualizar tipos de Supabase

**Testing:**
- Verificar tabla existe en Supabase dashboard
- Verificar RLS policies

---

### **Step 2: Add Transaction Types**

**Task:** Agregar tipos de Transaction a `src/types/payments.ts`

**File:** `src/types/payments.ts`

**Details:**
- Agregar `Transaction`, `TransactionInsert`, `TransactionStatus`
- Agregar `CreateCheckoutSessionRequest/Response`
- Agregar `CHECKOUT_MESSAGES`

**Testing:**
- TypeScript compila sin errores

---

### **Step 3: Create Checkout Session API Route**

**Task:** Crear endpoint `POST /api/checkout/session`

**File:** `src/app/api/checkout/session/route.ts`

**Logic:**
1. Verificar usuario autenticado (mentee)
2. Obtener booking por ID
3. Verificar booking pertenece al mentee
4. Verificar booking status es `pending_payment`
5. Obtener mentor details y stripe_account_id
6. Calcular platform_fee (20%)
7. Crear Stripe Checkout Session con:
   - `mode: 'payment'`
   - `payment_method_types: ['card']`
   - `line_items` con session details
   - `metadata: { booking_id, mentee_id, mentor_id }`
   - `success_url` y `cancel_url`
   - `payment_intent_data.transfer_data.destination` (mentor's Connect account)
8. Retornar checkout URL

**Edge cases:**
- Booking not found → 404
- Booking not in pending_payment → 400
- Mentor no tiene Stripe Connect → 400
- User no es el mentee del booking → 403

**Testing:**
- Unit test con mock Stripe
- Integration test con Stripe test mode

---

### **Step 4: Create Checkout Page UI**

**Task:** Crear página `/checkout/[bookingId]`

**File:** `src/app/checkout/[bookingId]/page.tsx`

**Components:**
1. Server Component que fetch booking data
2. `BookingSummaryCard` client component
3. `CheckoutButton` client component con loading state

**Logic:**
1. Fetch booking con mentor details
2. Mostrar resumen de la sesión
3. Al click "Pay Now":
   - Llamar `POST /api/checkout/session`
   - Redirect a Stripe Checkout URL

**Testing:**
- Visual test en diferentes viewports
- E2E test del flujo

---

### **Step 5: Create Success/Cancel Pages**

**Task:** Crear páginas de success y cancel

**Files:**
- `src/app/checkout/success/page.tsx`
- `src/app/checkout/cancel/page.tsx`

**Success page:**
- Lee `session_id` de query params
- Fetch session details (opcional para mostrar booking info)
- Muestra confirmación con CTA "Go to My Sessions"

**Cancel page:**
- Muestra mensaje de cancelación
- CTA "Try Again" que redirige back al checkout

**Testing:**
- Visual test
- Verificar redirect flows

---

### **Step 6: Extend Webhook Handler**

**Task:** Agregar handler para `checkout.session.completed`

**File:** `src/app/api/stripe/webhook/route.ts`

**Logic para `checkout.session.completed`:**
1. Extract session from event
2. Get `booking_id`, `mentee_id`, `mentor_id` from metadata
3. Check idempotency (transaction with this session_id exists?)
4. Create transaction record with `status: 'succeeded'`
5. Update booking status to `confirmed`
6. Log success

**Idempotency:**
- Check `stripe_checkout_session_id` UNIQUE constraint
- Si ya existe, skip silently (return 200)

**Testing:**
- Unit test con mock events
- Integration test con Stripe CLI: `stripe trigger checkout.session.completed`

---

### **Step 7: Update Middleware for Checkout Routes**

**Task:** Asegurar que rutas de checkout requieren autenticación

**File:** `middleware.ts`

**Details:**
- `/checkout/[bookingId]` → Requiere auth (mentee)
- `/checkout/success` → Requiere auth
- `/checkout/cancel` → Requiere auth

**Testing:**
- Verificar redirect a login si no autenticado

---

### **Step 8: Integration Testing**

**Task:** Test end-to-end del flujo completo

**Test scenario:**
1. Crear booking en `pending_payment`
2. Ir a `/checkout/[bookingId]`
3. Click "Pay Now"
4. Completar pago con test card `4242 4242 4242 4242`
5. Verificar redirect a success page
6. Verificar booking status → `confirmed`
7. Verificar transaction record creado

**Test cards:**
- `4242 4242 4242 4242` → Success
- `4000 0000 0000 9995` → Declined

---

## Technical Decisions (Story-specific)

### Decision 1: Platform Fee Handling

**Chosen:** Platform fee included in total (not added on top)

**Reasoning:**
- ✅ Cleaner UX - mentee sees one total price
- ✅ Consistent with MYM-25 feature-implementation-plan.md
- ❌ Trade-off: Less transparency (fee not shown separately)

**Implementation:**
- `gross_amount` = booking.total_cost
- `platform_fee` = gross_amount * 0.20
- `net_amount` = gross_amount - platform_fee

### Decision 2: Checkout Session Expiry

**Chosen:** 30 minute expiry (Stripe default)

**Reasoning:**
- ✅ Gives mentee enough time to complete payment
- ✅ Aligns with booking hold time (15 min provisional → 15 min pending_payment)
- ❌ If session expires, mentee must restart checkout

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Stripe SDK installed (`stripe`, `@stripe/stripe-js`) - MYM-25
- [x] Stripe server client configured (`src/lib/stripe/server.ts`) - MYM-25
- [x] Webhook handler base (`src/app/api/stripe/webhook/route.ts`) - MYM-25
- [x] `bookings` table with `pending_payment` status - Existing
- [ ] `transactions` table - **CREATE IN STEP 1**
- [x] Mentor Stripe Connect accounts - MYM-25

---

## Risks & Mitigations

### Risk 1: Webhook delivery failures

**Impact:** HIGH - Payment confirmed but booking not updated
**Likelihood:** LOW (Stripe reliability)
**Mitigation:**
- Idempotency via `stripe_checkout_session_id` UNIQUE
- Stripe auto-retries webhooks for 3 days
- Future: reconciliation job (MYM-27)

### Risk 2: Booking expires during checkout

**Impact:** MEDIUM - Mentee pays but booking was cancelled
**Likelihood:** LOW
**Mitigation:**
- Check booking status in webhook before updating
- If booking cancelled, initiate refund (future story)
- Clear messaging about time limits

### Risk 3: Mentor doesn't have Stripe Connect

**Impact:** MEDIUM - Payment cannot be processed
**Likelihood:** MEDIUM (mentors may not complete onboarding)
**Mitigation:**
- Check `payouts_enabled` before creating checkout session
- Show clear error message
- Future: email mentor to complete onboarding

---

## Definition of Done Checklist

- [ ] `transactions` table created via migration
- [ ] Transaction types added to `src/types/payments.ts`
- [ ] `POST /api/checkout/session` endpoint working
- [ ] `/checkout/[bookingId]` page renders booking summary
- [ ] "Pay Now" button redirects to Stripe Checkout
- [ ] `/checkout/success` page shows confirmation
- [ ] `/checkout/cancel` page shows cancellation message
- [ ] Webhook handler processes `checkout.session.completed`
- [ ] Booking status updates to `confirmed` on successful payment
- [ ] Transaction record created with correct amounts
- [ ] Middleware protects checkout routes
- [ ] **Type Safety:**
  - [ ] All components use types from `@/types/payments`
  - [ ] Zero TypeScript errors
- [ ] **UI/UX:**
  - [ ] Design system components used (Button, Card)
  - [ ] Loading states implemented
  - [ ] Error states implemented
  - [ ] Mobile responsive
- [ ] **Testing:**
  - [ ] Manual test with Stripe test card
  - [ ] Webhook test with Stripe CLI
- [ ] **Build:**
  - [ ] `bun run lint` passes
  - [ ] `bun run typecheck` passes
  - [ ] `bun run build` passes

---

**Última actualización:** 2025-12-08
**Generado por:** Claude Code (Fase 6 Planning)
