# Feature Implementation Plan: EPIC-MYM-28 - Session Management

**Fecha:** 2025-12-08
**Arquitecto:** AI-Generated
**Epic Jira Key:** MYM-28
**Status:** Ready for Implementation

---

## Overview

Esta feature implementa la gestión completa del ciclo de vida de sesiones de mentoría post-booking: dashboard para visualizar sesiones, integración de videollamadas y cancelación con reembolsos.

**Alcance:**
- **MYM-29:** Session Dashboard - Vista de sesiones próximas y pasadas
- **MYM-30:** Join Video Call - Integración con enlace de videollamada
- **MYM-31:** Cancel Session - Cancelación con regla de 24 horas

**Stack técnico:**
- Frontend: Next.js 15 (App Router) + React 19
- Backend: Supabase (PostgreSQL + Edge Functions)
- Database: PostgreSQL con RLS
- Video: Daily.co (API para rooms temporales)
- Payments: Stripe (refunds via existing integration)
- Deployment: Vercel
- Testing: Vitest + Playwright

---

## Technical Decisions

### Decision 1: Video Conferencing Provider

**Options considered:**
- A) Daily.co - API simple, rooms temporales, free tier 10k min/mes
- B) Whereby - Embed fácil pero planes pagos requeridos
- C) Jitsi - Open source pero requiere infraestructura propia
- D) Google Meet API - Requiere Google Workspace y OAuth complejo

**Chosen:** Daily.co

**Reasoning:**
- ✅ API REST simple para crear rooms programáticamente
- ✅ Free tier generoso (10,000 min/mes = ~167 horas)
- ✅ No requiere descargas (browser-based)
- ✅ Rooms temporales con expiración automática
- ✅ Privacidad configurable (rooms privados)
- ❌ Trade-off: Dependencia de servicio externo

**Implementation notes:**
- Crear room al confirmar booking (en webhook de Stripe payment success)
- Almacenar `videocall_url` en tabla `bookings`
- Configurar expiración: session_end_time + 1 hora
- Room settings: `privacy: 'private'`, `enable_screenshare: true`, `enable_chat: true`

---

### Decision 2: Arquitectura del Session Dashboard

**Options considered:**
- A) Página separada `/dashboard/sessions` con Server Component
- B) Tab dentro del dashboard existente `/dashboard`
- C) Modal/drawer desde cualquier página

**Chosen:** A) Página separada `/dashboard/sessions`

**Reasoning:**
- ✅ Separación clara de responsabilidades
- ✅ URL compartible y navegable
- ✅ Server Component para fetch inicial (mejor SEO/performance)
- ✅ Permite paginación futura sin afectar otras vistas
- ❌ Trade-off: Navegación adicional requerida

**Implementation notes:**
- Ruta: `app/dashboard/sessions/page.tsx` (Server Component)
- Client components para tabs y acciones interactivas
- Fetch inicial de bookings con status filtrado
- Polling o realtime para actualizaciones de estado

---

### Decision 3: Lógica de Tiempo para "Join Call" Button

**Options considered:**
- A) Lógica solo en frontend (client-side time check)
- B) Lógica solo en backend (API valida tiempo)
- C) Híbrido: UI optimista + validación backend

**Chosen:** C) Híbrido

**Reasoning:**
- ✅ UX fluida: botón aparece/desaparece sin reload
- ✅ Seguridad: backend es autoridad final sobre acceso
- ✅ Maneja clocks desincronizados del cliente
- ❌ Trade-off: Doble implementación de lógica temporal

**Implementation notes:**
- Frontend: Mostrar botón si `now >= session_date - 15min`
- Backend: API `/api/bookings/[id]/video-link` valida:
  - Usuario es participante (mentor o student)
  - Tiempo dentro de ventana (15 min antes hasta 1h después del fin)
- Error codes: `TOO_EARLY_TO_JOIN`, `SESSION_EXPIRED`, `NOT_A_PARTICIPANT`

---

### Decision 4: Estado de Sesiones y Transiciones

**Chosen:** Máquina de estados formal en `bookings.status`

**Estados definidos (ya en DB):**
```
provisional → pending_payment → confirmed → completed
                                    ↓
                                cancelled
```

