# Implementation Plan: STORY-MYM-10 - Review Mentor Application Details

**Fecha:** 2025-12-05
**Autor:** Claude Code (AI-Assisted)
**Story Jira Key:** MYM-10
**Epic:** EPIC-MYM-8 - Mentor Vetting & Onboarding

---

## Overview

Implementar la vista de detalle de una aplicación de mentor, permitiendo a los administradores revisar el perfil completo antes de tomar una decisión de aprobación/rechazo.

**Acceptance Criteria a cumplir:**
- Admin puede navegar desde la lista de aplicaciones pendientes a la vista de detalle
- Vista muestra todos los campos del perfil del mentor (name, email, bio, specialties, LinkedIn, GitHub, etc.)
- LinkedIn y GitHub URLs son links clickeables que abren en nueva pestaña con atributos de seguridad
- Admin puede volver a la lista de aplicaciones
- Aplicaciones en cualquier estado (PENDING, VERIFIED) son visibles para auditoría

---

## Technical Approach

**Chosen approach:** Server Component con dynamic route `/admin/applications/[id]`

**Alternatives considered:**
- Modal sobre la tabla: Descartado - espacio limitado para revisar perfiles externos
- Slide-over panel: Descartado - no permite URLs directas para bookmarking

**Why this approach:**
- ✅ Full screen para revisar LinkedIn/GitHub en nuevas tabs
- ✅ URL directa para compartir/bookmark aplicaciones específicas
- ✅ SSR con data fetching eficiente (RSC)
- ✅ Prepara estructura para MYM-11 (approve/reject buttons)
- ❌ Trade-off: Extra navigation step vs inline review

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md`

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ `Button` → `variant="outline"` para back, `variant="default"` para external links
- ✅ `Card` → Contenedor principal del detalle
- ✅ `Badge` → Especialidades y status indicator
- ✅ `AdminLayout` → Layout wrapper consistente con MYM-9

### Componentes custom a crear:

**Componentes específicos del dominio (nuevos):**

1. 🆕 `ApplicationDetail`
   - **Propósito:** Renderiza todos los campos del perfil de una aplicación
   - **Props:** `application: ApplicationDetail`
   - **Ubicación:** `components/admin/application-detail.tsx`

2. 🆕 `StatusBadge`
   - **Propósito:** Muestra estado de verificación (Pending, Verified)
   - **Props:** `isVerified: boolean`
   - **Ubicación:** `components/admin/status-badge.tsx`

3. 🆕 `ExternalLink`
   - **Propósito:** Link externo con icono y atributos de seguridad
   - **Props:** `href: string, label: string, icon?: LucideIcon`
   - **Ubicación:** `components/admin/external-link.tsx`

### Wireframe/Layout:

**Estructura de la página:**
```
┌──────────────────────────────────────────────────────────┐
│ AdminLayout: "Application Details"                        │
├──────────────────────────────────────────────────────────┤
│ ← Back to Applications                    [StatusBadge]  │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Card: Profile Information                            │ │
│ │ ┌─────────┐                                          │ │
│ │ │ Avatar  │  Name (H2)                               │ │
│ │ │ /Photo  │  email@example.com                       │ │
│ │ └─────────┘  Applied: Dec 1, 2025                    │ │
│ │──────────────────────────────────────────────────────│ │
│ │ Bio / Description                                    │ │
│ │ [Full text with proper wrapping]                     │ │
│ │──────────────────────────────────────────────────────│ │
│ │ Specialties                                          │ │
│ │ [Badge] [Badge] [Badge] [Badge]                      │ │
│ │──────────────────────────────────────────────────────│ │
│ │ Experience & Rates                                   │ │
│ │ • Years of Experience: 10                            │ │
│ │ • Hourly Rate: $75/hr                                │ │
│ │ • Rating: ⭐ 4.8 (12 reviews)                        │ │
│ │──────────────────────────────────────────────────────│ │
│ │ External Profiles                                    │ │
│ │ [LinkedIn ↗] [GitHub ↗]                              │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Placeholder for MYM-11: Approve/Reject buttons]         │
└──────────────────────────────────────────────────────────┘
```

### Estados de UI:

**Estados visuales a implementar:**
- **Loading:** Skeleton loader con estructura similar al layout final
- **Not Found:** 404 page con mensaje "Application not found" y link back
- **Error:** Error message con retry option
- **Success:** Vista completa con todos los datos

### Edge Cases (PO Decisions):

| Campo | Edge Case | Comportamiento |
|-------|-----------|----------------|
| `photo_url` | null | Placeholder avatar (User icon o iniciales) |
| `github_url` | null | Mostrar "Not provided" (no esconder sección) |
| `linkedin_url` | null | Mostrar "Not provided" (no esconder sección) |
| `specialties` | [] | Mostrar "No specialties listed" |
| `description` | null | Mostrar "No bio provided" |
| `hourly_rate` | null | Mostrar "Not specified" |

### Responsividad:

**Breakpoints:**
- **Mobile (< 768px):** Stack vertical, avatar smaller
- **Tablet (768px - 1024px):** Similar a desktop
- **Desktop (> 1024px):** Layout completo como wireframe

### Personalidad UI/UX: Moderno/Bold

**Aplicar:**
- Sombras pronunciadas en hover (`shadow-lg`)
- Bordes redondeados (`rounded-lg`)
- Transiciones suaves (`transition-all duration-200`)
- External links con icono `ExternalLink` de lucide-react

---

## Types & Type Safety

**Tipos existentes:**
- `PendingApplication` en `src/types/index.ts` (MYM-9)

**Tipos nuevos requeridos:**

```typescript
// Agregar a src/types/index.ts

