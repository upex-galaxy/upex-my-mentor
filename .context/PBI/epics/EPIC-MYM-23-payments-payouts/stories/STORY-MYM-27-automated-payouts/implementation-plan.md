# Implementation Plan: STORY-MYM-27 - Automated Payout Processing

**Fecha:** 2025-12-08
**Story Jira Key:** MYM-27
**Epic:** EPIC-MYM-23 - Payments & Payouts
**Status:** Ready for Implementation

---

## Overview

Implementar el sistema automatizado de payouts que transfiere el monto neto a los mentores 24 horas después de que una sesión se marca como completada. Esta es una story **backend-only** sin componentes de UI.

**Acceptance Criteria a cumplir:**
- Sistema identifica sesiones completadas hace más de 24 horas
- Sistema verifica que el mentor tiene cuenta Stripe Connect con `payouts_enabled: true`
- Sistema ejecuta Stripe Transfer por el `net_amount` al mentor
- Sistema registra el payout y actualiza el estado
- Si el payout falla, se registra el error y se notifica al mentor

---

## Technical Approach

**Chosen approach:** Next.js API Route con invocación programada via Vercel Cron

**Alternatives considered:**
- **Supabase Edge Function + pg_cron:** Requiere configuración adicional de pg_cron y manejo de secrets en Supabase
- **AWS Lambda + EventBridge:** Over-engineering para MVP, añade complejidad de infraestructura
- **Manual trigger only:** No cumple el requisito de automatización

**Why this approach:**
- ✅ Vercel Cron integrado nativamente (archivo `vercel.json`)
- ✅ Mismo stack que el resto del proyecto (Next.js API Routes)
- ✅ Stripe SDK ya configurado en `lib/stripe/server.ts`
- ✅ Logs automáticos en Vercel dashboard
- ❌ Trade-off: Cron de Vercel tiene mínimo 1 ejecución/hora en plan Pro

---

## Database Changes Required

### 1. Nueva tabla: `payouts`

Registra cada payout enviado a un mentor.

```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  stripe_transfer_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd' NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_transit', 'paid', 'failed', 'cancelled')),
  failure_reason TEXT,
  scheduled_for TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy: Mentors can only view their own payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = mentor_id);

-- Index for cron job query
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_mentor_id ON payouts(mentor_id);
```

### 2. Nueva tabla: `payout_items`

Vincula payouts con transactions (many-to-many para futuro batching).

```sql
CREATE TABLE payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(payout_id, transaction_id),
  UNIQUE(transaction_id) -- Prevents double payouts for same transaction
);

-- RLS: Inherit from payouts (mentors can view items of their payouts)
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view own payout items"
  ON payout_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payouts
      WHERE payouts.id = payout_items.payout_id
      AND payouts.mentor_id = auth.uid()
    )
  );
```

### 3. Nueva tabla: `failed_payouts` (para admin review)

Registra intentos de payout fallidos para reconciliación.

```sql
CREATE TABLE failed_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  transaction_id UUID REFERENCES transactions(id),
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  error_details JSONB,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin dashboard queries
CREATE INDEX idx_failed_payouts_resolved ON failed_payouts(resolved_at) WHERE resolved_at IS NULL;
```

### 4. Modificar tabla: `bookings`

Agregar campo `completed_at` para tracking preciso del período de 24 horas.

```sql
ALTER TABLE bookings
ADD COLUMN completed_at TIMESTAMPTZ;

COMMENT ON COLUMN bookings.completed_at IS
  'Timestamp when session was marked as completed. Used for 24h payout grace period.';

-- Backfill existing completed bookings (use updated_at as approximation)
UPDATE bookings
SET completed_at = updated_at
WHERE status = 'completed' AND completed_at IS NULL;
```

---

## Types & Type Safety

### Nuevos tipos en `src/types/payments.ts`

```typescript
// ==========================================
// Payout Types (MYM-27)
// ==========================================

export type Payout = Database['public']['Tables']['payouts']['Row']
export type PayoutInsert = Database['public']['Tables']['payouts']['Insert']
export type PayoutUpdate = Database['public']['Tables']['payouts']['Update']

export type PayoutItem = Database['public']['Tables']['payout_items']['Row']
export type PayoutItemInsert = Database['public']['Tables']['payout_items']['Insert']

export type FailedPayout = Database['public']['Tables']['failed_payouts']['Row']
export type FailedPayoutInsert = Database['public']['Tables']['failed_payouts']['Insert']

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled'

export type PayoutFailureReason =
  | 'MENTOR_ACCOUNT_RESTRICTED'
  | 'MENTOR_ACCOUNT_NOT_FOUND'
  | 'STRIPE_API_ERROR'
  | 'INSUFFICIENT_BALANCE'
  | 'ZERO_AMOUNT'

// ==========================================
// Payout Processing Types
// ==========================================

/**
 * Eligible session for payout processing
 */
export interface EligiblePayout {
  booking_id: string
  transaction_id: string
  mentor_id: string
  net_amount: number
  stripe_account_id: string
  payouts_enabled: boolean
}

/**
 * Result of processing a single payout
 */
export interface PayoutProcessResult {
  booking_id: string
  success: boolean
  payout_id?: string
  stripe_transfer_id?: string
  error?: PayoutFailureReason
  error_details?: string
}

/**
 * Summary of payout job execution
 */
export interface PayoutJobSummary {
  started_at: string
  completed_at: string
  eligible_count: number
  processed_count: number
  success_count: number
  failed_count: number
  skipped_count: number
  results: PayoutProcessResult[]
}
```

