# Implementation Plan: STORY-MYM-35 - View Profile Reviews

## Overview

Implementar la visualización completa de reviews y ratings en perfiles de mentor, incluyendo histograma de distribución, ordenamiento, paginación y funcionalidad de reporte.

**Acceptance Criteria a cumplir:**
- Mostrar rating promedio con formato "X.X/5.0 (based on N reviews)"
- Mostrar histograma de distribución de ratings (5★ a 1★)
- Lista de reviews con nombre del reviewer, rating, comentario y fecha
- Ordenamiento: Most Recent, Highest Rated, Lowest Rated
- Paginación: 10 reviews por página
- Estado vacío cuando no hay reviews
- Botón para reportar/flag reviews inapropiadas

---

## Technical Approach

**Chosen approach:** Client Components con URL State para filtros/paginación

**Alternatives considered:**
- **Server Components con SSR completo**: Más SEO-friendly pero requiere round-trips completos para cada cambio de filtro
- **Full client-side state (useState)**: Más simple pero no permite compartir URLs con estado

**Why this approach:**
- ✅ URL params permiten compartir links con filtros/página específica
- ✅ Next.js App Router soporta searchParams nativamente
- ✅ Componentes pueden ser renderizados en servidor para carga inicial
- ❌ Trade-off: Requiere más manejo de estado entre cliente y servidor

---

## UI/UX Design

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ Card → Para cada review individual
- ✅ Badge → Para mostrar rating stars
- ✅ Button → Para paginación y reportar
- ✅ Select (usar shadcn/ui Select) → Para sort/filter dropdowns

### Componentes custom a crear:

**🆕 RatingDisplay**
- **Propósito:** Mostrar rating promedio con estrellas visuales
- **Props:** `rating: number`, `totalReviews: number`
- **Ubicación:** `components/reviews/rating-display.tsx`

**🆕 RatingBreakdown**
- **Propósito:** Histograma de distribución de ratings
- **Props:** `distribution: Record<1|2|3|4|5, number>`, `totalReviews: number`
- **Ubicación:** `components/reviews/rating-breakdown.tsx`

**🆕 ReviewCard**
- **Propósito:** Mostrar un review individual
- **Props:** `review: Review`, `onFlag: (id: string) => void`
- **Ubicación:** `components/reviews/review-card.tsx`

**🆕 ReviewsList**
- **Propósito:** Contenedor de reviews con sort/filter/pagination
- **Props:** `reviews: Review[]`, `mentorId: string`
- **Ubicación:** `components/reviews/reviews-list.tsx`

**🆕 ReviewsSection**
- **Propósito:** Sección completa que integra rating display + breakdown + list
- **Props:** `mentorId: string`, `reviews: Review[]`, `averageRating: number`, `totalReviews: number`
- **Ubicación:** `components/reviews/reviews-section.tsx`

### Wireframes/Layout:

