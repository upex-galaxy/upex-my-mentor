# Implementation Plan: STORY-MYM-9 - View Pending Mentor Applications

## Overview

Implementar una vista administrativa que permita a los administradores ver la lista de mentores pendientes de verificación, con paginación y navegación hacia el detalle de cada aplicación.

**Acceptance Criteria a cumplir:**
- Admin autenticado puede ver lista de mentores con `is_verified = false` y `role = 'mentor'`
- La lista muestra: nombre, email, fecha de aplicación
- Paginación funcional (20 items por página)
- Estados de UI: loading, empty, error
- Usuarios no-admin son redirigidos

---

## Technical Approach

**Chosen approach:** Server Components + API Route con RLS

**Alternatives considered:**
- **Client-side fetching:** Descartado por seguridad (tokens expuestos) y SEO innecesario para admin
- **Edge Functions (Supabase):** Complejidad innecesaria para MVP

**Why this approach:**
- ✅ Server Components permiten fetch seguro sin exponer tokens
- ✅ Protección en middleware + RLS en DB = defensa en profundidad
- ✅ Consistente con arquitectura existente del proyecto
- ❌ Trade-off: Requiere migración de DB para añadir rol `admin`

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md`

**Estilo visual:** Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ `Button` → variant: `default` para "Review", `outline` para paginación
- ✅ `Card` → Contenedor principal de la tabla
- ✅ `Badge` → Para mostrar conteo de aplicaciones

### Componentes custom a crear:

**Componentes específicos del dominio (nuevos):**

1. 🆕 `ApplicationsTable`
   - **Propósito:** Tabla de aplicaciones pendientes de mentores
   - **Props:** `applications: PendingApplication[]`, `isLoading: boolean`
   - **Ubicación:** `src/components/admin/applications-table.tsx`

2. 🆕 `ApplicationRow`
   - **Propósito:** Fila individual de la tabla
   - **Props:** `application: PendingApplication`
   - **Ubicación:** Inline en `ApplicationsTable`

3. 🆕 `Pagination`
   - **Propósito:** Controles de paginación reutilizables
   - **Props:** `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`
   - **Ubicación:** `src/components/ui/pagination.tsx`

4. 🆕 `AdminLayout`
   - **Propósito:** Layout wrapper para páginas admin con sidebar
   - **Props:** `children: ReactNode`
   - **Ubicación:** `src/components/admin/admin-layout.tsx`

### Wireframes/Layout:

**Estructura de la página `/admin/applications`:**
```
┌──────────────────────────────────────────────────────────┐
│ AdminLayout                                               │
├─────────┬────────────────────────────────────────────────┤
│ Sidebar │  Header: "Pending Applications (5)"            │
│         ├────────────────────────────────────────────────┤
│ - Apps  │  ┌─────────────────────────────────────────┐   │
│ - ...   │  │ Table                                    │   │
│         │  │ ┌────────┬──────────┬────────┬────────┐ │   │
│         │  │ │ Name   │ Email    │ Date   │ Action │ │   │
│         │  │ ├────────┼──────────┼────────┼────────┤ │   │
│         │  │ │ Carlos │ c@e.com  │ Dec 1  │ Review │ │   │
│         │  │ │ Ana    │ a@e.com  │ Dec 2  │ Review │ │   │
│         │  │ └────────┴──────────┴────────┴────────┘ │   │
│         │  └─────────────────────────────────────────┘   │
│         │  ┌─────────────────────────────────────────┐   │
│         │  │ Pagination: < 1 2 3 >                   │   │
│         │  └─────────────────────────────────────────┘   │
└─────────┴────────────────────────────────────────────────┘
```

### Estados de UI:

**Estados visuales a implementar:**
- **Loading:** Skeleton loader de tabla (3-5 filas)
- **Empty:** Mensaje "No hay aplicaciones pendientes por revisar" + icono
- **Error:** Mensaje de error + botón "Reintentar"
- **Success:** Tabla con datos y paginación

### Responsividad:

**Breakpoints a considerar:**
- **Mobile (< 768px):** Tabla scroll horizontal o cards stacked
- **Tablet (768px - 1024px):** Sidebar colapsable
- **Desktop (> 1024px):** Layout completo con sidebar visible

**Paleta de colores aplicada:**
- Primary actions: `bg-primary` (botón Review)
- Borders: `border-border`
- Text: `text-foreground` / `text-muted-foreground`
- Table headers: `bg-muted`

---

## Types & Type Safety

**Tipos del backend disponibles:** `src/types/supabase.ts`

**Nuevos tipos a crear en `src/lib/types.ts`:**

```typescript
// Pending Application (view model)
export interface PendingApplication {
  id: string
  name: string | null
  email: string
  created_at: string
  linkedin_url: string | null
  github_url: string | null
}

