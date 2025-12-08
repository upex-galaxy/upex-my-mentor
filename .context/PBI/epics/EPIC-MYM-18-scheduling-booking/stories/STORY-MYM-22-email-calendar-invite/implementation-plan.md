# Implementation Plan: STORY-MYM-22 - Email Confirmation and Calendar Invite

## Overview

Implementar el envío de emails de confirmación con archivo .ics (calendar invite) adjunto cuando una sesión de mentoría es confirmada tras el pago exitoso.

**Acceptance Criteria a cumplir:**
- El sistema envía email de confirmación a mentee Y mentor tras booking confirmado
- El email contiene detalles de la sesión y archivo .ics adjunto
- El .ics crea evento de calendario con link de videollamada
- Las fechas/horas se muestran en timezone local de cada participante
- Retry logic con backoff exponencial (1min, 5min, 15min) si falla envío
- Campo `confirmation_sent_at` se actualiza solo tras envío exitoso

---

## Technical Approach

**Chosen approach:** API Route en Next.js + Resend + librería `ics`

**Alternatives considered:**
- Supabase Edge Function: Mayor complejidad de deployment, menos integración con Next.js
- SendGrid: Más establecido pero API más compleja y menos DX

**Why this approach:**
- ✅ API Route permite usar React Email templates type-safe
- ✅ Resend tiene excelente soporte para adjuntos y TypeScript
- ✅ Librería `ics` genera .ics RFC 5545 compliant
- ✅ Mejor testing local (no requiere deploy de Edge Functions)
- ❌ Trade-off: Requiere endpoint expuesto (securizado con API key)

---

## UI/UX Design

**Esta story es 100% backend** - No tiene componentes de UI.

El único output visible es:
- Email recibido por mentor y mentee
- Archivo .ics adjunto que abre en cliente de calendario

