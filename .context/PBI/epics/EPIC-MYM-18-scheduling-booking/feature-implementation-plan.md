# Feature Implementation Plan: EPIC-MYM-18 - Scheduling & Booking

## Overview

Esta feature implementa el núcleo transaccional de la plataforma: la reserva de sesiones de mentoría. Permite a los mentores definir su disponibilidad semanal y a los mentees seleccionar un horario disponible para reservar una sesión de 1 hora.

**Alcance:**
- **MYM-19**: Set Mentor Weekly Availability (✅ Completado - Ready For QA)
- **MYM-20**: Timezone Conversion for Availability Display
- **MYM-21**: Book a Session (requiere Shift-Left)
- **MYM-22**: Email Confirmation and Calendar Invite

**Stack técnico:**
- Frontend: Next.js 15 (App Router) + React 19
- Backend: Supabase (PostgreSQL + Edge Functions)
- Database: PostgreSQL con timestamptz para fechas
- Email: Resend (servicio de email transaccional)
- Scheduling: Supabase Cron Jobs (Edge Functions scheduled)
- Testing: Vitest + Playwright

---

## Technical Decisions

### Decision 1: Servicio de Email Transaccional

**Options considered:**
- A) Supabase Email (built-in, limitado)
- B) Resend (moderno, buena DX, React Email templates)
- C) SendGrid (establecido, más complejo)

**Chosen:** B) Resend

**Reasoning:**
- ✅ API moderna y simple con excelente TypeScript support
- ✅ Integración nativa con React Email para templates type-safe
- ✅ Tier gratuito generoso (100 emails/día)
- ✅ Mejor DX para envío de adjuntos (.ics files)
- ❌ Trade-off: Dependencia externa adicional

**Implementation notes:**
- Instalar: `bun add resend`
- Crear API route `/api/email/send` para centralizar envíos
- Templates en `src/lib/email/templates/` usando React Email

---

### Decision 2: Generación de Calendar Invites (.ics)

**Options considered:**
- A) Generar manualmente el formato .ics
- B) Usar librería `ics` (npm)
- C) Usar librería `ical-generator`

**Chosen:** B) Librería `ics`

**Reasoning:**
- ✅ Librería ligera y bien mantenida
- ✅ API simple para crear eventos
- ✅ Soporte completo para timezone y recurrence
- ✅ Compatible con Gmail, Outlook, Apple Calendar
- ❌ Trade-off: Dependencia adicional (pero justificada por complejidad de .ics)

**Implementation notes:**
- Instalar: `bun add ics`
- Crear helper `src/lib/calendar/generate-ics.ts`
- El .ics se adjunta al email de confirmación

---

### Decision 3: Timezone Handling Strategy

**Chosen:** UTC Storage + Client-side Display Conversion

**Reasoning:**
- ✅ Almacenar TODAS las fechas en UTC en PostgreSQL (`timestamptz`)
- ✅ Convertir a timezone del usuario solo en el frontend para display
- ✅ Usar `date-fns-tz` para conversiones consistentes
- ✅ Detectar timezone del navegador: `Intl.DateTimeFormat().resolvedOptions().timeZone`
- ❌ Trade-off: Complejidad adicional en frontend, pero necesario para marketplace global

**Implementation notes:**
- Instalar: `bun add date-fns date-fns-tz`
- Crear helpers en `src/lib/timezone/`
- Siempre mostrar ambos timezones (mentor y mentee) en UI

---

### Decision 4: Email Trigger Architecture

**Options considered:**
- A) Trigger desde frontend después de pago exitoso
- B) Webhook de Stripe que llama a Edge Function
- C) Database trigger + Edge Function listener

**Chosen:** B) Webhook de Stripe + Edge Function

**Reasoning:**
- ✅ Más confiable (no depende de estado del frontend)
- ✅ El webhook confirma el pago real antes de enviar
- ✅ Retry automático si falla
- ✅ Auditable (logs en Supabase)
- ❌ Trade-off: Requiere configuración de webhook en Stripe

**Implementation notes:**
- Para MYM-22, el email se dispara cuando el booking cambia a status `confirmed`
- Edge Function `send-booking-confirmation` escucha cambios en `bookings` table
- Incluye: datos de sesión + .ics adjunto

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos generados desde database schema
- `src/types/index.ts` - Type helpers del proyecto

**Tipos existentes relevantes:**
```typescript
// Ya existe en supabase.ts
type Booking = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']

// Ya existe en index.ts
type BookingStatus = 'provisional' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
```

**Nuevos tipos a crear para esta feature:**

