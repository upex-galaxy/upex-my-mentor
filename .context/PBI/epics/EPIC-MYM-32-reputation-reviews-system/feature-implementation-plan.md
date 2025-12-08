# Feature Implementation Plan: EPIC-MYM-32 - Reputation & Reviews System

**Fecha:** 2025-12-08
**Arquitecto:** Claude Code (AI-Assisted)
**Epic Jira Key:** MYM-32
**Status:** In Progress

---

## Overview

Esta feature implementa un sistema de reputación bidireccional que permite a mentees y mentores calificarse mutuamente después de cada sesión completada. El sistema incluye visualización de reviews en perfiles, cálculo de ratings promedio, y ordenamiento/filtrado de reviews.

**Alcance:**
- **MYM-33:** Mentee Rates and Reviews Mentor (pendiente)
- **MYM-34:** Mentor Rates and Reviews Mentee (pendiente)
- **MYM-35:** View Ratings and Reviews on Profiles ✅ COMPLETADO

**Stack técnico:**
- Frontend: Next.js 15 (App Router) + React Server Components
- Backend: Supabase (PostgreSQL + Edge Functions)
- Database: PostgreSQL (Supabase)
- Styling: TailwindCSS + shadcn/ui
- Validation: Zod schemas
- Testing: Vitest + Playwright (futuro)

---

## Current State Analysis

### Ya Implementado (MYM-35)

**Componentes UI existentes:**
- `src/components/reviews/review-card.tsx` - Card individual de review
- `src/components/reviews/reviews-list.tsx` - Lista paginada de reviews
- `src/components/reviews/reviews-section.tsx` - Sección completa con sort/filter

**Utilidades existentes:**
- `src/lib/reviews.ts`:
  - `calculateRatingDistribution()` - Calcula distribución de ratings
  - `sortReviews()` - Ordena por recent/highest/lowest
  - `filterReviews()` - Filtra por rating
  - `paginateReviews()` - Paginación
  - `formatReviewDate()` / `formatReviewDateFull()` - Formateo de fechas

**Tipos existentes (`src/types/index.ts`):**
- `Review` - Tipo base de review
- `ReviewWithReviewer` - Review con datos del reviewer
- `RatingDistribution` - Distribución de ratings {5: n, 4: n, ...}
- `ReviewSortOption` / `ReviewFilterOption` - Opciones de UI

**Schema de DB (tabla `reviews`):**
```sql
reviews (
  id: uuid (PK, gen_random_uuid())
  reviewer_id: uuid (FK → profiles.id)
  subject_id: uuid (FK → profiles.id)  -- El reviewee
  booking_id: uuid (nullable, FK → bookings.id)
  rating: integer (CHECK: 1-5)
  comment: text (nullable)
  created_at: timestamptz
)
```

### Por Implementar (MYM-33, MYM-34)

1. **Formulario de review submission**
2. **Verificación de elegibilidad** (session completed, 1h passed)
3. **API endpoint para crear reviews**
4. **Prevención de reviews duplicados**
5. **Actualización de average_rating en profiles**

---

## Technical Decisions

### Decision 1: Ubicación del formulario de review

**Options considered:**
- A) Modal desde session dashboard
- B) Página dedicada `/review/submit?booking=[id]`
- C) Inline form en session detail

**Chosen:** B) Página dedicada `/review/submit`

**Reasoning:**
- ✅ Ruta accesible desde email de reminder
- ✅ Permite deep-linking directo
- ✅ Experiencia enfocada sin distracciones
- ✅ Facilita tracking de conversión
- ❌ Trade-off: Un click más desde dashboard

**Implementation notes:**
- Ruta: `/review/submit?booking=[booking_id]`
- Query param `booking` requerido
- Validar elegibilidad en server component antes de mostrar form
- Redirect a dashboard si no elegible

---

### Decision 2: Lógica de elegibilidad para review

**Chosen:** Server-side validation con checks en cascada

**Reasoning:**
- ✅ Seguridad: validación no puede ser bypasseada desde frontend
- ✅ Reutilizable para API y UI
- ✅ Mensajes de error específicos por cada condición

**Implementation notes:**
```typescript
// Checks en orden:
1. isAuthenticated → 401 si no
2. bookingExists → 404 si no
3. isParticipant(booking, userId) → 403 si no es mentor/mentee de la sesión
4. isCompleted(booking) → 400 "Session not completed yet"
5. hasWaited1Hour(booking) → 400 "Please wait 1 hour after session"
6. hasNotReviewed(booking, userId) → 400 "Already reviewed"
```

