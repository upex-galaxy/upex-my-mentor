# Feature Implementation Plan: EPIC-MYM-2 - User Authentication & Profiles

**Fecha:** 2025-11-27
**Autor:** AI-Generated
**Epic Jira Key:** MYM-2
**Status:** Ready For Implementation

---

## Overview

Esta feature implementa el sistema fundacional de autenticación y gestión de perfiles para el marketplace Upex My Mentor. Permite a los usuarios crear cuentas, autenticarse de forma segura, y construir perfiles públicos que son esenciales para establecer confianza y habilitar el descubrimiento en la plataforma.

**Alcance:**
- **MYM-3**: Sign up with email and password
- **MYM-4**: Log in and log out
- **MYM-5**: Mentee basic profile (name, bio)
- **MYM-6**: Mentor detailed profile (skills, rate, LinkedIn/GitHub)
- **MYM-7**: Password reset flow

**Stack técnico:**
- **Frontend:** Next.js 15 (App Router) + React 19 + TailwindCSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + GoTrue Auth + Storage)
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth (JWT, 7-day sessions)
- **Deployment:** Vercel
- **Testing:** Playwright (E2E), Vitest (Unit), Postman (API)

---

## Technical Decisions

### Decision 1: Authentication Strategy - Supabase Auth

**Options considered:**
- A) Custom JWT implementation with bcrypt
- B) Supabase Auth (GoTrue) with built-in session management
- C) NextAuth.js with Supabase adapter

**Chosen:** B) Supabase Auth (GoTrue)

**Reasoning:**
- ✅ Integración nativa con Supabase Database (RLS policies automáticas)
- ✅ Manejo automático de password hashing (bcrypt)
- ✅ Email verification y password reset out-of-the-box
- ✅ JWT session management con refresh tokens automáticos
- ✅ Reducción significativa de código custom de autenticación
- ❌ Trade-off: Dependencia del ecosistema Supabase (vendor lock-in moderado)

**Implementation notes:**
- Usar `@supabase/ssr` para server-side authentication en Next.js App Router
- Almacenar tokens en HttpOnly cookies (no localStorage)
- Configurar session duration a 7 días (configurable en Supabase dashboard)

---

### Decision 2: Profile Data Model - Single Table vs Separate Tables

**Options considered:**
- A) Tabla `profiles` separada con tabla `mentor_profiles` adicional
- B) Tabla única `profiles` con campos nullable para mentores
- C) Herencia de tablas con PostgreSQL

**Chosen:** B) Tabla única `profiles` con campos condicionales

**Reasoning:**
- ✅ Queries más simples (no JOINs para obtener perfil completo)
- ✅ Supabase triggers funcionan mejor con tabla única (handle_new_user)
- ✅ Schema ya implementado en backend-setup.md con esta estructura
- ✅ RLS policies más simples de implementar
- ❌ Trade-off: Campos NULL para mentees (specialties, hourly_rate, etc.)

**Implementation notes:**
- Campos específicos de mentor: `specialties`, `hourly_rate`, `linkedin_url`, `github_url`, `is_verified`, `years_of_experience`
- Trigger `handle_new_user()` crea perfil automáticamente al registrarse
- RLS policy: usuarios solo pueden editar su propio perfil

---

### Decision 3: Form Validation Strategy - Client + Server with Zod

**Options considered:**
- A) Solo validación client-side con HTML5 attributes
- B) Solo validación server-side
- C) Dual validation con Zod schemas compartidos

**Chosen:** C) Dual validation con Zod

**Reasoning:**
- ✅ Type-safety end-to-end con TypeScript inference
- ✅ UX inmediato con feedback client-side
- ✅ Seguridad garantizada con validación server-side
- ✅ Schemas reutilizables entre frontend y backend
- ❌ Trade-off: Duplicación de bundle size (Zod en client y server)

**Implementation notes:**
- Crear schemas en `lib/validations/auth.ts` y `lib/validations/profile.ts`
- Usar `react-hook-form` con `@hookform/resolvers/zod` para forms
- Validar en Server Actions antes de operaciones con Supabase

---

### Decision 4: Profile Photo Upload - Supabase Storage

