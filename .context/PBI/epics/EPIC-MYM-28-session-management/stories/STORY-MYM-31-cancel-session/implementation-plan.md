# Implementation Plan: STORY-MYM-31 - Cancel Session

**Date:** 2025-12-13
**Developer:** Claude Code
**Story Jira Key:** MYM-31
**Epic:** EPIC-MYM-28 - Session Management
**Status:** Ready for Implementation

---

## Overview

Implementar la funcionalidad de cancelación de sesiones con la regla de 24 horas, procesamiento de reembolsos via Stripe, y notificaciones por email.

**Acceptance Criteria a cumplir:**
- Usuario puede cancelar sesión si faltan >24 horas
- Botón de cancelar deshabilitado/oculto si ≤24 horas
- Reembolso completo via Stripe API
- Notificación por email a mentor y mentee
- Estado de booking actualizado a 'cancelled'

---

## Technical Approach

**Chosen approach:** API Route con validación server-side + Modal de confirmación en frontend

**Why this approach:**
- ✅ Seguridad: Validación de 24h es autoridad final en backend
- ✅ UX fluida: Modal de confirmación con feedback inmediato
- ✅ Reembolso síncrono (MVP): Simplicidad, Stripe refunds son rápidos
- ✅ Reutiliza componentes existentes: Dialog de shadcn/ui
- ❌ Trade-off: Si Stripe falla, se requiere intervención manual

**Existing code to leverage:**
- `canCancelSession()` en `src/lib/date-utils.ts` (ya implementado)
- `SessionCard` con espacio reservado para botón Cancel (línea 218)
- `Dialog` component de shadcn/ui
- Stripe integration existente en `src/lib/stripe.ts`
- Email service con Resend (ya configurado)

---

## Database Changes

**Migration needed:** Agregar campos de tracking de cancelación a tabla `bookings`:

```sql
-- Add cancellation tracking fields
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.cancelled_at IS 'Timestamp when the session was cancelled';
COMMENT ON COLUMN public.bookings.cancelled_by IS 'User ID who initiated the cancellation';
COMMENT ON COLUMN public.bookings.cancellation_reason IS 'Optional reason provided for cancellation';
```

---

## UI/UX Design

**Design System:** Moderno/Bold (shadows, rounded corners, purple palette)

### Componentes a crear:

**1. CancelSessionButton**
- **Ubicación:** `src/components/sessions/cancel-session-button.tsx`
- **Propósito:** Botón con lógica de 24h que abre modal de confirmación
- **Estados:**
  - Enabled: >24h antes de la sesión
  - Disabled: ≤24h (con tooltip explicativo)
  - Loading: Durante procesamiento de cancelación

**2. CancelSessionModal**
- **Ubicación:** `src/components/sessions/cancel-session-modal.tsx`
- **Propósito:** Dialog de confirmación con advertencia
- **Contenido:**
  - Título: "¿Cancelar esta sesión?"
  - Mensaje: Info del mentor/mentee + fecha
  - Advertencia: "Recibirás un reembolso completo."
  - Botones: "Cancelar sesión" (destructive) + "Volver" (outline)

### Estados visuales:
- **Loading:** Spinner en botón durante request
- **Success:** Toast de confirmación + sesión movida a "Pasadas"
- **Error:** Toast de error con mensaje específico

---

## Types & Type Safety

**Tipos a agregar en `src/types/sessions.ts`:**

```typescript
// Cancellation API types
export type CancelErrorCode =
  | 'UNAUTHORIZED'
  | 'BOOKING_NOT_FOUND'
  | 'NOT_A_PARTICIPANT'
  | 'CANCELLATION_WINDOW_CLOSED'
  | 'SESSION_ALREADY_CANCELLED'
  | 'SESSION_NOT_CONFIRMED'
  | 'REFUND_FAILED'
  | 'INTERNAL_ERROR'

export interface CancelSuccessResponse {
  success: true
  message: string
  refundId?: string
}

export interface CancelErrorResponse {
  success: false
  error: CancelErrorCode
  message: string
}

export type CancelSessionResponse = CancelSuccessResponse | CancelErrorResponse
```

---

## Implementation Steps

### **Step 1: Database Migration**

**Task:** Agregar campos de cancelación a tabla bookings

**Details:**
- Ejecutar migration via Supabase MCP
- Campos: `cancelled_at`, `cancelled_by`, `cancellation_reason`
- Regenerar tipos de Supabase

**Testing:**
- Verificar campos agregados en schema
- Verificar tipos actualizados

