# Feature Implementation Plan: EPIC-MYM-8 - Mentor Vetting & Onboarding

**Fecha:** 2025-12-05
**Autor:** Claude Code (AI-Assisted)
**Epic Jira Key:** MYM-8
**Status:** Active Development

---

## Overview

Esta feature implementa el proceso de control de calidad para mentores que se unen al marketplace Upex My Mentor. Proporciona a los administradores las herramientas necesarias para revisar, evaluar y aprobar aplicaciones de mentores, asegurando que solo profesionales calificados y verificados estén accesibles para los estudiantes.

**Alcance:**
- **MYM-9:** View Pending Applications (✅ Completado)
- **MYM-10:** Review Application Details (En progreso)
- **MYM-11:** Approve/Reject Application
- **MYM-12:** Email Notification Status

**Stack técnico:**
- **Frontend:** Next.js 15 (App Router) + React Server Components
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Database:** PostgreSQL via Supabase
- **Deployment:** Vercel
- **Testing:** Vitest + Playwright

---

## Technical Decisions

### Decision 1: Admin Route Architecture

**Options considered:**
- A) Separate Next.js app for admin panel
- B) Protected route group `/admin/*` within existing app
- C) Client-side admin dashboard (SPA-style)

**Chosen:** B) Protected route group `/admin/*` within existing app

**Reasoning:**
- ✅ Shares design system, components, and Supabase client with main app
- ✅ Simpler deployment (single Vercel project)
- ✅ Middleware can protect entire route group easily
- ✅ SSR/RSC benefits for SEO-independent admin pages still apply (security, performance)
- ❌ Trade-off: Admin routes are in same codebase (but isolated in `/app/admin/`)

**Implementation notes:**
- Route group: `/app/admin/*`
- Middleware protection at `/admin` level
- Shared layout with Navbar + admin-specific sidebar

---

### Decision 2: Application Detail View Pattern

**Options considered:**
- A) Modal/Dialog over applications list
- B) Dedicated page `/admin/applications/[id]`
- C) Slide-over panel (side drawer)

**Chosen:** B) Dedicated page `/admin/applications/[id]`

**Reasoning:**
- ✅ Full screen real estate for reviewing LinkedIn/GitHub profiles in new tabs
- ✅ Direct URL access for bookmarking/sharing specific applications
- ✅ Cleaner back navigation with browser history
- ✅ Better for future: add comments, audit log, action history per application
- ❌ Trade-off: Extra navigation step vs inline review

**Implementation notes:**
- Dynamic route: `/app/admin/applications/[id]/page.tsx`
- Server Component (RSC) for data fetching
- Back button returns to `/admin/applications`

---

### Decision 3: Application Status Management

**Options considered:**
- A) Use `is_verified: boolean` (current schema)
- B) Add `verification_status: enum('pending', 'verified', 'rejected')`
- C) Separate `application_status` table

**Chosen:** A) Use existing `is_verified: boolean` + RLS for simplicity in MVP

**Reasoning:**
- ✅ No schema migration needed (is_verified already exists)
- ✅ Simple boolean logic: `is_verified=false` = pending, `is_verified=true` = verified
- ✅ Mentor Discovery (EPIC-MYM-13) already filters by `is_verified=true`
- ❌ Trade-off: Cannot distinguish "rejected" from "pending" without additional field
- 🔧 **Future:** Add `verification_status` enum in Phase 2 for rejection tracking

**Implementation notes:**
- Pending: `role='mentor' AND is_verified=false`
- Verified: `role='mentor' AND is_verified=true`
- For MYM-11 rejection, consider adding `rejection_reason` column

---

### Decision 4: Approve/Reject Workflow (MYM-11)

**Options considered:**
- A) Direct database update from client
- B) Server Action (Next.js)
- C) Supabase Edge Function

**Chosen:** B) Server Action (Next.js)

**Reasoning:**
- ✅ Type-safe with TypeScript
- ✅ Runs on server with service role key for sensitive operations
- ✅ Can bundle audit log write + status update in single transaction
- ✅ Integrates seamlessly with React Server Components
- ❌ Trade-off: Slightly more code than direct Supabase call

**Implementation notes:**
- Server Action in `/app/admin/applications/[id]/actions.ts`
- Uses `createServer()` Supabase client
- Returns result for UI feedback (success/error)

