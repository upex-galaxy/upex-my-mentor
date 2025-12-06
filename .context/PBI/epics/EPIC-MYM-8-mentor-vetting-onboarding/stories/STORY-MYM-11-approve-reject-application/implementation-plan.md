# Implementation Plan: STORY-MYM-11 - Approve or Reject Mentor Application

**Fecha:** 2025-12-05
**Autor:** Claude Code (AI-Assisted)
**Story Jira Key:** MYM-11
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Prerequisito:** MYM-10 (Application Detail View) ✅ Completado

---

## Overview

Implementar la funcionalidad para que los administradores puedan aprobar o rechazar solicitudes de mentores desde la página de detalle de aplicación. Esta es la acción core del proceso de vetting.

**Acceptance Criteria a cumplir:**
- Admin puede aprobar una aplicación pendiente → `is_verified` = `true`
- Admin puede rechazar una aplicación pendiente → `is_verified` permanece `false`, se guarda razón
- Mentor es removido de la lista de pendientes después de la acción
- Solo admins pueden ejecutar estas acciones (seguridad)

---

## Technical Approach

**Chosen approach:** Server Actions (Next.js) con revalidación automática

**Alternatives considered:**
- **API Routes**: Requiere más boilerplate y manejo manual de errores
- **Direct Supabase from Client**: Expone lógica de negocio, menos seguro
- **Edge Functions**: Overhead adicional, mejor para triggers async (MYM-12)

**Why this approach:**
- ✅ Type-safe con TypeScript end-to-end
- ✅ Ejecuta en servidor con credenciales seguras
- ✅ Integración nativa con React Server Components
- ✅ `revalidatePath` automático para refrescar lista
- ✅ Manejo de errores integrado con try/catch
- ❌ Trade-off: No async (bloquea hasta completar) - aceptable para esta operación

---

## UI/UX Design

**Design System:** `.context/design-system.md`
**Estilo Visual:** Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ `Button` → `variant="default"` (Approve), `variant="destructive"` (Reject)
- ✅ `Card` → Contenedor de acciones
- ✅ `Badge` → Status indicator (StatusBadge ya existe)
- ✅ `Input`/`Textarea` → Rejection reason input

**Componentes de shadcn/ui a agregar:**
- 🆕 `Dialog` → Modal de confirmación para rechazo
- 🆕 `AlertDialog` → Confirmación de aprobación (opcional)

### Componente custom a crear:

**`VerificationActions`**
- **Propósito:** Contenedor con botones Approve/Reject y modal de rechazo
- **Props:** `applicationId: string`, `isVerified: boolean`
- **Ubicación:** `src/components/admin/verification-actions.tsx`
- **Comportamiento:**
  - Si `isVerified=true` → Mostrar "Already Verified" (disabled)
  - Si `isVerified=false` → Mostrar botones Approve + Reject

### Layout de acciones:

```
┌─────────────────────────────────────────────────────────┐
│ [ApplicationDetailView - ya existe]                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Review Decision                                 │   │
│  │                                                  │   │
│  │  [ ✓ Approve Mentor ]    [ ✗ Reject ]           │   │
│  │       (primary)           (destructive)          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Modal de Rechazo:

```
┌─────────────────────────────────────────────────────────┐
│  Reject Application                              [X]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Are you sure you want to reject {mentorName}'s         │
│  application?                                           │
│                                                         │
│  Rejection Reason *                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Provide a reason for rejection...               │   │
│  │ (This will be visible to the mentor)            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│            [ Cancel ]    [ Confirm Rejection ]          │
│             (outline)       (destructive)               │
└─────────────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Spinner en botón durante Server Action
- **Success:** Toast notification + redirect a lista
- **Error:** Inline error message bajo botones
- **Already Processed:** Botones deshabilitados con mensaje

### Responsividad:

- **Mobile (< 768px):** Botones stack vertical, full width
- **Desktop:** Botones inline, right-aligned

---

## Types & Type Safety

**Tipos disponibles:** `src/types/index.ts`

### Tipos nuevos requeridos:

```typescript
// Agregar a src/types/index.ts

// MYM-11: Verification Action
export type VerificationAction = 'approve' | 'reject'

export interface VerificationPayload {
  applicationId: string
  action: VerificationAction
  reason?: string  // Required if action is 'reject'
}

export interface VerificationResult {
  success: boolean
  error?: string
  updatedAt?: string
}
```

