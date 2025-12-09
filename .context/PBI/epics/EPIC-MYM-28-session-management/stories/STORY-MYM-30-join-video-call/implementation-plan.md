# Implementation Plan: STORY-MYM-30 - Join Video Call

**Fecha:** 2025-12-08
**Developer:** AI-Generated
**Story Jira Key:** MYM-30
**Epic:** EPIC-MYM-28 - Session Management
**Status:** Ready for Implementation

---

## Overview

Implementar la funcionalidad de "Join Video Call" que permite a usuarios (mentores y mentees) unirse a la videollamada de su sesión programada mediante un botón que aparece 15 minutos antes del inicio.

**Acceptance Criteria a cumplir:**
- Usuario puede ver botón "Unirse a la Llamada" 15 minutos antes de la sesión
- Al hacer click, se abre nueva pestaña con el enlace de Daily.co
- API valida que el usuario es participante de la sesión
- API valida que el tiempo está dentro de la ventana permitida (15 min antes - 1h después)
- Manejo de errores cuando el enlace no está disponible

---

## Technical Approach

**Chosen approach:** Componente cliente `JoinCallButton` con validación híbrida (frontend + backend)

**Alternatives considered:**
- **Solo validación frontend:** Inseguro, usuarios podrían manipular el reloj
- **Solo validación backend:** Mala UX, botón siempre visible pero falla al hacer click
- **Server Component con refresh:** Requiere reload constante, mala UX

**Why this approach:**
- ✅ UX fluida: botón aparece/desaparece según tiempo local
- ✅ Seguridad: backend es autoridad final
- ✅ Resiliente a clocks desincronizados
- ❌ Trade-off: Doble lógica de tiempo (frontend y backend)

---

## UI/UX Design

**Design System:** `.context/design-system.md`
**Estilo Visual:** Moderno/Bold (Purple palette)

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ `Button` → `variant: "default"` para Join Call activo
- ✅ `Button` → `variant: "outline"` + `disabled` para estado temprano
- ✅ `Card` → Contenedor de SessionCard (del Epic)
- ✅ `Badge` → Status indicator

### Componentes custom a crear:

**1. JoinCallButton**
- **Propósito:** Botón con lógica temporal para unirse a videollamada
- **Props:**
  ```typescript
  interface JoinCallButtonProps {
    bookingId: string
    sessionDate: Date
    videocallUrl: string | null
    className?: string
  }
  ```
- **Diseño:**
  - Estado activo: `bg-primary` con icono Video, pulso sutil
  - Estado temprano: `outline` disabled con tooltip
  - Estado expirado: Hidden o "Sesión Finalizada"
- **Ubicación:** `src/components/sessions/join-call-button.tsx`

### Estados de UI:

| Estado | Condición | Apariencia |
|--------|-----------|------------|
| **Too Early** | `now < session - 15min` | Button outline disabled + tooltip "Disponible 15 min antes" |
| **Available** | `session - 15min <= now <= session + duration + 1h` | Button primary + icono Video + texto "Unirse a la Llamada" |
| **Expired** | `now > session + duration + 1h` | Hidden o Badge "Sesión Finalizada" |
| **No Link** | `videocall_url === null` | Button disabled + "Enlace no disponible" |
| **Loading** | Durante API call | Button con spinner |
| **Error** | API rechaza request | Toast con mensaje de error |

### Wireframe del botón en contexto:

```
┌─────────────────────────────────────────────────────────┐
│  SessionCard                                            │
│  ┌──────┐                                               │
│  │Avatar│  Carlos Rodriguez                             │
│  └──────┘  Senior Full-Stack Architect                  │
│                                                         │
│  📅 Viernes, 15 Nov 2025 • 10:00 AM (tu hora local)    │
│  ⏱️  60 minutos                                         │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────┐     │
│  │ 📹 Unirse a Llamada  │  │  Cancelar Sesión    │     │
│  └──────────────────────┘  └─────────────────────┘     │
│        ↑ primary             ↑ destructive outline      │
└─────────────────────────────────────────────────────────┘
```