---

### Decision 5: Email Notifications (MYM-12)

**Options considered:**
- A) Supabase Edge Function with Resend
- B) Supabase Database Webhook + Edge Function
- C) Next.js API Route with Resend/Sendgrid

**Chosen:** A) Supabase Edge Function with Resend

**Reasoning:**
- ✅ Decoupled from Next.js (can be triggered from any client)
- ✅ Async execution (doesn't block approval response)
- ✅ Retry logic built into Edge Functions
- ✅ Environment variables managed in Supabase dashboard
- ❌ Trade-off: Requires Edge Function deployment, separate from main codebase

**Implementation notes:**
- Edge Function: `supabase/functions/send-verification-email`
- Triggered after successful status update in MYM-11
- Templates: Approval email, Rejection email (with reason)

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/index.ts` - Domain types (PendingApplication ya definido)
- `src/types/supabase.ts` - Database types generados

**Estrategia de tipos a nivel feature:**

### Tipos existentes (MYM-9):
```typescript
// src/types/index.ts
export interface PendingApplication {
  id: string
  name: string | null
  email: string
  created_at: string
  specialties: string[] | null
  linkedin_url: string | null
  github_url: string | null
}
```

### Tipos nuevos requeridos (MYM-10, MYM-11):
```typescript
// Agregar a src/types/index.ts

// MYM-10: Application Detail (extends PendingApplication)
export interface ApplicationDetail extends PendingApplication {
  description: string | null       // bio del mentor
  photo_url: string | null         // avatar
  hourly_rate: number | null
  is_verified: boolean
  years_of_experience: number | null
  average_rating: number | null
  total_reviews: number | null
}

// MYM-11: Verification Action
export type VerificationAction = 'approve' | 'reject'

export interface VerificationResult {
  success: boolean
  error?: string
  updatedAt?: string
}

// MYM-12: Email Notification
export interface VerificationEmailPayload {
  mentorEmail: string
  mentorName: string
  action: VerificationAction
  rejectionReason?: string
}
```

**Directiva para todas las stories de esta feature:**
- ✅ TODAS las stories deben importar tipos desde `@/types`
- ✅ TODAS las props de componentes tipadas con interfaces definidas
- ✅ Server Actions tipadas con input/output interfaces
- ✅ Zero type errors relacionados a entidades del backend

---

## UI/UX Design Strategy

**Design System disponible:** `.context/design-system.md`

### Componentes compartidos por stories:

**Componentes del Design System a usar:**
- ✅ `Button`: Acciones (Approve, Reject, Back, Review)
- ✅ `Card`: Contenedor principal de application detail
- ✅ `Badge`: Especialidades del mentor, status indicators
- ✅ `Input`/`Textarea`: Rejection reason input (MYM-11)

**Componentes custom a nivel feature:**

| Componente | Stories | Ubicación | Propósito |
|------------|---------|-----------|-----------|
| `AdminLayout` | MYM-9, MYM-10, MYM-11 | `components/admin/` | Layout con título y badge de conteo |
| `ApplicationsTable` | MYM-9 | `components/admin/` | Tabla de aplicaciones pendientes |
| `ApplicationDetail` | MYM-10 | `components/admin/` | Vista detallada de aplicación |
| `VerificationActions` | MYM-11 | `components/admin/` | Botones Approve/Reject + modal de rechazo |
| `StatusBadge` | MYM-10, MYM-11 | `components/admin/` | Badge de estado (Pending, Verified, Rejected) |

### Consistencia visual:

**Paleta aplicada (del design system):**
- **Primary** (`bg-primary`): Botón "Approve", links de navegación
- **Secondary** (`bg-secondary`): Badges de especialidades
- **Destructive** (`bg-destructive`): Botón "Reject"
- **Muted** (`text-muted-foreground`): Texto secundario, placeholders

**Patrones de diseño comunes:**
- **Cards con hover**: `hover:shadow-lg transition-shadow` para elementos clickeables
- **Tabla responsive**: `overflow-x-auto` para mobile
- **External links**: `target="_blank" rel="noopener noreferrer"` con icono ExternalLink
- **Empty states**: Icono + mensaje + CTA centrado

### Flujos de UX:

**User journey principal: Admin Vetting Flow**
1. **Lista** (MYM-9) → Admin ve aplicaciones pendientes ordenadas por fecha
2. **Review** → Click en "Review" navega a detalle
3. **Detalle** (MYM-10) → Admin ve perfil completo, clicks LinkedIn/GitHub en nuevas tabs
4. **Decisión** (MYM-11) → Admin hace click en "Approve" o "Reject" (con razón)
5. **Confirmación** → Toast/alert confirma acción, regresa a lista
6. **Notificación** (MYM-12) → Email enviado async al mentor

**Estados globales de la feature:**
- **Loading**: Skeleton animado mientras carga
- **Empty**: "No pending applications" con icono
- **Error**: Mensaje de error con botón retry
- **Success**: Toast de confirmación (approve/reject)

### Personalidad UI/UX: Moderno/Bold

**Aplicar consistentemente en TODAS las stories:**
- Sombras pronunciadas en hover (`shadow-lg`, `shadow-xl`)
- Bordes redondeados (`rounded-lg`)
- Gradientes sutiles en headers (purple-50 → violet-50)
- Transiciones suaves (`transition-all duration-200`)

---

## Content Writing Strategy

**Vocabulario del dominio identificado:**
- **Application** (no "request" o "submission")
- **Mentor** (no "teacher" o "tutor")
- **Verify/Verified** (no "approve" en UI pública)
- **Pending** (no "waiting" o "in queue")
- **Review** (no "check" o "evaluate")

**Ejemplos de copy contextual:**
- ✅ "Pending Applications" (título de página)
- ✅ "Review mentor credentials and qualifications"
- ✅ "This mentor will appear in the marketplace once verified"
- ✅ "Provide a reason for rejection (visible to mentor)"
- ❌ "Manage your resources" (genérico)
- ❌ "Process submissions" (genérico)

**Mensajes de error:**
- 403: "You don't have permission to access the admin panel"
- 404: "Application not found"
- 500: "Something went wrong. Please try again."

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

### 1. Supabase Client Configuration
- `src/lib/supabase/server.ts` - Server-side client
- RLS policies para admin access

### 2. Admin Authorization
- Middleware check: `role === 'admin'`
- Protected routes: `/admin/*`

### 3. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://ionevzckjyxtpmyenbxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_ROLE_KEY=[key] # Para server actions
RESEND_API_KEY=[key] # Para MYM-12
```

### 4. External Services
- **Supabase Auth**: Verificación de sesión admin
- **Resend/Email**: Notificaciones (MYM-12)

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx                    # Admin route layout (✅ existe)
│       ├── page.tsx                      # Admin dashboard redirect (✅ existe)
│       └── applications/
│           ├── page.tsx                  # MYM-9: Applications list (✅ existe)
│           ├── pagination-wrapper.tsx    # Client pagination (✅ existe)
│           └── [id]/
│               ├── page.tsx              # MYM-10: Application detail (🆕)
│               ├── actions.ts            # MYM-11: Server actions (🆕)
│               └── loading.tsx           # Loading state (🆕)
│
├── components/
│   └── admin/
│       ├── admin-layout.tsx              # Reusable layout (✅ existe)
│       ├── applications-table.tsx        # Table component (✅ existe)
│       ├── application-detail.tsx        # Detail view (🆕 MYM-10)
│       ├── verification-actions.tsx      # Approve/Reject (🆕 MYM-11)
│       └── status-badge.tsx              # Status indicator (🆕)
│
├── types/
│   └── index.ts                          # Agregar ApplicationDetail, etc.
│
└── lib/
    └── supabase/
        └── server.ts                     # Server client (✅ existe)

supabase/
└── functions/
    └── send-verification-email/          # Edge function (🆕 MYM-12)
        └── index.ts
```

### Design Patterns

1. **React Server Components (RSC)**: Data fetching en página, no en cliente
2. **Server Actions**: Mutaciones (approve/reject) con revalidation
3. **Composition Pattern**: AdminLayout wraps content components
4. **URL-based State**: Pagination, application ID en URL (no client state)

### Third-party Libraries

| Library | Version | Uso |
|---------|---------|-----|
| `@supabase/supabase-js` | ^2.x | Database client |
| `lucide-react` | ^0.x | Iconos (CheckCircle, XCircle, ExternalLink) |
| `resend` | ^2.x | Email delivery (MYM-12) |

---

## Implementation Order

**Recomendado:**

### 1. **MYM-9: View Pending Applications** ✅ COMPLETADO
- **Razón**: Base del admin dashboard, lista de aplicaciones
- **Estado**: Implementado y en main

### 2. **MYM-10: Review Application Details** (En progreso)
- **Razón**: Depende de MYM-9 (navigation desde tabla), prerequisito para MYM-11
- **Dependencias**:
  - Ruta dinámica `/admin/applications/[id]`
  - Tipo `ApplicationDetail`
  - Componente `ApplicationDetail`

### 3. **MYM-11: Approve/Reject Application**
- **Razón**: Core workflow, depende de MYM-10 (vista donde se toman acciones)
- **Dependencias**:
  - Server Actions para mutaciones
  - Schema update para rejection_reason (opcional)
  - Componente `VerificationActions`

### 4. **MYM-12: Email Notifications**
- **Razón**: Triggered por MYM-11, puede implementarse en paralelo con testing
- **Dependencias**:
  - Supabase Edge Function
  - Resend API key
  - Email templates

```
MYM-9 ──► MYM-10 ──► MYM-11 ──► MYM-12
  ✅         🔄         ⏳         ⏳
```

---

## Risks & Mitigations

### Risk 1: Admin Access Control Bypass

**Impact:** Critical (security breach)
**Likelihood:** Medium
**Mitigation:**
- Middleware verification en `/admin/*` routes
- Server-side role check en todas las queries
- RLS policies como segunda línea de defensa
- Test cases: TC-006, TC-007, TC-016

### Risk 2: LinkedIn/GitHub URL Validation

**Impact:** Medium (fake profiles aprobados)
**Likelihood:** High
**Mitigation:**
- URLs como links clickeables (admin verifica manualmente)
- External link icon con `target="_blank"`
- Futuro: Validación de URL format (regex)
- Test cases: TC-002, TC-003, TC-013

### Risk 3: Email Delivery Failures

**Impact:** Medium (mentor no notificado)
**Likelihood:** Medium
**Mitigation:**
- Retry logic en Edge Function
- Approval persiste aunque email falle (async)
- Logging de delivery status
- Futuro: In-app notification fallback

### Risk 4: Concurrent Approvals (Race Condition)

**Impact:** Low (duplicate actions)
**Likelihood:** Low (single admin initially)
**Mitigation:**
- Optimistic locking: check `is_verified=false` before update
- Return 409 Conflict si ya procesada
- Test case: TC-057, TC-058 (del feature-test-plan)

---

## Success Criteria

**Esta feature estará completa cuando:**

### Funcionalidad
- [x] MYM-9: Admins pueden ver lista de aplicaciones pendientes
- [ ] MYM-10: Admins pueden ver detalle completo de cada aplicación
- [ ] MYM-11: Admins pueden aprobar/rechazar aplicaciones
- [ ] MYM-12: Mentores reciben email de notificación

### Tipos del Backend
- [x] Tipo `PendingApplication` definido y usado
- [ ] Tipo `ApplicationDetail` definido y usado
- [ ] Tipo `VerificationResult` para server actions
- [ ] Zero type errors en toda la feature

### UI/UX Consistente
- [x] Design system aplicado (Button, Card, Badge)
- [ ] Estados loading/empty/error en todas las vistas
- [ ] External links con seguridad (noopener noreferrer)
- [ ] Responsive design en admin panel

### Content Writing
- [x] Vocabulario del dominio (Application, Mentor, Verify)
- [ ] Mensajes de error claros y contextuales
- [ ] Copy coherente sin placeholders

### Calidad
- [ ] 100% test cases críticos pasando
- [ ] Build y typecheck exitosos
- [ ] Code review aprobado
- [ ] Documentación actualizada

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/feature-test-plan.md`
- **Stories:**
  - `stories/STORY-MYM-9-view-pending-applications/`
  - `stories/STORY-MYM-10-review-application-details/`
  - `stories/STORY-MYM-11-approve-reject-application/`
  - `stories/STORY-MYM-12-email-notification-status/`
- **Design System:** `.context/design-system.md`
- **Backend Setup:** `.context/backend-setup.md`

---

**Versión:** 1.0
**Última actualización:** 2025-12-05
**Generado con:** Claude Code (AI-Assisted Development)
