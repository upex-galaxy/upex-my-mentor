# Frontend Architecture - Upex My Mentor

**Generado:** Fase 2.5 - Frontend Scaffolding
**Fecha:** 2025-11-12
**Framework:** Next.js 15 (App Router)
**Package Manager:** Bun

---

## 📋 Índice

1. [Tech Stack](#tech-stack)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura de Componentes](#arquitectura-de-componentes)
4. [Routing y Navegación](#routing-y-navegación)
5. [Estado y Contextos](#estado-y-contextos)
6. [Integración con APIs](#integración-con-apis)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [Styling Strategy](#styling-strategy)
9. [Convenciones de Código](#convenciones-de-código)
10. [Performance y Optimización](#performance-y-optimización)
11. [Testing Strategy](#testing-strategy)

---

## 🛠️ Tech Stack

### Core Framework

- **Next.js 15.1.5** (App Router)
  - React Server Components (RSC)
  - Server Actions
  - Streaming SSR
  - Route Handlers para API

### Runtime & Package Manager

- **Bun** - Runtime JavaScript ultra-rápido
  - 25x más rápido que npm en instalación
  - Ejecuta TypeScript nativamente
  - Compatible con Node.js APIs

### Lenguaje

- **TypeScript 5.x**
  - Type-safe en todo el proyecto
  - Interfaces para datos del dominio
  - Strict mode habilitado

### UI & Styling

- **TailwindCSS 3.4.17**
  - Utility-first CSS
  - Custom theme con paleta morada
  - Dark mode support
- **shadcn/ui** (patrón de componentes)
  - Components copiables y customizables
  - Built on Radix UI primitives (implícito)
  - Usando class-variance-authority (cva)
- **Lucide React** - Iconos modernos y consistentes

### State Management

- **React Context API**
  - AuthContext para estado de autenticación
  - Lightweight, no necesita Redux para MVP

### Validation

- **Zod 3.24.1**
  - Schema validation
  - Type inference
  - Error handling

### Backend/Database (Integración)

- **Supabase** (PostgreSQL + Auth)
  - Actualmente: Mock data en desarrollo
  - Futuro: Supabase Client para queries
- **Stripe** (Pagos)
  - Futuro: Stripe Elements para checkout

---

## 📂 Estructura del Proyecto

```
upex-my-mentor/
├── .context/                     # Documentación del proyecto
│   ├── PRD/                      # Product Requirements
│   ├── SRS/                      # Software Requirements
│   ├── PBI/                      # Product Backlog Items
│   ├── design-system.md          # 📄 Design System Documentation
│   └── frontend-architecture.md  # 📄 Este archivo
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Route group para auth (sin layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── dashboard/           # Dashboard protegido
│   │   │   └── page.tsx
│   │   │
│   │   ├── mentors/             # Rutas de mentores
│   │   │   ├── [id]/           # Dynamic route
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css          # Estilos globales + CSS variables
│   │   ├── layout.tsx           # Root layout (AuthProvider)
│   │   ├── not-found.tsx        # 404 page
│   │   └── page.tsx             # Landing page (home)
│   │
│   ├── components/
│   │   ├── ui/                  # 🎨 Design System Components
│   │   │   ├── button.tsx       # Button con variantes (cva)
│   │   │   ├── card.tsx         # Card + subcomponents
│   │   │   ├── input.tsx        # Input estilizado
│   │   │   └── badge.tsx        # Badge con variantes
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── navbar.tsx       # Top navigation (responsive)
│   │   │   └── footer.tsx       # Site footer
│   │   │
│   │   ├── landing/             # Landing page sections
│   │   │   ├── hero.tsx         # Hero section
│   │   │   ├── features.tsx     # Features section
│   │   │   └── how-it-works.tsx # How it works section
│   │   │
│   │   └── mentors/             # Mentor-specific components
│   │       └── mentor-card.tsx  # Mentor card component
│   │
│   ├── contexts/                # React Contexts
│   │   └── auth-context.tsx    # Auth state management
│   │
│   ├── lib/                     # Utilities & helpers
│   │   ├── utils.ts            # cn() function, helpers
│   │   ├── auth.ts             # Auth utilities (mock)
│   │   └── data.ts             # Mock data for development
│   │
│   └── types/                   # TypeScript types
│       ├── index.ts            # Domain types (User, Mentor, etc.)
│       └── supabase.ts         # Supabase-generated types
│
├── public/                      # Static assets
│   └── [images, icons, etc.]
│
├── .env.example                 # Environment variables template
├── tailwind.config.ts           # Tailwind configuration
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── bun.lock                     # Bun lockfile
└── SETUP.md                     # Setup instructions

```

---

## 🏗️ Arquitectura de Componentes

### Jerarquía de Componentes

```
┌─────────────────────────────────────────┐
│      app/layout.tsx (Root Layout)      │
│  ┌───────────────────────────────────┐ │
│  │   AuthProvider (Context)          │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │   page.tsx (Cada ruta)      │  │ │
│  │  │  ┌───────────────────────┐  │  │ │
│  │  │  │  Layout Components   │  │  │ │
│  │  │  │  - Navbar            │  │  │ │
│  │  │  │  - Footer            │  │  │ │
│  │  │  └───────────────────────┘  │  │ │
│  │  │  ┌───────────────────────┐  │  │ │
│  │  │  │  Page Sections        │  │  │ │
│  │  │  │  - Hero, Features...  │  │  │ │
│  │  │  └───────────────────────┘  │  │ │
│  │  │  ┌───────────────────────┐  │  │ │
│  │  │  │  UI Components        │  │  │ │
│  │  │  │  - Button, Card...    │  │  │ │
│  │  │  └───────────────────────┘  │  │ │
│  │  └─────────────────────────────┘  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Categorías de Componentes

#### 1. UI Components (`components/ui/`)

**Propósito:** Design system base - componentes reutilizables sin lógica de negocio.

**Características:**
- Built con TailwindCSS
- Usan `class-variance-authority` para variantes
- Typed con TypeScript
- Sin dependencias del dominio
- Exportan variantes para reuso

**Ejemplos:**
- `Button` - Botón con 6 variantes
- `Card` - Contenedor con sub-componentes
- `Input` - Input estilizado
- `Badge` - Etiqueta pequeña

**Patrón:**
```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { /* ... */ },
      size: { /* ... */ }
    },
    defaultVariants: { /* ... */ }
  }
)

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

export const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <element
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

#### 2. Layout Components (`components/layout/`)

**Propósito:** Componentes estructurales que definen el layout de la aplicación.

**Componentes:**
- **Navbar** - Barra superior con:
  - Logo con gradiente
  - Links de navegación
  - Auth state (logged in/out)
  - Mobile menu responsive
  - Sticky + backdrop-blur
- **Footer** - Footer del sitio

**Client-side:** Usan `"use client"` porque necesitan interactividad (useState, useAuth).

#### 3. Domain Components (`components/[domain]/`)

**Propósito:** Componentes específicos del dominio del negocio.

**Ejemplos:**
- **MentorCard** (`components/mentors/`)
  - Muestra info de mentor (avatar, rating, skills, precio)
  - Usa UI components (Card, Badge, Button)
  - Lógica específica del dominio (formateo de rating, skills)

**Patrón:**
```tsx
// Componente de dominio usa UI components
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function MentorCard({ mentor }: MentorCardProps) {
  // Lógica específica del dominio
  return (
    <Card>
      {/* Composición de UI components */}
    </Card>
  )
}
```

#### 4. Page Sections (`components/landing/`, etc.)

**Propósito:** Secciones grandes de páginas específicas.

**Ejemplos:**
- `Hero` - Hero section de landing
- `Features` - Features section
- `HowItWorks` - Cómo funciona section

**Razón:** Mantener `page.tsx` limpio, composable, testeable.

---

## 🧭 Routing y Navegación

### App Router (Next.js 15)

**File-system based routing:**

```
app/
├── page.tsx                    → /
├── login/page.tsx             → /login
├── signup/page.tsx            → /signup
├── dashboard/page.tsx         → /dashboard (protegido)
├── mentors/
│   ├── page.tsx              → /mentors
│   └── [id]/page.tsx         → /mentors/:id (dynamic)
└── not-found.tsx             → 404
```

### Route Groups

```
app/
├── (auth)/           # Route group (no afecta URL)
│   ├── login/
│   └── signup/
```

**Propósito:** Agrupar rutas relacionadas sin agregar segmentos a la URL.

### Dynamic Routes

```tsx
// app/mentors/[id]/page.tsx
export default function MentorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  // Fetch mentor by id
}
```

### Navigation

```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Declarative
<Link href="/mentors">Explorar Mentores</Link>

// Programmatic
const router = useRouter()
router.push('/dashboard')
```

### Protected Routes

**Pattern actual:**
```tsx
// app/dashboard/page.tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) return <LoadingSpinner />
  if (!user) return null

  return <DashboardContent />
}
```

**Futuro:** Middleware para proteger rutas en server-side.

---

## 🔄 Estado y Contextos

### AuthContext

**Ubicación:** `src/contexts/auth-context.tsx`

**Propósito:** Gestionar estado de autenticación global.

**API:**
```tsx
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  signup: (data: SignupData) => Promise<void>
}
```

**Uso:**
```tsx
import { useAuth } from '@/contexts/auth-context'

function Component() {
  const { user, isLoading, login, logout } = useAuth()

  if (isLoading) return <LoadingSpinner />

  return user ? <LoggedInView /> : <LoggedOutView />
}
```

**Implementación Actual:**
- Mock system con localStorage
- Simula delays realistas
- Error handling
- Tipo de usuario (student/mentor)

**Futuro:**
- Integrar con Supabase Auth
- Sesión persistente
- Refresh tokens

### Estado Local

**Para estado de componentes:**
```tsx
// useState para formularios
const [email, setEmail] = useState("")

// useMemo para valores derivados
const filteredMentors = useMemo(() =>
  mentors.filter(m => m.name.includes(searchQuery)),
  [searchQuery, mentors]
)

// useCallback para funciones estables
const handleSubmit = useCallback(() => {
  // ...
}, [dependencies])
```

---

## 🌐 Integración con APIs

### Mock Data (Desarrollo)

**Ubicación:** `src/lib/data.ts`

**Contenido:**
- 8 mentores hardcodeados
- Funciones de búsqueda/filtrado
- Mock user data

**Uso:**
```tsx
import { mentors, searchMentors } from '@/lib/data'

const results = searchMentors("React")
```

### Future: API Routes

**Pattern para Next.js API Routes:**
```tsx
// app/api/mentors/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  const mentors = await db.mentor.findMany({
    where: { name: { contains: query } }
  })

  return Response.json({ mentors })
}
```

### Future: Supabase Client

```tsx
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// Uso en componentes
const { data: mentors } = await supabase
  .from('mentors')
  .select('*')
  .eq('is_verified', true)
```

---

## 🔐 Autenticación y Autorización

### Sistema Actual (Mock)

**Auth Flow:**
1. Usuario ingresa credenciales en `/login`
2. `login()` valida contra localStorage
3. AuthContext actualiza `user` state
4. Navbar re-renderiza con user info
5. Dashboard es accesible

**Storage:**
```typescript
// localStorage keys
"upex-my-mentor-users"    // Lista de usuarios registrados
"upex-my-mentor-current"  // Usuario actual logueado
```

### Futuro: Supabase Auth

**Flow planeado:**
```tsx
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, role }
  }
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Session
const { data: { session } } = await supabase.auth.getSession()
```

**Row Level Security (RLS):**
- Políticas en Supabase para proteger datos
- Usuarios solo ven sus propios bookings
- Mentores solo editan su propio perfil

---

## 🎨 Styling Strategy

### TailwindCSS + CSS Variables

**Configuración:** `tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      // ...
    }
  }
}
```

**Variables definidas en:** `app/globals.css`

```css
:root {
  --primary: 271 91% 65%;      /* Purple */
  --secondary: 277 91% 70%;    /* Violet */
  --accent: 328 86% 70%;       /* Fuchsia */
  /* ... */
}
```

**Ventajas:**
- ✅ Theming consistente
- ✅ Dark mode fácil (override en `.dark`)
- ✅ Cambios centralizados

### Utility-First con cn()

**Helper function:** `lib/utils.ts`

```typescript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Uso:**
```tsx
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // Props overrides
)} />
```

**Ventajas:**
- ✅ Conditional classes limpias
- ✅ Merge correcto de Tailwind classes
- ✅ Override desde props

### Component Variants con CVA

**class-variance-authority:**

```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-primary",
        outline: "border border-primary"
      },
      size: {
        sm: "h-9 px-3",
        lg: "h-11 px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

**Ventajas:**
- ✅ Type-safe variants
- ✅ Composable
- ✅ Maintainable

---

## 📐 Convenciones de Código

### Naming Conventions

**Archivos:**
- Components: `kebab-case.tsx` (ej: `mentor-card.tsx`)
- Utilities: `kebab-case.ts` (ej: `auth-context.ts`)
- Types: `index.ts` o `domain-name.ts`

**Componentes:**
- PascalCase: `MentorCard`, `AuthContext`
- Funciones: camelCase: `searchMentors`, `useAuth`
- Constants: UPPER_SNAKE_CASE (si aplica)

### File Organization

**Patrón de imports:**
```tsx
// 1. React/Next imports
import { useState } from 'react'
import Link from 'next/link'

// 2. Third-party
import { cva } from 'class-variance-authority'

// 3. Internal - absolute imports con @/
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

// 4. Types
import type { Mentor } from '@/types'

// 5. Relative imports (si aplica)
import { localHelper } from './helpers'
```

### TypeScript Conventions

**Props typing:**
```tsx
// Interfaces para props
interface MentorCardProps {
  mentor: Mentor
  className?: string
}

// Extends cuando necesites HTML attributes
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}
```

**Type vs Interface:**
- `interface` para component props y public APIs
- `type` para unions, intersections, utilities

### Component Structure

```tsx
"use client" // Solo si necesita client-side

// Imports (ordenados)

// Types/Interfaces

// Component
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState()
  const { data } = useCustomHook()

  // 2. Derived state
  const derived = useMemo(() => /* ... */, [deps])

  // 3. Event handlers
  const handleClick = () => { /* ... */ }

  // 4. Effects
  useEffect(() => { /* ... */ }, [deps])

  // 5. Early returns
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage />

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

---

## ⚡ Performance y Optimización

### Next.js Optimizations

**Image Optimization:**
```tsx
import Image from 'next/image'

<Image
  src={mentor.photoUrl}
  alt={mentor.name}
  fill
  className="object-cover"
/>
```

**Font Optimization:**
- Next.js optimiza Google Fonts automáticamente
- Usa font-display: swap

**Code Splitting:**
- App Router hace code-splitting por ruta automáticamente
- Componentes client-side solo se cargan cuando se necesitan

### React Optimizations

**useMemo para cálculos costosos:**
```tsx
const filteredMentors = useMemo(() => {
  return mentors.filter(m => /* expensive operation */)
}, [mentors, filterCriteria])
```

**useCallback para funciones estables:**
```tsx
const handleSubmit = useCallback(() => {
  // Evita re-crear función en cada render
}, [dependencies])
```

**React.forwardRef para UI components:**
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <button ref={ref} {...props} />
)
```

### Bundle Optimization

**Dynamic Imports (cuando sea necesario):**
```tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
})
```

**Tree-shaking:**
- Usar named imports: `import { Button } from '@/components/ui/button'`
- Evitar `import *`

---

## 🧪 Testing Strategy

### Planeado para Fase 6+

**Unit Tests:**
- Vitest para componentes UI
- Testing Library para interactions
- Coverage para utils y helpers

**Integration Tests:**
- Playwright/Cypress para E2E
- Flujos críticos: Auth, Booking, Payment

**Pattern futuro:**
```tsx
// mentor-card.test.tsx
import { render, screen } from '@testing-library/react'
import { MentorCard } from './mentor-card'

test('renders mentor name', () => {
  const mentor = { name: 'John Doe', /* ... */ }
  render(<MentorCard mentor={mentor} />)
  expect(screen.getByText('John Doe')).toBeInTheDocument()
})
```

---

## 🚀 Próximos Pasos

### Fase 3-8: Implementation

1. **Integrar Supabase**
   - Reemplazar mock auth con Supabase Auth
   - Conectar queries a Supabase DB
   - Implementar RLS policies

2. **Implementar Payments**
   - Stripe Checkout
   - Webhooks para confirmación
   - Payout flow para mentores

3. **Agregar Funcionalidades**
   - Calendario de scheduling
   - Sistema de reviews real
   - Admin panel para vetting
   - Email notifications

4. **Testing**
   - Unit tests para componentes críticos
   - E2E tests para flujos principales
   - Performance testing

5. **Deployment**
   - Vercel deployment
   - CI/CD pipeline
   - Monitoring y analytics

---

## 📚 Referencias

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Design System Documentation](.context/design-system.md)
- [Setup Guide](../SETUP.md)

---

**Última actualización:** 2025-11-12
**Versión:** 1.0.0