// MYM-10: Application Detail (extends PendingApplication)
export interface ApplicationDetail extends PendingApplication {
  description: string | null       // bio del mentor (campo: description)
  photo_url: string | null         // avatar
  hourly_rate: number | null
  is_verified: boolean
  years_of_experience: number | null
  average_rating: number | null
  total_reviews: number | null
}
```

**Nota sobre campos del PO:**
- ⚠️ El PO solicitó `languages` y `timezone` pero estos campos **NO existen** en el schema actual de `profiles`.
- **Decisión MVP:** Omitir estos campos. Se agregarán en una futura migración si se requieren.

**Directiva:**
- ✅ Importar tipos desde `@/types`
- ✅ Props de componentes tipadas
- ✅ Zero type errors

---

## Content Writing

**Vocabulario del dominio:**
- "Application" (no "request")
- "Mentor" (no "teacher")
- "Review" (no "check")

**Copy contextual:**
- Page title: "Application Details"
- Back button: "Back to Applications"
- Empty bio: "No bio provided"
- Empty specialties: "No specialties listed"
- Empty hourly rate: "Rate not specified"
- Not provided: "Not provided"

**Mensajes de error:**
- 404: "Application not found"
- 500: "Unable to load application details. Please try again."

---

## Implementation Steps

### **Step 1: Add ApplicationDetail Type**

**Task:** Agregar el tipo `ApplicationDetail` al archivo de tipos existente

**File:** `src/types/index.ts`

**Details:**
- Extender `PendingApplication` con campos adicionales
- Campos: description, photo_url, hourly_rate, is_verified, years_of_experience, average_rating, total_reviews

**Testing:**
- TypeScript: Verificar que el tipo compila sin errores
- Import test: Verificar import en otro archivo

**Estimated effort:** Small

---

### **Step 2: Create StatusBadge Component**

**Task:** Crear componente para mostrar estado de verificación

**File:** `src/components/admin/status-badge.tsx`

**Structure:**
```tsx
interface StatusBadgeProps {
  isVerified: boolean
}

// Renders:
// - Pending: Badge outline con texto "Pending Review"
// - Verified: Badge default con texto "Verified" y icono check
```

**Styling:**
- Pending: `variant="outline"` con borde amarillo/amber
- Verified: `variant="default"` (primary) con CheckCircle icon

**Testing:**
- Unit test: Render con isVerified=true y isVerified=false
- Visual: Verificar colores correctos

**Estimated effort:** Small

---

### **Step 3: Create ExternalLink Component**

**Task:** Crear componente reutilizable para links externos

**File:** `src/components/admin/external-link.tsx`

**Structure:**
```tsx
interface ExternalLinkProps {
  href: string | null
  label: string
  icon: LucideIcon
}

// Renders:
// - Si href existe: Link clickeable con target="_blank" rel="noopener noreferrer"
// - Si href es null: Texto "Not provided" en muted
```

**Security:**
- `target="_blank"`
- `rel="noopener noreferrer"`
- Icon `ExternalLink` de lucide-react

**Testing:**
- Unit test: Verificar atributos de seguridad
- Unit test: Verificar fallback cuando href es null

**Estimated effort:** Small

---

### **Step 4: Create ApplicationDetail Component**

**Task:** Crear componente principal que renderiza todos los campos

**File:** `src/components/admin/application-detail.tsx`

**Structure:**
```tsx
interface ApplicationDetailProps {
  application: ApplicationDetail
}