**Transiciones automáticas:**
- `confirmed` → `completed`: Cron job o Edge Function cuando `session_date + duration + 1h < now`
- Manual: `confirmed` → `cancelled` (solo si >24h antes)

**Implementation notes:**
- No hay estado `in_progress` en MVP (simplifica lógica)
- El botón "Join Call" es disponible basado en tiempo, no en status
- `cancelled` es estado terminal (no se puede revertir)

---

### Decision 5: Cancelación y Reembolsos

**Options considered:**
- A) Reembolso inmediato síncrono
- B) Reembolso async con cola de jobs
- C) Estado intermedio `pending_refund` con retry

**Chosen:** A) Reembolso inmediato síncrono (MVP)

**Reasoning:**
- ✅ Simplicidad para MVP
- ✅ UX clara: usuario ve confirmación inmediata
- ✅ Stripe refunds son rápidos y confiables
- ❌ Trade-off: Si Stripe falla, la UX se degrada

**Implementation notes:**
- Usar `stripe.refunds.create()` con el `payment_intent_id` de la transacción
- En caso de fallo: marcar booking como `pending_manual_refund` (nuevo status si necesario)
- Logging extensivo para debugging
- Notificar admin en caso de fallo (email o Slack webhook)

---

## Types & Type Safety

**Tipos disponibles en el proyecto:**

La tabla `bookings` ya existe en Supabase con los campos necesarios:

```typescript
// Derivar de Database types (a crear/actualizar en src/lib/database.types.ts)
import type { Database } from './database.types'

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']

// Tipos extendidos para esta feature
export type BookingWithParticipants = Booking & {
  mentor: Pick<Profile, 'id' | 'name' | 'photo_url' | 'email'>
  student: Pick<Profile, 'id' | 'name' | 'photo_url' | 'email'>
}

export type BookingStatus = 'provisional' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'

// Para el dashboard
export type SessionTab = 'upcoming' | 'past'

export interface SessionFilters {
  tab: SessionTab
  search?: string
  limit?: number
  offset?: number
}
```

**Directiva para todas las stories:**
- ✅ Usar tipos generados desde Supabase schema
- ✅ Tipar todas las props de componentes
- ✅ Tipar responses de API routes
- ✅ Usar Zod para validación de inputs en API routes

---

## UI/UX Design Strategy

**Estilo Visual:** Moderno/Bold (del design-system.md)

### Componentes compartidos por stories

**Componentes del Design System a usar:**
- ✅ `Card`: Contenedor para cada sesión
- ✅ `Button`: Join Call, Cancel, View Details
- ✅ `Badge`: Status indicators (Próxima, Completada, Cancelada)
- ✅ `Avatar`: Fotos de mentor/mentee
- ✅ `Tabs`: Upcoming / Past sessions

**Componentes custom a nivel feature:**

1. **SessionCard**
   - **Usado por:** MYM-29, MYM-30, MYM-31
   - **Propósito:** Mostrar información resumida de una sesión
   - **Ubicación:** `src/components/sessions/session-card.tsx`
   - **Diseño:** Card con avatar, nombre, fecha/hora, duración, acciones

2. **JoinCallButton**
   - **Usado por:** MYM-30
   - **Propósito:** Botón con lógica temporal para unirse a videollamada
   - **Ubicación:** `src/components/sessions/join-call-button.tsx`
   - **Estados:** Disabled (muy temprano), Enabled (ventana activa), Hidden (sesión pasada)

3. **CancelSessionModal**
   - **Usado por:** MYM-31
   - **Propósito:** Confirmación de cancelación con advertencia
   - **Ubicación:** `src/components/sessions/cancel-session-modal.tsx`

4. **SessionEmptyState**
   - **Usado por:** MYM-29
   - **Propósito:** Estado vacío con CTA a buscar mentores
   - **Ubicación:** `src/components/sessions/session-empty-state.tsx`

### Paleta aplicada

- **Primary** (`bg-primary`): Botón "Join Call" activo
- **Secondary** (`bg-secondary`): Badges de status
- **Destructive** (`bg-destructive`): Botón "Cancel Session"
- **Muted** (`text-muted-foreground`): Información secundaria (fecha, duración)

### Patrones de diseño