---

### Decision 3: Cálculo de average_rating

**Options considered:**
- A) DB Trigger en INSERT/UPDATE/DELETE de reviews
- B) Calcular on-the-fly en cada query
- C) Background job periódico

**Chosen:** A) DB Trigger + cached column en `profiles.average_rating`

**Reasoning:**
- ✅ Performance: rating siempre disponible sin joins
- ✅ Consistencia: se actualiza automáticamente
- ✅ Ya existe columna `average_rating` en profiles
- ❌ Trade-off: Complejidad en DB, pero mantenible

**Implementation notes:**
- Crear trigger `update_profile_rating_trigger`
- Trigger calcula AVG y COUNT de reviews donde subject_id = profile.id
- Actualiza `profiles.average_rating` y `profiles.total_reviews`

---

### Decision 4: Prevención de reviews duplicados

**Chosen:** UNIQUE constraint en DB + API validation

**Reasoning:**
- ✅ Defense in depth: DB + API
- ✅ Clear error message para usuario
- ✅ Concurrency-safe (DB constraint)

**Implementation notes:**
```sql
-- Ya existe la tabla, agregar constraint:
ALTER TABLE reviews
ADD CONSTRAINT unique_review_per_booking_reviewer
UNIQUE (booking_id, reviewer_id);
```
- API: Check existente antes de INSERT
- UI: Disable form si ya existe review

---

### Decision 5: Determinar rol del reviewer

**Options considered:**
- A) Campo `reviewer_role` en reviews table
- B) Inferir de booking (reviewer_id === mentor_id ? 'mentor' : 'mentee')
- C) No almacenar, inferir siempre

**Chosen:** B) Inferir de booking data

**Reasoning:**
- ✅ No duplica datos
- ✅ Siempre correcto (deriva de fuente de verdad)
- ✅ Evita schema change
- ❌ Trade-off: Requiere join con bookings

**Implementation notes:**
- En queries de reviews, JOIN con bookings para determinar rol
- Helper function: `getReviewerRole(booking, reviewerId)`

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/index.ts` - Tipos de dominio
- `src/types/supabase.ts` - Tipos generados de DB (si existe)

**Nuevos tipos a agregar:**

```typescript
// src/types/index.ts

// Review Submission
export interface ReviewSubmission {
  booking_id: string;
  rating: number; // 1-5
  comment?: string; // max 500 chars
}

// Eligibility Check Result
export interface ReviewEligibility {
  canReview: boolean;
  reason?: 'not_participant' | 'not_completed' | 'too_early' | 'already_reviewed';
  booking?: BookingForReview;
}