**Directiva:**
- ✅ Server Action tipada con `VerificationPayload` input
- ✅ Retorno tipado con `VerificationResult`
- ✅ Props del componente tipadas con interfaces

---

## Content Writing

**Vocabulario del dominio:**
- "Approve" (no "Accept" o "Verify")
- "Reject" (no "Deny" o "Decline")
- "Application" (no "Request")
- "Mentor" (no "User" o "Applicant")

**Copy contextual:**
- Título sección: "Review Decision"
- Botón aprobar: "Approve Mentor"
- Botón rechazar: "Reject Application"
- Modal título: "Reject Application"
- Modal descripción: "Are you sure you want to reject {name}'s application?"
- Placeholder razón: "Provide a reason for rejection (e.g., incomplete profile, unverifiable credentials)"
- Validación: "Rejection reason is required (minimum 10 characters)"
- Success approve: "Mentor has been approved and will now appear in the marketplace"
- Success reject: "Application has been rejected. The mentor will be notified."
- Error: "Something went wrong. Please try again."

---

## Implementation Steps

### **Step 1: Add Required Types**

**Task:** Agregar tipos para verification actions

**File:** `src/types/index.ts`

**Details:**
- Agregar `VerificationAction` type
- Agregar `VerificationPayload` interface
- Agregar `VerificationResult` interface

**Testing:**
- TypeScript: Verificar que compila sin errores

---

### **Step 2: Database Migration (Optional)**

**Task:** Agregar campo `rejection_reason` a tabla `profiles`

**Details:**
- Campo: `rejection_reason TEXT NULL`
- Solo se llena cuando `is_verified=false` y se rechaza explícitamente

**⚠️ IMPORTANTE:** Usar Supabase MCP para ejecutar migración.

**SQL a ejecutar:**
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

COMMENT ON COLUMN profiles.rejection_reason IS 'Reason provided by admin when rejecting mentor application';
```

**Testing:**
- Verificar columna existe con `\d profiles`
- Verificar acepta NULL y TEXT

---

### **Step 3: Install shadcn Dialog Component**

**Task:** Instalar componente Dialog de shadcn/ui

**Command:**
```bash
bunx shadcn@latest add dialog
```

**Details:**
- Dialog se usará para modal de rechazo
- Incluye subcomponentes: DialogTrigger, DialogContent, DialogHeader, etc.

**Testing:**
- Verificar archivo creado en `src/components/ui/dialog.tsx`

---

### **Step 4: Create Server Action**

**Task:** Implementar Server Action para approve/reject

**File:** `src/app/admin/applications/[id]/actions.ts`

**Structure:**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createServer } from '@/lib/supabase/server'
import type { VerificationPayload, VerificationResult } from '@/types'

export async function updateApplicationStatus(
  payload: VerificationPayload
): Promise<VerificationResult> {
  // 1. Validate payload
  // 2. Get supabase client
  // 3. Verify current user is admin (security check)
  // 4. Check application exists and is pending
  // 5. Update is_verified + rejection_reason
  // 6. Revalidate paths
  // 7. Return result
}
```

**Edge cases handled:**
- User not admin → Return 403 error
- Application already processed → Return 409 error
- Application not found → Return 404 error
- Missing rejection reason → Return 400 error

**Testing:**
- Unit test: Mock supabase, verify correct updates
- Integration test: Verify RLS allows admin updates

---

### **Step 5: Create VerificationActions Component**

**Task:** Crear componente con botones y modal

**File:** `src/components/admin/verification-actions.tsx`

**Props:**
```typescript
interface VerificationActionsProps {
  applicationId: string
  applicationName: string
  isVerified: boolean
}
```

**Structure:**
- Client component (`"use client"`)
- Estado local: `isLoading`, `error`, `showRejectModal`, `rejectionReason`
- Botón Approve: Llama Server Action directamente
- Botón Reject: Abre Dialog para ingresar razón
- Dialog con Textarea para razón (min 10 chars)
- Manejo de loading states en ambos botones
- Redirect a `/admin/applications` después de éxito