**Options considered:**
- A) Cloudinary para image optimization
- B) Supabase Storage con transformaciones
- C) Almacenar URLs externas (LinkedIn, Gravatar)

**Chosen:** B) Supabase Storage

**Reasoning:**
- ✅ Integración nativa con Supabase Auth (RLS en storage)
- ✅ Simplicidad de implementación (mismo SDK)
- ✅ Costos predecibles dentro del ecosistema Supabase
- ❌ Trade-off: Transformaciones de imagen limitadas vs Cloudinary

**Implementation notes:**
- Bucket: `avatars` con políticas RLS
- Límite de archivo: 5MB máximo
- Formatos permitidos: JPEG, PNG, WebP
- Naming convention: `{user_id}/avatar.{ext}`

---

### Decision 5: Password Policy Enforcement

**Options considered:**
- A) Validación solo client-side con regex
- B) Supabase Auth password policies (configuración dashboard)
- C) Custom server-side validation + Supabase defaults

**Chosen:** C) Custom validation + Supabase

**Reasoning:**
- ✅ Control total sobre mensajes de error específicos
- ✅ Indicador de strength en tiempo real para UX
- ✅ Supabase como safety net adicional
- ❌ Trade-off: Mantener sincronizados ambos sistemas

**Implementation notes:**
- Policy: Min 8 chars, 1 uppercase, 1 number, 1 special char
- Mostrar password strength indicator en SignupForm
- Zod schema con regex patterns para cada requisito

---

## Types & Type Safety

**IMPORTANTE:** Esta feature debe usar tipos del backend para garantizar type-safety consistente en todas las stories.

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos generados desde database schema
- `src/types/index.ts` - Type helpers y tipos de dominio

**Estrategia de tipos a nivel feature:**

### 1. Identificar entidades principales:

```typescript
// Entidades del backend relevantes a esta feature:
// - profiles (tabla principal)
// - reviews (para average_rating y total_reviews)
// - user_role (enum: 'student' | 'mentor')
```

### 2. Tipos exportados desde lib/types.ts:

```typescript
// src/lib/types.ts
import type { Database } from '@/types/supabase'

// Profile types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// User role enum
export type UserRole = Database['public']['Enums']['user_role']

// Derived types para UI
export type MentorProfile = Profile & { role: 'mentor' }
export type StudentProfile = Profile & { role: 'student' }

// Auth types
export interface SignupData {
  email: string
  password: string
  name?: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}
```

### 3. Directiva para todas las stories de esta feature:

- ✅ TODAS las stories deben importar tipos desde `@/lib/types` o `@/types/supabase`
- ✅ TODAS las props de componentes tipadas con tipos del backend
- ✅ Mock data type-safe que cumpla estructura de tipos
- ✅ Zero type errors relacionados a entidades del backend
- ✅ Zod schemas deben inferir tipos consistentes con Database types

**Mapping de tipos por story:**

| Story | Tipos principales |
|-------|-------------------|
| MYM-3 | `SignupData`, `ProfileInsert`, `UserRole` |
| MYM-4 | `LoginCredentials`, `Profile`, `Session` |
| MYM-5 | `Profile`, `ProfileUpdate` |
| MYM-6 | `MentorProfile`, `ProfileUpdate` |
| MYM-7 | `LoginCredentials` (para reset) |

---

## UI/UX Design Strategy

**IMPORTANTE:** Esta feature debe usar el Design System base definido en `.context/design-system.md`.

**Design System disponible:** Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

- ✅ **Button**: Variantes `default`, `outline`, `ghost`, `destructive` para CTAs
- ✅ **Card**: Para formularios de auth y contenedores de perfil
- ✅ **Input**: Para campos de email, password, name, bio
- ✅ **Badge**: Para mostrar skills/specialties del mentor
- ✅ **Navbar**: Ya implementado con auth state integrado

### Componentes custom a nivel feature:

#### 1. AuthForm (Shared)
- **Usado por stories:** MYM-3, MYM-4, MYM-7
- **Propósito:** Layout consistente para formularios de autenticación
- **Ubicación:** `src/components/auth/auth-form-layout.tsx`
- **Características:**
  - Card con header y descripción
  - Loading state en submit
  - Error display consistente
  - Links de navegación (Login/Signup/Forgot Password)