// Sections:
// 1. Header: Avatar + Name + Email + Application Date
// 2. Bio: Full description text
// 3. Specialties: Badges grid
// 4. Experience & Rates: Years, hourly rate, rating
// 5. External Profiles: LinkedIn, GitHub
```

**Edge cases handled:**
- Missing avatar → Placeholder con User icon
- Empty specialties → "No specialties listed"
- Null description → "No bio provided"
- Null hourly_rate → "Rate not specified"
- Null linkedin/github → "Not provided" via ExternalLink

**Styling:**
- Card container con `p-6 space-y-6`
- Sections separadas con `border-t border-border pt-6`
- Avatar: `w-20 h-20 rounded-full`

**Testing:**
- Unit tests para cada edge case
- Snapshot test para layout completo

**Estimated effort:** Medium

---

### **Step 5: Create Detail Page**

**Task:** Crear la página dinámica con data fetching

**File:** `src/app/admin/applications/[id]/page.tsx`

**Structure:**
```tsx
// Server Component
interface PageProps {
  params: Promise<{ id: string }>
}

// Data fetching:
// - Query profiles por id
// - Verificar que rol es 'mentor'
// - Handle 404 si no existe
```

**Query:**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select(`
    id, name, email, created_at, specialties, linkedin_url, github_url,
    description, photo_url, hourly_rate, is_verified,
    years_of_experience, average_rating, total_reviews
  `)
  .eq('id', id)
  .eq('role', 'mentor')
  .single()
```

**Edge cases handled:**
- Invalid UUID → 404
- Application not found → 404 page
- Database error → Error state

**Testing:**
- E2E: Navegar desde lista → ver detalle
- E2E: URL directa → ver detalle
- E2E: URL inválida → 404

**Estimated effort:** Medium

---

### **Step 6: Create Loading State**

**Task:** Crear loading.tsx con skeleton loader

**File:** `src/app/admin/applications/[id]/loading.tsx`

**Structure:**
- Skeleton que replica el layout del ApplicationDetail
- Animated pulse effect
- Muestra estructura mientras carga

**Testing:**
- Visual: Verificar que skeleton tiene misma estructura que contenido real

**Estimated effort:** Small

---

### **Step 7: Create Not Found Page**

**Task:** Crear página 404 para aplicaciones no encontradas

**File:** `src/app/admin/applications/[id]/not-found.tsx`

**Structure:**
```tsx
// Centered layout con:
// - Icon de FileX
// - "Application not found"
// - "The application you're looking for doesn't exist or has been removed."
// - Button "Back to Applications" → /admin/applications
```

**Testing:**
- E2E: Navegar a UUID inexistente → ver 404

**Estimated effort:** Small

---

### **Step 8: Integration Testing**

**Task:** Verificar integración completa

**Flow completo:**
1. Admin en `/admin/applications` (MYM-9)
2. Click "Review" en una aplicación
3. Navegar a `/admin/applications/[id]`
4. Ver todos los campos del mentor
5. Click LinkedIn → abre en nueva pestaña
6. Click "Back to Applications" → volver a lista

**Test cases from test-cases.md:**
- TC-001: Admin successfully views pending application details
- TC-002: LinkedIn URL opens in new tab with security attributes
- TC-003: GitHub URL opens in new tab with security attributes
- TC-004: Back button returns to applications list
- TC-005: Specialties displayed as badges
- TC-008: Application ID not found returns 404
- TC-010: View already approved application (audit capability)
- TC-011: Missing avatar displays placeholder
- TC-012: Empty specialties shows fallback message
- TC-013: Missing GitHub URL shows "Not provided"

**Estimated effort:** Medium

---

## Technical Decisions (Story-specific)

### Decision 1: Visibility of All Application States

**Chosen:** Admin puede ver aplicaciones en CUALQUIER estado (PENDING, VERIFIED)

**Reasoning:**
- ✅ Auditoría: Admin puede revisar decisiones pasadas
- ✅ Consistencia: Misma URL funciona para todas las aplicaciones
- ✅ PO Decision: Confirmado en test-cases.md
- ❌ Trade-off: Query no filtra por is_verified