- **Cards con hover:** `hover:shadow-lg transition-shadow`
- **Tabs:** Estilo underline para Upcoming/Past
- **Modals:** Usar Dialog de shadcn/ui para cancelación
- **Loading:** Spinner centrado con `animate-spin`
- **Empty state:** Ícono + mensaje + CTA button

### Estados globales de la feature

- **Loading:** Skeleton cards mientras carga
- **Empty (Upcoming):** "No tienes sesiones programadas" + "Buscar Mentores"
- **Empty (Past):** "Aún no has completado ninguna sesión"
- **Error:** Toast con mensaje + retry button

---

## Content Writing Strategy

**Vocabulario del dominio (de PRD):**
- "Sesión" (no "reunión" o "meeting")
- "Mentor" y "Mentee/Estudiante"
- "Unirse a la llamada" (no "Join call" en español)
- "Cancelar sesión" con política clara de 24h

**Textos contextuales:**

| Ubicación | Texto |
|-----------|-------|
| Page title | "Mis Sesiones" |
| Tab 1 | "Próximas" |
| Tab 2 | "Pasadas" |
| Join button | "Unirse a la Llamada" |
| Cancel button | "Cancelar Sesión" |
| Empty upcoming | "No tienes sesiones programadas. ¿Listo para tu primera mentoría?" |
| Empty past | "Aún no has completado ninguna sesión" |
| Cancel modal title | "¿Cancelar esta sesión?" |
| Cancel warning | "Esta acción no se puede deshacer. Recibirás un reembolso completo." |
| Too early tooltip | "Disponible 15 minutos antes de la sesión" |

---

## Shared Dependencies

**Todas las stories requieren:**

1. **Supabase Client**
   - `src/lib/supabase/client.ts` (client components)
   - `src/lib/supabase/server.ts` (server components)

2. **Auth Context**
   - `src/contexts/auth-context.tsx` - Para obtener user ID

3. **Date utilities**
   - Crear `src/lib/date-utils.ts`:
     - `formatSessionDate(date: Date, timezone?: string): string`
     - `isWithinJoinWindow(sessionDate: Date): boolean`
     - `canCancelSession(sessionDate: Date): boolean`
     - `getTimeUntilSession(sessionDate: Date): string`

4. **Environment variables:**
   - `DAILY_API_KEY`: API key de Daily.co (server-only)
   - `NEXT_PUBLIC_DAILY_DOMAIN`: Dominio para URLs de rooms

5. **External services:**
   - **Daily.co:** Crear rooms de video
   - **Stripe:** Procesar reembolsos (ya configurado)
   - **Resend:** Emails de cancelación (ya configurado)

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   └── dashboard/
│       └── sessions/
│           ├── page.tsx              # Server Component - fetch inicial
│           └── _components/
│               ├── sessions-tabs.tsx # Client - tabs Upcoming/Past
│               └── sessions-list.tsx # Client - lista con acciones
│
├── components/
│   └── sessions/
│       ├── session-card.tsx          # Card de sesión individual
│       ├── join-call-button.tsx      # Botón con lógica temporal
│       ├── cancel-session-modal.tsx  # Modal de confirmación
│       └── session-empty-state.tsx   # Estado vacío
│
├── lib/
│   ├── date-utils.ts                 # Utilidades de fecha/hora
│   └── daily.ts                      # Cliente Daily.co API
│
└── app/api/
    └── bookings/
        └── [id]/
            ├── video-link/
            │   └── route.ts          # GET - obtener link con validación
            └── cancel/
                └── route.ts          # POST - cancelar y refund
