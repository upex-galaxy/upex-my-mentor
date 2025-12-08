# Implementation Plan: STORY-MYM-34 - Mentor Reviews Mentee

**Fecha:** 2025-12-08
**Branch:** `feat/MYM-34/mentor-review-mentee`
**Jira Key:** MYM-34
**Status:** In Progress

---

## Overview

Implementar funcionalidad para que mentores puedan dejar reviews (rating 1-5 estrellas + comentario opcional) a mentees después de completar una sesión.

**Acceptance Criteria a cumplir:**
- AC1: Mentor puede dejar review después de sesión completada (1h después)
- AC2: Rating 1-5 estrellas requerido, comentario hasta 500 chars opcional
- AC3: Review no editable después de submit
- AC4: Cada sesión solo puede ser revieweada una vez por el mentor
- AC5: Rating promedio del mentee se actualiza después de cada review

**Nota:** Esta story reutiliza la infraestructura de MYM-35 (componentes de visualización) y comparte patrón con MYM-33 (mentee reviews mentor).

---

## Technical Approach

**Chosen approach:** Página dedicada `/review/submit` con verificación server-side de elegibilidad

**Alternatives considered:**
- Modal desde dashboard: Rechazado - no permite deep-linking desde emails
- Inline form en session detail: Rechazado - experiencia más fragmentada

**Why this approach:**
- ✅ Ruta accesible desde email de reminder (futuro)
- ✅ Deep-linking directo con query params
- ✅ Verificación de elegibilidad en server antes de mostrar form
- ✅ Reutilizable para MYM-33 (mentee reviews mentor)
- ❌ Trade-off: Un click adicional desde dashboard

---

## UI/UX Design

**Design System:** Moderno/Bold (del `.context/design-system.md`)

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ Button → `variant`: primary (submit), outline (cancel)
- ✅ Card → Container del formulario
- ✅ Textarea → Input del comentario
- ✅ Label → Form labels

### Componentes custom a crear:

**1. 🆕 StarRatingInput**
- **Propósito:** Selector interactivo de 1-5 estrellas
- **Props:** `value: number`, `onChange: (value: number) => void`, `disabled?: boolean`
- **Diseño:** 5 estrellas clickeables con hover state, keyboard accessible
- **Ubicación:** `src/components/reviews/star-rating-input.tsx`

**2. 🆕 ReviewForm**
- **Propósito:** Formulario completo de review submission
- **Props:** `bookingId: string`, `revieweeName: string`, `onSuccess: () => void`
- **Diseño:** Card con StarRatingInput + Textarea + character counter + Buttons
- **Ubicación:** `src/components/reviews/review-form.tsx`

### Wireframe/Layout:

```
┌─────────────────────────────────────────────┐
│           ¿Cómo fue tu sesión              │
│              con [MenteeName]?              │
│                                             │
│  Tu valoración:                             │
│  ★ ★ ★ ★ ★  (interactive stars)            │
│                                             │
│  Cuéntanos más (opcional):                  │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                          125 / 500 chars    │
│                                             │
│         [Cancelar]    [Enviar valoración]   │
└─────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton mientras verifica elegibilidad
- **Not Eligible:** Mensaje explicativo con CTA a dashboard
- **Form Ready:** Formulario habilitado
- **Submitting:** Button con loading spinner, form disabled
- **Success:** Checkmark + mensaje + redirect automático
- **Error:** Toast notification con mensaje de error

### Personalidad UI/UX aplicada (Bold/Moderno):

- ✅ Sombras pronunciadas: `shadow-lg` en Card
- ✅ Bordes redondeados: `rounded-xl`
- ✅ Hover effects: `hover:scale-110` en estrellas
- ✅ Transiciones suaves: `transition-all duration-200`
- ✅ Estrellas amarillas: `fill-yellow-400 text-yellow-400`

---

## Types & Type Safety

**Tipos existentes (`src/types/index.ts`):**
- `Review`, `ReviewWithReviewer` - Ya definidos
- `BookingStatus` - Ya definido

**Nuevos tipos a agregar:**

```typescript
// src/types/index.ts

// Review Submission payload
export interface ReviewSubmission {
  booking_id: string;
  subject_id: string;  // El reviewee (mentee en este caso)
  rating: number;      // 1-5
  comment?: string;    // max 500 chars
}

// Eligibility check result
export interface ReviewEligibility {
  canReview: boolean;
  reason?: 'not_authenticated' | 'booking_not_found' | 'not_participant' |
           'not_completed' | 'too_early' | 'already_reviewed';
  booking?: BookingForReview;
}

