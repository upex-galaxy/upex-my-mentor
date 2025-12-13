# Implementation Plan: STORY-MYM-16 - Filter Mentors by Skills

## Overview

Implementar/corregir funcionalidad de filtrado de mentores por skills, asegurando que múltiples skills se filtren con lógica AND y que los filtros se apliquen server-side.

**Acceptance Criteria a cumplir:**
- AC1: Filtrar por múltiples skills usa AND logic (mentores con TODOS los skills seleccionados)
- AC2: Combinar skill filter con keyword search funciona correctamente

**Bugs relacionados a corregir:**
- MYM-46: Trim de espacios en búsqueda
- MYM-47: Skill filtering usa OR en vez de AND
- MYM-48: Filtros deben ser server-side, no client-only

---

## Technical Approach

**Chosen approach:** Server-side filtering via Supabase `.contains()` con URL params

**Current state (bugs):**
- UI de skill badges existe y funciona visualmente
- Pero: filtros no aplican AND logic correctamente
- Query usa `.contains()` pero bug en construcción de array

**Fix approach:**
- Verificar que array de skills se pase correctamente a `.contains()`
- `.contains("specialties", skills)` requiere `skills` sea un array
- Asegurar que searchParams parsee correctamente múltiples `?skill=X&skill=Y`

**Why this approach:**
- ✅ Código base ya existe, solo necesita fixes
- ✅ `.contains()` mapea a PostgreSQL `@>` (array containment AND)
- ✅ Minimal changes, máximo impact
- ❌ Trade-off: Requiere debugging cuidadoso del parsing de URL params

---

## UI/UX Design

### Componentes existentes a modificar:

- ✅ `MentorFilters` - Ya tiene UI de badges, necesita verificar lógica
- ✅ `Badge` - Funciona correctamente (variant toggle)
- ✅ `ClearSearchButton` - Ya implementado

### Estados de UI:

- **Loading:** SSR handles (no skeleton adicional necesario)
- **Empty (no results):** Ya implementado en page.tsx
- **Success:** Grid de mentores filtrados

### No hay cambios de UI necesarios

La UI ya está implementada correctamente. Los bugs están en la lógica de backend/query.

---

## Types & Type Safety

**Tipos existentes a usar:**
```typescript
// Database type
type ProfileRow = Database['public']['Tables']['profiles']['Row']

// specialties es TEXT[] en ProfileRow
// skills filter debe ser string[]
```

**Verificar tipo correcto:**
```typescript
// En page.tsx
const skills: string[] = Array.isArray(params.skill)
  ? params.skill
  : params.skill
  ? [params.skill]
  : [];

// Debe pasar string[] a .contains(), no string
```

---

## Implementation Steps

### **Step 1: Diagnosticar el bug actual**

**Task:** Identificar exactamente dónde falla la lógica AND

**Files to review:**
- `src/app/mentors/page.tsx` - líneas 135-140 (parsing skills)
- `src/app/mentors/page.tsx` - líneas 156-158, 179-180 (query filtering)

**Diagnostic checklist:**
1. [ ] Verificar que `params.skill` parsea múltiples valores correctamente
2. [ ] Verificar que `skills` array se pasa a `.contains()` correctamente
3. [ ] Verificar que `.contains()` funciona en ambas branches (con/sin keyword)

**Expected finding:**
Según MYM-48, los filtros podrían estar siendo client-side. Verificar si hay JavaScript filtering en lugar de query filtering.

**Testing:**
- Console.log del array `skills` antes de query
- Network tab para verificar que request incluye params

**Estimated time:** 15 min

---

### **Step 2: Fix skill filter en query sin keyword**

**Task:** Asegurar que `.contains()` funciona correctamente cuando no hay keyword

**File:** `src/app/mentors/page.tsx`

**Current code (lines 171-196):**
```typescript
// No keyword - use regular query
let mentorQuery = supabase
  .from("profiles")
  .select("*")
  .eq("role", "mentor")
  .eq("is_verified", true);

if (skills.length > 0) {
  mentorQuery = mentorQuery.contains("specialties", skills);
}
```

**Verify/Fix:**
1. `skills` debe ser `string[]` no `string`
2. `.contains("specialties", skills)` es correcto para AND logic
3. Si `skills = ["Python", "Django"]`, query retorna mentores con AMBOS

**Edge cases handled:**
- `skills = []` → No filter applied (all mentors)
- `skills = ["Python"]` → Single skill filter
- `skills = ["Python", "Django"]` → AND filter

**Testing:**
- TC-002: Multiple skill filter with AND logic

**Estimated time:** 20 min

---

### **Step 3: Fix skill filter en query con keyword (RPC)**

**Task:** Asegurar que skill filter funciona cuando hay keyword search

**File:** `src/app/mentors/page.tsx`

**Current code (lines 149-170):**
```typescript
if (keyword) {
  let searchQuery = supabase.rpc('search_mentors_by_keyword', {
    search_keyword: keyword
  });

  // Apply skill filter if selected
  if (skills.length > 0) {
    searchQuery = searchQuery.contains("specialties", skills);
  }
  // ...
}
```