// Admin user check
export type UserRole = 'student' | 'mentor' | 'admin'

// Pagination response
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

---

## Database Changes

**⚠️ IMPORTANTE:** Requiere migración de DB antes de implementar UI.

### Migración 1: Añadir rol `admin` al enum

**Descripción:** El enum `user_role` actual solo tiene `student` | `mentor`. Necesitamos añadir `admin`.

**SQL a ejecutar via Supabase MCP:**
```sql
-- Add 'admin' to user_role enum
ALTER TYPE user_role ADD VALUE 'admin';
```

### Migración 2: RLS Policy para admins

**Descripción:** Crear policy que permita a admins leer todos los perfiles de mentores.

**SQL:**
```sql
-- Policy: Admins can read all mentor profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Crear primer admin (seed)

**SQL para crear admin de prueba:**
```sql
-- Update existing user to admin role (run manually for first admin)
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@upexmymentor.com';
```

---

## Implementation Steps

### **Step 1: Database Migration - Add Admin Role**

**Task:** Ejecutar migración para añadir rol `admin` al enum y crear RLS policy

**Details:**
- Usar Supabase MCP `apply_migration` para ejecutar SQL
- Verificar que el enum se actualizó correctamente
- Crear policy para admins

**Testing:**
- Verificar `\dT+ user_role` muestra `admin` como opción
- Verificar policy existe en `pg_policies`

---

### **Step 2: Update Middleware for Admin Routes**

**Task:** Modificar middleware para proteger rutas `/admin/*`

**File:** `middleware.ts`

**Changes:**
```typescript
// Add admin routes check
const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

// For admin routes, verify user has admin role
if (isAdminRoute) {
  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session?.user?.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}
```

**Edge cases handled:**
- No session → redirect to login
- Session but no profile → redirect to dashboard
- Profile exists but not admin → redirect to dashboard

**Testing:**
- TC-007, TC-008, TC-009: Unauthorized access tests

---

### **Step 3: Create Admin Layout Component**

**Task:** Crear layout wrapper para páginas de admin

**File:** `src/components/admin/admin-layout.tsx`

**Structure:**
```tsx
interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-muted border-r">
        <nav>
          <Link href="/admin/applications">Applications</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  )
}
```

**Testing:**
- Visual: Layout renders correctly at different breakpoints

---

### **Step 4: Create Applications Table Component**

**Task:** Crear componente de tabla para mostrar aplicaciones

**File:** `src/components/admin/applications-table.tsx`

**Structure:**
```tsx
interface ApplicationsTableProps {
  applications: PendingApplication[]
  isLoading?: boolean
}

export function ApplicationsTable({ applications, isLoading }: ApplicationsTableProps) {
  if (isLoading) return <TableSkeleton />
  if (applications.length === 0) return <EmptyState />

  return (
    <table data-testid="applications-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Applied</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {applications.map(app => (
          <ApplicationRow key={app.id} application={app} />
        ))}
      </tbody>
    </table>
  )
}
```

**data-testid attributes:**
- `applications-table`
- `application-row`
- `applications-loading`
- `applications-empty`
- `review-button`

**Testing:**
- TC-001 to TC-006: Positive tests
- TC-011, TC-012: Boundary tests

---

### **Step 5: Create Pagination Component**

**Task:** Crear componente de paginación reutilizable

**File:** `src/components/ui/pagination.tsx`

**Structure:**
```tsx
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div data-testid="pagination-controls" className="flex items-center gap-2">
      <Button
        data-testid="pagination-prev"
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span>Page {currentPage} of {totalPages}</span>
      <Button
        data-testid="pagination-next"
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  )
}
```

**Testing:**
- TC-002: Pagination displays correctly
- TC-013: Large dataset pagination

---

### **Step 6: Create Admin Applications Page**

**Task:** Crear página Server Component para `/admin/applications`

**File:** `src/app/admin/applications/page.tsx`

**Structure:**
```tsx
import { createServerClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ApplicationsTable } from '@/components/admin/applications-table'

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const supabase = createServerClient()
  const page = Number(searchParams.page) || 1
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch pending mentor applications
  const { data: applications, count, error } = await supabase
    .from('profiles')
    .select('id, name, email, created_at, linkedin_url, github_url', { count: 'exact' })
    .eq('role', 'mentor')
    .eq('is_verified', false)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    return <ErrorState message="Error al cargar las aplicaciones" />
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <AdminLayout title={`Pending Applications (${count || 0})`}>
      <ApplicationsTable applications={applications || []} />
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => /* client-side navigation */}
        />
      )}
    </AdminLayout>
  )
}
```

**Testing:**
- TC-001 to TC-006: All positive tests
- TC-014 to TC-018: Integration and API tests

---

### **Step 7: Add Admin Layout Route**

**Task:** Crear layout.tsx para rutas admin

**File:** `src/app/admin/layout.tsx`

**Purpose:**
- Envolver todas las páginas admin
- Verificar rol admin (doble check además de middleware)

---

### **Step 8: Integration Testing**

**Task:** Verificar flujo completo

**Flow:**
1. Usuario admin navega a `/admin/applications`
2. Ve lista de mentores pendientes
3. Puede navegar entre páginas
4. Puede hacer click en "Review" para ir al detalle

**Testing:**
- E2E test con Playwright
- TC-014 to TC-016: Integration tests

---

## Technical Decisions

### Decision 1: Server Component vs Client Component

**Chosen:** Server Component para la página, Client Component para paginación

**Reasoning:**
- ✅ Fetch seguro en servidor
- ✅ SEO no importante (admin)
- ✅ Pagination puede usar URL params + client navigation
- ❌ Trade-off: Refresh completo al paginar (acceptable para MVP)

### Decision 2: Usar `is_verified` boolean en lugar de `verification_status` enum

**Chosen:** Usar campo existente `is_verified = false` para pendientes

**Reasoning:**
- ✅ No requiere migración de schema adicional
- ✅ Ya existe en la DB
- ❌ Trade-off: No hay estado "rejected" (aceptable para MYM-9, se añadirá en MYM-11)

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Epic MYM-2 (Auth) completado - usuarios pueden loguearse
- [x] Tabla `profiles` existe con campos necesarios
- [ ] **BLOCKER:** Migración para añadir rol `admin` al enum

---

## Risks & Mitigations

**Risk 1:** Rol `admin` no existe en enum
- **Impact:** High
- **Mitigation:** Step 1 de implementación incluye migración

**Risk 2:** Performance con muchos mentores
- **Impact:** Medium
- **Mitigation:** Paginación con limit/offset, índice en `role` + `is_verified`

**Risk 3:** Middleware overhead para verificar rol
- **Impact:** Low
- **Mitigation:** Cache de perfil o usar JWT claims en futuro

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | DB Migration (admin role) | 15 min |
| 2 | Middleware update | 30 min |
| 3 | AdminLayout component | 45 min |
| 4 | ApplicationsTable component | 1 hour |
| 5 | Pagination component | 30 min |
| 6 | Admin Applications page | 1 hour |
| 7 | Admin layout route | 15 min |
| 8 | Integration testing | 1 hour |
| **Total** | | **~5-6 hours** |

**Story points:** 3 (Medium complexity)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/supabase` o `@/lib/types`
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [ ] Bordes redondeados (`rounded-lg`)
  - [ ] Sombras sutiles (`shadow-sm`, `hover:shadow-lg`)
  - [ ] Paleta purple aplicada
  - [ ] Efectos hover coherentes
- [ ] **data-testid attributes añadidos**
  - [ ] `applications-table`
  - [ ] `application-row`
  - [ ] `applications-loading`
  - [ ] `applications-empty`
  - [ ] `applications-error`
  - [ ] `applications-count`
  - [ ] `review-button`
  - [ ] `pagination-controls`
  - [ ] `pagination-next`
  - [ ] `pagination-prev`
  - [ ] `retry-button`
- [ ] Tests de integración pasando
  - [ ] TC-001 to TC-006 (Positive)
  - [ ] TC-007 to TC-010 (Negative)
  - [ ] TC-011 to TC-013 (Boundary)
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Code review aprobado
- [ ] Deployed to staging
- [ ] Manual smoke test en staging

---

**Output:** Implementation plan listo para STORY-MYM-9

**Siguiente paso:** Ejecutar Step 1 (DB Migration) y continuar con implementación