```

### Design Patterns

1. **Server Components First:** Fetch inicial en page.tsx
2. **Client Islands:** Componentes interactivos (tabs, buttons, modals)
3. **Optimistic Updates:** UI responde inmediatamente, rollback si falla
4. **Time-based Logic:** Centralizada en `date-utils.ts`

### Third-party Libraries

- **date-fns** (ya instalado): Formateo y cálculos de fechas
- **@daily-co/daily-js** (opcional): SDK cliente para embed futuro
- **zod**: Validación de inputs en API routes

---

## Implementation Order

**Recomendado:**

1. **MYM-29: Session Dashboard** (base)
   - Razón: Establece la página, estructura de datos, y componentes base
   - Entregables: `/dashboard/sessions`, SessionCard, tabs, empty states

2. **MYM-30: Join Video Call** (core value)
   - Razón: Depende del dashboard para mostrar el botón
   - Entregables: JoinCallButton, API `/video-link`, integración Daily.co

3. **MYM-31: Cancel Session** (flexibility)
   - Razón: Puede desarrollarse en paralelo con MYM-30 si hay dos devs
   - Entregables: CancelSessionModal, API `/cancel`, refund logic, emails

---

## Risks & Mitigations

### Risk 1: Daily.co API no disponible durante creación de booking

**Impact:** High - Usuario paga pero no puede acceder a sesión
**Likelihood:** Low
**Mitigation:**
- Retry con backoff exponencial (3 intentos)
- Si falla: crear booking sin URL, marcar para retry manual
- Edge Function periódica que reintenta bookings sin videocall_url
- UI muestra "Enlace de video se está generando" si URL es null

### Risk 2: Timezone confusion en dashboard

**Impact:** Medium - Usuario ve hora incorrecta
**Likelihood:** Medium
**Mitigation:**
- Almacenar siempre en UTC en DB
- Mostrar timezone del usuario explícitamente: "10:00 AM (tu hora local)"
- Usar `Intl.DateTimeFormat` con timezone del browser
- Test cases con usuarios en diferentes zonas horarias

### Risk 3: Stripe refund falla

**Impact:** High - Usuario no recibe su dinero
**Likelihood:** Low
**Mitigation:**
- Log detallado de cada intento de refund
- Si falla: marcar transacción como `refund_failed`
- Notificar admin inmediatamente (email/Slack)
- Dashboard admin para procesar refunds manuales (futuro)

### Risk 4: Race condition en cancelación (24h boundary)

**Impact:** Medium - Usuario cancela cuando no debería
**Likelihood:** Low
**Mitigation:**
- Validación server-side es autoridad final
- Usar timestamps UTC para comparación
- Transaction en DB: verificar tiempo + actualizar status atómicamente
- Frontend muestra "Verificando..." durante request

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las stories implementadas y deployed
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] Tipos desde Supabase schema en `@/lib/database.types`
  - [ ] Zero type errors en toda la feature
  - [ ] Props de componentes tipadas correctamente
- [ ] **Personalidad UI/UX consistente**
  - [ ] Estilo Moderno/Bold aplicado (shadows, rounded corners)
  - [ ] Paleta purple/violet consistente
  - [ ] Hover effects y transiciones suaves
- [ ] **Content Writing contextual**
  - [ ] Vocabulario "Sesión", "Mentor", "Mentee" usado
  - [ ] Sin placeholders genéricos
  - [ ] Mensajes de error útiles y específicos
- [ ] **Funcionalidad core**
  - [ ] Dashboard muestra sesiones upcoming y past
  - [ ] "Join Call" aparece 15 min antes y funciona
  - [ ] Cancelación respeta regla 24h y procesa refund
- [ ] **Tests**
  - [ ] Unit tests para date-utils (>90% coverage)
  - [ ] E2E test: usuario ve dashboard, hace click en Join Call
  - [ ] E2E test: usuario cancela sesión >24h antes
- [ ] **Performance**
  - [ ] Dashboard LCP < 2.5s con 100 sesiones
  - [ ] Join Call button responde en <500ms
- [ ] **Build y linting**
  - [ ] `bun run build` exitoso
  - [ ] `bun run lint` sin errores
  - [ ] Zero TypeScript errors

---

## Database Schema (Current State)

La tabla `bookings` ya tiene la columna `videocall_url`:

```sql
-- Existing columns relevant to this feature:
- id: uuid (PK)
- student_id: uuid (FK to profiles)
- mentor_id: uuid (FK to profiles)
- session_date: timestamptz
- duration_minutes: integer (default 60)
- total_cost: numeric
- status: text ('provisional', 'pending_payment', 'confirmed', 'completed', 'cancelled')
- videocall_url: text (nullable) -- Ya existe!
- notes: text (nullable)
- created_at, updated_at: timestamptz

-- May need to add for cancellation tracking:
- cancelled_at: timestamptz (nullable)
- cancelled_by: uuid (FK to profiles, nullable)
- cancellation_reason: text (nullable)
```

**Migration needed:** Agregar campos de cancelación si no existen.

---

*Generado automáticamente - Claude Code*
*Última actualización: 2025-12-08*