```
┌──────────────────────────────────────────────────────────────────┐
│ Reviews (23)                                                     │
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌──────────────────────────────┐ │
│ │ ★★★★☆ 4.7/5.0              │ │ 5★ ███████████████ 65%    15 │ │
│ │ (based on 23 reviews)       │ │ 4★ ██████         22%     5 │ │
│ │                             │ │ 3★ ██             9%      2 │ │
│ │                             │ │ 2★               0%      0 │ │
│ │                             │ │ 1★ █              4%      1 │ │
│ └─────────────────────────────┘ └──────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ [Sort: Most Recent ▼]  [Filter: All Ratings ▼]                   │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Laura Martinez              ★★★★★    Nov 10, 2025  [Flag] │   │
│ │ "Excellent mentor! Carlos helped me debug a complex..."    │   │
│ └────────────────────────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Sofia Rojas                 ★★★★☆    Nov 5, 2025   [Flag] │   │
│ │ "Very knowledgeable about architecture patterns..."        │   │
│ └────────────────────────────────────────────────────────────┘   │
│ ... (8 more reviews)                                             │
├──────────────────────────────────────────────────────────────────┤
│ [← Prev]  Page 1 of 3  [Next →]                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton loader para rating display, breakdown y cards
- **Empty:** "No reviews yet" con mensaje de invitación
- **Error:** "Unable to load reviews. Please try again." con botón Retry
- **Success:** Vista normal con todos los datos

### Responsividad:

- **Mobile (< 768px):** Rating y breakdown stacked verticalmente, cards full width
- **Tablet (768px - 1024px):** Rating y breakdown side by side
- **Desktop (> 1024px):** Layout completo como wireframe

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos generados de DB

**Nuevos tipos a crear:**

```typescript
// types/reviews.ts
export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    id: string;
    name: string | null;
  };
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export type ReviewSortOption = 'recent' | 'highest' | 'lowest';
export type ReviewFilterOption = 'all' | '5' | '4' | '3' | '2' | '1';
```

---

## Implementation Steps

### **Step 1: Create Review Types**

**Task:** Crear tipos para reviews y rating distribution

**Details:**
- Crear archivo `src/types/reviews.ts`
- Definir interfaces Review, RatingDistribution, y enums de sort/filter
- Exportar en `src/types/index.ts`

**File:** `src/types/reviews.ts`

**Testing:**
- TypeScript compilation check

---

### **Step 2: Create RatingDisplay Component**

**Task:** Componente para mostrar rating promedio con estrellas

**File:** `src/components/reviews/rating-display.tsx`

**Structure:**
- Mostrar rating numérico (4.7/5.0)
- Visualización de estrellas (llenas, parciales, vacías)
- Texto "(based on N reviews)" con pluralización correcta

**Edge cases:**
- 0 reviews: Mostrar "No rating yet"
- 1 review: Singular "1 review"
- Rating decimal: Mostrar 1 decimal (4.7)

**Testing:**
- Verificar pluralización
- Verificar estrellas parciales

---

### **Step 3: Create RatingBreakdown Component**

**Task:** Componente histograma de distribución de ratings

**File:** `src/components/reviews/rating-breakdown.tsx`

**Structure:**
- 5 filas (5★ a 1★)
- Cada fila: Stars icon + Progress bar + Porcentaje + Count
- Progress bar proporcional al porcentaje

**Calculation:**
```typescript
const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
```

**Edge cases:**
- 0 reviews: No mostrar o barras en 0%
- 100% en una categoría: Barra completa

---

### **Step 4: Create ReviewCard Component**

**Task:** Componente para mostrar un review individual

**File:** `src/components/reviews/review-card.tsx`

**Structure:**
- Header: Reviewer name + Stars + Date + Flag button
- Body: Comment text (preserve line breaks)
- Sanitización de texto (prevent XSS)

**Edge cases:**
- Comment null/empty: No mostrar sección de comentario
- Deleted reviewer: Mostrar "Deleted User"
- Long comment: white-space: pre-wrap, no truncación

---

### **Step 5: Create ReviewsList Component (Client Component)**

**Task:** Componente con lista paginada y controles de sort/filter

**File:** `src/components/reviews/reviews-list.tsx`

**Structure:**
- "use client" - Componente cliente para interactividad
- Sort dropdown (Most Recent, Highest, Lowest)
- Filter dropdown (All, 5★, 4★, 3★, 2★, 1★)
- Lista de ReviewCards
- Paginación (Prev/Next + Page X of Y)
- URL state sync con searchParams

**Logic:**
```typescript
// Sort
const sortedReviews = useMemo(() => {
  return [...reviews].sort((a, b) => {
    if (sort === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === 'highest') return b.rating - a.rating;
    if (sort === 'lowest') return a.rating - b.rating;
  });
}, [reviews, sort]);

// Filter
const filteredReviews = useMemo(() => {
  if (filter === 'all') return sortedReviews;
  return sortedReviews.filter(r => r.rating === parseInt(filter));
}, [sortedReviews, filter]);