**Estimated time:** 15 min

---

### **Step 2: Add Cancellation Types**

**Task:** Agregar tipos para la API de cancelación

**File:** `src/types/sessions.ts`

**Details:**
- Agregar `CancelErrorCode`, `CancelSuccessResponse`, `CancelErrorResponse`
- Export types

**Testing:**
- TypeScript compila sin errores

**Estimated time:** 10 min

---

### **Step 3: Create Cancel API Route**

**Task:** Crear endpoint POST `/api/bookings/[id]/cancel`

**File:** `src/app/api/bookings/[id]/cancel/route.ts`

**Logic:**
1. Autenticar usuario
2. Obtener booking por ID
3. Verificar usuario es participante (mentor o student)
4. Verificar booking está en status 'confirmed'
5. Verificar regla de 24 horas (server-side)
6. Obtener transaction asociada con payment_intent_id
7. Llamar Stripe API para refund
8. Actualizar booking a 'cancelled' con metadata
9. Actualizar transaction a 'refunded'
10. Enviar emails de notificación
11. Retornar success/error response

**Edge cases handled:**
- Booking no existe → 404 BOOKING_NOT_FOUND
- Usuario no es participante → 403 NOT_A_PARTICIPANT
- Ya cancelado → 400 SESSION_ALREADY_CANCELLED
- ≤24h → 400 CANCELLATION_WINDOW_CLOSED
- Status no es 'confirmed' → 400 SESSION_NOT_CONFIRMED
- Stripe refund falla → 500 REFUND_FAILED (log error, no cambiar status)

**Testing:**
- Unit test para validación de 24h
- Integration test con mock de Stripe

**Estimated time:** 1.5 hours

---

### **Step 4: Create CancelSessionButton Component**

**Task:** Botón con lógica de 24h

**File:** `src/components/sessions/cancel-session-button.tsx`

**Props:**
```typescript
interface CancelSessionButtonProps {
  bookingId: string
  sessionDate: string
  onCancelSuccess?: () => void
  className?: string
}
```

**Logic:**
- Usar `canCancelSession()` de date-utils para determinar si mostrar enabled/disabled
- Si disabled: mostrar tooltip "No es posible cancelar con menos de 24 horas de anticipación"
- Si enabled: abrir CancelSessionModal

**Testing:**
- Render test con sesión >24h (enabled)
- Render test con sesión <24h (disabled)

**Estimated time:** 45 min

---

### **Step 5: Create CancelSessionModal Component**

**Task:** Modal de confirmación de cancelación

**File:** `src/components/sessions/cancel-session-modal.tsx`