#### 2. PasswordInput
- **Usado por stories:** MYM-3, MYM-4, MYM-7
- **Propósito:** Input de password con toggle visibility y strength indicator
- **Ubicación:** `src/components/auth/password-input.tsx`
- **Características:**
  - Eye icon para mostrar/ocultar
  - Strength indicator (Weak/Medium/Strong) para signup
  - Validation feedback inline

#### 3. RoleSelector
- **Usado por stories:** MYM-3
- **Propósito:** Selección de rol durante signup
- **Ubicación:** `src/components/auth/role-selector.tsx`
- **Características:**
  - Dos opciones: Mentor / Student
  - Cards seleccionables con descripción
  - Visual feedback de selección

#### 4. ProfileForm (Base)
- **Usado por stories:** MYM-5, MYM-6
- **Propósito:** Formulario de edición de perfil compartido
- **Ubicación:** `src/components/profile/profile-form.tsx`
- **Características:**
  - Avatar upload con preview
  - Name y bio fields
  - Extiende para MentorProfileForm

#### 5. MentorProfileForm
- **Usado por stories:** MYM-6
- **Propósito:** Formulario completo para perfiles de mentor
- **Ubicación:** `src/components/profile/mentor-profile-form.tsx`
- **Características:**
  - Hereda de ProfileForm
  - Skills/Specialties selector (chips dinámicos)
  - Hourly rate input con currency
  - LinkedIn/GitHub URL inputs
  - Years of experience selector

### Consistencia visual:

**Paleta aplicada (del design system):**
- **Primary** (`bg-primary`): Botones principales, links activos, focus states
- **Secondary** (`bg-secondary`): Botones secundarios, badges de skills
- **Accent** (`bg-accent`): Highlights, gradientes decorativos
- **Muted** (`text-muted-foreground`): Texto secundario, placeholders

**Patrones de diseño comunes:**
- **Auth pages**: Card centrado con gradiente de fondo (`bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50`)
- **Profile edit**: Layout de dos columnas (sidebar avatar + main form) en desktop
- **Error states**: Text red-500 debajo del input con ícono de warning
- **Success states**: Toast notification con checkmark verde

### Flujos de UX:

**Journey 1: Registro de nuevo usuario**
```
Landing (/) → Signup (/signup) → [Selección rol] → Email verification prompt
                                                   ↓
                                            Dashboard (/dashboard)
                                                   ↓
                                  [Mentor: /profile/edit] | [Student: /profile/edit]
```

**Journey 2: Login existente**
```
Landing (/) → Login (/login) → Dashboard (/dashboard)
```

**Journey 3: Password Reset**
```
Login (/login) → Forgot Password (/password-reset) → Check email message
                                                            ↓
                                              Email link → Reset form (/password-reset/confirm)
                                                            ↓
                                                      Login (/login)
```

**Estados globales de la feature:**
- **Loading**: Spinner centrado con texto "Cargando..." o skeleton para forms
- **Empty**: N/A para auth (siempre hay formulario)
- **Error**: Alert con mensaje específico y retry action

### Personalidad UI/UX de la feature:

**Estilo visual:** Moderno/Bold

**Aplicar consistentemente en TODAS las stories:**
- Gradientes sutiles en backgrounds de auth pages
- Sombras pronunciadas (`shadow-lg`) en cards y hover states
- Bordes redondeados (`rounded-lg`, `rounded-xl`)
- Hover effects con transforms (scale on buttons)
- Transiciones suaves (`transition-all duration-200`)

---

## Content Writing Strategy

**CRÍTICO:** Esta feature debe usar Content Writing real basado en el contexto del negocio, NO texto genérico.

### Contexto de negocio (del PRD):
- **Problema:** Escasez de mentoría personalizada para juniors + falta de canal eficiente para seniors
- **Solución:** Marketplace que conecta ingenieros senior verificados con estudiantes tech
- **Target:** Laura (Junior 24), Carlos (Senior 40), Sofía (Career Changer 32)

### Vocabulario del dominio:
| Término genérico | Término contextual |
|------------------|-------------------|
| Usuario | Mentor / Estudiante |
| Registrarse | Únete como Mentor / Únete como Estudiante |
| Iniciar sesión | Accede a tu cuenta |
| Perfil | Tu perfil profesional |
| Habilidades | Especialidades técnicas |

