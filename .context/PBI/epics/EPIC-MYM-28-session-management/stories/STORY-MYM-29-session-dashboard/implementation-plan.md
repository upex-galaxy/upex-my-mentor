# Implementation Plan: STORY-MYM-29 - Session Dashboard

**Fecha:** 2025-12-08
**Developer:** Claude Code
**Branch:** `feat/MYM-29/session-dashboard`
**Status:** Ready for Implementation

---

## Overview

Implementar página dedicada de sesiones donde usuarios (mentores y mentees) pueden ver sus sesiones próximas y pasadas en tabs separados.

**Acceptance Criteria a cumplir:**
- Usuario ve dos listas distintas: "Sesiones Próximas" y "Sesiones Pasadas"
- Cada item muestra: nombre del otro participante, fecha y hora de la sesión
- Usuario logueado puede navegar a `/dashboard/sessions`

**Referencia:** Feature Implementation Plan del Epic MYM-28

---

## Technical Approach

**Chosen approach:** Página Server Component con Client Islands para interactividad

**Alternatives considered:**
- Client-side only: Requiere más JS, peor performance inicial
- ISR/Static: No funciona bien con datos dinámicos por usuario

**Why this approach:**
- ✅ Fetch inicial en server = mejor LCP
- ✅ SEO/SSR benefits para páginas autenticadas
- ✅ Client components solo donde hay interactividad (tabs)
- ❌ Trade-off: Requiere refetch para actualizar datos

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md`
**Estilo visual:** Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ Card → Contenedor de cada sesión
- ✅ Badge → Status de la sesión (confirmed, completed, cancelled)
- ✅ Button → CTAs (Ver detalles, Explorar Mentores)
- ✅ Avatar → Foto del otro participante (implementar con Image)

**Componentes a instalar (shadcn):**
- 🆕 Tabs → Para alternar entre Próximas/Pasadas

### Componentes custom a crear:

**1. SessionCard**
- **Propósito:** Mostrar información resumida de una sesión individual
- **Props:**
  - `session`: BookingWithParticipant
  - `currentUserRole`: 'student' | 'mentor'
- **Diseño:** Card horizontal con avatar, nombre, fecha/hora, duración, badge de status
- **Ubicación:** `src/components/sessions/session-card.tsx`

**2. SessionEmptyState**
- **Propósito:** Estado vacío con CTA contextual
- **Props:**
  - `tab`: 'upcoming' | 'past'
  - `userRole`: 'student' | 'mentor'
- **Diseño:** Icono + mensaje + botón CTA
- **Ubicación:** `src/components/sessions/session-empty-state.tsx`

**3. SessionsTabs (Client Component)**
- **Propósito:** Tabs interactivos para filtrar sesiones
- **Props:**
  - `upcomingSessions`: BookingWithParticipant[]
  - `pastSessions`: BookingWithParticipant[]
  - `currentUserRole`: 'student' | 'mentor'
- **Ubicación:** `src/app/dashboard/sessions/_components/sessions-tabs.tsx`

### Wireframe/Layout:

```
┌──────────────────────────────────────────────────────────────┐
│ Header: Gradiente purple-50 → violet-50                      │
│   "Mis Sesiones"                                             │
│   "Gestiona tus sesiones de mentoría"                        │
├──────────────────────────────────────────────────────────────┤
│ Tabs: [Próximas] [Pasadas]                                   │
├──────────────────────────────────────────────────────────────┤
│ Tab Content:                                                 │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ SessionCard                                          │   │
│   │   [Avatar] Nombre Participante                       │   │
│   │            15 dic, 10:00 • 60 min      [confirmed]   │   │
│   └──────────────────────────────────────────────────────┘   │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ SessionCard                                          │   │
│   │   [Avatar] Nombre Participante                       │   │
│   │            20 dic, 14:00 • 45 min      [confirmed]   │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   -- OR if empty: --                                         │
│   ┌──────────────────────────────────────────────────────┐   │
│   │              [Calendar Icon]                         │   │
│   │  No tienes sesiones programadas                      │   │
│   │  ¿Listo para tu primera mentoría?                    │   │
│   │           [Explorar Mentores]                        │   │
│   └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton cards mientras carga (3 placeholders)
- **Empty (Upcoming):** "No tienes sesiones programadas" + CTA "Explorar Mentores"
- **Empty (Past):** "Aún no has completado ninguna sesión"
- **Success:** Lista de SessionCards

### Responsividad:

- **Mobile (< 768px):** Cards full width, stacked
- **Desktop (≥ 768px):** Cards full width con más padding

### Paleta aplicada:

- Header gradient: `bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50`
- Tabs active: `bg-primary text-primary-foreground`
- Status badges:
  - confirmed: `variant="default"` (primary)
  - completed: `variant="secondary"`
  - cancelled: `variant="destructive"`
- Cards: `hover:shadow-lg transition-shadow`

---

## Types & Type Safety

**Tipos a definir en `src/lib/types/sessions.ts`:**

```typescript
import type { Database } from './database.types'

// Base booking type from Supabase
type BookingRow = Database['public']['Tables']['bookings']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Participant info (subset of profile)
export interface SessionParticipant {
  id: string
  name: string | null
  photo_url: string | null
  email: string
}

// Booking with joined participant data
export interface BookingWithParticipant extends BookingRow {
  mentor: SessionParticipant
  student: SessionParticipant
}

// Tab options
export type SessionTab = 'upcoming' | 'past'

// Booking status enum for type safety
export type BookingStatus = 'provisional' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
```

**Nota:** Importar tipos desde el schema de Supabase si existe `database.types.ts`, de lo contrario definir inline.

---

## Content Writing

**Vocabulario del dominio:**
- "Sesiones" (no "reuniones" o "meetings")
- "Mentor" y "Mentee" / "Estudiante"
- "Próximas" y "Pasadas" (tabs)

**Textos contextuales:**

| Ubicación | Texto |
|-----------|-------|
| Page title | "Mis Sesiones" |
| Page subtitle | "Gestiona tus sesiones de mentoría" |
| Tab 1 | "Próximas" |
| Tab 2 | "Pasadas" |
| Empty upcoming (student) | "No tienes sesiones programadas. ¿Listo para tu primera mentoría?" |
| Empty upcoming (mentor) | "No tienes sesiones programadas. Tus estudiantes aparecerán aquí." |
| Empty past | "Aún no has completado ninguna sesión" |
| CTA button | "Explorar Mentores" |
| Duration format | "{X} min" |

---

## Implementation Steps

### **Step 1: Instalar componente Tabs de shadcn**

**Task:** Agregar el componente Tabs al proyecto

**Details:**
```bash
bunx shadcn@latest add tabs
```

**Files created:**
- `src/components/ui/tabs.tsx`

**Estimated time:** 2 min

---

### **Step 2: Crear tipos de sesiones**

**Task:** Definir tipos TypeScript para sesiones

**File:** `src/lib/types/sessions.ts`

**Structure:**
- `SessionParticipant`: Subset de profile para mostrar en cards
- `BookingWithParticipant`: Booking con mentor y student populados
- `SessionTab`: Union type 'upcoming' | 'past'
- `BookingStatus`: Union type de los status válidos

**Estimated time:** 5 min

---

### **Step 3: Crear componente SessionCard**

**Task:** Card reutilizable para mostrar una sesión

**File:** `src/components/sessions/session-card.tsx`

**Props:**
```typescript
interface SessionCardProps {
  session: BookingWithParticipant
  currentUserRole: 'student' | 'mentor'
  className?: string
}
```

**Structure:**
- Avatar del otro participante (mentor si soy student, student si soy mentor)
- Nombre del participante
- Fecha/hora formateada con `formatSessionDateShort()`
- Duración en minutos
- Badge con status

**Edge cases:**
- Nombre null: Mostrar "Usuario" como fallback
- Avatar null: Mostrar inicial del nombre
- Status cancelled: Mostrar badge destructive

**Testing:**
- Unit test: Renderiza correctamente con datos completos
- Unit test: Muestra fallbacks cuando datos son null

**Estimated time:** 20 min

---

### **Step 4: Crear componente SessionEmptyState**

**Task:** Estado vacío contextual según tab y rol

**File:** `src/components/sessions/session-empty-state.tsx`

**Props:**
```typescript
interface SessionEmptyStateProps {
  tab: 'upcoming' | 'past'
  userRole: 'student' | 'mentor'
}
```

**Logic:**
- Tab "upcoming" + student: Mostrar CTA "Explorar Mentores"
- Tab "upcoming" + mentor: Solo mensaje informativo
- Tab "past": Mensaje neutral sin CTA

**Estimated time:** 10 min

---

### **Step 5: Crear componente SessionsTabs (Client)**

**Task:** Componente interactivo con tabs

**File:** `src/app/dashboard/sessions/_components/sessions-tabs.tsx`

**Directive:** `"use client"`

**Props:**
```typescript
interface SessionsTabsProps {
  upcomingSessions: BookingWithParticipant[]
  pastSessions: BookingWithParticipant[]
  currentUserRole: 'student' | 'mentor'
}
```