### Personalidad UI/UX (Bold/Moderno):

- ✅ Sombras pronunciadas en hover: `hover:shadow-lg`
- ✅ Bordes redondeados: `rounded-lg`
- ✅ Transiciones suaves: `transition-all duration-200`
- ✅ Efecto pulse cuando está disponible: `animate-pulse` sutil en borde
- ✅ Icono Video: `<Video className="h-4 w-4 mr-2" />`

---

## Types & Type Safety

**Tipos a usar/crear:**

```typescript
// src/lib/types/booking.ts (o agregar a types.ts existente)

import type { Database } from './database.types'

export type Booking = Database['public']['Tables']['bookings']['Row']

export type BookingWithParticipants = Booking & {
  mentor: {
    id: string
    name: string
    photo_url: string | null
    email: string
  }
  student: {
    id: string
    name: string
    photo_url: string | null
    email: string
  }
}

// Para el API response
export interface VideoLinkResponse {
  success: true
  url: string
}

export interface VideoLinkError {
  success: false
  error: 'TOO_EARLY_TO_JOIN' | 'SESSION_EXPIRED' | 'NOT_A_PARTICIPANT' | 'LINK_NOT_AVAILABLE'
  message: string
}

export type VideoLinkResult = VideoLinkResponse | VideoLinkError
```

---

## Content Writing

**Vocabulario del dominio:**
- "Sesión" (no meeting/reunión)
- "Unirse a la Llamada" (no Join Call)
- "Mentor" / "Mentee"

**Textos específicos:**

| Ubicación | Texto |
|-----------|-------|
| Button activo | "Unirse a la Llamada" |
| Tooltip temprano | "Disponible 15 minutos antes de la sesión" |
| Error no participant | "No tienes acceso a esta sesión" |
| Error too early | "Aún es muy temprano para unirse" |
| Error expired | "Esta sesión ya finalizó" |
| Error no link | "El enlace de video no está disponible. Contacta a soporte." |
| Loading | "Conectando..." |

---

## Implementation Steps

### **Step 1: Crear utilidades de fecha para lógica temporal**

**Task:** Crear funciones helper para cálculos de tiempo de sesión

**File:** `src/lib/date-utils.ts`

**Functions to create:**
```typescript
// Verifica si estamos en ventana de join (15 min antes hasta 1h después del fin)
export function isWithinJoinWindow(sessionDate: Date, durationMinutes: number): boolean

// Calcula tiempo restante hasta que se pueda unir
export function getTimeUntilJoinable(sessionDate: Date): string | null

// Verifica si la sesión ya expiró (1h después del fin)
export function isSessionExpired(sessionDate: Date, durationMinutes: number): boolean

// Formatea fecha para mostrar en UI
export function formatSessionDate(date: Date): string
```

**Details:**
- Usar `date-fns` para manipulación de fechas
- Todas las comparaciones en UTC
- Considerar duration_minutes del booking

**Testing:**
- Unit tests con diferentes escenarios de tiempo
- Edge cases: exactamente 15 min antes, exactamente al finalizar

**Estimated time:** 30 min

---

### **Step 2: Crear API Route para obtener video link**

**Task:** Crear endpoint que valida permisos y tiempo, retorna URL

**File:** `src/app/api/bookings/[id]/video-link/route.ts`

**Logic:**
1. Obtener user de sesión (auth)
2. Fetch booking por ID con Supabase
3. Validar: usuario es mentor_id o student_id
4. Validar: tiempo dentro de ventana (15 min antes - 1h después fin)
5. Validar: videocall_url existe
6. Retornar URL o error apropiado

**Response codes:**
- `200 OK`: `{ success: true, url: string }`
- `403 Forbidden`: NOT_A_PARTICIPANT, TOO_EARLY_TO_JOIN
- `404 Not Found`: Booking no existe
- `410 Gone`: SESSION_EXPIRED
- `503 Service Unavailable`: LINK_NOT_AVAILABLE (videocall_url null)

