# Implementation Plan: STORY-MYM-15 - Search Mentors by Keyword

## Overview

Implementar funcionalidad de búsqueda de mentores por palabra clave, permitiendo a los mentees encontrar mentores relevantes buscando en múltiples campos (nombre, bio, especialidades).

**Acceptance Criteria a cumplir:**
- AC1: Búsqueda exitosa muestra mentores que coinciden y actualiza URL
- AC2: Búsqueda sin resultados muestra mensaje específico con botón "Clear search"
- AC3: Búsqueda case-insensitive
- AC4: Partial matching funciona (ej: "Java" encuentra "JavaScript")
- AC5: Búsqueda vacía muestra todos los mentores verificados
- AC6: Múltiples palabras usan OR logic
- AC7: Solo mentores verificados aparecen en resultados

---

## Technical Approach

**Chosen approach:** Modificar el componente existente `MentorFilters` y la lógica de query en `/mentors/page.tsx` para expandir la búsqueda a múltiples campos usando PostgreSQL ILIKE con OR conditions.

**Alternatives considered:**
- Full-text search (tsvector): Más potente pero overkill para MVP, requiere índices adicionales
- Fuzzy search (pg_trgm): Tolerancia a typos pero añade complejidad innecesaria para v1

**Why this approach:**
- ✅ Usa infraestructura existente (ILIKE ya usado)
- ✅ Bajo riesgo - cambios incrementales
- ✅ Parameterized queries de Supabase previenen SQL injection
- ✅ Cumple con todas las especificaciones de la story
- ❌ Trade-off: Sin tolerancia a typos (feature para v2)

---

## UI/UX Design

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ Input → Search bar con icono, maxLength={100}
- ✅ Badge → Mostrar keyword activo
- ✅ Button → "Clear search" (variant="outline", size="sm")
- ✅ Skeleton → Loading state durante búsqueda

### Cambios de UI:

**Search Bar (ya existe en MentorFilters):**
- Cambiar placeholder: "Buscar por nombre, bio, specialty..."
- Cambiar debounce: 500ms → 300ms
- Agregar maxLength={100} para validación
- Renombrar query param: `q` → `keyword`

