# Feature Implementation Plan: EPIC-MYM-23 - Payments & Payouts

**Fecha:** 2025-12-08
**Autor:** AI-Generated (Fase 6 Planning)
**Epic Jira Key:** MYM-23
**Status:** Draft - Ready for Implementation

---

## Overview

Esta feature implementa el sistema completo de pagos y payouts del marketplace Upex My Mentor, incluyendo procesamiento de pagos de mentees via Stripe Checkout, onboarding de mentors via Stripe Connect Express, y distribución automatizada de payouts.

**Alcance:**

- **MYM-24:** Stripe Checkout - Mentee payment processing
- **MYM-25:** Stripe Connect - Mentor bank account onboarding
- **MYM-26:** Mentor Earnings Dashboard - Transaction history and balance
- **MYM-27:** Automated Payouts - 24h post-session payout processing

**Stack técnico:**

- Frontend: Next.js 15 (App Router) + React Server Components
- Backend: Next.js API Routes + Supabase Edge Functions (webhooks)
- Database: Supabase PostgreSQL
- Payment Provider: Stripe (Checkout, Connect Express, Webhooks)
- Deployment: Vercel
- Testing: Vitest + Playwright

---

## Technical Decisions

### Decision 1: Stripe Integration Mode

**Options considered:**

- A) Stripe Elements (custom payment form)
- B) Stripe Checkout (hosted payment page)
- C) Stripe Payment Links (no-code solution)

**Chosen:** B) Stripe Checkout (hosted payment page)

**Reasoning:**

- ✅ PCI-compliant without custom form handling (platform never touches card data)
- ✅ Built-in fraud protection via Stripe Radar
- ✅ Automatic 3D Secure for SCA compliance (EU)
- ✅ Mobile-optimized UX out of the box
- ✅ Faster implementation (no custom UI for payment form)
- ❌ Trade-off: Less control over checkout UX (redirect to Stripe)

**Implementation notes:**

- Create Checkout Session via API route
- Redirect mentee to Stripe-hosted page
- Handle success/cancel via redirect URLs
- Webhook `checkout.session.completed` confirms payment

---

### Decision 2: Mentor Payout Method

**Options considered:**

- A) Stripe Connect Standard (full Stripe Dashboard for mentors)
- B) Stripe Connect Express (embedded onboarding, limited dashboard)
- C) Stripe Connect Custom (full control, high complexity)

**Chosen:** B) Stripe Connect Express

**Reasoning:**

- ✅ White-labeled onboarding flow (mentors stay within platform context)
- ✅ Stripe handles KYC/identity verification automatically
- ✅ Bank account validation handled by Stripe
- ✅ Simpler tax handling (mentors manage own taxes)
- ✅ Reasonable control without Custom complexity
- ❌ Trade-off: Limited payout customization (Stripe's standard payout schedule)

**Implementation notes:**

- Generate Account Link for mentor onboarding
- Store stripe_account_id in `stripe_accounts` table
- Verify `payouts_enabled` before processing payouts
- Handle `account.updated` webhook for status changes

---

### Decision 3: Webhook Handler Architecture

**Options considered:**

- A) Next.js API Route with direct processing
- B) Supabase Edge Function for webhook handling
- C) Queue-based processing (SQS/Redis)

**Chosen:** A) Next.js API Route with idempotency

**Reasoning:**