**Verify/Fix:**
1. RPC result debe soportar `.contains()` chaining
2. Verificar que RPC retorna `specialties` column para filtering

**Potential issue:**
Si RPC no retorna `specialties`, el `.contains()` no funcionará. Necesitamos verificar la función RPC.

**Testing:**
- TC-003: Skill filter combined with keyword search

**Estimated time:** 30 min

---

### **Step 4: Fix trailing spaces in keyword (MYM-46)**

**Task:** Asegurar que keyword se trimea antes de buscar

**File:** `src/app/mentors/page.tsx`

**Current code (line 134):**
```typescript
const keyword = (params.keyword || "").trim().slice(0, 100);
```

**Analysis:**
El código ya tiene `.trim()`. El bug podría estar en:
1. `MentorFilters` no trimea antes de set URL
2. El trim ocurre después del debounce pero no se aplica al URL

**File:** `src/components/mentors/mentor-filters.tsx`

**Fix needed (if applicable):**
```typescript
// Line 36-38
if (debouncedKeyword.trim()) {
  params.set("keyword", debouncedKeyword.trim()); // Trim here too
} else {
  params.delete("keyword");
}
```

**Testing:**
- TC-009: Search trims trailing spaces with skill filter

**Estimated time:** 15 min

---

### **Step 5: Verificar server-side filtering (MYM-48)**

**Task:** Confirmar que filtros son server-side, no client-only

**Analysis:**
El código actual usa Server Components con searchParams, lo cual ES server-side. Sin embargo:

1. `MentorFilters` es "use client" → Solo actualiza URL
2. `MentorsPage` es Server Component → Lee URL y hace query
3. Query se ejecuta en server → Resultados vienen filtrados

**Verification steps:**
1. No hay `Array.filter()` en client-side con todos los mentores
2. La query de Supabase incluye los filtros
3. Network tab muestra navigation request (no API fetch client-side)

**Si hay client-side filtering encontrado:**
- Remover y asegurar que query de Supabase hace todo el filtering

**Testing:**
- TC-008: Skill filter works server-side

**Estimated time:** 15 min

---

### **Step 6: Testing manual completo**

**Task:** Ejecutar test cases del test-cases.md

**Test scenarios:**
1. [ ] TC-001: Single skill filter
2. [ ] TC-002: Multiple skills AND logic
3. [ ] TC-003: Skill + keyword combination
4. [ ] TC-004: Deselect single skill
5. [ ] TC-005: Clear all filters
6. [ ] TC-006: Empty results
7. [ ] TC-007: URL refresh maintains state
8. [ ] TC-008: Server-side filtering (network tab)
9. [ ] TC-009: Trailing spaces (MYM-46)
10. [ ] TC-010: AND not OR (MYM-47)

**Estimated time:** 30 min

---

### **Step 7: Build and lint verification**

**Task:** Asegurar que build y lint pasan

**Commands:**
```bash
bun run lint
bun run build
```

**Fix any errors found**

**Estimated time:** 10 min

---

## Technical Decisions (Story-specific)

### Decision 1: Mantener arquitectura actual vs refactor completo

**Chosen:** Mantener arquitectura actual con fixes puntuales

**Reasoning:**
- ✅ La arquitectura (Server Components + URL params) es correcta
- ✅ Solo hay bugs de implementación, no de diseño
- ✅ Menor riesgo de regresiones
- ❌ Trade-off: Si hay más issues, considerar refactor

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] MYM-14 completado (Gallery base)
- [x] MYM-15 completado (Keyword search)
- [x] RPC `get_all_unique_skills` existe
- [x] RPC `search_mentors_by_keyword` existe
- [x] Componente `MentorFilters` existe

---

## Risks & Mitigations

**Risk 1:** RPC no soporta chaining con `.contains()`
- **Impact:** High
- **Mitigation:** Si no funciona, modificar RPC para aceptar `skill_filter` param

**Risk 2:** Otros bugs no documentados en la lógica
- **Impact:** Medium
- **Mitigation:** Testing exhaustivo con todos los test cases

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Diagnosticar bug | 15 min |
| 2. Fix query sin keyword | 20 min |
| 3. Fix query con keyword | 30 min |
| 4. Fix trailing spaces | 15 min |
| 5. Verificar server-side | 15 min |
| 6. Testing manual | 30 min |
| 7. Build y lint | 10 min |
| **Total** | **~2.25 hours** |

**Story points:** 3 (Medium complexity - debugging existing code)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Acceptance Criteria pasando:
  - [ ] AC1: AND logic funciona con múltiples skills
  - [ ] AC2: Combinación skill + keyword funciona
- [ ] **Bugs corregidos y verificados:**
  - [ ] MYM-46: Trailing spaces trimeados
  - [ ] MYM-47: AND logic (no OR)
  - [ ] MYM-48: Server-side filtering confirmado
- [ ] **Test cases pasando:**
  - [ ] TC-001 a TC-012 del test-cases.md
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Code review aprobado
- [ ] Deployed to staging
- [ ] Manual smoke test en staging

---

**Plan creado:** 2025-12-12
**Story:** MYM-16
**Epic:** EPIC-MYM-13 (Mentor Discovery & Search)
**Generado por:** Claude Code
