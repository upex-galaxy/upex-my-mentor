# Feature Implementation Plan: EPIC-MYM-13 - Mentor Discovery & Search

## Overview

Esta feature implementa el motor de descubrimiento del marketplace: permite a los mentees encontrar mentores verificados mediante búsqueda por keyword, filtrado por skills, y visualización de perfiles detallados.

**Alcance:**
- MYM-14: Mentor Gallery (Ver todos los mentores) ✅ Implementado
- MYM-15: Search by Keyword (Buscar mentores) ✅ Implementado
- MYM-16: Filter by Skills (Filtrar por habilidades) 🔄 En Progreso
- MYM-17: Mentor Detail Page (Ver perfil detallado) ✅ Implementado

**Stack técnico:**
- Frontend: Next.js 15 (App Router) + React Server Components
- Backend: Supabase (PostgreSQL + RPC Functions)
- Database: PostgreSQL con RLS policies
- Deployment: Vercel
- Testing: Vitest (unit) + Playwright (E2E)

---

## Technical Decisions

### Decision 1: Server-Side Filtering vs Client-Side

**Options considered:**
- A) Client-side filtering (fetch all, filter in browser)
- B) Server-side filtering via Supabase queries
- C) Server-side filtering via RPC functions

**Chosen:** C) Server-side filtering via RPC functions

**Reasoning:**
- ✅ Escala con crecimiento de mentores (no fetch all)
- ✅ Type-safe con Supabase generated types
- ✅ Parameterized queries previenen SQL injection
- ✅ RPC permite lógica compleja (full-text search)
- ❌ Trade-off: Requiere crear/mantener funciones PostgreSQL

**Implementation notes:**
- `search_mentors_by_keyword(search_keyword TEXT)` - búsqueda multi-campo
- `get_all_unique_skills()` - lista de skills disponibles
- Queries usan `.contains()` para array containment (AND logic)

---

### Decision 2: Skill Filter Logic (AND vs OR)

**Options considered:**
- A) OR logic: mentors con ANY skill seleccionado
- B) AND logic: mentors con ALL skills seleccionados

**Chosen:** B) AND logic (según AC de MYM-16)

**Reasoning:**
- ✅ Cumple acceptance criteria: "mentors who have both 'Python' AND 'Django'"
- ✅ Permite narrowing progresivo de resultados
- ✅ Más útil para encontrar matches específicos
- ❌ Trade-off: Puede resultar en 0 resultados si combinación muy específica

**Implementation notes:**
- Usar Supabase `.contains("specialties", skills)` que mapea a PostgreSQL `@>` operator
- El operator `@>` verifica que el array contiene TODOS los elementos

---

### Decision 3: URL State Management para Filtros

**Options considered:**
- A) React state only (perdido en refresh)
- B) URL search params (shareable, persistente)
- C) LocalStorage (persistente pero no shareable)

**Chosen:** B) URL search params

**Reasoning:**
- ✅ URLs shareables para compartir búsquedas específicas
- ✅ Funciona con Server Components (params disponibles en server)
- ✅ Browser back/forward funciona naturalmente
- ✅ Bookmarkeable
- ❌ Trade-off: URL puede volverse larga con muchos filtros

**Implementation notes:**
- `?keyword=React&skill=Python&skill=Django` para múltiples skills
- Client component `MentorFilters` actualiza URL via `router.replace()`
- Server component `MentorsPage` lee params y ejecuta query

---

### Decision 4: Cursor-Based Pagination

**Chosen:** Cursor-based con composite key (average_rating, id)

**Reasoning:**
- ✅ Estable cuando data cambia (nuevos mentors agregados)
- ✅ Mejor performance con datasets grandes
- ✅ Evita duplicados entre páginas
- ❌ Trade-off: No permite "ir a página N" directamente

**Implementation notes:**
- Cursor format: `{average_rating}:{id}` (ej: `4.5:uuid-123`)
- Query usa OR condition para cursor comparison
- PAGE_SIZE = 12 mentors por página

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos generados desde Supabase schema
- `src/types/index.ts` - Domain types (Mentor, MentorProfile, etc.)

**Estrategia de tipos:**

```typescript
// Database types (from Supabase)
type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Domain types (transformed for frontend)
interface Mentor extends User {
  role: "mentor"
  profile: MentorProfile
}

// Transformation function
function transformToMentor(profile: ProfileRow): Mentor
```

**Directiva para todas las stories:**
- ✅ Usar `ProfileRow` para queries de DB
- ✅ Transformar a `Mentor` para componentes React
- ✅ Props de componentes tipadas con domain types

---

## UI/UX Design Strategy

### Componentes del Design System usados:

- ✅ `Input` - Search bar con icono de búsqueda
- ✅ `Badge` - Skill pills clickeables (outline/default variants)
- ✅ `Card` - MentorCard para grid
- ✅ `Button` - CTAs y clear filters
- ✅ `Skeleton` - Loading states

### Componentes custom de la feature:

- 🆕 `MentorFilters` - Sidebar con search + skill badges
  - **Usado por:** MYM-15, MYM-16
  - **Ubicación:** `components/mentors/mentor-filters.tsx`

- 🆕 `MentorCard` - Card de preview del mentor
  - **Usado por:** MYM-14, MYM-15, MYM-16
  - **Ubicación:** `components/mentors/mentor-card.tsx`

- 🆕 `MentorPagination` - Controles de paginación
  - **Usado por:** MYM-14
  - **Ubicación:** `components/mentors/mentor-pagination.tsx`

- 🆕 `ClearSearchButton` - Botón para limpiar filtros
  - **Usado por:** MYM-15, MYM-16
  - **Ubicación:** `components/mentors/clear-search-button.tsx`

### Paleta aplicada:

- Primary: `bg-primary` - Badges seleccionados, CTAs
- Secondary: `bg-secondary` - Backgrounds hover
- Muted: `text-muted-foreground` - Labels, secondary text
- Accent: `bg-accent` - Empty state icons

### Estados de UI:

- **Loading:** Skeleton cards (SSR handles initial load)
- **Empty (no mentors):** "Aún no hay mentores disponibles"
- **Empty (no results):** "No mentors found matching '[keyword]'"
- **Success:** Grid de MentorCards

---

## Shared Dependencies

**Todas las stories requieren:**

1. **Supabase Client**
   - `src/lib/supabase/server.ts` - Server component usage
   - `src/lib/supabase/client.ts` - Client component usage

2. **RPC Functions (PostgreSQL):**
   - `search_mentors_by_keyword` - Full-text search
   - `get_all_unique_skills` - Skills list for filter UI

3. **Environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Architecture Notes

### Folder Structure

```
src/
├── app/mentors/
│   ├── page.tsx              # Gallery (MYM-14, MYM-15, MYM-16)
│   └── [id]/page.tsx         # Detail (MYM-17)
├── components/mentors/
│   ├── mentor-card.tsx       # Preview card
│   ├── mentor-filters.tsx    # Search + skill filters
│   ├── mentor-pagination.tsx # Pagination controls
│   └── clear-search-button.tsx # Clear filters CTA
└── types/
    ├── index.ts              # Domain types
    └── supabase.ts           # DB types
```

### Data Flow

```
User Action (select skill)
    ↓
MentorFilters (client) updates URL params
    ↓
Browser navigates to /mentors?skill=Python&skill=Django
    ↓
MentorsPage (server) reads searchParams
    ↓
Supabase query with .contains("specialties", skills)
    ↓
Server renders MentorCards with filtered data
```

---

## Implementation Order

**Completado:**

1. **MYM-14: Mentor Gallery** (base para todo)
   - Razón: Establece page, MentorCard, pagination

2. **MYM-15: Keyword Search** (añade búsqueda)
   - Razón: Implementa MentorFilters, RPC function

**En Progreso:**

3. **MYM-16: Skill Filters** (añade filtrado)
   - Razón: Extiende MentorFilters existente
   - **Bugs a corregir:** MYM-46, MYM-47, MYM-48

**Completado:**

4. **MYM-17: Mentor Detail Page**
   - Razón: Completa flujo discovery → detail

---

## Risks & Mitigations

### Risk 1: Filtros AND resultan en 0 mentores

**Impact:** Medium (UX frustration)
**Likelihood:** High
**Mitigation:**
- Mostrar mensaje claro con sugerencia de relajar filtros
- Botón "Clear filters" prominente
- Considerar mostrar count de mentores por skill (v2)

### Risk 2: Performance con muchos mentores

**Impact:** High (slow page load)
**Likelihood:** Low (MVP tiene ~50 mentors)
**Mitigation:**
- Cursor-based pagination implementada
- Indexes en DB (specialties GIN, is_verified)
- PAGE_SIZE = 12 mantiene payload pequeño

### Risk 3: Skills inconsistentes (case sensitivity)

**Impact:** Medium (filtros no funcionan como esperado)
**Likelihood:** Medium
**Mitigation:**
- Skills en DB deben estar normalizados (title case)
- RPC function `get_all_unique_skills` retorna distinct skills

---

## Success Criteria

**Esta feature estará completa cuando:**

- [x] MYM-14: Gallery básico funcionando
- [x] MYM-15: Keyword search funcionando
- [ ] MYM-16: Skill filters con AND logic
- [x] MYM-17: Detail page funcionando
- [ ] **Bugs corregidos:**
  - [ ] MYM-46: Trim de espacios en búsqueda
  - [ ] MYM-47: AND logic en skill filters
  - [ ] MYM-48: Filtros server-side (no client-only)
- [ ] Build y linting pasando (`bun run build`, `bun run lint`)
- [ ] Tests manuales de acceptance criteria pasando

---

**Plan creado:** 2025-12-12
**Epic:** EPIC-MYM-13 (Mentor Discovery & Search)
**Generado por:** Claude Code