**Email Template Design:**
- Estilo: Limpio, profesional, alineado con brand de Upex My Mentor
- Colores: Primary purple (#9333EA) para header y CTAs
- Responsive: Compatible con Gmail, Outlook, Apple Mail

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos de database
- `src/types/index.ts` - Types helpers existentes

**Nuevos tipos a crear:**

```typescript
// src/types/scheduling.ts (agregar a feature-level types)

export interface BookingConfirmationData {
  booking: {
    id: string
    session_date: string        // ISO datetime UTC
    duration_minutes: number
    total_cost: number
    videocall_url: string | null
  }
  mentor: {
    id: string
    name: string
    email: string
    timezone: string           // IANA timezone
  }
  mentee: {
    id: string
    name: string
    email: string
    timezone: string           // IANA timezone
  }
}

export interface CalendarEventData {
  title: string
  description: string
  start: Date
  end: Date
  location?: string
  organizer: { name: string; email: string }
  attendees: { name: string; email: string }[]
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  retryCount: number
}
```

**Directiva:**
- ✅ Todos los helpers usan tipos desde `@/types/scheduling`
- ✅ API route tipada con request/response interfaces
- ✅ Zero type errors en generación de .ics

---

## Content Writing

**Email Subject:**
- Mentee: "Your session with {mentor_name} is confirmed!"
- Mentor: "Your session with {mentee_name} is confirmed!"

**Email Body (template):**
```
Hi {name},

Great news! Your 60-minute mentorship session is confirmed.

When: {day}, {date} at {time} ({timezone})
With: {other_party_name}
Link: {videocall_url}

We've attached a calendar invite to this email.

See you there!
The Upex My Mentor Team
```

**Calendar Event:**
- Title: "Mentorship Session with {name}"
- Description: Session details + videocall link
- Organizer: confirmations@upexmymentor.com

---

## Implementation Steps

### **Step 1: Install Dependencies**

**Task:** Agregar librerías necesarias para email y calendar

**Commands:**
```bash
bun add resend ics date-fns date-fns-tz
bun add -D @types/ics
```

**Details:**
- `resend`: Cliente de email transaccional
- `ics`: Generación de archivos .ics RFC 5545
- `date-fns` + `date-fns-tz`: Manejo de timezones

**Testing:**
- Verificar que las dependencias se instalaron correctamente
- `bun run typecheck` pasa

**Estimated time:** 10 min

---

### **Step 2: Create Scheduling Types**

**Task:** Agregar tipos para booking confirmation y calendar events

**File:** `src/types/scheduling.ts`

**Structure:**
- `BookingConfirmationData`: Datos para generar email
- `CalendarEventData`: Datos para generar .ics
- `EmailSendResult`: Resultado del envío

**Testing:**
- TypeScript compila sin errores

**Estimated time:** 15 min

---

### **Step 3: Create ICS Generator Helper**

**Task:** Implementar generación de archivos .ics

**File:** `src/lib/calendar/generate-ics.ts`

**Logic:**
```typescript
import { createEvent, EventAttributes } from 'ics'
import { formatInTimeZone } from 'date-fns-tz'

export function generateCalendarInvite(data: CalendarEventData): string {
  const event: EventAttributes = {
    title: data.title,
    description: data.description,
    start: [year, month, day, hour, minute],
    duration: { hours: 1 },
    location: data.location,
    organizer: data.organizer,
    attendees: data.attendees.map(a => ({
      name: a.name,
      email: a.email,
      rsvp: true
    }))
  }

  const { error, value } = createEvent(event)
  if (error) throw error
  return value
}
```

**Edge cases handled:**
- DST transitions: Usar IANA timezone IDs
- Invalid dates: Throw descriptive error
- Missing optional fields: Graceful defaults

**Testing:**
- Unit test: Generate .ics for different timezones
- Unit test: Validate .ics format with online validator

**Estimated time:** 45 min

---

### **Step 4: Create Email Templates**

**Task:** Crear templates de email con React Email

**Files:**
- `src/lib/email/templates/booking-confirmation.tsx`

**Structure:**
```tsx
import { Html, Head, Body, Container, Text, Link, Hr } from '@react-email/components'

interface BookingConfirmationEmailProps {
  recipientName: string
  otherPartyName: string
  sessionDate: string      // Formatted in recipient's timezone
  sessionTime: string      // Formatted in recipient's timezone
  timezone: string
  videocallUrl: string | null
}

export function BookingConfirmationEmail(props: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Session Confirmed!</Text>
          <Text>Hi {props.recipientName},</Text>
          <Text>
            Great news! Your 60-minute mentorship session is confirmed.
          </Text>
          {/* ... rest of template */}
        </Container>
      </Body>
    </Html>
  )
}
```

**Testing:**
- Preview email in browser (React Email preview)
- Verify responsive design

**Estimated time:** 30 min

---

### **Step 5: Create Resend Client & Send Function**

**Task:** Configurar cliente de Resend y función de envío con retry

**Files:**
- `src/lib/email/resend.ts`
- `src/lib/email/send-with-retry.ts`

**Logic for retry:**
```typescript
const RETRY_DELAYS = [60000, 300000, 900000] // 1min, 5min, 15min

export async function sendEmailWithRetry(
  emailData: EmailData,
  maxRetries: number = 3
): Promise<EmailSendResult> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(emailData)
      return { success: true, messageId: result.id, retryCount: attempt }
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries) {
        await sleep(RETRY_DELAYS[attempt])
      }
    }
  }

  // Log critical error for admin review
  console.error(`[CRITICAL] Email send failed after ${maxRetries} retries`, lastError)
  return { success: false, error: lastError?.message, retryCount: maxRetries }
}
```

**Environment variables required:**
- `RESEND_API_KEY`: API key de Resend

**Testing:**
- Mock Resend client
- Test retry logic with simulated failures

**Estimated time:** 45 min

---

### **Step 6: Create API Route for Sending Confirmation**

**Task:** Crear endpoint que procesa booking y envía emails

**File:** `src/app/api/email/booking-confirmation/route.ts`

**Logic:**
1. Validate request (API key header)
2. Fetch booking details from database
3. Fetch mentor and mentee profiles
4. Generate .ics for each recipient (in their timezone)
5. Render email template for each recipient
6. Send emails with attachments
7. Update `confirmation_sent_at` in database

**Security:**
- Require `X-API-Key` header matching env variable
- Validate booking ID exists and is confirmed

**Edge cases handled:**
- Booking not found: Return 404
- Booking not confirmed: Return 400
- Email already sent: Return 200 (idempotent)
- Partial failure: Log and continue with second email

**Testing:**
- Integration test: Full flow with test database
- Test with invalid booking ID
- Test idempotency (call twice, only send once)

**Estimated time:** 1.5 hours

---

### **Step 7: Database Migration for Email Tracking**

**Task:** Agregar campos de tracking al esquema de bookings

**Migration:** Usar Supabase MCP para aplicar

**Changes to `bookings` table:**
- Verificar que existe `confirmation_sent_at` (timestamptz, nullable)
- Si no existe, agregarlo

**Note:** Según el schema actual en `supabase.ts`, la tabla bookings NO tiene el campo `confirmation_sent_at`. Necesitamos agregarlo.

**Testing:**
- Migration aplicada exitosamente
- TypeScript types regenerados

**Estimated time:** 20 min

---

### **Step 8: Create Test Endpoint for QA**

**Task:** Endpoint para que QA pueda triggear emails manualmente

**File:** `src/app/api/testing/trigger-confirmation/[bookingId]/route.ts`

**Security:**
- Solo disponible en NODE_ENV !== 'production'
- Require API key

**Testing:**
- QA puede probar sin completar flujo de pago

**Estimated time:** 20 min

---

### **Step 9: Integration Testing**

**Task:** Tests E2E del flujo completo

**Test scenarios:**
1. TC-001: Mentee receives correct email with .ics
2. TC-002: Mentor receives correct email with .ics
3. TC-003: Retry on temporary failure
4. TC-004: Stop retry after 3 failures
5. TC-005: DST handling in .ics

**Manual verification:**
- .ics opens correctly in Gmail
- .ics opens correctly in Outlook
- .ics opens correctly in Apple Calendar

**Estimated time:** 1.5 hours

---

## Technical Decisions (Story-specific)

### Decision 1: React Email vs Plain HTML Templates

**Chosen:** React Email

**Reasoning:**
- ✅ Type-safe props
- ✅ Component reusability
- ✅ Better maintainability
- ❌ Trade-off: Slightly more complex setup

### Decision 2: Single API Route vs Separate Mentor/Mentee Endpoints

**Chosen:** Single endpoint that sends both emails

**Reasoning:**
- ✅ Atomic operation (both or neither)
- ✅ Single transaction for database update
- ❌ Trade-off: Longer execution time, but acceptable for email

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla `bookings` existe (ya existe)
- [ ] Campo `confirmation_sent_at` en bookings (migration requerida)
- [ ] Variable `RESEND_API_KEY` configurada
- [ ] Dominio verificado en Resend para "upexmymentor.com"

**BLOCKER:** Si Resend no está configurado, usar logs como fallback para testing

---

## Risks & Mitigations

**Risk 1:** Resend no configurado en tiempo
- **Impact:** High - No se pueden enviar emails reales
- **Mitigation:** Implementar modo "dry-run" que loggea en lugar de enviar

**Risk 2:** .ics incompatible con algún cliente
- **Impact:** Medium - Usuarios no pueden agregar a calendario
- **Mitigation:** Testing manual en Gmail, Outlook, Apple Calendar antes de deploy

**Risk 3:** Timezone conversion errors
- **Impact:** High - Sesiones en hora incorrecta
- **Mitigation:** Unit tests exhaustivos para conversiones, mostrar ambos timezones

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Install Dependencies | 10 min |
| 2. Create Types | 15 min |
| 3. ICS Generator | 45 min |
| 4. Email Templates | 30 min |
| 5. Resend Client + Retry | 45 min |
| 6. API Route | 1.5 hrs |
| 7. Database Migration | 20 min |
| 8. Test Endpoint | 20 min |
| 9. Integration Testing | 1.5 hrs |
| **Total** | **~6 hours** |

**Story points:** 5 (Medium complexity, mostly backend)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/scheduling`
  - [ ] API route tipada correctamente
  - [ ] Zero type errors
- [ ] **Email functionality**
  - [ ] Mentee recibe email con .ics
  - [ ] Mentor recibe email con .ics
  - [ ] Fechas en timezone local correcto
  - [ ] Retry logic funciona
  - [ ] `confirmation_sent_at` se actualiza
- [ ] **Calendar invite**
  - [ ] .ics válido RFC 5545
  - [ ] Funciona en Gmail
  - [ ] Funciona en Outlook
  - [ ] Funciona en Apple Calendar
  - [ ] Contiene link de videollamada
- [ ] Tests unitarios escritos
  - [ ] generate-ics.ts
  - [ ] send-with-retry.ts
  - [ ] Timezone conversions
- [ ] Tests de integración pasando
  - [ ] API route con mock data
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Deployed to staging
- [ ] Manual test: Trigger email y verificar en inbox

---

**Creado:** 2025-12-08
**Developer:** Claude Code
**Story Jira Key:** MYM-22