// Booking data needed for review form
export interface BookingForReview {
  id: string;
  mentor_id: string;
  student_id: string;
  session_date: string;
  status: BookingStatus;
  mentor_name: string;
  student_name: string;
}
```

**Estrategia de tipos:**
- ✅ TODAS las stories importan tipos desde `@/types`
- ✅ Zod schemas para validación de form
- ✅ Type guards para elegibilidad

---

## UI/UX Design Strategy

**Design System:** Moderno/Bold (del `.context/design-system.md`)

### Componentes compartidos por stories:

**Componentes del Design System a usar:**
- ✅ `Button` - Submit, Cancel
- ✅ `Card` - Container del form
- ✅ `Textarea` - Comment input
- ✅ `Label` - Form labels

**Componentes custom a nivel feature:**

1. 🆕 **StarRatingInput**
   - **Usado por stories:** MYM-33, MYM-34
   - **Propósito:** Selector interactivo de 1-5 estrellas
   - **Diseño:** Estrellas clickeables, hover state, keyboard accessible
   - **Ubicación:** `src/components/reviews/star-rating-input.tsx`

2. 🆕 **ReviewForm**
   - **Usado por stories:** MYM-33, MYM-34
   - **Propósito:** Formulario completo de review submission
   - **Diseño:** Card con StarRatingInput + Textarea + Buttons
   - **Ubicación:** `src/components/reviews/review-form.tsx`

3. 🆕 **ReviewSuccessMessage**
   - **Usado por stories:** MYM-33, MYM-34
   - **Propósito:** Confirmación post-submit
   - **Ubicación:** `src/components/reviews/review-success.tsx`

### Consistencia visual:

**Paleta aplicada:**
- Primary (`bg-primary`) - Submit button, star fill color
- Secondary (`bg-secondary`) - Secondary actions
- Accent (`bg-accent`) - Hover states en estrellas
- Muted (`text-muted-foreground`) - Labels, placeholder

**Patrones de diseño:**
- Cards con `hover:shadow-lg transition-shadow`
- Bordes redondeados `rounded-lg`
- Espaciado generoso (p-6 en cards)
- Estrellas: `fill-yellow-400` cuando activas (consistente con ReviewCard)

### Flujos de UX:

**User journey - Submit Review:**
1. Usuario navega a `/review/submit?booking=[id]`
2. Sistema verifica elegibilidad (server-side)
3. Si elegible: muestra form con datos de sesión
4. Si no elegible: muestra mensaje explicativo + redirect
5. Usuario selecciona rating (1-5 estrellas)
6. Usuario opcionalmente escribe comentario
7. Click "Enviar Review"
8. Loading state en button
9. Success: Muestra mensaje + redirect a dashboard
10. Error: Muestra toast con error

**Estados:**
- Loading: Skeleton mientras verifica elegibilidad
- Empty/Not Eligible: Mensaje explicativo con CTA a dashboard
- Error: Toast notification
- Success: Checkmark animation + redirect

---

## Content Writing Strategy

**Vocabulario del dominio (del PRD):**
- "Sesión" (no "reunión" ni "llamada")
- "Mentor" / "Mentee" (no "tutor" / "estudiante" en contexto de reviews)
- "Valoración" / "Review" (intercambiables)
- "Experiencia" (al referirse a la sesión)

**Textos específicos:**

```
// Título del form
"¿Cómo fue tu sesión con {name}?"

// Rating label
"Tu valoración"

// Comment label
"Cuéntanos más (opcional)"

// Comment placeholder
"Comparte tu experiencia: ¿Qué te gustó? ¿Qué podría mejorar?"

// Character counter
"{current} / 500 caracteres"

// Submit button
"Enviar valoración"

// Success message
"¡Gracias por tu valoración!"
"Tu feedback ayuda a construir una comunidad de confianza."

// Error: Already reviewed
"Ya dejaste una valoración para esta sesión."

// Error: Too early
"Podrás dejar tu valoración 1 hora después de completar la sesión."

// Error: Not completed
"La sesión aún no ha sido completada."
```

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

1. **Supabase Client**
   - `src/lib/supabase/client.ts` - Para client components
   - `src/lib/supabase/server.ts` - Para server components

2. **Auth Context**
   - `src/contexts/auth-context.tsx` - Para obtener userId

3. **Bookings Table**
   - Necesario para verificar elegibilidad
   - JOIN para obtener nombres de participantes

4. **Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **External services:**
   - Supabase Auth - Verificación de usuario
   - Supabase DB - CRUD de reviews

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   └── review/
│       └── submit/
│           └── page.tsx           # Review submission page (MYM-33, MYM-34)
├── components/
│   └── reviews/
│       ├── review-card.tsx        # ✅ Existente
│       ├── reviews-list.tsx       # ✅ Existente
│       ├── reviews-section.tsx    # ✅ Existente
│       ├── star-rating-input.tsx  # 🆕 Nuevo
│       ├── review-form.tsx        # 🆕 Nuevo
│       └── review-success.tsx     # 🆕 Nuevo
├── lib/
│   ├── reviews.ts                 # ✅ Existente (agregar funciones)
│   └── supabase/
│       ├── client.ts
│       └── server.ts
└── types/
    └── index.ts                   # Agregar nuevos tipos
```

### Design Patterns

1. **Server Component First:** La página de review es RSC para verificar elegibilidad
2. **Controlled Form:** ReviewForm maneja estado local con useState
3. **Optimistic UI:** Button muestra loading mientras procesa
4. **Error Boundaries:** Manejo de errores con try/catch + toast

### Third-party Libraries

- **lucide-react:** Iconos (Star, Flag, Check) - ya instalado
- **zod:** Validación de form - ya instalado
- **sonner:** Toast notifications - si está instalado, o usar alternativa

---

## Implementation Order

**Recomendado:**

