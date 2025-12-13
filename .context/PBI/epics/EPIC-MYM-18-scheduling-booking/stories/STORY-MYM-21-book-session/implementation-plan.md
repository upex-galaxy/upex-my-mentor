# Implementation Plan: STORY-MYM-21 - Book a Session

## Overview

Implementar el flujo completo de reserva de sesiones de mentoría. El mentee puede seleccionar un slot disponible del calendario del mentor, confirmar los detalles y proceder al checkout de Stripe.

**Acceptance Criteria a cumplir:**
- Mentee puede ver slots disponibles de un mentor
- Mentee puede seleccionar un slot de 1 hora y confirmar booking
- Sistema crea registro en `bookings` con status `pending_payment`
- Sistema redirige a Stripe Checkout
- Si slot ya tomado, muestra error "This time slot is no longer available"

---

## Technical Approach

**Chosen approach:** Server Component + Client Booking UI + Server Action

**Flow:**
1. Página `/mentors/[id]/book` (Server Component) carga datos del mentor
2. `BookingCalendar` (Client) muestra slots disponibles
3. `BookingSummary` (Client) muestra confirmación pre-pago
4. Server Action crea booking y genera Stripe Checkout Session
5. Redirect a Stripe hosted checkout

**Alternatives considered:**
- A) API Route + fetch: Mayor complejidad, más código boilerplate
- B) Full client-side: Menos seguro, expone lógica de negocio

**Why this approach:**
- ✅ Server Actions simplifican el flujo sin API routes adicionales
- ✅ Validación server-side para race conditions
- ✅ Stripe Checkout hosted = menos código, PCI compliant
- ❌ Trade-off: Requiere "use server" y manejo de errores cuidadoso

---

## UI/UX Design

**Design System:** `.context/design-system.md`
**Estilo Visual:** Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

| Componente | Uso en esta Story |
|------------|-------------------|
| `Button` | "Reservar Sesión", "Confirmar y Pagar" |
| `Card` | Contenedor de calendario, resumen de booking |
| `Badge` | Indicador de timezone, slot disponible |
| `Calendar` (shadcn) | Selector de fecha |

### Componentes custom a crear:

**1. BookingCalendar**
- **Propósito:** Muestra calendario mensual + slots disponibles del día seleccionado
- **Props:** `mentorId`, `mentorTimezone`, `hourlyRate`
- **Ubicación:** `src/components/scheduling/booking-calendar.tsx`
- **Diseño:** Grid calendario + lista de time slots clickeables

**2. BookingSummary**
- **Propósito:** Modal/Card con resumen pre-checkout
- **Props:** `mentor`, `selectedSlot`, `totalCost`, `onConfirm`, `onCancel`
- **Ubicación:** `src/components/scheduling/booking-summary.tsx`
- **Diseño:** Card con detalles + CTA "Confirmar y Pagar"

**3. TimeSlotPicker**
- **Propósito:** Lista de slots disponibles para un día
- **Props:** `slots`, `selectedSlot`, `onSelect`
- **Ubicación:** `src/components/scheduling/time-slot-picker.tsx`
- **Diseño:** Grid de botones con hover effects

### Wireframes/Layout:

**Página `/mentors/[id]/book`:**
```
┌──────────────────────────────────────────────────────────────┐
│ Navbar                                                        │
├──────────────────────────────────────────────────────────────┤
│ Header: "Reservar sesión con {mentor.name}"                   │
│ Subheader: TimezoneIndicator + hourly rate                   │
├────────────────────────────┬─────────────────────────────────┤
│                            │                                  │
│    Calendar (Month View)   │     Time Slots (Day View)       │
│    ┌──────────────────┐    │     ┌─────────────────────┐     │
│    │   December 2025  │    │     │ 09:00 AM  [Select]  │     │
│    │ Su Mo Tu We Th.. │    │     │ 10:00 AM  [Select]  │     │
│    │     1  2  3  4.. │    │     │ 11:00 AM  [BOOKED]  │     │
│    │  7  8  9 10 11.. │    │     │ 12:00 PM  [Select]  │     │
│    └──────────────────┘    │     │ ...                 │     │
│                            │     └─────────────────────┘     │
├────────────────────────────┴─────────────────────────────────┤
│ [BookingSummary - aparece al seleccionar slot]               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Mentor: {name}   |   Date: Dec 15   |   Time: 10:00 AM   │ │
│ │ Duration: 1 hour |   Total: $100.00                      │ │
│ │                                                          │ │
│ │ [Cancelar]                    [Confirmar y Pagar →]      │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton de calendario + slots
- **Empty (sin disponibilidad):** "Este mentor no tiene disponibilidad esta semana"
- **Error (slot tomado):** Toast destructive "Este horario ya no está disponible"
- **Success:** Redirect a Stripe Checkout

### Responsividad:

- **Mobile (< 768px):** Calendario encima, slots debajo (stack vertical)
- **Desktop (> 768px):** Calendario lado izquierdo, slots lado derecho

### Personalidad UI/UX aplicada (Moderno/Bold):

- Gradientes sutiles en header: `from-purple-50 via-fuchsia-50 to-violet-50`
- Sombras pronunciadas en hover: `shadow-lg`
- Bordes redondeados: `rounded-lg`, `rounded-xl`
- Transiciones suaves: `transition-all duration-200`
- Slots disponibles: `border-primary hover:bg-primary/10`
- Slots no disponibles: `bg-muted opacity-50 cursor-not-allowed`

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos generados desde DB
- `src/types/index.ts` - Booking, BookingStatus
- `src/types/scheduling.ts` - TimeDisplay, TimezoneIndicatorProps

**Nuevos tipos a agregar en `src/types/scheduling.ts`:**

```typescript
// MYM-21: Book a Session Types

export interface MentorAvailability {
  id: string
  mentor_id: string
  day_of_week: number  // 0-6 (Sun-Sat)
  start_time: string   // HH:MM format (e.g., "09:00")
  end_time: string     // HH:MM format (e.g., "17:00")
  is_active: boolean
  created_at: string
}

export interface TimeSlot {
  datetime: Date        // UTC datetime
  displayTime: string   // Formatted in user's timezone
  mentorTime: string    // Formatted in mentor's timezone
  isAvailable: boolean
  isSelected?: boolean
}

export interface BookingFormData {
  mentorId: string
  sessionDate: Date     // UTC
  durationMinutes: number
  totalCost: number
}

export interface CreateBookingResult {
  success: boolean
  bookingId?: string
  checkoutUrl?: string
  error?: string
}

export interface BookingCalendarProps {
  mentorId: string
  mentorName: string
  mentorTimezone: string
  hourlyRate: number
}