---

## Implementation Steps

### **Step 1: Database Migrations**

**Task:** Crear las tablas necesarias y modificar `bookings`

**Details:**
- Crear migración para `payouts` table
- Crear migración para `payout_items` table
- Crear migración para `failed_payouts` table
- Agregar campo `completed_at` a `bookings`
- Regenerar tipos Supabase

**Files:**
- Migration via Supabase MCP `apply_migration`

**Testing:**
- Verificar que las tablas existen con `list_tables`
- Verificar constraints y RLS policies

---

### **Step 2: Actualizar Types**

**Task:** Agregar tipos para payouts en `src/types/payments.ts`

**File:** `src/types/payments.ts`

**Details:**
- Agregar tipos de Database rows para nuevas tablas
- Agregar tipos de procesamiento (EligiblePayout, PayoutProcessResult)
- Agregar tipos de failure reasons
- Regenerar `src/types/supabase.ts` después de migraciones

**Testing:**
- `bun run typecheck` sin errores

---

### **Step 3: Crear Payout Service**

**Task:** Implementar lógica de negocio para procesamiento de payouts

**File:** `src/lib/payments/payout-service.ts`

**Structure:**

```typescript
// Key functions:

/**
 * Find all bookings eligible for payout
 * Criteria:
 * - status = 'completed'
 * - completed_at < NOW() - 24 hours
 * - has transaction with status = 'succeeded'
 * - transaction not already in payout_items
 * - mentor has stripe_account with payouts_enabled = true
 */
async function findEligiblePayouts(): Promise<EligiblePayout[]>

/**
 * Process a single payout
 * - Create Stripe Transfer
 * - Create payout record
 * - Create payout_item record
 * - Handle errors gracefully
 */
async function processPayout(eligible: EligiblePayout): Promise<PayoutProcessResult>

/**
 * Main entry point for cron job
 * - Find eligible payouts
 * - Process each independently (one failure doesn't stop others)
 * - Return summary
 */
async function processPayouts(): Promise<PayoutJobSummary>
```

**Edge cases handled:**
- Zero amount transactions: Skip with log, don't call Stripe
- Mentor account restricted: Log to failed_payouts, notify mentor
- Stripe API error: Log error, retry on next run
- Already processed: UNIQUE constraint prevents duplicates

**Testing:**
- Unit tests for eligibility query logic
- Unit tests for error handling paths

---

### **Step 4: Crear API Route para Cron Job**

**Task:** Crear endpoint que ejecuta el payout job

**File:** `src/app/api/cron/process-payouts/route.ts`

**Details:**
- Verificar authorization header (Vercel Cron secret)
- Llamar a `processPayouts()`
- Retornar resumen del job
- Log structured para debugging

```typescript
// Verification of Vercel Cron
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 })
}
```

**Security:**
- `CRON_SECRET` env var para autenticar requests
- Solo acepta requests del Vercel Cron scheduler

**Testing:**
- Integration test con mock de Stripe API

---

### **Step 5: Configurar Vercel Cron**

**Task:** Agregar configuración de cron en `vercel.json`

**File:** `vercel.json`

**Details:**
```json
{
  "crons": [
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 * * * *"
    }
  ]
}
```

Schedule: Cada hora, minuto 0 (`0 * * * *`)

**Testing:**
- Verificar en Vercel dashboard que el cron aparece
- Trigger manual para verificar funcionamiento

---

### **Step 6: Actualizar Webhook Handler**

**Task:** Manejar eventos de Transfer (opcional para MVP)

**File:** `src/app/api/stripe/webhook/route.ts`

**Details:**
- Agregar handler para `transfer.created`
- Agregar handler para `transfer.paid`
- Agregar handler para `transfer.failed`
- Actualizar status en tabla `payouts`

**Note:** El status del payout en Stripe puede cambiar después de la creación.
El webhook nos notifica cuando el payout realmente llega al banco del mentor.

---

### **Step 7: Email Notifications (Opcional para MVP)**

**Task:** Notificar al mentor cuando se envía/falla un payout

**Details:**
- Success: "Your payout of $X has been sent! Funds arrive in 2-7 business days."
- Failure: "Your payout could not be processed. Please check your Stripe account."