```typescript
// src/types/scheduling.ts

// MYM-19: Mentor Availability
export interface MentorAvailability {
  id: string
  mentor_id: string
  day_of_week: number // 0-6 (Sun-Sat)
  start_time: string  // HH:MM format
  end_time: string    // HH:MM format
  timezone: string    // IANA timezone
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AvailabilityException {
  id: string
  mentor_id: string
  blocked_date: string // YYYY-MM-DD
  reason?: string
  created_at: string
}

// MYM-20: Timezone Display
export interface TimeSlot {
  datetime: Date        // UTC
  displayTime: string   // Formatted in user's timezone
  mentorTime: string    // Formatted in mentor's timezone
  isAvailable: boolean
}

// MYM-22: Email & Calendar
export interface BookingConfirmationEmail {
  to: string
  booking: {
    id: string
    session_datetime: Date
    duration_minutes: number
    total_cost: number
  }
  mentor: {
    name: string
    email: string
    timezone: string
  }
  mentee: {
    name: string
    email: string
    timezone: string
  }
  videocall_url?: string
}

export interface CalendarInvite {
  title: string
  description: string
  start: Date
  end: Date
  location?: string
  organizer: { name: string; email: string }
  attendees: { name: string; email: string }[]
}
```

**Directiva para todas las stories:**
- ✅ Importar tipos desde `@/types/scheduling` para esta feature
- ✅ Usar tipos de `@/types/supabase` para operaciones de DB
- ✅ Zero type errors relacionados a scheduling

---

## UI/UX Design Strategy

**Design System:** `.context/design-system.md`
**Estilo Visual:** Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

| Componente | Uso en esta Feature |
|------------|---------------------|
| `Button` | CTAs: "Confirmar Reserva", "Guardar Disponibilidad" |
| `Card` | Contenedor de calendario, resumen de booking |
| `Input` | Selectores de tiempo (con time picker) |
| `Badge` | Estados de disponibilidad, timezone indicators |

### Componentes custom a nivel feature:

**1. AvailabilityCalendar (MYM-19)**
- **Usado por:** Mentor Dashboard
- **Propósito:** Permite al mentor configurar slots semanales recurrentes
- **Ubicación:** `src/components/scheduling/availability-calendar.tsx`
- **Diseño:** Grid semanal con time slots clickeables

**2. BookingCalendar (MYM-21)**
- **Usado por:** Mentor Profile Page, Book Session Page
- **Propósito:** Muestra slots disponibles para mentees
- **Ubicación:** `src/components/scheduling/booking-calendar.tsx`
- **Diseño:** Calendario mensual + lista de slots del día seleccionado

**3. TimezoneSelector (MYM-20)**
- **Usado por:** Ambos calendarios
- **Propósito:** Muestra y permite cambiar timezone de visualización
- **Ubicación:** `src/components/scheduling/timezone-selector.tsx`
- **Diseño:** Select dropdown con timezone actual detectado

**4. BookingSummary (MYM-21)**
- **Usado por:** Checkout page
- **Propósito:** Resumen pre-pago con todos los detalles
- **Ubicación:** `src/components/scheduling/booking-summary.tsx`

### Consistencia visual:

**Paleta aplicada:**
- Primary (`bg-primary`): Botones de acción principal, slots seleccionados
- Secondary (`bg-secondary`): Estados hover, elementos secundarios
- Accent (`bg-accent`): Highlights, indicadores de timezone
- Muted (`text-muted-foreground`): Slots no disponibles, texto secundario

**Patrones de diseño:**
- Calendario usa grid responsive con hover effects (`shadow-lg`)
- Slots disponibles tienen borde primary con hover accent
- Slots no disponibles son `bg-muted` con `opacity-50`
- Transiciones suaves: `transition-all duration-200`

### Estados globales de la feature:

| Estado | Visualización |
|--------|---------------|
| Loading | Skeleton de calendario con shimmer |
| Empty (sin disponibilidad) | Card con mensaje + CTA "Configurar Disponibilidad" |
| Error | Toast con mensaje + botón retry |
| Success (booking) | Redirect a confirmación + toast success |

---

## Content Writing Strategy

**Contexto del negocio:** Upex My Mentor - Marketplace de mentoría tech

**Vocabulario del dominio:**
- "Sesión" (no "cita" o "reunión")
- "Mentor" / "Mentee" (no "profesor/estudiante")
- "Reservar" (no "agendar" o "programar")
- "Disponibilidad" (no "horario libre")

**Ejemplos de copy contextual:**

| Genérico ❌ | Contextual ✅ |
|-------------|---------------|
| "Selecciona un horario" | "Elige el mejor momento para tu sesión" |
| "Confirmar cita" | "Reservar sesión de mentoría" |
| "Tu reserva ha sido confirmada" | "¡Sesión confirmada! Te enviamos los detalles por email" |
| "Cancelar" | "No puedo asistir" |

**Mensajes de email (MYM-22):**
- Subject: "Tu sesión con {mentor_name} está confirmada"
- Preview: "El {date} a las {time} - No olvides preparar tus preguntas"

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

1. **date-fns + date-fns-tz**
   - Manejo de fechas y conversión de timezones
   - `bun add date-fns date-fns-tz`

2. **Tablas de base de datos** (migración requerida):
   - `mentor_availability` (slots semanales)
   - `availability_exceptions` (fechas bloqueadas)
   - Update a `bookings` (campos de email tracking)

3. **Environment variables:**
   - `RESEND_API_KEY`: API key de Resend para emails
   - `NEXT_PUBLIC_APP_URL`: URL base para links en emails