**Empty State (modificar existente):**
```
┌──────────────────────────────────────────────┐
│             🔍 (icono grande)                │
│                                              │
│   No mentors found matching 'KEYWORD'.       │
│   Try a different search term.               │
│                                              │
│        [ Clear search ] (button)             │
└──────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton cards durante búsqueda (ya implementado con SSR)
- **Empty (no filters):** Mensaje "Aún no hay mentores disponibles"
- **Empty (with filters):** "No mentors found matching '[keyword]'. Try a different search term." + Clear button
- **Success:** Grid de MentorCards

### Responsividad:

Sin cambios - ya implementado correctamente en MYM-14.

---

## Types & Type Safety

**Tipos existentes a usar:**
- `Database['public']['Tables']['profiles']['Row']` - ProfileRow del backend
- `Mentor` - Tipo de dominio frontend (transformado)

**No se requieren nuevos tipos** - la funcionalidad usa tipos existentes.

---

## Implementation Steps

### **Step 1: Crear función de búsqueda en Supabase (RPC)**

**Task:** Crear función PostgreSQL para búsqueda multi-campo con OR logic para múltiples palabras.

**Details:**
- Función `search_mentors_by_keyword(keyword TEXT)`
- Búsqueda en: `name`, `description`, `specialties[]`
- Case-insensitive con ILIKE
- OR logic para múltiples palabras (split por espacios)
- Solo mentores verificados (`is_verified = true`)
- Sanitización automática por parameterized queries

**SQL Logic:**
```sql
-- Para cada palabra en el keyword, buscar en los 3 campos
-- "React TypeScript" → buscar "React" OR "TypeScript"
-- Cada palabra busca en name OR description OR ANY(specialties)
```

**Testing:**
- Verificar búsqueda case-insensitive
- Verificar partial matching
- Verificar OR logic con múltiples palabras
- Verificar solo verified mentors

**Estimated time:** 30 min

---

### **Step 2: Actualizar MentorFilters component**

**Task:** Modificar el componente de filtros para usar `keyword` param y debounce de 300ms.

**File:** `src/components/mentors/mentor-filters.tsx`

**Changes:**
1. Renombrar `q` → `keyword` en URL params
2. Cambiar debounce de 500ms a 300ms
3. Agregar `maxLength={100}` al Input
4. Actualizar placeholder: "Buscar por nombre, bio, specialty..."
5. Agregar data-testid para testing

**Edge cases handled:**
- Input mayor a 100 chars: Truncado por maxLength
- Whitespace-only: Tratado como búsqueda vacía
- Caracteres especiales: Escapados por Supabase parameterized queries

**Testing:**
- Verificar URL actualiza con `?keyword=`
- Verificar debounce funciona
- Verificar truncamiento de input largo

**Estimated time:** 20 min

---

### **Step 3: Actualizar lógica de búsqueda en page.tsx**

**Task:** Modificar la query de mentores para usar búsqueda multi-campo.

**File:** `src/app/mentors/page.tsx`

**Changes:**
1. Renombrar `q` → `keyword` en searchParams
2. Implementar búsqueda multi-campo:
   - Buscar en `name` con ILIKE
   - Buscar en `description` con ILIKE
   - Buscar en `specialties` array con ANY + ILIKE
3. Implementar OR logic para múltiples palabras
4. Mantener filtro `is_verified = true`

**Search Logic (OR between words, OR between fields):**
```typescript
// "React TypeScript" busca:
// (name ILIKE '%React%' OR description ILIKE '%React%' OR specialties @> '{React}')
// OR
// (name ILIKE '%TypeScript%' OR description ILIKE '%TypeScript%' OR specialties @> '{TypeScript}')
```

**Edge cases handled:**
- Empty keyword: Mostrar todos los mentores verificados
- Whitespace trimming: trim() antes de procesar
- Multiple spaces: split y filter empty strings

**Testing:**
- Verificar búsqueda en name
- Verificar búsqueda en description (bio)
- Verificar búsqueda en specialties
- Verificar OR logic
- Verificar only verified mentors

**Estimated time:** 45 min

---

### **Step 4: Actualizar Empty State con mensaje dinámico**

**Task:** Mostrar keyword buscado en mensaje de "no results" y agregar botón "Clear search".

**File:** `src/app/mentors/page.tsx`

**Changes:**
1. Pasar `keyword` al empty state
2. Mostrar mensaje: "No mentors found matching '[keyword]'. Try a different search term."
3. Agregar botón "Clear search" que limpia filtros
4. Crear componente `ClearSearchButton` (client component para navigation)

**New Component:** `src/components/mentors/clear-search-button.tsx`
```typescript
"use client"
// Botón que usa router.push para limpiar keyword de URL
```

**Testing:**
- Verificar mensaje muestra keyword buscado
- Verificar botón limpia filtros y URL

**Estimated time:** 20 min

---

### **Step 5: Testing y Validación**

**Task:** Verificar todos los escenarios de la story.

**Manual Testing Checklist:**
- [ ] Búsqueda "React" → muestra mentores con React
- [ ] Búsqueda "react" (lowercase) → mismos resultados
- [ ] Búsqueda "Java" → incluye "JavaScript" mentors
- [ ] Búsqueda "COBOL" → mensaje "No mentors found matching 'COBOL'"
- [ ] Clear search → URL limpia, todos mentores
- [ ] Búsqueda "React TypeScript" → mentores con cualquiera
- [ ] Solo mentores verificados aparecen
- [ ] URL shareable funciona (/mentors?keyword=React)
- [ ] Input > 100 chars truncado
- [ ] Búsqueda en bio funciona

**Estimated time:** 30 min

---

## Technical Decisions (Story-specific)

### Decision 1: Usar OR filters de Supabase vs RPC function

**Chosen:** OR filters inline con Supabase query builder

**Reasoning:**
- ✅ Más simple de mantener
- ✅ No requiere nueva migration
- ✅ TypeScript autocomplete funciona
- ❌ Trade-off: Query más compleja pero manejable

### Decision 2: Búsqueda en specialties array

**Chosen:** Usar `overlaps` operator para arrays

**Reasoning:**
- ✅ PostgreSQL native array operation
- ✅ Case-insensitive con `ilike` helper
- ❌ Trade-off: Necesita construir array de keywords para overlaps

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] MYM-14 completado (Gallery base)
- [x] MentorFilters component existe
- [x] Supabase client configurado
- [x] `is_verified` column existe en profiles

---

## Risks & Mitigations

**Risk 1:** Query performance con múltiples OR conditions
- **Impact:** Low (pocos mentores en MVP)
- **Mitigation:** Monitorear en producción, agregar índices si necesario

**Risk 2:** Specialties array search puede ser lento
- **Impact:** Low
- **Mitigation:** PostgreSQL maneja arrays eficientemente, considerar GIN index para v2

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Función búsqueda Supabase | 30 min |
| 2. Update MentorFilters | 20 min |
| 3. Update page.tsx search logic | 45 min |
| 4. Empty state + Clear button | 20 min |
| 5. Testing y validación | 30 min |
| **Total** | **~2.5 hours** |

**Story points:** 3 (Medium complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los 7 Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [x] ProfileRow type usado
  - [x] Mentor domain type mantenido
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [x] Design system respetado
  - [x] Empty state con icono y mensaje claro
- [ ] **Content Writing contextual**
  - [x] Mensaje "No mentors found matching '[keyword]'"
  - [x] Placeholder "Buscar por nombre, bio, specialty..."
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Code review aprobado
- [ ] Deployed to staging

---

**Plan creado:** 2025-12-07
**Story:** MYM-15
**Epic:** EPIC-MYM-13 (Mentor Discovery & Search)