export interface BookingSummaryProps {
  mentor: {
    id: string
    name: string
    photoUrl?: string
  }
  selectedSlot: TimeSlot
  totalCost: number
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}
```

---

## Content Writing

**Vocabulario del dominio:**
- "Sesión de mentoría" (no "cita" o "reunión")
- "Reservar" (no "agendar" o "programar")
- "Mentor" / "Mentee" (consistente)

**Copy contextual:**

| Elemento | Texto |
|----------|-------|
| Page title | "Reservar sesión con {mentor.name}" |
| Slot available | "Disponible" |
| Slot booked | "Reservado" |
| No slots | "No hay horarios disponibles para este día" |
| CTA primary | "Confirmar y Pagar" |
| CTA secondary | "Cancelar" |
| Error race condition | "Este horario ya no está disponible. Por favor, selecciona otro." |
| Success redirect | "Redirigiendo a pago seguro..." |
| Summary header | "Resumen de tu sesión" |
| Duration label | "Duración: 1 hora" |

---

## Implementation Steps

### **Step 1: Database - Create mentor_availability table**

**Task:** Crear tabla para almacenar disponibilidad semanal de mentores

**Details:**
- Tabla `mentor_availability` con campos:
  - `id` (uuid, PK)
  - `mentor_id` (uuid, FK → profiles)
  - `day_of_week` (int, 0-6)
  - `start_time` (time)
  - `end_time` (time)
  - `is_active` (boolean, default true)
  - `created_at`, `updated_at` (timestamptz)
- UNIQUE constraint: `(mentor_id, day_of_week, start_time)`
- RLS policies para lectura pública, escritura solo mentor

**Migration name:** `create_mentor_availability_table`

**Testing:**
- Verificar tabla creada en Supabase
- Probar insert/select con RLS

**Estimated time:** 20 min

---

### **Step 2: Types - Add booking types to scheduling.ts**

**Task:** Agregar tipos TypeScript para el flujo de booking

**File:** `src/types/scheduling.ts`

**Types to add:**
- `MentorAvailability`
- `TimeSlot`
- `BookingFormData`
- `CreateBookingResult`
- `BookingCalendarProps`
- `BookingSummaryProps`

**Testing:**
- TypeScript compile sin errores

**Estimated time:** 15 min

---

### **Step 3: Component - TimeSlotPicker**

**Task:** Crear componente que muestra slots disponibles para un día

**File:** `src/components/scheduling/time-slot-picker.tsx`

**Structure:**
- Props: `slots: TimeSlot[]`, `selectedSlot`, `onSelect`
- Grid de botones, 2-3 columnas en desktop
- Estados: disponible, reservado, seleccionado
- Usa timezone helpers existentes

**Edge cases handled:**
- Sin slots: Mostrar mensaje "No hay horarios disponibles"
- Slot reservado: Disabled con estilo muted

**Testing:**
- Render con slots mock
- Click selecciona slot
- Disabled no permite click

**Estimated time:** 45 min

---

### **Step 4: Component - BookingCalendar**

**Task:** Crear componente principal de calendario con selector de fecha y slots

**File:** `src/components/scheduling/booking-calendar.tsx`

**Structure:**
- Calendar de shadcn/ui para selección de fecha
- TimeSlotPicker para mostrar slots del día
- TimezoneIndicator mostrando timezone del usuario
- State: selectedDate, selectedSlot
- Fetch slots disponibles basado en mentor_availability - bookings existentes

**Dependencies:**
- `bun add date-fns` (ya instalado)
- shadcn Calendar component

**Edge cases handled:**
- Fechas pasadas: Disabled
- Días sin disponibilidad: Mostrar mensaje
- Loading: Skeleton

**Testing:**
- Render calendario
- Cambio de fecha actualiza slots
- Selección de slot actualiza state

**Estimated time:** 1.5 hours

---

### **Step 5: Component - BookingSummary**

**Task:** Crear componente de resumen pre-checkout

**File:** `src/components/scheduling/booking-summary.tsx`

**Structure:**
- Card con mentor info (avatar, nombre)
- Fecha y hora en timezone del usuario
- Duración: 1 hora
- Total: ${hourlyRate}
- Botones: Cancelar (outline), Confirmar y Pagar (primary)
- Loading state en botón submit

**Edge cases handled:**
- isSubmitting: Disable buttons, show spinner

**Testing:**
- Render con props mock
- Click Confirmar dispara onConfirm
- Click Cancelar dispara onCancel

**Estimated time:** 45 min

---

### **Step 6: Server Action - createBooking**

**Task:** Crear server action para crear booking y Stripe checkout

**File:** `src/app/mentors/[id]/book/actions.ts`

**Logic:**
1. Validar usuario autenticado
2. Verificar slot disponible (race condition check)
3. Crear booking en DB con status `pending_payment`
4. Crear Stripe Checkout Session con booking_id en metadata
5. Return checkout URL o error

**Race condition prevention:**
- `SELECT ... FOR UPDATE` antes de insert
- UNIQUE constraint en bookings: `(mentor_id, session_date)` con status != cancelled

**Edge cases handled:**
- Slot ya tomado: Return error 409
- Usuario no autenticado: Return error 401
- Stripe error: Return error 500, rollback booking

**Testing:**
- Integration test con mock Stripe
- Test race condition con concurrent requests

**Estimated time:** 1.5 hours

---

### **Step 7: Page - /mentors/[id]/book**

**Task:** Crear página de booking

**File:** `src/app/mentors/[id]/book/page.tsx`

**Structure:**
- Server Component que carga mentor data
- Client wrapper para BookingCalendar + BookingSummary
- Layout con Navbar/Footer

**Data fetching:**
- Fetch mentor profile
- Fetch mentor availability
- Fetch existing bookings para calcular slots disponibles

**Edge cases handled:**
- Mentor no encontrado: notFound()
- Mentor no verificado: Redirect o mensaje
- Usuario no autenticado: Redirect a login con returnTo

**Testing:**
- E2E: Navegar a página, ver calendario
- Verificar mentor data se muestra

**Estimated time:** 1 hour

---

### **Step 8: Enable booking button on mentor profile**

**Task:** Habilitar botón "Agendar Sesión" en página del mentor

**File:** `src/app/mentors/[id]/page.tsx`

**Changes:**
- Remover `disabled` del Button
- Agregar Link a `/mentors/${mentor.id}/book`
- Remover mensaje "próximamente"

**Testing:**
- Click en botón navega a página de booking

**Estimated time:** 15 min

---

### **Step 9: Integration - Full booking flow**

**Task:** Integrar todos los componentes y probar flujo completo

**Flow completo:**
1. Usuario en `/mentors/[id]` → Click "Agendar Sesión"
2. Navega a `/mentors/[id]/book`
3. Selecciona fecha → Ve slots disponibles
4. Selecciona slot → Aparece BookingSummary
5. Click "Confirmar y Pagar" → Server Action
6. Success → Redirect a Stripe Checkout
7. Stripe success → Webhook actualiza booking a `confirmed`

**Testing:**
- E2E test completo con Playwright
- Manual test en staging

**Estimated time:** 1 hour

---

### **Step 10: Seed data - Add mentor availability**

**Task:** Agregar disponibilidad para mentores existentes (seed/migration)

**Details:**
- Para cada mentor verificado, crear disponibilidad estándar:
  - Lunes-Viernes: 09:00-17:00
- Esto permite probar el flujo sin configuración manual

**Testing:**
- Verificar mentores tienen slots disponibles

**Estimated time:** 20 min

---

## Technical Decisions (Story-specific)

### Decision 1: Stripe Checkout hosted vs embedded

**Chosen:** Stripe Checkout hosted (redirect)

**Reasoning:**
- ✅ PCI compliant sin esfuerzo adicional
- ✅ Menos código frontend
- ✅ UI optimizada por Stripe
- ❌ Trade-off: Usuario sale del sitio temporalmente

### Decision 2: Race condition handling

**Chosen:** Database constraint + SELECT FOR UPDATE

**Reasoning:**
- ✅ UNIQUE constraint como última línea de defensa
- ✅ SELECT FOR UPDATE previene race conditions en transacción
- ✅ Error handling con mensaje user-friendly
- ❌ Trade-off: Slightly más complejo que check simple

### Decision 3: Slot calculation approach

**Chosen:** Server-side calculation of available slots

**Reasoning:**
- ✅ Seguro - no expone lógica de negocio
- ✅ Actualizado - calcula en tiempo real
- ❌ Trade-off: Más carga en servidor

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla `bookings` (ya existe)
- [x] Stripe Connect configurado (MYM-25)
- [x] Timezone utilities (MYM-20)
- [ ] Tabla `mentor_availability` (crear en Step 1)
- [ ] shadcn Calendar component (instalar)

**Instalar:**
```bash
bunx shadcn@latest add calendar
```

---

## Risks & Mitigations

**Risk 1:** Race condition - dos usuarios reservan mismo slot
- **Impact:** High
- **Mitigation:** UNIQUE constraint + SELECT FOR UPDATE + UI feedback

**Risk 2:** Mentor sin disponibilidad configurada
- **Impact:** Medium
- **Mitigation:** Seed data con disponibilidad default + mensaje claro en UI

**Risk 3:** Stripe checkout falla después de crear booking
- **Impact:** Medium
- **Mitigation:** Cleanup job para bookings en `pending_payment` > 15 min

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | Database migration | 20 min |
| 2 | Types | 15 min |
| 3 | TimeSlotPicker | 45 min |
| 4 | BookingCalendar | 1.5 hours |
| 5 | BookingSummary | 45 min |
| 6 | Server Action | 1.5 hours |
| 7 | Booking Page | 1 hour |
| 8 | Enable button | 15 min |
| 9 | Integration testing | 1 hour |
| 10 | Seed data | 20 min |
| **Total** | | **~8 hours** |

**Story points:** 8 (High complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] Mentee puede ver slots disponibles
  - [ ] Mentee puede seleccionar y confirmar booking
  - [ ] Booking creado con status `pending_payment`
  - [ ] Redirect a Stripe Checkout funciona
  - [ ] Error message para slot tomado
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/scheduling`
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada**
  - [ ] Estilo Moderno/Bold
  - [ ] Colores primary/secondary/accent
  - [ ] Hover effects y transitions
- [ ] **Content Writing contextual**
  - [ ] Vocabulario de mentoría
  - [ ] Sin frases placeholder
- [ ] Tests:
  - [ ] Unit: BookingCalendar, TimeSlotPicker
  - [ ] Integration: createBooking action
  - [ ] E2E: Flujo completo de booking
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` pasa
  - [ ] `bun run build` pasa
- [ ] Deployed to staging
- [ ] Manual smoke test
  - [ ] Desktop: Flujo completo funciona
  - [ ] Mobile: Layout responsive

---

**Generado:** 2025-12-13
**Por:** Claude Code
