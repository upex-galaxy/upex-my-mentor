# Implementation Plan: STORY-MYM-20 - Timezone Conversion for Availability

## Overview

Implementar la funcionalidad de conversión de zona horaria para que los mentees vean la disponibilidad de los mentores en su propia zona horaria local, evitando confusiones al reservar sesiones.

**Acceptance Criteria a cumplir:**
- El sistema detecta automáticamente la zona horaria del navegador del mentee
- La disponibilidad del mentor (almacenada en UTC) se convierte y muestra en la zona horaria del mentee
- El mentee puede ver claramente en qué zona horaria se están mostrando los horarios

---

## Technical Approach

**Chosen approach:** Client-side timezone detection + conversion using `date-fns-tz`

**Alternatives considered:**
- Server-side conversion: Requiere enviar timezone en cada request, más complejo
- `moment-timezone`: Librería más pesada, `date-fns-tz` es más moderna y tree-shakeable

**Why this approach:**
- ✅ `date-fns-tz` ya está instalado en el proyecto
- ✅ Offloads conversion al cliente, reduciendo carga del servidor
- ✅ Permite detección automática sin input del usuario
- ✅ Alineado con decisión técnica del `feature-implementation-plan.md`
- ❌ Trade-off: Depende de la API de internacionalización del navegador

---

## UI/UX Design

**Design System:** `.context/design-system.md`
**Estilo Visual:** Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

- ✅ `Badge` → Indicador de timezone actual
- ✅ `Button` → Potencial selector de timezone
- ✅ `Card` → Contenedor para información de timezone

### Componentes custom a crear:

**1. TimezoneIndicator**
- **Propósito:** Mostrar la zona horaria detectada del usuario con opción de ver la del mentor
- **Props:** `userTimezone: string`, `mentorTimezone?: string`, `showMentorTime?: boolean`
- **Diseño:** Badge con ícono de globo + texto de timezone
- **Ubicación:** `src/components/scheduling/timezone-indicator.tsx`

### Estados de UI:

- **Loading:** Spinner mientras se detecta timezone
- **Detected:** Badge con timezone detectada
- **Dual display:** Cuando se muestran ambas timezones (mentor + mentee)

### Paleta aplicada:

- Timezone badge: `bg-accent/10 text-accent` (highlight suave)
- Timezone icon: `text-muted-foreground`
- Timezone text: `text-sm text-foreground`

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/scheduling.ts` - Ya tiene tipos para email/calendar
- `src/types/supabase.ts` - Tipos de DB

**Nuevos tipos a agregar en `src/types/scheduling.ts`:**

```typescript
// MYM-20: Timezone Conversion Types
export interface TimezoneInfo {
  timezone: string           // IANA timezone (e.g., "America/New_York")
  abbreviation: string       // e.g., "EST", "PST"
  offset: string             // e.g., "UTC-5", "UTC+0"
  displayName: string        // e.g., "Eastern Standard Time"
}

export interface TimeDisplay {
  utcTime: Date              // Original UTC time
  localTime: string          // Formatted in user's timezone
  timezone: string           // User's timezone
  mentorTime?: string        // Formatted in mentor's timezone (optional)
  mentorTimezone?: string    // Mentor's timezone (optional)
}

export interface TimezoneIndicatorProps {
  userTimezone: string
  mentorTimezone?: string
  showBothTimezones?: boolean
  className?: string
}
```

---

## Implementation Steps

### **Step 1: Create Timezone Utility Functions**

**Task:** Crear helpers para detección y conversión de timezones

**File:** `src/lib/timezone/index.ts`

**Functions to implement:**
- `detectUserTimezone(): string` - Detecta timezone del navegador
- `formatInTimezone(date: Date, timezone: string, format: string): string` - Formatea fecha en timezone específica
- `getTimezoneAbbreviation(timezone: string): string` - Obtiene abreviación (EST, PST)
- `getTimezoneOffset(timezone: string): string` - Obtiene offset (UTC-5)
- `convertToTimezone(date: Date, fromTz: string, toTz: string): Date` - Convierte entre timezones

**Dependencies:**
- `date-fns` (ya instalado)
- `date-fns-tz` (ya instalado)

**Testing:**
- Unit tests para cada función con casos edge (DST transitions, diferentes zonas)

**Estimated time:** 45 min

---

### **Step 2: Add Timezone Types**

**Task:** Agregar tipos de timezone al archivo de tipos existente

**File:** `src/types/scheduling.ts`

**Types to add:**
- `TimezoneInfo`
- `TimeDisplay`
- `TimezoneIndicatorProps`

**Testing:**
- TypeScript compilation check

**Estimated time:** 15 min

---

### **Step 3: Create TimezoneIndicator Component**

**Task:** Crear componente visual para mostrar timezone

**File:** `src/components/scheduling/timezone-indicator.tsx`

**Structure:**
```tsx
<div className="flex items-center gap-2">
  <Globe className="h-4 w-4 text-muted-foreground" />
  <Badge variant="outline" className="bg-accent/10">
    {timezone} ({offset})
  </Badge>
  {showMentorTime && (
    <span className="text-xs text-muted-foreground">
      • Mentor: {mentorTimezone}
    </span>
  )}