**Styling (Design System):**
```tsx
// Approve Button
<Button
  variant="default"
  className="gap-2"
  disabled={isLoading || isVerified}
>
  <CheckCircle className="h-4 w-4" />
  Approve Mentor
</Button>

// Reject Button
<Button
  variant="destructive"
  className="gap-2"
  disabled={isLoading || isVerified}
>
  <XCircle className="h-4 w-4" />
  Reject Application
</Button>
```

**Testing:**
- Render test: Botones visibles para pending
- Render test: Botones disabled para verified
- Interaction test: Modal abre al click reject
- Validation test: Submit disabled sin razón

---

### **Step 6: Integrate into Detail Page**

**Task:** Agregar VerificationActions a la página de detalle

**File:** `src/app/admin/applications/[id]/page.tsx`

**Changes:**
- Importar `VerificationActions`
- Reemplazar placeholder con componente real
- Pasar props: `applicationId`, `applicationName`, `isVerified`

**Layout:**
```tsx
{/* Action Buttons - MYM-11 */}
{!application.is_verified && (
  <VerificationActions
    applicationId={application.id}
    applicationName={application.name || 'Unknown'}
    isVerified={application.is_verified}
  />
)}
```

**Testing:**
- E2E: Navegar a detalle → ver botones → aprobar → verificar redirect
- E2E: Navegar a detalle → rechazar → ingresar razón → verificar redirect

---

### **Step 7: Update StatusBadge for Rejected State**

**Task:** Agregar estado "Rejected" al StatusBadge

**File:** `src/components/admin/status-badge.tsx`

**Changes:**
- Modificar props para aceptar `status: 'pending' | 'verified' | 'rejected'`
- O crear lógica basada en `isVerified` + `rejectionReason`
- Agregar variante roja para rejected

**New Variant:**
```tsx
// Rejected state
<Badge
  data-testid="status_badge_rejected"
  variant="destructive"
>
  <XCircle className="mr-1 h-3 w-3" />
  Rejected
</Badge>
```

**Consideración:** En MVP, `rejected` = `is_verified=false` + `rejection_reason IS NOT NULL`

---

### **Step 8: Add Toast Notifications**

**Task:** Agregar feedback visual con toasts

**Option A:** Usar `sonner` (recomendado por shadcn)
```bash
bunx shadcn@latest add sonner
```

**Option B:** Usar estado local temporal

**Details:**
- Toast de éxito verde para approve
- Toast de éxito (neutral) para reject
- Toast de error rojo para fallos

**Integration:**
- Agregar `<Toaster />` en layout si no existe
- Llamar `toast.success()` / `toast.error()` en componente

---

### **Step 9: Security Verification**

**Task:** Verificar protección de seguridad

**Checks:**
1. Middleware protege `/admin/*` routes
2. Server Action verifica rol admin
3. RLS policies permiten solo admin updates

**File to verify:** `middleware.ts`

**Test manual:**
- Login como student → intentar acceder → debe redirigir
- Login como mentor → intentar acceder → debe redirigir
- Intentar llamar Server Action sin auth → debe fallar

---

### **Step 10: Integration Testing**

**Task:** Verificar flujo completo

**Test Scenarios:**
1. TC-011-001: Admin aprueba aplicación pendiente
2. TC-011-002: Admin rechaza aplicación con razón
3. TC-011-003: Non-admin no puede acceder
4. TC-011-004: Acción sobre aplicación ya procesada

**Manual Testing Checklist:**
- [ ] Approve flow funciona end-to-end
- [ ] Reject flow con modal funciona
- [ ] Validación de razón mínima funciona
- [ ] Loading states visibles
- [ ] Toast notifications aparecen
- [ ] Redirect a lista funciona
- [ ] Lista actualizada después de acción
- [ ] StatusBadge muestra estado correcto

---

## Technical Decisions (Story-specific)

### Decision 1: Rejection Reason Storage

**Chosen:** Agregar columna `rejection_reason` a `profiles`

**Reasoning:**
- ✅ Simple, sin tabla adicional
- ✅ Fácil de consultar (JOIN no requerido)
- ❌ Trade-off: No hay historial de múltiples rechazos (aceptable para MVP)

### Decision 2: Confirmation Flow

**Chosen:** Modal solo para Reject, no para Approve