4. **External services:**
   - Resend: Envío de emails transaccionales
   - Supabase Cron: Recordatorios programados (24h, 1h antes)

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── mentor/
│   │       └── availability/    # MYM-19: Mentor sets availability
│   │           └── page.tsx
│   ├── mentors/
│   │   └── [id]/
│   │       └── book/            # MYM-21: Book a session
│   │           └── page.tsx
│   └── api/
│       ├── email/
│       │   └── send/            # MYM-22: Email sending endpoint
│       │       └── route.ts
│       └── bookings/
│           └── [...]/
│
├── components/
│   └── scheduling/              # Feature-specific components
│       ├── availability-calendar.tsx
│       ├── booking-calendar.tsx
│       ├── timezone-selector.tsx
│       ├── booking-summary.tsx
│       └── time-slot.tsx
│
├── lib/
│   ├── calendar/
│   │   └── generate-ics.ts      # MYM-22: .ics generation
│   ├── email/
│   │   ├── resend.ts            # Resend client
│   │   └── templates/
│   │       └── booking-confirmation.tsx
│   └── timezone/
│       ├── convert.ts           # MYM-20: Timezone utils
│       └── detect.ts
│
└── types/
    └── scheduling.ts            # Feature-specific types
```

### Design Patterns

1. **Server Actions**: Para mutaciones de disponibilidad y bookings
2. **Optimistic Updates**: En el calendario de disponibilidad del mentor
3. **React Query/SWR**: Para fetching de slots disponibles con cache
4. **Webhook Pattern**: Para trigger de emails post-pago

### Third-party Libraries

| Library | Version | Uso |
|---------|---------|-----|
| `date-fns` | ^3.x | Manipulación de fechas |
| `date-fns-tz` | ^3.x | Conversión de timezones |
| `resend` | ^3.x | Envío de emails |
| `ics` | ^3.x | Generación de .ics files |
| `react-email` | ^2.x | Templates de email |

---

## Implementation Order

**Recomendado:**

1. **MYM-19: Set Mentor Availability** ✅ COMPLETADO
   - Base para todo el flujo de booking
   - Migración de DB + UI de calendario

2. **MYM-20: Timezone Conversion** (Ready For QA)
   - Depende de MYM-19
   - Helpers de timezone + UI updates

3. **MYM-21: Book a Session** (requiere Shift-Left)
   - Depende de MYM-19 y MYM-20
   - Flujo completo de booking

4. **MYM-22: Email Confirmation & Calendar Invite** ← **SIGUIENTE**
   - Puede iniciar en paralelo con MYM-21 (backend)
   - Integración con Resend + generación .ics
   - Se activa cuando booking status = 'confirmed'

---

## Risks & Mitigations

### Risk 1: Timezone Conversion Errors

**Impact:** Critical - Sesiones reservadas en hora incorrecta
**Likelihood:** High
**Mitigation:**
- Almacenar TODO en UTC en DB
- Tests unitarios exhaustivos para conversiones
- Mostrar SIEMPRE ambos timezones en UI
- Confirmación explícita del usuario antes de reservar

### Risk 2: Race Conditions en Doble Booking

**Impact:** High - Dos mentees reservan el mismo slot
**Likelihood:** Medium
**Mitigation:**
- `UNIQUE CONSTRAINT` en DB: `(mentor_id, session_datetime)`
- Transacción con `SELECT FOR UPDATE` antes de insertar
- Timeout de 15 min para reservas `draft`

### Risk 3: Email Delivery Failures

**Impact:** Medium - Usuario no recibe confirmación
**Likelihood:** Medium
**Mitigation:**
- Usar Resend con retry automático
- Logging de todos los intentos de envío
- Dashboard de admin para re-enviar manualmente
- Mostrar confirmación en UI además de email

### Risk 4: .ics Incompatibility

**Impact:** Medium - Calendar invite no funciona
**Likelihood:** Low
**Mitigation:**
- Tests manuales en Gmail, Outlook, Apple Calendar
- Usar librería probada (`ics`)
- Formato estándar RFC 5545

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las stories implementadas y deployed
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] Todas las stories usan tipos desde `@/types/scheduling`
  - [ ] Zero type errors relacionados a scheduling
  - [ ] Props de componentes tipadas correctamente
- [ ] **Personalidad UI/UX consistente**
  - [ ] Estilo Moderno/Bold aplicado en todos los calendarios
  - [ ] Colores primary/secondary/accent usados consistentemente
  - [ ] Hover effects y transitions uniformes
- [ ] **Content Writing contextual**
  - [ ] Vocabulario de mentoría usado en toda la feature
  - [ ] Sin frases placeholder genéricas
  - [ ] Emails con tono profesional pero cercano
- [ ] **Emails funcionando correctamente**
  - [ ] Confirmación enviada a mentor Y mentee
  - [ ] .ics válido y funcional en Gmail, Outlook, Apple Calendar
  - [ ] Recordatorios 24h y 1h antes (si implementados)
- [ ] 100% de test cases críticos pasando (26 según feature-test-plan)
- [ ] `bun run build` exitoso
- [ ] Zero TypeScript errors
- [ ] Linting passes

---

**Última actualización:** 2025-12-08
**Generado por:** Claude Code