</div>
```

**Edge cases handled:**
- Timezone inválida: Fallback a UTC
- Componente server vs client: Usar `"use client"` directive

**Testing:**
- Render test con diferentes timezones
- Visual regression test

**Estimated time:** 30 min

---

### **Step 4: Create useTimezone Hook**

**Task:** Hook para gestionar timezone del usuario en React

**File:** `src/hooks/use-timezone.ts`

**Logic:**
```typescript
export function useTimezone() {
  const [timezone, setTimezone] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detected = detectUserTimezone()
    setTimezone(detected)
    setIsLoading(false)
  }, [])

  return { timezone, isLoading, setTimezone }
}
```

**Testing:**
- Hook test con mock de Intl.DateTimeFormat

**Estimated time:** 20 min

---

### **Step 5: Update BookingSummaryCard**

**Task:** Integrar timezone display en el resumen de booking

**File:** `src/components/checkout/booking-summary-card.tsx`

**Changes:**
1. Import `useTimezone` hook
2. Import `formatInTimezone` utility
3. Add `TimezoneIndicator` component
4. Update date/time display to use timezone functions
5. Show time in user's timezone with indicator

**Before:**
```tsx
const dateFormatted = date.toLocaleDateString('en-US', {...})
const timeFormatted = date.toLocaleTimeString('en-US', {...})
```

**After:**
```tsx
const { timezone } = useTimezone()
const dateFormatted = formatInTimezone(date, timezone, 'EEEE, MMMM d, yyyy')
const timeFormatted = formatInTimezone(date, timezone, 'h:mm a')
```

**Testing:**
- Component test con mock timezone
- E2E test simulating different browser timezones

**Estimated time:** 30 min

---

### **Step 6: Update Session Card (Sessions Dashboard)**

**Task:** Integrar timezone display en las cards de sesiones

**File:** `src/components/sessions/session-card.tsx`

**Changes:**
- Similar al Step 5: usar `useTimezone` y `formatInTimezone`
- Agregar `TimezoneIndicator` discreto

**Estimated time:** 20 min

---

### **Step 7: Integration & E2E Testing**

**Task:** Verificar flujo completo de timezone conversion

**Test scenarios:**
1. Usuario en NYC ve sesión en horario local
2. Mentor en London, mentee en Tokyo - verificar conversión correcta
3. DST transition handling

**E2E Test (Playwright):**
```typescript
test('shows session time in user timezone', async ({ page }) => {
  // Set browser timezone to specific zone
  await page.emulateTimezone('America/New_York')
  await page.goto('/checkout/[bookingId]')

  // Verify timezone indicator shows EST
  await expect(page.getByTestId('timezone_indicator'))
    .toContainText('EST')
})
```

**Estimated time:** 45 min

---

## Technical Decisions

### Decision 1: UTC Storage, Client Display Conversion

**Chosen:** All dates stored as UTC in PostgreSQL, converted to user timezone only for display

**Reasoning:**
- ✅ Single source of truth in DB
- ✅ No timezone data corruption
- ✅ Easy to compare dates server-side
- ❌ Trade-off: Every display needs conversion

### Decision 2: Intl API for Detection

**Chosen:** Use native `Intl.DateTimeFormat().resolvedOptions().timeZone`

**Reasoning:**
- ✅ No additional library needed
- ✅ Supported in all modern browsers
- ✅ Returns IANA timezone string directly
- ❌ Trade-off: Not available in older browsers (IE11)

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] `date-fns` instalado
- [x] `date-fns-tz` instalado
- [x] `bookings` table con `session_date` as `timestamptz`
- [ ] Componente `BookingSummaryCard` existe (MYM-24) ✅

---

## Risks & Mitigations

**Risk 1:** DST (Daylight Saving Time) transitions cause incorrect times
- **Impact:** High
- **Mitigation:** Use `date-fns-tz` which handles DST correctly; add specific tests for DST transition dates

**Risk 2:** Invalid timezone string from browser
- **Impact:** Medium
- **Mitigation:** Fallback to 'UTC' if timezone detection fails; validate IANA timezone format

**Risk 3:** Server-rendered content shows different time than client
- **Impact:** Medium
- **Mitigation:** Use `"use client"` directive; show loading state until timezone detected; consider hydration mismatch handling

---

## Estimated Effort

| Step                         | Time    |
|------------------------------|---------|
| 1. Timezone Utilities        | 45 min  |
| 2. Add Types                 | 15 min  |
| 3. TimezoneIndicator         | 30 min  |
| 4. useTimezone Hook          | 20 min  |
| 5. Update BookingSummaryCard | 30 min  |
| 6. Update Session Card       | 20 min  |
| 7. Integration & E2E         | 45 min  |
| **Total**                    | **~3.5h** |

**Story points:** 3 (Medium complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] Timezone del mentee detectada automáticamente
  - [ ] Horarios del mentor convertidos a timezone del mentee
  - [ ] Indicator de timezone visible y claro
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/scheduling` en componentes
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors relacionados a timezone
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [ ] Badge usa colores del design system (accent)
  - [ ] Espaciado consistente (gap-2, text-sm)
  - [ ] Icono de Globe para contexto visual
- [ ] **Content Writing contextual**
  - [ ] "Tu zona horaria" no "Your timezone"
  - [ ] Timezone abbreviations claras (EST, PST)
- [ ] Tests unitarios escritos (coverage > 80%)
  - [ ] `formatInTimezone` - múltiples timezones
  - [ ] `detectUserTimezone` - fallback handling
  - [ ] `getTimezoneAbbreviation` - edge cases
- [ ] Tests de integración pasando
  - [ ] BookingSummaryCard con timezone
- [ ] Tests E2E pasando
  - [ ] TC-001: Mentee en diferente timezone ve hora convertida
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
  - [ ] Zero TypeScript errors
- [ ] Deployed to staging
- [ ] Manual smoke test en staging
  - [ ] Timezone indicator visible en checkout
  - [ ] Hora mostrada correctamente según browser timezone

---

**Última actualización:** 2025-12-13
**Generado por:** Claude Code