**Edge cases handled:**
- Usuario no autenticado → 401
- Booking no existe → 404
- Usuario no es participante → 403
- Muy temprano → 403 con código específico
- Sesión expirada → 410
- URL null → 503

**Testing:**
- Test con usuario participante en ventana válida
- Test con usuario no participante
- Test antes de ventana
- Test después de expiración

**Estimated time:** 45 min

---

### **Step 3: Crear componente JoinCallButton**

**Task:** Crear componente cliente con lógica de UI y llamada a API

**File:** `src/components/sessions/join-call-button.tsx`

**Structure:**
```typescript
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Video, Loader2 } from 'lucide-react'
import { isWithinJoinWindow, isSessionExpired, getTimeUntilJoinable } from '@/lib/date-utils'
import { toast } from 'sonner' // o el toast system del proyecto

interface JoinCallButtonProps {
  bookingId: string
  sessionDate: Date
  durationMinutes: number
  videocallUrl: string | null
  className?: string
}

export function JoinCallButton({ ... }: JoinCallButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute for UI reactivity
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Determine button state based on time
  const canJoin = isWithinJoinWindow(sessionDate, durationMinutes)
  const isExpired = isSessionExpired(sessionDate, durationMinutes)
  const timeUntilJoin = getTimeUntilJoinable(sessionDate)

  // Handle click - validate via API and open in new tab
  async function handleJoinClick() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/video-link`)
      const data = await response.json()

      if (data.success) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Error al conectar. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Render based on state
  if (isExpired) return null // or Badge "Sesión Finalizada"

  if (!canJoin) {
    return (
      <Button variant="outline" disabled title={`Disponible ${timeUntilJoin}`}>
        <Video className="h-4 w-4 mr-2" />
        Unirse a la Llamada
      </Button>
    )
  }

  return (
    <Button onClick={handleJoinClick} disabled={isLoading || !videocallUrl}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Video className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Conectando...' : 'Unirse a la Llamada'}
    </Button>
  )
}
```

**States:**
- Disabled (too early): outline + tooltip
- Enabled: primary + Video icon
- Loading: spinner + "Conectando..."
- No URL: disabled + different message

**Testing:**
- Render tests para cada estado
- Click handler mock

**Estimated time:** 1 hour

---

### **Step 4: Integrar en SessionCard (preparación para MYM-29)**

**Task:** Crear/actualizar SessionCard para incluir JoinCallButton

**Note:** MYM-29 (Session Dashboard) creará el SessionCard completo. Esta story solo prepara la integración del botón.

**File:** `src/components/sessions/session-card.tsx` (crear si no existe)

**Minimal structure for this story:**
```typescript
import { JoinCallButton } from './join-call-button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { BookingWithParticipants } from '@/lib/types'

interface SessionCardProps {
  booking: BookingWithParticipants
  currentUserId: string
}

export function SessionCard({ booking, currentUserId }: SessionCardProps) {
  const otherParticipant = booking.mentor_id === currentUserId
    ? booking.student
    : booking.mentor

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        {/* Avatar + Name - minimal for now */}
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="font-semibold">{otherParticipant.name}</div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Date/time display */}
        <p className="text-muted-foreground mb-4">
          {formatSessionDate(new Date(booking.session_date))}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <JoinCallButton
            bookingId={booking.id}
            sessionDate={new Date(booking.session_date)}
            durationMinutes={booking.duration_minutes}
            videocallUrl={booking.videocall_url}
          />
          {/* Cancel button will be added by MYM-31 */}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Estimated time:** 30 min

---

### **Step 5: Testing E2E**

**Task:** Crear test E2E para flujo de Join Call

**File:** `tests/e2e/join-video-call.spec.ts` (o ubicación según proyecto)

**Test scenarios:**
1. Usuario ve botón disabled cuando falta >15 min
2. Usuario ve botón enabled cuando está en ventana
3. Click en botón abre nueva pestaña con URL correcta
4. Usuario no participante recibe error

**Note:** Para E2E, necesitamos seedear un booking en la DB con una session_date cercana. Puede requerir mock de tiempo o booking con fecha específica.