// Booking data for review form context
export interface BookingForReview {
  id: string;
  mentor_id: string;
  student_id: string;
  mentor_name: string | null;
  student_name: string | null;
  session_date: string;
  status: string;
}
```

---

## Content Writing

**Textos contextuales (NO genéricos):**

| Elemento | Texto |
|----------|-------|
| Título | "¿Cómo fue tu sesión con {name}?" |
| Rating label | "Tu valoración" |
| Comment label | "Cuéntanos más (opcional)" |
| Comment placeholder | "Comparte tu experiencia: ¿El mentee estuvo preparado? ¿Fue puntual? ¿Hubo buena comunicación?" |
| Character counter | "{count} / 500 caracteres" |
| Cancel button | "Cancelar" |
| Submit button | "Enviar valoración" |
| Submit loading | "Enviando..." |
| Success title | "¡Gracias por tu valoración!" |
| Success message | "Tu feedback ayuda a construir una comunidad de confianza." |
| Error: already reviewed | "Ya dejaste una valoración para esta sesión." |
| Error: too early | "Podrás dejar tu valoración 1 hora después de completar la sesión." |
| Error: not completed | "La sesión aún no ha sido completada." |
| Error: not participant | "No tienes permiso para valorar esta sesión." |

---

## Implementation Steps

### **Step 1: Agregar tipos necesarios**

**Task:** Agregar tipos para review submission

**File:** `src/types/index.ts`

**Details:**
- Agregar `ReviewSubmission` interface
- Agregar `ReviewEligibility` interface
- Agregar `BookingForReview` interface

**Testing:**
- TypeScript compilation sin errores

**Estimated time:** 15 min

---

### **Step 2: Crear StarRatingInput component**

**Task:** Crear componente interactivo de 5 estrellas

**File:** `src/components/reviews/star-rating-input.tsx`

**Details:**
- 5 estrellas clickeables (1-5)
- Hover state para preview de rating
- Keyboard accessible (arrow keys, Enter)
- Colores del design system (yellow-400)
- Disabled state para cuando form está submitting

**Structure:**
```tsx
interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}
```

**Testing:**
- Click en estrella 3 → value = 3
- Hover preview funciona
- Keyboard navigation funciona
- Disabled bloquea interacción

**Estimated time:** 45 min

---

### **Step 3: Crear ReviewForm component**

**Task:** Crear formulario completo de review

**File:** `src/components/reviews/review-form.tsx`

**Details:**
- StarRatingInput para rating
- Textarea con max 500 chars + counter
- Validación: rating requerido (1-5)
- Loading state en submit
- Error handling con toast
- Success callback

**Props:**
```tsx
interface ReviewFormProps {
  bookingId: string;
  subjectId: string;  // ID del mentee
  subjectName: string;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**Edge cases:**
- Submit sin rating → mostrar error "Selecciona una valoración"
- Comment > 500 chars → Textarea limita input
- Network error → toast con mensaje + retry habilitado

**Testing:**
- Form validation funciona
- Submit llama API correctamente
- Success callback se ejecuta
- Cancel redirige

**Estimated time:** 1h

---

### **Step 4: Crear funciones de elegibilidad**

**Task:** Crear server actions para verificar elegibilidad y crear review

**File:** `src/lib/actions/reviews.ts`

**Details:**
```typescript
// Verificar si user puede dejar review
async function checkReviewEligibility(
  userId: string,
  bookingId: string
): Promise<ReviewEligibility>

// Crear review
async function createReview(
  reviewerId: string,
  data: ReviewSubmission
): Promise<{ success: boolean; error?: string }>
```

**Eligibility checks (en orden):**
1. Booking existe → 404 si no
2. User es participante (mentor_id === userId) → 403 si no
3. Booking status === 'completed' → 400 "Not completed"
4. Han pasado 1h desde session_date → 400 "Too early"
5. No existe review previo (booking_id + reviewer_id) → 400 "Already reviewed"

**Testing:**
- Cada check devuelve reason correcto
- createReview guarda en DB correctamente

**Estimated time:** 1h

---

### **Step 5: Crear página /review/submit**

**Task:** Crear página de review submission con server-side eligibility check

**File:** `src/app/review/submit/page.tsx`

**Details:**
- Server component para verificar elegibilidad
- Si no elegible: mostrar mensaje + link a dashboard
- Si elegible: mostrar ReviewForm con datos del booking
- Query param: `?booking=[booking_id]`

**Structure:**
```tsx
// src/app/review/submit/page.tsx
export default async function ReviewSubmitPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  // 1. Verificar autenticación
  // 2. Verificar elegibilidad
  // 3. Si OK, renderizar ReviewForm
  // 4. Si no, mostrar mensaje de error
}
```

**Edge cases:**
- No booking param → redirect a dashboard
- User no autenticado → redirect a login
- Booking no encontrado → 404 message
- Ya revieweado → mensaje + link a ver review

**Testing:**
- Page renderiza correctamente con booking válido
- Redirects funcionan
- Error states se muestran correctamente

**Estimated time:** 45 min

---

### **Step 6: Crear DB trigger para average_rating**

**Task:** Crear trigger que actualice average_rating en profiles

**Details:**
- Trigger en INSERT/UPDATE/DELETE de reviews
- Calcula AVG(rating) y COUNT(*) para subject_id
- Actualiza profiles.average_rating y profiles.total_reviews

**Migration SQL:**
```sql
-- Ver feature-implementation-plan.md para SQL completo
-- Ejecutar via Supabase MCP
```

**Testing:**
- INSERT review → average_rating actualizado
- DELETE review → average_rating recalculado

**Estimated time:** 30 min

---

### **Step 7: Integration y Testing E2E**

**Task:** Probar flujo completo

**Flow completo:**
1. Login como mentor
2. Navegar a `/review/submit?booking=[id]`
3. Verificar que se muestra form con nombre del mentee
4. Seleccionar 4 estrellas
5. Escribir comentario
6. Click "Enviar valoración"
7. Verificar mensaje de éxito
8. Verificar review aparece en profile del mentee (MYM-35)
9. Verificar average_rating actualizado en profile

**Testing:**
- E2E con booking mock
- Verificar redirect después de success
- Verificar no se puede re-submit

**Estimated time:** 30 min

---

## Technical Decisions (Story-specific)

### Decision 1: Form state management

**Chosen:** useState local en ReviewForm

**Reasoning:**
- ✅ Simple para un form pequeño
- ✅ No requiere libraries adicionales
- ❌ Trade-off: No persiste en refresh (aceptable)

### Decision 2: API call pattern

**Chosen:** Server Actions (Next.js 14+)

**Reasoning:**
- ✅ Type-safe de frontend a backend
- ✅ No necesita crear API route separada
- ✅ Mejor DX con revalidación automática

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla `reviews` existe en Supabase
- [x] Componentes de visualización (ReviewCard, etc.) existen
- [ ] Al menos 1 booking con status='completed' para testing
- [ ] Trigger de average_rating (Step 6)

---

## Risks & Mitigations

**Risk 1:** No hay bookings completados para testing
- **Impact:** Medium - No se puede probar flujo completo
- **Mitigation:** Crear seed data o permitir reviews sin booking_id para dev

**Risk 2:** Trigger de DB falla silenciosamente
- **Impact:** High - average_rating queda desactualizado
- **Mitigation:** Log errors en trigger, verificar manualmente después de cada review

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Tipos | 15 min |
| 2. StarRatingInput | 45 min |
| 3. ReviewForm | 1h |
| 4. Eligibility functions | 1h |
| 5. Page /review/submit | 45 min |
| 6. DB trigger | 30 min |
| 7. Integration testing | 30 min |
| **Total** | **~5h** |

**Story points:** 5 (Medium complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] ReviewSubmission, ReviewEligibility tipos agregados
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada (Bold/Moderno)**
  - [ ] Card con shadow-lg, rounded-xl
  - [ ] Estrellas con hover effect (scale)
  - [ ] Colores consistentes (yellow-400, primary)
- [ ] **Content Writing contextual**
  - [ ] Textos específicos del dominio
  - [ ] Sin placeholders genéricos
- [ ] **Funcionalidad:**
  - [ ] Mentor puede dejar review
  - [ ] Validación de elegibilidad funciona
  - [ ] Review se guarda en DB
  - [ ] average_rating se actualiza
  - [ ] No se puede duplicar review
- [ ] Linting y build pasando
  - [ ] `bun run lint` sin errores
  - [ ] `bun run build` exitoso
- [ ] Smoke test en local
  - [ ] Form se renderiza correctamente
  - [ ] Submit funciona
  - [ ] Review aparece en profile del mentee

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