**Structure:**
- Tabs con Radix/shadcn
- TabsList con "Próximas" y "Pasadas"
- TabsContent renderiza lista de SessionCard o SessionEmptyState

**Estimated time:** 15 min

---

### **Step 6: Crear página /dashboard/sessions**

**Task:** Server Component principal

**File:** `src/app/dashboard/sessions/page.tsx`

**Logic:**
1. Verificar autenticación (redirect a /login si no auth)
2. Obtener profile del usuario
3. Fetch bookings donde user es mentor_id O student_id
4. Particionar en upcoming (session_date > now) y past
5. Renderizar header + SessionsTabs

**Supabase Query:**
```typescript
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    mentor:profiles!mentor_id(id, name, photo_url, email),
    student:profiles!student_id(id, name, photo_url, email)
  `)
  .or(`mentor_id.eq.${userId},student_id.eq.${userId}`)
  .in('status', ['confirmed', 'completed', 'cancelled'])
  .order('session_date', { ascending: false })
```

**Edge cases:**
- Usuario sin bookings: Mostrar empty state
- Error de DB: Log error y mostrar mensaje genérico

**Estimated time:** 25 min

---

### **Step 7: Agregar link en dashboard existente**

**Task:** Conectar el dashboard principal con la nueva página

**File:** `src/app/dashboard/page.tsx`

**Changes:**
- Agregar link/botón "Ver todas las sesiones" en la card de "Sesiones Próximas"
- Mantener la preview de 3 sesiones, pero con link a la vista completa

**Estimated time:** 5 min

---

### **Step 8: Verificar build y linting**

**Task:** Asegurar que todo compila sin errores

**Commands:**
```bash
bun run lint
bun run build
```

**Fix any issues found**

**Estimated time:** 10 min

---

## Technical Decisions (Story-specific)

### Decision 1: Particionar sesiones en frontend vs backend

**Chosen:** Frontend (en el Server Component)

**Reasoning:**
- ✅ Una sola query a DB
- ✅ Lógica simple de Date comparison
- ✅ Permite memoizar el split
- ❌ Trade-off: Si hay muchas sesiones, se traen todas

### Decision 2: Status a mostrar

**Chosen:** Solo mostrar sesiones con status `confirmed`, `completed`, `cancelled`

**Reasoning:**
- `provisional` y `pending_payment` son estados transitorios
- No tiene sentido mostrar sesiones que aún no están confirmadas
- Evita confusión al usuario

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla `bookings` existe en Supabase
- [x] Tabla `profiles` existe con campos name, photo_url
- [x] `date-utils.ts` existe con funciones de formateo
- [ ] Componente Tabs instalado (Step 1)

**No blockers identificados**

---

## Risks & Mitigations

**Risk 1:** Performance con muchas sesiones
- **Impact:** Medium
- **Likelihood:** Low (MVP con pocos usuarios)
- **Mitigation:** Agregar paginación en iteración futura si necesario

**Risk 2:** Timezone confusion
- **Impact:** Medium
- **Likelihood:** Medium
- **Mitigation:** Usar date-fns con locale `es`, mostrar tiempo relativo

---

## Estimated Effort

| Step | Task | Time |
|------|------|------|
| 1 | Instalar Tabs shadcn | 2 min |
| 2 | Crear tipos de sesiones | 5 min |
| 3 | Crear SessionCard | 20 min |
| 4 | Crear SessionEmptyState | 10 min |
| 5 | Crear SessionsTabs | 15 min |
| 6 | Crear página /dashboard/sessions | 25 min |
| 7 | Agregar link en dashboard | 5 min |
| 8 | Verificar build y linting | 10 min |
| **Total** | | **~1.5 horas** |

**Story points:** 3 (Medium complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] Usuario ve "Próximas" y "Pasadas" como tabs separados
  - [ ] Cada sesión muestra nombre, fecha, hora del participante
  - [ ] Navegación funciona a `/dashboard/sessions`
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde tipos definidos
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada**
  - [ ] Estilo Moderno/Bold (sombras pronunciadas, bordes redondeados)
  - [ ] Paleta purple/violet aplicada
  - [ ] Hover effects con transitions
- [ ] **Content Writing contextual**
  - [ ] Vocabulario "Sesión", "Mentor", "Mentee"
  - [ ] Sin placeholders genéricos
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` pasa
  - [ ] `bun run build` pasa
- [ ] Tests referenciados en test-cases.md:
  - [ ] TC-MYM-29-01: Dashboard displays upcoming and past sessions
  - [ ] TC-MYM-29-02: Session card details
  - [ ] TC-MYM-29-03: Empty state for new user

---

*Generado por Claude Code - 2025-12-08*