- ✅ Simplest architecture for MVP
- ✅ Native Next.js integration
- ✅ Vercel handles scaling automatically
- ✅ Idempotency via payment_intent_id prevents duplicate processing
- ❌ Trade-off: No message queue for retry (rely on Stripe's built-in retry)

**Implementation notes:**

- Verify Stripe webhook signature on all requests
- Use `stripe_payment_intent_id` as idempotency key
- Log all webhook events to `webhook_logs` table
- Stripe auto-retries failed webhooks for 3 days

---

### Decision 4: Currency and Payment Methods (CEO Decision)

**Chosen:** USD-only, Cards-only for MVP

**From decisions.md (Q3, Q7):**

- All transactions and payouts in USD
- Hardcode `currency: 'usd'` in all Stripe calls
- Payment methods: `['card']` only (Visa, Mastercard, Amex, Discover)
- Reject non-USD requests with 400 Bad Request

**Implementation notes:**

- No currency selection UI
- Frontend displays `$` symbol for all prices
- Multi-currency roadmapped for V2 based on user demand

---

### Decision 5: Payout Timing (CEO Decision)

**Chosen:** 24-hour grace period + 2-7 days bank transfer

**From decisions.md (Q4):**

- Payout job runs hourly
- Eligible: sessions with `status='completed'` AND `completed_at < NOW() - 24 hours`
- Transfer to mentor's Stripe Connect account
- Bank transfer takes 2-7 business days (Stripe standard)

**Implementation notes:**

- Clear messaging: "Payout initiated 24h after session, arrives 2-7 days"
- Email notification when payout sent (not when funds arrive)
- Dashboard shows "Sent: [date], Arrival: 2-7 days"

---

## Types & Type Safety

**Estrategia de tipos a nivel feature:**

### 1. Database Schema (New Tables)

Las siguientes tablas deben crearse via migraciones Supabase:

```sql
-- stripe_accounts (mentor Stripe Connect accounts)
CREATE TABLE stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- transactions (payment records)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  stripe_payment_intent_id TEXT UNIQUE,
  mentee_id UUID NOT NULL REFERENCES profiles(id),
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  gross_amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd' NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- payouts (mentor payout records)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  stripe_transfer_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd' NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_transit', 'paid', 'failed')),
  scheduled_for TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- payout_items (many-to-many: payouts <-> transactions)
CREATE TABLE payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  UNIQUE(payout_id, transaction_id)
);
```

### 2. TypeScript Types (src/types/payments.ts)

```typescript
// src/types/payments.ts
import type { Database } from './supabase'

// Database Row Types
export type StripeAccount = Database['public']['Tables']['stripe_accounts']['Row']
export type StripeAccountInsert = Database['public']['Tables']['stripe_accounts']['Insert']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export type Payout = Database['public']['Tables']['payouts']['Row']
export type PayoutInsert = Database['public']['Tables']['payouts']['Insert']

// Enums
export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed'

// API Request/Response Types
export interface CreateCheckoutSessionRequest {
  booking_id: string
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string
  session_id: string
}

export interface StripeConnectOnboardRequest {
  return_url: string
  refresh_url: string
}

export interface StripeConnectOnboardResponse {
  onboarding_url: string
}

export interface StripeConnectStatus {
  connected: boolean
  onboarding_complete: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
}

// Mentor Earnings Dashboard Types
export interface MentorEarnings {
  available_balance: number
  pending_balance: number
  lifetime_earnings: number
  total_sessions: number
  next_payout_date: string | null
}

export interface TransactionWithBooking extends Transaction {
  booking: {
    session_date: string
    duration_minutes: number
  }
  mentee: {
    name: string | null
  }
}
```

### 3. Directiva para todas las stories

- ✅ Importar tipos desde `@/types/payments`
- ✅ Usar `Database` types para queries Supabase
- ✅ Props de componentes tipadas con tipos del backend
- ✅ Zero type errors en toda la feature

---

## UI/UX Design Strategy

### Componentes del Design System a usar:

- ✅ **Button:** Primary para "Connect Bank Account", "Pay Now"
- ✅ **Card:** Para earnings summary, transaction items
- ✅ **Badge:** Para status (Connected, Pending, Paid)
- ✅ **Input:** Para search/filter transactions (future)

### Componentes custom a nivel feature:

**1. ConnectBankAccountCard**

- **Usado por stories:** MYM-25
- **Propósito:** CTA card para iniciar Stripe Connect onboarding
- **Estados:** Not Connected, Pending Verification, Connected
- **Ubicación:** `components/payments/connect-bank-account-card.tsx`

**2. PayoutStatusBadge**

- **Usado por stories:** MYM-26, MYM-27
- **Propósito:** Badge semántico para estados de payout
- **Variantes:** Pending (yellow), In Transit (blue), Paid (green), Failed (red)
- **Ubicación:** `components/payments/payout-status-badge.tsx`

**3. EarningsSummaryCard**

- **Usado por stories:** MYM-26
- **Propósito:** Mostrar balance disponible, lifetime earnings, próximo payout
- **Ubicación:** `components/payments/earnings-summary-card.tsx`

**4. TransactionRow**

- **Usado por stories:** MYM-26
- **Propósito:** Fila de tabla para historial de transacciones
- **Ubicación:** `components/payments/transaction-row.tsx`

### Consistencia visual:

**Paleta aplicada (del design system):**

- Primary (`bg-primary`): Botones principales (Connect, Pay)
- Secondary (`bg-secondary`): Badges secundarios
- Accent (`bg-accent`): Highlights, balance disponible
- Muted (`text-muted-foreground`): Texto secundario, timestamps
- Destructive (`bg-destructive`): Failed status, errors

**Patrones de diseño:**

- Cards con `hover:shadow-lg transition-shadow` para items interactivos
- Grid responsive: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Spacing consistente: `p-6`, `gap-4`, `mb-4`

### Flujos de UX:

**1. Stripe Connect Onboarding (MYM-25):**

```
/dashboard/payouts (Not Connected)
    → Click "Connect Bank Account"
    → Redirect to Stripe Connect Express
    → Complete onboarding on Stripe
    → Redirect back to /dashboard/payouts?stripe_onboarding=success
    → Show "Account Connected ✓"
```

**2. Mentor Views Earnings (MYM-26):**

```
/dashboard/payouts (Connected)
    → See EarningsSummaryCard (balance, lifetime, next payout)
    → See TransactionHistory table (paginated)
    → Filter by date range (future enhancement)
```

### Estados globales de la feature:

- **Loading:** Spinner centered con `animate-spin`
- **Empty:** "No transactions yet" con ilustración
- **Error:** Toast notification + retry button

---

## Content Writing Strategy

**Vocabulario del dominio identificado:**

- "Connect Bank Account" (no "Link Your Bank")
- "Payout" (no "Withdrawal" o "Transfer")
- "Session earnings" (no "Income" o "Revenue")
- "Platform fee" (no "Commission" en UI)
- "Available balance" (no "Pending funds")

**Mensajes contextuales:**

| Escenario | Mensaje |
|-----------|---------|
| Onboarding success | "Your account has been successfully connected for payouts." |
| Onboarding cancelled | "The bank account connection was cancelled. You can try again anytime." |
| Verification needed | "Stripe requires additional information to enable payouts. Please complete your profile on Stripe." |
| Payout sent | "Your payout of $X has been sent! Funds arrive in 2-7 business days." |
| No payouts yet | "Complete your first session to start earning." |

---

## Shared Dependencies

### 1. Stripe SDK

```bash
bun add stripe @stripe/stripe-js
```

- `stripe`: Server-side SDK (API routes)
- `@stripe/stripe-js`: Client-side (loadStripe for redirects)

### 2. Environment Variables

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_...
```

### 3. Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0027 6000 3184 | 3D Secure required |
| 4000 0000 0000 0077 | Charge succeeds, payout fails |

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── session/
│   │   │       └── route.ts          # POST: Create checkout session
│   │   ├── stripe/
│   │   │   ├── connect/
│   │   │   │   ├── onboard/
│   │   │   │   │   └── route.ts      # POST: Start Connect onboarding
│   │   │   │   └── status/
│   │   │   │       └── route.ts      # GET: Check Connect status
│   │   │   └── webhook/
│   │   │       └── route.ts          # POST: Handle Stripe webhooks
│   │   └── transactions/
│   │       └── route.ts              # GET: List transactions
│   ├── dashboard/
│   │   └── payouts/
│   │       └── page.tsx              # Mentor payouts page
│   └── checkout/
│       ├── [bookingId]/
│       │   └── page.tsx              # Checkout page (MYM-24)
│       ├── success/
│       │   └── page.tsx              # Payment success
│       └── cancel/
│           └── page.tsx              # Payment cancelled
│
├── components/
│   └── payments/
│       ├── connect-bank-account-card.tsx
│       ├── payout-status-badge.tsx
│       ├── earnings-summary-card.tsx
│       ├── transaction-row.tsx
│       └── transaction-history.tsx
│
├── lib/
│   ├── stripe/
│   │   ├── client.ts                 # Stripe server client
│   │   ├── checkout.ts               # Checkout session helpers
│   │   ├── connect.ts                # Connect helpers
│   │   └── webhooks.ts               # Webhook handlers
│   └── payments/
│       ├── transactions.ts           # Transaction queries
│       └── payouts.ts                # Payout queries
│
└── types/
    └── payments.ts                   # Payment types
```

### Design Patterns

1. **Server Actions for mutations:** Use Next.js Server Actions for form submissions
2. **API Routes for Stripe:** External webhooks require API routes (not Server Actions)
3. **React Server Components:** Fetch data server-side, minimize client JavaScript

### Third-party Libraries

- **stripe** (v17+): Stripe Node.js SDK
- **@stripe/stripe-js** (v5+): Stripe client-side library
- **@stripe/react-stripe-js** (optional): React components (not needed with Checkout)

---

## Implementation Order

**Recomendado:**

1. **Database Migrations (Prerequisite)**
   - Crear tablas: `stripe_accounts`, `transactions`, `payouts`, `payout_items`
   - Actualizar `src/types/supabase.ts` con nuevas tablas
   - Crear `src/types/payments.ts` con tipos de dominio
   - Razón: Base para todas las stories

2. **MYM-25: Stripe Connect Onboarding** (esta story)
   - Mentor puede conectar cuenta bancaria
   - Razón: Prerequisito para recibir pagos; no depende de checkout

3. **MYM-24: Stripe Checkout**
   - Mentee puede pagar por sesión
   - Razón: Depende de booking (EPIC-004) pero no de MYM-25

4. **MYM-26: Mentor Earnings Dashboard**
   - Ver historial de transacciones y balance
   - Razón: Depende de MYM-24 (necesita transacciones)

5. **MYM-27: Automated Payouts**
   - Procesar payouts automaticos 24h post-sesión
   - Razón: Depende de MYM-24 + MYM-25 (necesita pagos y Connect)

---

## Risks & Mitigations

### Risk 1: Webhook Delivery Failures

**Impact:** HIGH - Pagos confirmados pero bookings no actualizados
**Likelihood:** MEDIUM
**Mitigation:**

- Verificar firma de webhook (STRIPE_WEBHOOK_SECRET)
- Idempotencia via `stripe_payment_intent_id`
- Stripe auto-retry por 3 días
- Reconciliation job diario (futuro)

### Risk 2: Stripe Connect Onboarding Abandonment

**Impact:** MEDIUM - Mentors no pueden recibir pagos
**Likelihood:** MEDIUM
**Mitigation:**

- UI clara con estados (Not Connected, Pending, Connected)
- Email reminder si onboarding incompleto (futuro)
- Help article: "How to connect your bank account"

### Risk 3: Race Condition in Payout Processing

**Impact:** HIGH - Pagos duplicados
**Likelihood:** LOW
**Mitigation:**

- UNIQUE constraint en `payout_items.transaction_id`
- SELECT FOR UPDATE cuando sea necesario
- Job idempotente (check if payout exists before creating)

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las 4 stories implementadas y deployed (MYM-24, MYM-25, MYM-26, MYM-27)
- [ ] **Database migrations aplicadas**
  - [ ] Tablas `stripe_accounts`, `transactions`, `payouts`, `payout_items` creadas
  - [ ] RLS policies configuradas
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] `src/types/payments.ts` creado
  - [ ] Todas las stories usan tipos desde `@/types/payments`
  - [ ] Zero type errors
- [ ] **Stripe Integration funcional**
  - [ ] Checkout flow completo (test card 4242...)
  - [ ] Connect onboarding completo
  - [ ] Webhook handler procesa eventos correctamente
- [ ] **UI/UX consistente**
  - [ ] Design system aplicado (Button, Card, Badge)
  - [ ] Estados de loading, empty, error implementados
  - [ ] Mobile responsive
- [ ] **Security**
  - [ ] Webhook signature verification
  - [ ] Idempotency en webhook handler
  - [ ] RLS policies restringen acceso a datos propios
- [ ] **Build y linting pasando**
  - [ ] `bun run build` exitoso
  - [ ] `bun run lint` sin errores
  - [ ] `bun run typecheck` sin errores

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/epic.md`
- **CEO Decisions:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/decisions.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/feature-test-plan.md`
- **Design System:** `.context/design-system.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-016, FR-017, FR-018)

---

**Última actualización:** 2025-12-08
**Generado por:** Claude Code (Fase 6 Planning)