### Copy contextual por pantalla:

**Signup Page (/signup):**
- ❌ Genérico: "Crea tu cuenta"
- ✅ Contextual: "Únete a la comunidad de mentoría tech"
- Subtítulo: "Conecta con expertos verificados o comparte tu conocimiento"

**Login Page (/login):**
- ❌ Genérico: "Inicia sesión"
- ✅ Contextual: "Accede a tu cuenta"
- Subtítulo: "Continúa aprendiendo o mentoreando"

**Role Selection (durante signup):**
- **Mentor card:** "Quiero ser Mentor - Comparte tu experiencia y genera ingresos"
- **Student card:** "Busco Mentoría - Aprende de expertos en tu área"

**Profile Edit (Mentor):**
- ❌ Genérico: "Edita tu perfil"
- ✅ Contextual: "Construye tu perfil profesional"
- Subtítulo: "Tu perfil es tu carta de presentación ante estudiantes que buscan crecer"

**Profile Edit (Student):**
- ❌ Genérico: "Edita tu perfil"
- ✅ Contextual: "Cuéntanos sobre ti"
- Subtítulo: "Ayuda a los mentores a conocerte mejor"

**Password Reset:**
- ❌ Genérico: "Recupera tu contraseña"
- ✅ Contextual: "¿Olvidaste tu contraseña?"
- Subtítulo: "Te enviaremos un enlace para crear una nueva"

### Mensajes de error contextuales:

| Caso | Mensaje |
|------|---------|
| Email ya registrado | "Este email ya tiene una cuenta. ¿Quieres iniciar sesión?" |
| Password débil | "Tu contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo" |
| Credenciales inválidas | "Email o contraseña incorrectos. Verifica e intenta de nuevo" |
| Email no verificado | "Revisa tu bandeja de entrada para verificar tu email" |

### Tono:
- **Formal pero cercano:** Tuteo, sin jerga excesiva
- **Profesional:** Enfocado en crecimiento profesional
- **Motivacional:** Enfatizar el valor del aprendizaje y mentoría

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

### 1. Supabase Configuration
- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase client (con cookies)
- `src/lib/supabase/middleware.ts` - Middleware helper para auth

### 2. Auth Context
- `src/contexts/auth-context.tsx` - React context para estado de auth global
- Provee: `user`, `isLoading`, `isAuthenticated`, `signOut`

### 3. Validation Schemas
- `src/lib/validations/auth.ts` - Zod schemas para signup, login, password reset
- `src/lib/validations/profile.ts` - Zod schemas para profile updates

