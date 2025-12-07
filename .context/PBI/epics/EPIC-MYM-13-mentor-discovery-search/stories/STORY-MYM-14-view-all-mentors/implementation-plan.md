# Implementation Plan: STORY-MYM-14 - View All Available Mentors

## Overview

Completar la implementación de la galería de mentores, añadiendo las funcionalidades faltantes: empty state diferenciado, paginación cursor-based, y manejo de imágenes rotas.

**Acceptance Criteria a cumplir:**
- Grid paginado de tarjetas de mentor
- Solo mostrar mentores con `is_verified: true`
- Ordenar por rating descendente
- Empty state cuando no hay mentores verificados en el sistema
- Fallback avatar para imágenes rotas

---

## Current State Analysis

La página `/mentors` ya tiene implementado:
- ✅ Server Component con query a Supabase (`role='mentor'`, `is_verified=true`)
- ✅ Ordenamiento por `average_rating` descendente
- ✅ MentorCard con avatar, rating, skills, precio, botón "Ver Perfil"
- ✅ Fallback avatar con inicial cuando no hay `photoUrl`
- ✅ Grid responsive (1/2/3 columnas)
- ✅ Filtros de búsqueda y skills
- ✅ Data-testid para E2E tests

**Gaps identificados:**
1. Empty state no diferencia entre "sin mentores en sistema" vs "sin resultados de búsqueda"
2. No hay paginación implementada
3. No hay manejo de imágenes rotas (404)

---

## Technical Approach

**Chosen approach:** Implementar gaps de forma incremental sobre el código existente

**Why this approach:**
- ✅ El código base ya sigue las convenciones del proyecto
- ✅ Minimiza riesgos de regresión
- ✅ Cambios enfocados y testeables
- ❌ Trade-off: Requiere entender bien el código existente

---

## Implementation Steps

### **Step 1: Empty State Diferenciado**

**Task:** Diferenciar entre "no hay mentores verificados en el sistema" vs "sin resultados por filtros"

**File:** `src/app/mentors/page.tsx`

**Details:**
- Ejecutar dos queries: una sin filtros (cuenta total) y otra con filtros
- Si no hay mentores verificados en el sistema → mostrar empty state global con CTA "Aplica como mentor"
- Si hay mentores pero no hay resultados → mostrar empty state de búsqueda

**Logic:**
```typescript
// Query adicional para verificar si hay mentores en el sistema
const { count: totalMentors } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("role", "mentor")
  .eq("is_verified", true);

const hasNoMentorsInSystem = totalMentors === 0;
const hasNoFilterResults = mentors.length === 0 && !hasNoMentorsInSystem;
```

**Empty States:**
- **Sin mentores en sistema:** "Aún no hay mentores disponibles. ¡Vuelve pronto o aplica para ser uno!"
- **Sin resultados de filtro:** "No se encontraron mentores con los filtros seleccionados."

**Testing:**
- TC-003: Verificar empty state cuando no hay mentores verificados

---

### **Step 2: Manejo de Imagen Rota en MentorCard**

**Task:** Añadir fallback cuando la imagen del mentor devuelve 404

**File:** `src/components/mentors/mentor-card.tsx`

**Details:**
- Convertir a Client Component (necesario para useState)
- Añadir estado `imageError` para detectar fallo de carga
- Mostrar avatar con inicial cuando la imagen falla

**Structure:**
```typescript
"use client"
import { useState } from "react"

// ... dentro del componente
const [imageError, setImageError] = useState(false)

// En el render:
{mentor.photoUrl && !imageError ? (
  <Image
    src={mentor.photoUrl}
    onError={() => setImageError(true)}
    ...
  />
) : (
  <div className="fallback-avatar">
    {mentor.name.charAt(0)}
  </div>
)}
```

**Testing:**
- TC-004: Verificar avatar de fallback para imagen rota

---

### **Step 3: Paginación Cursor-Based**

**Task:** Implementar paginación para manejar grandes cantidades de mentores

**Files:**
- `src/app/mentors/page.tsx` - Lógica de paginación
- `src/components/mentors/mentor-pagination.tsx` - Componente de UI (nuevo)