### Decision 2: Omit languages/timezone Fields

**Chosen:** No incluir campos `languages` y `timezone` en MVP

**Reasoning:**
- ✅ Campos NO existen en schema actual de `profiles`
- ✅ Evita migración de base de datos en esta story
- ✅ Se pueden agregar en futura story si se requieren
- ❌ Trade-off: No cumple 100% con request del PO

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] MYM-9 completado (lista de aplicaciones con botón "Review")
- [x] Tabla `profiles` con campos requeridos
- [x] AdminLayout component existente
- [x] Middleware protege rutas `/admin/*`
- [x] Tipo `PendingApplication` definido

**No blockers identificados.**

---

## Risks & Mitigations

**Risk 1:** Admin puede ver perfiles de cualquier usuario (no solo mentores)
- **Impact:** Medium (exposición de datos)
- **Mitigation:** Query filtra por `role='mentor'`

**Risk 2:** External links vulnerables a tabnabbing
- **Impact:** Medium (security)
- **Mitigation:** Todos los external links usan `rel="noopener noreferrer"`

**Risk 3:** Campos nullables causan crashes en UI
- **Impact:** Low (UX issues)
- **Mitigation:** Fallbacks para todos los campos opcionales

---

## Estimated Effort

| Step | Description | Effort |
|------|-------------|--------|
| 1 | Add ApplicationDetail Type | Small |
| 2 | Create StatusBadge Component | Small |
| 3 | Create ExternalLink Component | Small |
| 4 | Create ApplicationDetail Component | Medium |
| 5 | Create Detail Page | Medium |
| 6 | Create Loading State | Small |
| 7 | Create Not Found Page | Small |
| 8 | Integration Testing | Medium |
| **Total** | | **Medium (3-5 story points)** |

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] `ApplicationDetail` type definido en `@/types`
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [ ] Bordes `rounded-lg`
  - [ ] Sombras `shadow-lg` en hover
  - [ ] Transiciones suaves
  - [ ] Paleta de colores del design system
- [ ] **Content Writing contextual (NO genérico)**
  - [ ] Vocabulario: Application, Mentor, Review
  - [ ] Sin frases placeholder
  - [ ] Mensajes de error específicos
- [ ] **Protección de rutas**
  - [ ] Middleware protege `/admin/applications/[id]`
  - [ ] Solo admin puede acceder
- [ ] **Edge cases handled**
  - [ ] Missing avatar → placeholder
  - [ ] Empty specialties → fallback message
  - [ ] Null linkedin/github → "Not provided"
  - [ ] Long bio → proper wrapping
- [ ] Tests E2E pasando (referencia: test-cases.md)
  - [ ] TC-001: View pending application details
  - [ ] TC-002: LinkedIn opens in new tab
  - [ ] TC-003: GitHub opens in new tab
  - [ ] TC-004: Back button navigation
  - [ ] TC-008: 404 for non-existent ID
  - [ ] TC-011: Missing avatar placeholder
  - [ ] TC-012: Empty specialties fallback
  - [ ] TC-013: Missing GitHub shows fallback
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run typecheck` passes
  - [ ] `bun run build` passes
- [ ] Code review aprobado
- [ ] Manual smoke test
  - [ ] UI correcta en desktop
  - [ ] UI correcta en mobile
  - [ ] External links funcionan

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add `ApplicationDetail` type |
| `src/components/admin/status-badge.tsx` | Create | Status indicator component |
| `src/components/admin/external-link.tsx` | Create | Secure external link component |
| `src/components/admin/application-detail.tsx` | Create | Main detail view component |
| `src/app/admin/applications/[id]/page.tsx` | Create | Detail page with data fetching |
| `src/app/admin/applications/[id]/loading.tsx` | Create | Skeleton loader |
| `src/app/admin/applications/[id]/not-found.tsx` | Create | 404 page |

---

## Related Documentation

- **Story:** `stories/STORY-MYM-10-review-application-details/story.md`
- **Test Cases:** `stories/STORY-MYM-10-review-application-details/test-cases.md`
- **Feature Plan:** `feature-implementation-plan.md`
- **Design System:** `.context/design-system.md`
- **Backend Setup:** `.context/backend-setup.md`

---

**Versión:** 1.0
**Última actualización:** 2025-12-05
**Generado con:** Claude Code (AI-Assisted Development)