### 4. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://ionevzckjyxtpmyenbxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> # Server-only
```

### 5. Middleware (Route Protection)
- `middleware.ts` - Protección de rutas autenticadas
- Rutas protegidas: `/dashboard`, `/profile/*`
- Rutas públicas: `/`, `/login`, `/signup`, `/password-reset`, `/mentors/*`

### 6. External Services
- **Supabase Auth:** Registration, login, password reset, email verification
- **Supabase Storage:** Profile photo uploads (bucket: `avatars`)
- **Email Service:** Supabase built-in (templates configurables en dashboard)

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   ├── (auth)/                    # Route group para auth pages
│   │   ├── login/
│   │   │   └── page.tsx          # MYM-4
│   │   ├── signup/
│   │   │   └── page.tsx          # MYM-3
│   │   └── password-reset/
│   │       ├── page.tsx          # MYM-7 (request)
│   │       └── confirm/
│   │           └── page.tsx      # MYM-7 (reset form)
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard
│   ├── profile/
│   │   └── edit/
│   │       └── page.tsx          # MYM-5, MYM-6
│   └── layout.tsx                # Root layout con AuthProvider
│
├── components/
│   ├── auth/
│   │   ├── auth-form-layout.tsx  # Shared layout para forms
│   │   ├── login-form.tsx        # MYM-4
│   │   ├── signup-form.tsx       # MYM-3
│   │   ├── password-input.tsx    # Shared: visibility toggle + strength
│   │   ├── role-selector.tsx     # MYM-3: mentor/student selector
│   │   └── password-reset-form.tsx # MYM-7
│   ├── profile/
│   │   ├── profile-form.tsx      # MYM-5: base profile form
│   │   ├── mentor-profile-form.tsx # MYM-6: extended form
│   │   ├── avatar-upload.tsx     # Photo upload component
│   │   └── skills-selector.tsx   # MYM-6: dynamic skills chips
│   ├── ui/                       # Design system components
│   └── layout/                   # Navbar, Footer
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware helpers
│   ├── validations/
│   │   ├── auth.ts               # Zod schemas for auth
│   │   └── profile.ts            # Zod schemas for profiles
│   ├── types.ts                  # Type helpers
│   └── utils.ts                  # cn() utility
│
├── contexts/
│   └── auth-context.tsx          # Global auth state
│
└── types/
    ├── index.ts                  # Domain types
    └── supabase.ts               # Generated Supabase types
```

### Design Patterns

1. **Server Components by Default:** Usar Server Components para páginas que no requieren interactividad client-side
2. **Client Components for Forms:** `"use client"` solo para formularios con hooks (useForm, useState)
3. **Server Actions for Mutations:** Usar Server Actions para operaciones de escritura (signup, update profile)
4. **Optimistic Updates:** Para operaciones de perfil, mostrar cambios inmediatamente
5. **Error Boundaries:** Implementar error.tsx para cada route segment crítico

### Third-party Libraries

| Library | Version | Uso |
|---------|---------|-----|
| `@supabase/ssr` | ^0.5.x | Server-side Supabase client |
| `@supabase/supabase-js` | ^2.x | Base Supabase SDK |
| `react-hook-form` | ^7.x | Form state management |
| `@hookform/resolvers` | ^3.x | Zod resolver para react-hook-form |
| `zod` | ^3.x | Schema validation |
| `lucide-react` | ^0.x | Iconos (Eye, EyeOff, User, etc.) |

---

## Implementation Order

**Recomendado (basado en dependencias):**

### Sprint 1: Foundation

1. **MYM-3: Sign up with email and password** (base para todo)
   - **Status Jira:** In Progress
   - **Razón:** Sin registro, no hay usuarios. Es el punto de entrada a la plataforma.
   - **Dependencias:** AuthContext, Supabase config, middleware
   - **Entregables:** SignupForm, RoleSelector, PasswordInput, email verification

2. **MYM-4: Log in and log out** (completa ciclo de auth)
   - **Status Jira:** Ready For QA
   - **Razón:** Usuarios registrados necesitan poder volver. Completa el ciclo básico.
   - **Dependencias:** MYM-3 (usuarios existentes)
   - **Entregables:** LoginForm, logout action, session management

3. **MYM-7: Password reset** (recovery flow)
   - **Status Jira:** Ready For QA
   - **Razón:** Usuarios que olvidan password no pueden usar la plataforma. Critical path.
   - **Dependencias:** MYM-3, MYM-4 (necesita usuarios y flujo de login)
   - **Entregables:** PasswordResetRequestForm, PasswordResetConfirmForm

### Sprint 2: Profiles

4. **MYM-5: Mentee basic profile** (perfil base)
   - **Status Jira:** Ready For QA
   - **Razón:** Más simple que mentor profile. Establece el patrón base.
   - **Dependencias:** MYM-3, MYM-4 (usuario autenticado)
   - **Entregables:** ProfileForm (base), AvatarUpload

5. **MYM-6: Mentor detailed profile** (perfil extendido)
   - **Status Jira:** In Progress
   - **Razón:** Extiende MYM-5 con campos adicionales. Más complejo.
   - **Dependencias:** MYM-5 (base profile form)
   - **Entregables:** MentorProfileForm, SkillsSelector, validaciones específicas

---

## Risks & Mitigations

### Risk 1: Email delivery failures prevent verification

**Impact:** High
**Likelihood:** Medium
**Mitigation:**
- Usar Supabase built-in email con templates configurados
- Implementar "Resend verification email" button
- Mostrar mensaje claro con instrucciones (revisar spam)
- Logging de envíos para debugging

### Risk 2: Weak passwords compromise accounts

**Impact:** High
**Likelihood:** Medium
**Mitigation:**
- Enforcer password policy en client Y server (Zod schemas)
- Mostrar password strength indicator en tiempo real
- Mensajes de error específicos por cada requisito faltante
- Supabase Auth como backup de validación

### Risk 3: Profile photo storage issues

**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Validar tipo y tamaño de archivo antes de upload (5MB max, JPEG/PNG/WebP)
- Implementar fallback a avatar placeholder si upload falla
- Compresión client-side antes de enviar
- Error handling con retry option

### Risk 4: Session hijacking (JWT theft)

**Impact:** High
**Likelihood:** Low
**Mitigation:**
- Almacenar JWT en HttpOnly cookies (no localStorage)
- Configurar SameSite=Lax para CSRF protection
- HTTPS enforced en Vercel
- Session refresh automático con Supabase

### Risk 5: High registration abandonment

**Impact:** High (afecta KPI de 500 estudiantes)
**Likelihood:** Medium
**Mitigation:**
- Formulario simple (solo email, password, role)
- Password strength indicator para feedback inmediato
- Error messages claros y específicos
- "Already have account?" link prominente

### Risk 6: Rate limiting not implemented

**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Supabase Auth tiene rate limiting built-in
- Verificar configuración en Supabase dashboard
- Implementar feedback UI cuando se alcanza límite

---

## Success Criteria

**Esta feature estará completa cuando:**

### Functional Requirements
- [ ] Todas las stories implementadas (MYM-3, MYM-4, MYM-5, MYM-6, MYM-7)
- [ ] 100% de los acceptance criteria de cada story cumplidos
- [ ] E2E tests pasando para user journeys críticos

### Type Safety
- [ ] Todas las stories usan tipos desde `@/lib/types` o `@/types/supabase`
- [ ] Zero TypeScript errors en toda la feature
- [ ] Props de componentes tipadas correctamente
- [ ] Zod schemas consistentes con Database types

### UI/UX Consistency
- [ ] Estilo visual Moderno/Bold aplicado consistentemente
- [ ] Bordes (`rounded-lg`), sombras (`shadow-lg`) y spacing coherentes
- [ ] Paleta de colores aplicada (bg-primary, bg-secondary, text-muted-foreground)
- [ ] Hover effects y transitions en todos los elementos interactivos
- [ ] Responsive design funcionando en mobile y desktop

### Content Writing
- [ ] Vocabulario del dominio usado consistentemente (Mentor/Estudiante, no Usuario)
- [ ] Sin frases placeholder genéricas
- [ ] Tono profesional pero cercano en todos los textos
- [ ] Mensajes de error específicos y útiles

### Security
- [ ] Password policy enforced (8+ chars, 1 upper, 1 number, 1 special)
- [ ] JWT en HttpOnly cookies
- [ ] HTTPS only
- [ ] Rate limiting funcional (5 attempts/15min)
- [ ] No password leaks en logs o responses

### Route Protection
- [ ] Middleware actualizado con rutas de esta feature
- [ ] Rutas protegidas redirigen a `/login` si no autenticado
- [ ] Rutas de auth redirigen a `/dashboard` si ya autenticado

### Quality Gates
- [ ] `bun run build` exitoso
- [ ] `bun run typecheck` sin errores
- [ ] `bun run lint` pasando
- [ ] Unit tests con >80% coverage en lógica de auth
- [ ] E2E tests para 3 user journeys (signup, login, profile edit)

### Documentation
- [ ] CLAUDE.md actualizado si hay nuevos patrones
- [ ] Componentes documentados con JSDoc donde aplique
- [ ] Test cases documentados en cada story folder

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-test-plan.md`
- **Design System:** `.context/design-system.md`
- **Backend Setup:** `.context/backend-setup.md`
- **SRS Functional Specs:** `.context/SRS/functional-specs.md` (FR-001 to FR-005)
- **PRD:** `.context/PRD/executive-summary.md`, `.context/PRD/user-personas.md`
- **Jira Epic:** https://upexgalaxy62.atlassian.net/browse/MYM-2

---

**Formato:** Markdown estructurado para `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-implementation-plan.md`

**Generated:** 2025-11-27