// Pagination
const paginatedReviews = useMemo(() => {
  const start = (page - 1) * REVIEWS_PER_PAGE;
  return filteredReviews.slice(start, start + REVIEWS_PER_PAGE);
}, [filteredReviews, page]);
```

**Edge cases:**
- Empty after filter: Mostrar empty state
- Invalid page param: Reset to page 1

---

### **Step 6: Create ReviewsSection Component**

**Task:** Componente contenedor que integra todo

**File:** `src/components/reviews/reviews-section.tsx`

**Structure:**
- Header con título "Reviews (N)"
- Grid: RatingDisplay + RatingBreakdown
- ReviewsList
- Empty state cuando no hay reviews

---

### **Step 7: Calculate Rating Distribution**

**Task:** Función para calcular distribución de ratings

**File:** `src/lib/reviews.ts`

**Function:**
```typescript
export function calculateRatingDistribution(reviews: { rating: number }[]): RatingDistribution {
  const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating as 1|2|3|4|5]++;
    }
  });
  return distribution;
}
```

---

### **Step 8: Update Mentor Profile Page**

**Task:** Integrar ReviewsSection en la página de perfil

**File:** `src/app/mentors/[id]/page.tsx`

**Changes:**
- Importar ReviewsSection
- Calcular rating distribution desde reviews
- Reemplazar sección de reviews actual con ReviewsSection

---

### **Step 9: Add shadcn/ui Select Component**

**Task:** Instalar componente Select para dropdowns

**Command:**
```bash
bunx shadcn@latest add select
```

**Usage:** Para sort y filter dropdowns en ReviewsList

---

### **Step 10: Integration & Testing**

**Task:** Probar flujo completo

**Flow:**
1. Navegar a perfil de mentor
2. Verificar rating display y breakdown
3. Probar sort (recent/highest/lowest)
4. Probar filter (5★, 4★, etc.)
5. Probar paginación (prev/next, direct URL)
6. Verificar empty state en mentor sin reviews
7. Verificar mobile responsive

**Testing:**
- Manual smoke test en dev
- Verificar URL params funcionan

---

## Technical Decisions

### Decision 1: Client-side filtering vs Server-side

**Chosen:** Client-side filtering

**Reasoning:**
- ✅ Reviews ya se cargan con el perfil (no fetch adicional)
- ✅ Respuesta instantánea sin roundtrips
- ✅ Menos carga en el servidor
- ❌ Trade-off: Si hay 1000+ reviews, podría ser lento (pero para MVP es aceptable)

### Decision 2: URL State para paginación

**Chosen:** Usar searchParams en URL

**Reasoning:**
- ✅ Permite compartir links con página/filtro específico
- ✅ Browser back/forward funciona correctamente
- ✅ SEO friendly para pages de reviews

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Tabla reviews existe en Supabase
- [x] Profiles tienen average_rating y total_reviews
- [ ] shadcn/ui Select component instalado

---

## Risks & Mitigations

**Risk 1:** Performance con muchos reviews
- **Impact:** Medium
- **Mitigation:** Límite de 100 reviews cargados, paginación cliente-side

**Risk 2:** Reviews con contenido XSS
- **Impact:** High
- **Mitigation:** React escapa texto por defecto, no usar dangerouslySetInnerHTML

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | Review Types | 10 min |
| 2 | RatingDisplay | 20 min |
| 3 | RatingBreakdown | 30 min |
| 4 | ReviewCard | 20 min |
| 5 | ReviewsList | 45 min |
| 6 | ReviewsSection | 15 min |
| 7 | Rating Distribution util | 10 min |
| 8 | Update Mentor Profile | 20 min |
| 9 | Add Select component | 5 min |
| 10 | Integration & Testing | 30 min |
| **Total** | | **~3.5 hrs** |

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/supabase` en componentes
  - [ ] Props tipadas correctamente
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada (Moderno/Bold)**
  - [ ] Bordes redondeados (rounded-lg)
  - [ ] Sombras sutiles (shadow-sm, hover:shadow-lg)
  - [ ] Colores primary/secondary del design system
- [ ] **Test IDs agregados para E2E**
  - [ ] `data-testid="rating-display"`
  - [ ] `data-testid="rating-breakdown"`
  - [ ] `data-testid="reviews-list"`
  - [ ] `data-testid="review-card"`
  - [ ] `data-testid="reviews-empty-state"`
  - [ ] `data-testid="reviews-pagination"`
- [ ] Linting passes (`bun run lint`)
- [ ] Build passes (`bun run build`)
- [ ] Manual smoke test:
  - [ ] Desktop: Layout correcto
  - [ ] Mobile: Responsive layout
  - [ ] Sort/Filter funcionan
  - [ ] Paginación funciona
  - [ ] Empty state visible en mentor sin reviews

---

**Output:** Archivo listo para implementación

**Fecha:** 2025-12-07
**Generado por:** Claude Code