1. **DB Setup: Unique Constraint + Trigger** (prerequisito)
   - Agregar UNIQUE constraint en reviews
   - Crear trigger para actualizar average_rating
   - Razón: Fundación para todo lo demás

2. **STORY-MYM-33: Mentee Reviews Mentor** (base)
   - Crear StarRatingInput component
   - Crear ReviewForm component
   - Crear página /review/submit
   - Implementar elegibilidad logic
   - Razón: Establece patrón para MYM-34

3. **STORY-MYM-34: Mentor Reviews Mentee** (extiende)
   - Reutilizar componentes de MYM-33
   - Ajustar textos para perspectiva de mentor
   - Razón: Casi idéntico a MYM-33, solo cambios de texto

4. **MYM-35: View Reviews** ✅ YA COMPLETADO
   - Solo verificar integración con nuevos reviews

---

## Risks & Mitigations

### Risk 1: Race condition en unique constraint

**Impact:** Medium - Podría permitir reviews duplicados momentáneamente
**Likelihood:** Low
**Mitigation:**
- DB constraint como última línea de defensa
- API check antes de INSERT
- UI disable después de submit exitoso

### Risk 2: Cálculo incorrecto de average_rating

**Impact:** High - Afecta confianza en el sistema
**Likelihood:** Low
**Mitigation:**
- Trigger de DB es atómico
- Tests de integración para verificar cálculo
- Monitoring: comparar AVG calculado vs stored

### Risk 3: Booking data no disponible

**Impact:** Medium - No se puede verificar elegibilidad
**Likelihood:** Medium (si bookings table vacía)
**Mitigation:**
- Para MVP/testing: permitir reviews sin booking_id
- Clear error message si booking no existe
- Seed data para testing

### Risk 4: XSS en comments

**Impact:** Critical - Seguridad
**Likelihood:** Low
**Mitigation:**
- React escapa por defecto (no usar dangerouslySetInnerHTML)
- Sanitizar en backend si es necesario
- Max 500 chars limita payload

---

## Success Criteria

**Esta feature estará completa cuando:**

- [x] MYM-35 implementado y deployed (View Reviews)
- [ ] MYM-33 implementado (Mentee reviews mentor)
- [ ] MYM-34 implementado (Mentor reviews mentee)
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] Nuevos tipos agregados a `@/types`
  - [ ] Zero type errors
  - [ ] Props tipadas correctamente
- [ ] **Personalidad UI/UX consistente**
  - [ ] StarRatingInput usa colores del design system
  - [ ] Cards y buttons consistentes con resto de app
- [ ] **Content Writing contextual**
  - [ ] Textos específicos del dominio (no genéricos)
  - [ ] Tono coherente con el resto de la app
- [ ] **Funcionalidad core:**
  - [ ] Usuario puede dejar review 1h después de sesión
  - [ ] No puede dejar review duplicado
  - [ ] average_rating se actualiza en profile
  - [ ] Reviews aparecen en profile del reviewee
- [ ] **Build y linting pasando**
  - [ ] `bun run build` exitoso
  - [ ] `bun run lint` sin errores
  - [ ] Zero TypeScript errors

---

## Database Migrations Needed

```sql
-- Migration 1: Add unique constraint for duplicate prevention
ALTER TABLE reviews
ADD CONSTRAINT unique_review_per_booking_reviewer
UNIQUE (booking_id, reviewer_id);

-- Migration 2: Create trigger for average_rating calculation
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the subject's average rating and total reviews
  UPDATE profiles
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE subject_id = COALESCE(NEW.subject_id, OLD.subject_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE subject_id = COALESCE(NEW.subject_id, OLD.subject_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.subject_id, OLD.subject_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS trigger_update_profile_rating_insert ON reviews;
CREATE TRIGGER trigger_update_profile_rating_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating();

DROP TRIGGER IF EXISTS trigger_update_profile_rating_update ON reviews;
CREATE TRIGGER trigger_update_profile_rating_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating();

DROP TRIGGER IF EXISTS trigger_update_profile_rating_delete ON reviews;
CREATE TRIGGER trigger_update_profile_rating_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating();
```

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/feature-test-plan.md`
- **Design System:** `.context/design-system.md`
- **PRD:** `.context/PRD/executive-summary.md`
- **Jira Epic:** https://upexgalaxy62.atlassian.net/browse/MYM-32

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

*This implementation plan provides technical guidance for implementing the Reputation & Reviews System epic.*
