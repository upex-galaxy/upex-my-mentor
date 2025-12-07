# Implementation Plan: STORY-MYM-17 - View Mentor Detailed Profile

## Overview

Completar la implementación de la página de detalle de mentor `/mentors/[id]` agregando validaciones de seguridad faltantes y mejorando la experiencia de usuario para casos edge.

**Estado actual:** La página ya existe con la mayoría de funcionalidades implementadas. Este plan cubre los gaps identificados durante el análisis.

**Acceptance Criteria a cumplir:**
- [x] Navegación desde galería a perfil de mentor
- [x] Mostrar información completa: nombre, foto, bio, skills, experiencia, rate
- [x] Mostrar rating y reviews
- [x] Botón "Book a Session" visible
- [x] Empty state para mentor sin reviews
- [x] Social links opcionales (solo se muestran si existen)
- [ ] **404 para mentor no existente con link a galería**
- [ ] **404 para mentor no verificado (seguridad)**

---

## Technical Approach

**Chosen approach:** Corrección incremental sobre la implementación existente.

**Gaps identificados:**
1. **Seguridad (TC-005):** La query actual no filtra por `is_verified`. Un mentor no verificado es accesible si se conoce su ID.
2. **UX (TC-004):** La página 404 global no tiene link específico a la galería de mentores.

**Why this approach:**
- ✅ Mínimo cambio, máximo impacto en seguridad
- ✅ Aprovecha código existente bien estructurado
- ✅ Mantiene consistencia con design system
- ❌ Trade-off: Paginación de reviews diferida a futuro

---

## Implementation Steps

### **Step 1: Fix Security - Filter by is_verified**

**Task:** Agregar filtro `is_verified: true` a la query de mentor para prevenir acceso a perfiles no verificados.

**File:** `src/app/mentors/[id]/page.tsx`

**Current query (line 81-95):**
```typescript
const { data: mentorData, error: mentorError } = await supabase
  .from('profiles')
  .select(`...`)
  .eq('id', id)
  .eq('role', 'mentor')
  .single();
```

**Required change:**
```typescript
const { data: mentorData, error: mentorError } = await supabase
  .from('profiles')
  .select(`...`)
  .eq('id', id)
  .eq('role', 'mentor')
  .eq('is_verified', true)  // <- ADD THIS
  .single();
```

**Testing:**
- TC-005: Verify that accessing `/mentors/<unverified_mentor_id>` returns 404

---

### **Step 2: Create Mentor-Specific 404 Page**

**Task:** Crear página 404 específica para mentores con link de regreso a la galería.

**File:** `src/app/mentors/[id]/not-found.tsx` (nuevo)

**Structure:**
```typescript
// Mensaje específico para mentores no encontrados
// Link a /mentors en lugar de /
// Mantener design system (gradiente, botones)
```

**UI Elements:**
- Título: "Mentor no encontrado"
- Mensaje: "Lo sentimos, no pudimos encontrar este mentor. Puede que el perfil no exista o aún no esté verificado."
- Botón: "Explorar Mentores" → `/mentors`

**Testing:**
- TC-004: Verify that `/mentors/fake-id` shows custom 404 with link to gallery

---

### **Step 3: Verify and Test**

**Task:** Ejecutar linting, build y verificación manual.

**Commands:**
```bash
bun run lint
bun run build
```

**Manual verification:**
- Navigate from `/mentors` to a mentor detail page
- Verify all information displays correctly
- Test responsive layout on mobile viewport
- Test 404 page with invalid mentor ID

---

## Technical Decisions

### Decision 1: Defer Review Pagination to Future Story

**Chosen:** No implementar paginación de reviews en este story.

**Reasoning:**
- ✅ MVP puede funcionar sin paginación (pocos reviews inicialmente)
- ✅ Reduce complejidad y tiempo de implementación
- ✅ Puede ser una mejora futura si la data crece
- ❌ Trade-off: Si un mentor tiene 50+ reviews, la página será larga

### Decision 2: Specific 404 vs Global 404

**Chosen:** Crear 404 específica para `/mentors/[id]/` con link a galería.

**Reasoning:**
- ✅ Mejor UX con mensaje contextual
- ✅ Cumple TC-004 exactamente
- ✅ No afecta otras rutas

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Página `/mentors/[id]/page.tsx` existente
- [x] Design system components (Button, Card, Badge)
- [x] Supabase client configurado
- [x] Campo `is_verified` en tabla `profiles`

---

## Risks & Mitigations

**Risk 1:** Query sin `is_verified` actualmente expone perfiles no verificados
- **Impact:** High (seguridad)
- **Mitigation:** Step 1 corrige esto inmediatamente

**Risk 2:** Next.js podría no usar la 404 específica del directorio
- **Impact:** Low
- **Mitigation:** Verificar que `notFound()` dispara la 404 del directorio más cercano

---

## Estimated Effort

| Step           | Time   |
| -------------- | ------ |
| 1. Security fix | 5 min  |
| 2. 404 page    | 15 min |
| 3. Verify/Test | 10 min |
| **Total**      | **30 min** |

**Story points:** 2 (ajuste menor a implementación existente)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Validaciones de seguridad:**
  - [ ] Query filtra por `is_verified: true`
  - [ ] Mentor no verificado retorna 404
- [ ] **UI/UX:**
  - [ ] 404 específica con link a galería
  - [ ] Responsive en mobile
- [ ] Tests manuales:
  - [ ] TC-001: View complete mentor profile
  - [ ] TC-002: View mentor profile with no reviews
  - [ ] TC-003: View mentor profile with no social links
  - [ ] TC-004: 404 for non-existent mentor
  - [ ] TC-005: 404 for unverified mentor
  - [ ] TC-006: Mobile responsive
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Code review aprobado
- [ ] Deployed to staging

---

**Output:** Plan de implementación para completar MYM-17 - View Mentor Detailed Profile

*Generado por Claude Code - 2025-12-07*