**Note:** Puede implementarse via Supabase Edge Functions o servicio de email.
Para MVP, puede ser solo un log estructurado.

---

## Technical Decisions (Story-specific)

### Decision 1: Hourly vs Daily Cron

**Chosen:** Hourly (cada hora)

**Reasoning:**
- ✅ Mentors reciben payouts más rápido (máximo 1h después de elegibilidad)
- ✅ Alineado con decisión del Epic (`feature-implementation-plan.md`)
- ✅ Menor carga por ejecución (procesa menos items cada vez)
- ❌ Trade-off: Más invocaciones = más logs, pero impacto mínimo

### Decision 2: Batch vs Individual Transfers

**Chosen:** Individual Transfers (un Transfer por transaction)

**Reasoning:**
- ✅ Simplicidad para MVP
- ✅ Fallo de una transfer no afecta otras
- ✅ Tracking granular (cada transaction tiene su payout)
- ❌ Trade-off: Más API calls a Stripe (pero dentro de límites)

### Decision 3: Vercel Cron vs External Scheduler

**Chosen:** Vercel Cron

**Reasoning:**
- ✅ Zero infraestructura adicional
- ✅ Integrado en deployment pipeline
- ✅ Logs unificados en Vercel dashboard
- ❌ Trade-off: Mínimo 1h interval en plan Pro (suficiente para MVP)

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla `stripe_accounts` existe (MYM-25)
- [x] Tabla `transactions` existe (MYM-24)
- [x] Stripe SDK configurado (`lib/stripe/server.ts`)
- [x] Tipos de payments (`types/payments.ts`)
- [ ] Vercel Pro plan (para Cron Jobs) - **VERIFY**
- [ ] `CRON_SECRET` env var configurada

---

## Risks & Mitigations

**Risk 1: Pagos duplicados**
- **Impact:** HIGH - Pérdida financiera
- **Mitigation:** UNIQUE constraint en `payout_items.transaction_id` + verificación en query

**Risk 2: Stripe API rate limits**
- **Impact:** MEDIUM - Algunos payouts podrían retrasarse
- **Mitigation:** Procesamiento en batches pequeños, retry en siguiente ejecución

**Risk 3: Mentor sin cuenta Stripe**
- **Impact:** LOW - Payout se registra como fallido
- **Mitigation:** Verificar `payouts_enabled` antes de intentar transfer, notificar mentor

**Risk 4: Cron job timeout**
- **Impact:** MEDIUM - Algunos payouts no se procesan
- **Mitigation:** Límite de 50 payouts por ejecución, continúa en siguiente hora

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | Database Migrations | 30 min |
| 2 | Actualizar Types | 15 min |
| 3 | Payout Service | 2 hours |
| 4 | API Route (Cron) | 45 min |
| 5 | Vercel Cron Config | 15 min |
| 6 | Webhook Updates | 45 min |
| 7 | Testing & Verification | 1 hour |
| **Total** | | **~6 hours** |

**Story points:** 8 (backend complexity, external integration, financial criticality)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] Sistema identifica sesiones elegibles (>24h, status=completed)
  - [ ] Sistema verifica payouts_enabled del mentor
  - [ ] Sistema ejecuta Stripe Transfer
  - [ ] Sistema registra payout en DB
  - [ ] Sistema maneja fallos correctamente
- [ ] **Database**
  - [ ] Tabla `payouts` creada con RLS
  - [ ] Tabla `payout_items` creada con UNIQUE constraint
  - [ ] Tabla `failed_payouts` creada
  - [ ] Campo `completed_at` agregado a `bookings`
- [ ] **Types**
  - [ ] Tipos de payouts agregados a `payments.ts`
  - [ ] `supabase.ts` regenerado
  - [ ] Zero type errors
- [ ] **API**
  - [ ] Endpoint `/api/cron/process-payouts` creado
  - [ ] Authorization via CRON_SECRET
  - [ ] Vercel Cron configurado
- [ ] **Testing**
  - [ ] Payout service funciona en local
  - [ ] Stripe test mode transfers exitosos
  - [ ] Error handling verificado
- [ ] **Build & Lint**
  - [ ] `bun run lint` sin errores
  - [ ] `bun run build` exitoso
  - [ ] `bun run typecheck` sin errores
- [ ] Deployed to staging
- [ ] Cron job visible en Vercel dashboard

---

## Related Test Cases

Del archivo `test-cases.md`:

| TC ID | Description | Priority |
|-------|-------------|----------|
| TC-001 | Procesamiento exitoso de pago elegible | Critical |
| TC-002 | Falla por cuenta Stripe restringida | High |
| TC-003 | Idempotencia - ignora sesión ya pagada | Critical |
| TC-004 | Falla en llamada a API de Stripe | High |
| TC-009-011 | Elegibilidad por tiempo (boundary tests) | High |

---

**Última actualización:** 2025-12-08
**Generado por:** Claude Code (Fase 6 Planning)