**Props:**
```typescript
interface CancelSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  participantName: string
  sessionDate: string
  onCancelSuccess?: () => void
}
```

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ ⚠️ ¿Cancelar esta sesión?              │
├─────────────────────────────────────────┤
│ Sesión con [Nombre]                     │
│ [Fecha formateada]                      │
│                                         │
│ Esta acción no se puede deshacer.       │
│ Recibirás un reembolso completo.        │
├─────────────────────────────────────────┤
│ [Volver]          [Cancelar sesión] 🔴  │
└─────────────────────────────────────────┘
```

**Logic:**
- Llamar API `/api/bookings/[id]/cancel` en submit
- Mostrar loading state
- Mostrar toast de éxito o error
- Cerrar modal y callback onCancelSuccess

**Testing:**
- Render test de modal abierto
- Mock API call y verificar comportamiento

**Estimated time:** 1 hour

---

### **Step 6: Integrate into SessionCard**

**Task:** Agregar CancelSessionButton al SessionCard existente

**File:** `src/components/sessions/session-card.tsx`

**Changes:**
- Import CancelSessionButton
- Agregar en línea 218 (donde dice "Cancel button will be added by MYM-31")
- Pasar props: bookingId, sessionDate
- Agregar callback para refresh de lista

**Props adicionales para SessionCard:**
```typescript
interface SessionCardProps {
  // ... existing props
  onSessionCancelled?: () => void
}
```

**Testing:**
- Visual test con sesión cancelable
- Visual test con sesión no cancelable

**Estimated time:** 30 min

---

### **Step 7: Add Email Templates for Cancellation**

**Task:** Crear templates de email para notificaciones

**Files:**
- `src/lib/emails/session-cancelled-mentee.tsx` (React Email)
- `src/lib/emails/session-cancelled-mentor.tsx` (React Email)

**Content (Mentee):**
```
Subject: Tu sesión ha sido cancelada
Body:
- Confirmación de cancelación
- Detalles de la sesión (mentor, fecha)
- Info sobre reembolso
- CTA para buscar otra sesión
```

**Content (Mentor):**
```
Subject: Una sesión ha sido cancelada
Body:
- Notificación de cancelación
- Detalles del mentee y fecha
- Info de que el slot está libre
```

**Testing:**
- Preview de emails en desarrollo

**Estimated time:** 45 min

---

### **Step 8: Update SessionsTabs with Refresh Logic**

**Task:** Agregar refresh de lista cuando se cancela sesión

**File:** `src/app/dashboard/sessions/_components/sessions-tabs.tsx`

**Changes:**
- Agregar prop `onRefresh` a SessionsTabs
- Pasar `onSessionCancelled` a cada SessionCard
- Implementar refetch de datos usando `router.refresh()`

**Testing:**
- E2E: Cancelar sesión → lista se actualiza

**Estimated time:** 30 min

---

### **Step 9: Integration Testing**

**Task:** Verificar flujo completo E2E

**Test Cases a cubrir:**
1. TC-001: Cancelación exitosa (>24h)
2. TC-002: Botón deshabilitado (<24h)
3. TC-003: API bypass (<24h) retorna error
4. TC-004: Boundary check (24h + 1min = allowed)
5. TC-005: Boundary check (23h 59min = denied)
6. TC-007: Idempotency (cancelar 2 veces)

**Testing:**
- Manual smoke test
- `bun run lint && bun run build`

**Estimated time:** 45 min

---

## Technical Decisions

### Decision 1: Reembolso Síncrono vs Async

**Chosen:** Síncrono (MVP)

**Reasoning:**
- ✅ Simplicidad de implementación
- ✅ UX clara: usuario ve confirmación inmediata
- ✅ Stripe refunds son rápidos y confiables
- ❌ Trade-off: Si Stripe falla, UX se degrada

**Fallback:** Si refund falla, NO cambiar status a cancelled, retornar error al usuario.

---

### Decision 2: Quién puede cancelar

**Chosen:** Tanto mentor como mentee pueden cancelar

**Reasoning:**
- ✅ Flexibilidad para ambas partes
- ✅ Simplicidad de implementación (mismo endpoint)
- El campo `cancelled_by` registra quién canceló

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] `canCancelSession()` en date-utils (ya existe)
- [x] Stripe integration (ya configurado)
- [x] Resend email service (ya configurado)
- [x] Dialog component (ya existe)
- [ ] Migration de campos de cancelación

---

## Risks & Mitigations

**Risk 1:** Stripe refund falla
- **Impact:** High
- **Mitigation:** Log detallado, NO cambiar status, mostrar error al usuario, manual intervention needed

**Risk 2:** Race condition (24h boundary)
- **Impact:** Medium
- **Mitigation:** Validación server-side es autoridad final, usar UTC timestamps

**Risk 3:** Double cancellation (click doble)
- **Impact:** Medium
- **Mitigation:** Check status antes de procesar, idempotency en API

---

## Estimated Effort

| Step | Task | Time |
|------|------|------|
| 1 | Database Migration | 15 min |
| 2 | Add Cancellation Types | 10 min |
| 3 | Create Cancel API Route | 1.5 hours |
| 4 | Create CancelSessionButton | 45 min |
| 5 | Create CancelSessionModal | 1 hour |
| 6 | Integrate into SessionCard | 30 min |
| 7 | Email Templates | 45 min |
| 8 | Update SessionsTabs | 30 min |
| 9 | Integration Testing | 45 min |
| **Total** | | **~6.5 hours** |

**Story points:** 5 (Medium complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/sessions`
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada (Moderno/Bold)**
  - [ ] Botón destructive para cancelar
  - [ ] Modal con sombras y rounded corners
  - [ ] Toast notifications
- [ ] **Content Writing contextual**
  - [ ] "Cancelar sesión" (no genérico)
  - [ ] Mensajes claros sobre reembolso
- [ ] Tests E2E pasando (referencia: test-cases.md)
  - [ ] TC-001: Cancelación exitosa
  - [ ] TC-002: Botón deshabilitado <24h
  - [ ] TC-003: API bypass denied
  - [ ] TC-004/005: Boundary checks
  - [ ] TC-007: Idempotency
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Deployed to staging

---

*Generado automáticamente - Claude Code*
*Última actualización: 2025-12-13*