**Reasoning:**
- ✅ Approve es positivo, menos fricción
- ✅ Reject requiere razón, modal natural
- ❌ Trade-off: Click accidental en Approve (bajo riesgo, admin consciente)

### Decision 3: Post-Action Navigation

**Chosen:** Redirect a lista después de cualquier acción

**Reasoning:**
- ✅ UX consistente
- ✅ Lista se refresca automáticamente
- ✅ Admin puede procesar siguiente aplicación
- ❌ Trade-off: No puede ver estado actualizado en detalle (menor)

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] MYM-10 completado (página de detalle existe)
- [x] Middleware de admin configurado
- [x] Supabase client configurado
- [ ] shadcn Dialog component (instalar en Step 3)
- [ ] sonner para toasts (instalar en Step 8)

---

## Risks & Mitigations

### Risk 1: Admin Role Check Bypass

**Impact:** Critical
**Mitigation:**
- Verificar rol en Server Action (no solo middleware)
- RLS policy como segunda línea de defensa
- Test case TC-011-003 obligatorio

### Risk 2: Race Condition (Concurrent Actions)

**Impact:** Low (single admin initially)
**Mitigation:**
- Optimistic locking: verificar `is_verified=false` before update
- Retornar 409 si ya procesada
- Aceptable para MVP, mejorar en v2

### Risk 3: Lost Rejection Reason

**Impact:** Medium
**Mitigation:**
- Validación client-side (min 10 chars)
- Validación server-side antes de update
- Campo requerido en UI

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add VerificationAction, VerificationPayload, VerificationResult |
| `src/components/ui/dialog.tsx` | Create | Install via shadcn CLI |
| `src/app/admin/applications/[id]/actions.ts` | Create | Server Action for approve/reject |
| `src/components/admin/verification-actions.tsx` | Create | Buttons + reject modal component |
| `src/app/admin/applications/[id]/page.tsx` | Modify | Integrate VerificationActions |
| `src/components/admin/status-badge.tsx` | Modify | Add rejected state (optional) |
| `src/app/layout.tsx` or `admin/layout.tsx` | Modify | Add Toaster if using sonner |

---

## Definition of Done Checklist

### Funcionalidad
- [ ] Admin puede aprobar aplicación pendiente
- [ ] Admin puede rechazar aplicación con razón
- [ ] Aplicación desaparece de lista pendientes después de acción
- [ ] Non-admin no puede ejecutar acciones (403)

### Tipos del Backend
- [ ] `VerificationAction` type definido
- [ ] `VerificationPayload` interface definida
- [ ] `VerificationResult` interface definida
- [ ] Server Action tipada correctamente
- [ ] Zero type errors

### UI/UX Consistente
- [ ] Botones usan design system (Button component)
- [ ] Modal usa Dialog de shadcn
- [ ] Loading states en botones
- [ ] Toast notifications para feedback
- [ ] Responsive en mobile

### Content Writing
- [ ] "Approve Mentor" / "Reject Application" (no genérico)
- [ ] Mensajes de error claros
- [ ] Copy del modal contextual

### Seguridad
- [ ] Server Action verifica rol admin
- [ ] RLS policies actualizadas si necesario
- [ ] Middleware protege rutas

### Calidad
- [ ] Build exitoso (`bun run build`)
- [ ] Typecheck exitoso (`bun run typecheck`)
- [ ] Lint sin errores (`bun run lint`)
- [ ] Test cases TC-011-001 a TC-011-004 pasando manualmente

### Tests E2E (Manual para MVP)
- [ ] TC-011-001: Approve happy path
- [ ] TC-011-002: Reject with reason
- [ ] TC-011-003: Non-admin blocked
- [ ] TC-011-004: Already processed error

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/epic.md`
- **Feature Plan:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/feature-implementation-plan.md`
- **Test Cases:** `./test-cases.md`
- **Design System:** `.context/design-system.md`
- **MYM-10 (Prerequisite):** `../STORY-MYM-10-review-application-details/`
- **MYM-12 (Email - Next):** `../STORY-MYM-12-email-notification-status/`

---

**Versión:** 1.0
**Última actualización:** 2025-12-05
**Generado con:** Claude Code (AI-Assisted Development)