**Estimated time:** 1 hour

---

### **Step 6: Documentation and Cleanup**

**Task:** Actualizar documentación y limpiar código

**Details:**
- Agregar JSDoc a funciones de date-utils
- Agregar comentarios en API route para lógica de validación
- Verificar imports y exports
- Run linting y fix issues

**Estimated time:** 15 min

---

## Technical Decisions (Story-specific)

### Decision 1: Polling vs Real-time para actualización de botón

**Chosen:** Polling simple (setInterval cada 60s)

**Reasoning:**
- ✅ Simple de implementar
- ✅ No requiere WebSocket/Supabase Realtime
- ✅ Suficiente precisión (1 min es aceptable)
- ❌ Trade-off: Pequeño delay en cambio de estado (max 60s)

### Decision 2: Abrir en nueva pestaña vs modal/embed

**Chosen:** Nueva pestaña (`window.open`)

**Reasoning:**
- ✅ Experiencia de video completa (pantalla dedicada)
- ✅ No requiere integración de SDK de Daily.co
- ✅ Funciona en todos los browsers
- ❌ Trade-off: Usuario sale de la plataforma temporalmente

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla `bookings` con columna `videocall_url` (ya existe en DB)
- [x] Auth context funcionando (ya existe)
- [x] Design system components (Button, Card) (ya existen)
- [ ] `date-fns` instalado (verificar, probablemente ya está)
- [ ] Toast system configurado (sonner o similar)

**Dependencias con otras stories:**
- MYM-29 (Session Dashboard): Proveerá la página donde se muestra el botón
- Este botón puede desarrollarse independientemente y luego integrarse

---

## Risks & Mitigations

**Risk 1:** Clock drift entre cliente y servidor
- **Impact:** Medium - Botón aparece en momento incorrecto
- **Mitigation:** Backend es autoridad final; UI es solo UX hint

**Risk 2:** videocall_url es null (Daily.co falló al crear room)
- **Impact:** High - Usuario no puede unirse a sesión pagada
- **Mitigation:**
  - UI muestra mensaje claro de error
  - Botón "Contactar Soporte" visible
  - Logging para alertar al equipo

**Risk 3:** Usuario abre múltiples pestañas
- **Impact:** Low - Múltiples conexiones a la misma sala
- **Mitigation:** Daily.co maneja esto naturalmente; no es blocker

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Date utilities | 30 min |
| 2. API Route | 45 min |
| 3. JoinCallButton component | 1 hour |
| 4. SessionCard integration | 30 min |
| 5. E2E Testing | 1 hour |
| 6. Documentation | 15 min |
| **Total** | **4 hours** |

**Story points:** 3 (Medium complexity, clear scope)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] `BookingWithParticipants` type creado/usado
  - [ ] Props de JoinCallButton tipadas
  - [ ] API response types definidos
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada (Bold/Moderno)**
  - [ ] `rounded-lg` en botones
  - [ ] `hover:shadow-lg` en cards
  - [ ] Transiciones suaves (`transition-all`)
  - [ ] Icono Video de Lucide usado
- [ ] **Content Writing contextual**
  - [ ] "Unirse a la Llamada" (no "Join Call")
  - [ ] Mensajes de error en español y claros
  - [ ] Tooltip informativo
- [ ] Tests unitarios escritos
  - [ ] date-utils functions (>90% coverage)
  - [ ] JoinCallButton render states
- [ ] Tests de integración
  - [ ] API route con diferentes scenarios
- [ ] Tests E2E (referencia: test-cases.md)
  - [ ] TC-001: Join button visible in window
  - [ ] TC-002: Click opens correct URL
  - [ ] TC-003: Button disabled before window
  - [ ] TC-007: Non-participant rejected
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Deployed to staging
- [ ] Manual smoke test en staging
  - [ ] Botón visible en momento correcto
  - [ ] Click abre Daily.co en nueva pestaña
  - [ ] UI responsive en mobile

---

*Generado automáticamente - Claude Code*
*Última actualización: 2025-12-08*