**Details:**
- Usar cursor-based pagination con `id` del último mentor
- Implementar botones "Anterior" / "Siguiente"
- Mostrar indicador de página actual
- Límite: 12 mentores por página (para grid 3x4)

**Query Modification:**
```typescript
const PAGE_SIZE = 12;

let mentorQuery = supabase
  .from("profiles")
  .select("*")
  .eq("role", "mentor")
  .eq("is_verified", true)
  .order("average_rating", { ascending: false })
  .limit(PAGE_SIZE + 1); // +1 para saber si hay más

if (cursor) {
  mentorQuery = mentorQuery.lt("average_rating", cursorRating);
}

// Determinar si hay siguiente página
const hasNextPage = mentors.length > PAGE_SIZE;
const displayedMentors = hasNextPage ? mentors.slice(0, PAGE_SIZE) : mentors;
```

**UI Component:**
```typescript
// src/components/mentors/mentor-pagination.tsx
interface MentorPaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  prevCursor?: string;
}
```

**Testing:**
- TC-005: Verificar paginación - carga de segunda página

---

### **Step 4: Verificación y Testing**

**Task:** Ejecutar linting, build y verificar funcionalidad

**Details:**
- Ejecutar `bun run lint` y corregir errores
- Ejecutar `bun run build` y verificar que compila
- Verificar visualmente en dev server:
  - Empty state sin mentores
  - Empty state con filtros sin resultados
  - Grid con mentores
  - Paginación funcionando
  - Fallback de imagen

**Testing:**
- Todos los test cases del documento test-cases.md

---

## Technical Decisions

### Decision 1: Client Component para MentorCard

**Chosen:** Convertir MentorCard a Client Component

**Reasoning:**
- ✅ Necesario para manejar estado de imagen (onError)
- ✅ El componente es pequeño, impacto mínimo en bundle
- ❌ Trade-off: Ya no se puede usar en Server Component puro

### Decision 2: Paginación via URL params

**Chosen:** Usar searchParams para cursor de paginación

**Reasoning:**
- ✅ Permite compartir URLs con página específica
- ✅ Compatible con Server Components
- ✅ Historial del navegador funciona correctamente
- ❌ Trade-off: Reload completo de página al paginar

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla `profiles` con campo `is_verified` - Ya existe
- [x] Función RPC `get_all_unique_skills` - Ya existe
- [x] Componentes UI (Card, Badge, Button) - Ya existen

---

## Risks & Mitigations

**Risk 1:** Paginación puede afectar performance con muchos mentores
- **Impact:** Medium
- **Mitigation:** Usar cursor-based en lugar de offset-based, limitar a 12 por página

**Risk 2:** Convertir MentorCard a Client Component puede afectar SEO
- **Impact:** Low
- **Mitigation:** Los datos siguen viniendo del Server Component padre, solo el rendering de la imagen es cliente

---

## Estimated Effort

| Step                              | Time   |
| --------------------------------- | ------ |
| 1. Empty State Diferenciado       | 30min  |
| 2. Manejo de Imagen Rota          | 20min  |
| 3. Paginación Cursor-Based        | 1h     |
| 4. Verificación y Testing         | 30min  |
| **Total**                         | **2h** |

**Story points:** 5 (según estimación original)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [x] Imports desde tipos de Supabase
  - [x] Props de componentes tipadas
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [x] Bordes según estilo Moderno/Bold
  - [x] Sombras según estilo (hover:shadow-lg)
  - [x] Paleta de colores aplicada
- [ ] **Content Writing contextual (NO genérico)**
  - [ ] Mensaje de empty state específico del dominio
- [ ] Tests E2E pasando (referencia: test-cases.md)
  - [ ] TC-001: Mentores ordenados por rating descendente
  - [ ] TC-002: Contenido de MentorCard correcto
  - [ ] TC-003: Empty state sin mentores verificados
  - [ ] TC-004: Avatar fallback para imagen rota
  - [ ] TC-005: Paginación funcional
  - [ ] TC-006: Responsive design
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` pasa
  - [ ] `bun run build` pasa
- [ ] Code review aprobado
- [ ] Deployed to staging

---

**Generado por:** Claude Code
**Fecha:** 2025-12-07
