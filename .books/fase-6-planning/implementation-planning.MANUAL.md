<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Implementation Planning - Manual

> **Fase:** 6 - Planning (Planificación Técnica)
> **Tiempo estimado:** 1-2 horas por épica + 30-60 min por story
> **Herramientas:** SRS, Design System, IDE, Documentation
> **Pre-requisito:** Fase 5 (Shift-Left Testing) completada

---

## Objetivo

Crear **planes de implementación técnica** antes de escribir código:

1. **Feature Implementation Plan:** Decisiones técnicas y arquitectura a nivel épica
2. **Story Implementation Plan:** Pasos específicos de implementación por story
3. **Consistencia:** Garantizar que todas las stories siguen el mismo patrón

El principio: **piensa antes de codear**.

---

## Conceptos Clave

### 🔑 Feature Plan vs Story Plan

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  EPIC: User Authentication                                       │
│  ┌───────────────────────────────────────────────────────┐      │
│  │        FEATURE IMPLEMENTATION PLAN                     │      │
│  │                                                        │      │
│  │  • Technical Decisions (state mgmt, auth library)     │      │
│  │  • Types & Type Safety strategy                       │      │
│  │  • UI/UX Design Strategy (design system, patterns)    │      │
│  │  • Shared Dependencies                                │      │
│  │  • Implementation Order                               │      │
│  └───────────────────────────────────────────────────────┘      │
│                          │                                       │
│     ┌────────────────────┼────────────────────┐                 │
│     ▼                    ▼                    ▼                 │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐              │
│  │ STORY 1   │     │ STORY 2   │     │ STORY 3   │              │
│  │           │     │           │     │           │              │
│  │ ┌───────┐ │     │ ┌───────┐ │     │ ┌───────┐ │              │
│  │ │Impl   │ │     │ │Impl   │ │     │ │Impl   │ │              │
│  │ │Plan   │ │     │ │Plan   │ │     │ │Plan   │ │              │
│  │ │       │ │     │ │       │ │     │ │       │ │              │
│  │ │• Steps│ │     │ │• Steps│ │     │ │• Steps│ │              │
│  │ │• Files│ │     │ │• Files│ │     │ │• Files│ │              │
│  │ │• Tests│ │     │ │• Tests│ │     │ │• Tests│ │              │
│  │ └───────┘ │     │ └───────┘ │     │ └───────┘ │              │
│  └───────────┘     └───────────┘     └───────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Feature Plan:** Decisiones que afectan a TODAS las stories
- **Story Plan:** Pasos específicos para implementar UNA story

### 🔑 Technical Decisions

Una **decisión técnica** es una elección entre alternativas que afecta cómo se construye el software.

**Estructura de una buena decisión:**

```markdown
### Decision: [Nombre]

**Options considered:**

- A) [Opción A]
- B) [Opción B]
- C) [Opción C]

**Chosen:** [Opción elegida]

**Reasoning:**

- ✅ Ventaja 1
- ✅ Ventaja 2
- ❌ Trade-off: [Desventaja aceptada]

**Implementation notes:**

- [Detalle de cómo implementar]
```

**Ejemplos de decisiones técnicas:**

| Área             | Decisión                        | Opciones comunes                     |
| ---------------- | ------------------------------- | ------------------------------------ |
| State Management | ¿Cómo manejar estado global?    | React Context, Redux, Zustand, Jotai |
| Data Fetching    | ¿Cómo obtener datos del server? | fetch, React Query, SWR, tRPC        |
| Form Handling    | ¿Cómo manejar formularios?      | React Hook Form, Formik, manual      |
| Validation       | ¿Cómo validar datos?            | Zod, Yup, manual                     |
| UI Components    | ¿Qué librería de componentes?   | shadcn/ui, MUI, Chakra, custom       |

### 🔑 Type Safety Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    TYPE SAFETY FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Database Schema (Supabase)                                      │
│         │                                                        │
│         ▼                                                        │
│  lib/database.types.ts (auto-generated)                         │
│         │                                                        │
│         ▼                                                        │
│  lib/types.ts (helper types)                                    │
│         │                                                        │
│         ▼                                                        │
│  Components (import types from @/lib/types)                     │
│                                                                  │
│  BENEFICIO:                                                      │
│  Si cambias el schema → TypeScript te avisa qué rompes          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🔑 Design System Consistency

El **Design System** (creado en Fase 3) define:

- **Colores:** Primary, Secondary, Accent, Neutral
- **Tipografía:** Font family, sizes, weights
- **Espaciado:** Padding, margin scales
- **Componentes:** Button, Card, Input, Modal, etc.
- **Personalidad:** Minimalista, Bold, Corporativo, Playful

Todas las stories deben seguir el mismo Design System.

---

## Pre-requisitos

### Documentación Lista

- [ ] `.context/SRS/architecture-specs.md` - Arquitectura del sistema
- [ ] `.context/SRS/functional-specs.md` - Requerimientos funcionales
- [ ] `.context/design-system.md` - Design System del proyecto
- [ ] `feature-test-plan.md` - Plan de testing de la épica
- [ ] `test-cases.md` - Test cases de cada story

### Conocimiento del Stack

- [ ] Framework frontend (Next.js, React, etc.)
- [ ] Backend/Database (Supabase, etc.)
- [ ] UI Library (shadcn/ui, etc.)
- [ ] Testing tools (Playwright, Vitest, etc.)

---

# PARTE 1: FEATURE IMPLEMENTATION PLAN

## Paso 1: Review Epic Context

### 1.1 Lee la épica completa

Abre `epic.md` y extrae:

- Descripción general
- Lista de stories
- Scope (in/out of scope)
- Dependencias

### 1.2 Lee el Feature Test Plan

Abre `feature-test-plan.md` y extrae:

- Riesgos identificados
- Integration points críticos
- Test strategy definida
- Preguntas resueltas por PO/Dev

### 1.3 Documenta el Overview

```markdown
## Overview

Esta feature implementa [descripción high-level].

**Alcance:**

- STORY-MYM-3: User Signup
- STORY-MYM-4: User Login
- STORY-MYM-5: User Logout
- STORY-MYM-6: Password Reset

**Stack técnico:**

- Frontend: Next.js 14 (App Router)
- Backend: Supabase (Auth + Database)
- UI: shadcn/ui + TailwindCSS
- Testing: Playwright + Vitest
```

---

## Paso 2: Technical Decisions

Identifica las decisiones técnicas críticas para esta feature.

### 2.1 Categorías de decisiones

**State Management:**

- ¿Cómo manejas el estado de autenticación?
- ¿Dónde guardas datos del usuario?

**Data Fetching:**

- ¿Cómo obtienes datos del servidor?
- ¿Usas cache? ¿Revalidation?

**Form Handling:**

- ¿Cómo manejas formularios?
- ¿Cómo validas input?

**Error Handling:**

- ¿Cómo manejas errores de API?
- ¿Cómo muestras errores al usuario?

**Authentication:**

- ¿Cómo manejas sesiones?
- ¿Cómo proteges rutas?

### 2.2 Documenta cada decisión

Ejemplo completo:

```markdown
## Technical Decisions

### Decision 1: Authentication State Management

**Options considered:**

- A) React Context + useEffect for session check
- B) Supabase Auth helpers with server components
- C) Third-party auth library (NextAuth.js)

**Chosen:** B) Supabase Auth helpers

**Reasoning:**

- ✅ Native integration with Supabase
- ✅ SSR support out of the box
- ✅ Session management handled automatically
- ❌ Trade-off: Locked to Supabase (acceptable for this project)

**Implementation notes:**

- Use @supabase/ssr for session handling
- Create client in lib/supabase/client.ts
- Create server client in lib/supabase/server.ts
- Middleware handles session refresh

---

### Decision 2: Form Validation

**Options considered:**

- A) Manual validation with useState
- B) React Hook Form + Zod
- C) Formik + Yup

**Chosen:** B) React Hook Form + Zod

**Reasoning:**

- ✅ Type-safe validation with Zod
- ✅ Great performance (uncontrolled inputs)
- ✅ Easy integration with shadcn/ui form components
- ❌ Trade-off: Extra dependencies

**Implementation notes:**

- Define schemas in lib/validations/auth.ts
- Use Form component from shadcn/ui
- Zod schemas reusable for API validation
```

### 2.3 Consulta documentación actual

Antes de tomar decisiones finales:

1. **Verifica versiones** de las librerías en `package.json`
2. **Consulta docs oficiales** para API actual
3. **Revisa ejemplos** en la documentación

Esto evita usar APIs deprecadas o inexistentes.

---

## Paso 3: Types & Type Safety

Define la estrategia de tipos para toda la feature.

### 3.1 Identifica entidades del backend

Revisa `lib/database.types.ts` (generado en Fase 3):

```typescript
// ¿Qué tablas usa esta feature?
// - profiles
// - sessions (si aplica)
// - roles (si aplica)
```

### 3.2 Crea helper types

En `lib/types.ts`:

```typescript
import type { Database } from './database.types';

// Extrae tipos de tablas
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Tipos derivados si necesitas
export type PublicProfile = Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
```

### 3.3 Documenta la estrategia

````markdown
## Types & Type Safety

**Tipos disponibles:**

- `lib/database.types.ts` - Tipos generados desde database schema
- `lib/types.ts` - Type helpers extraídos

**Estrategia de tipos a nivel feature:**

1. **Entidades principales:**
   - `Profile` - Perfil de usuario (extends auth.users)
   - `Session` - Sesión de autenticación

2. **Directiva para todas las stories:**
   - ✅ Importar tipos desde `@/lib/types`
   - ✅ Props de componentes tipadas con tipos del backend
   - ✅ Zero type errors relacionados a entidades

3. **Ejemplo de uso:**

   ```typescript
   import type { Profile } from '@/lib/types';

   interface ProfileCardProps {
     profile: Profile; // ✅ Tipo del backend
     onEdit: (id: string) => void;
   }
   ```
````

````

---

## Paso 4: UI/UX Design Strategy

Define la estrategia visual para toda la feature.

### 4.1 Review Design System

Abre `.context/design-system.md` y extrae:

- Paleta de colores (primary, secondary, accent)
- Personalidad visual (minimalista, bold, corporativo, playful)
- Componentes disponibles

### 4.2 Identifica componentes compartidos

¿Qué componentes usará más de una story?

```markdown
## UI/UX Design Strategy

**Componentes del Design System a usar:**
- ✅ Button → Para submit de formularios
- ✅ Card → Para contenedores de forms
- ✅ Input → Campos de formulario
- ✅ Label → Labels de campos
- ✅ Form → Wrapper de formularios

**Componentes custom a nivel feature:**
- 🆕 AuthLayout
  - **Usado por:** Signup, Login, Password Reset
  - **Propósito:** Layout consistente para páginas de auth
  - **Ubicación:** `components/auth/auth-layout.tsx`

- 🆕 PasswordStrengthIndicator
  - **Usado por:** Signup, Password Reset
  - **Propósito:** Muestra fortaleza del password
  - **Ubicación:** `components/auth/password-strength.tsx`
````

### 4.3 Define consistencia visual

```markdown
### Consistencia visual

**Personalidad elegida:** Minimalista

**Aplicar en todas las stories:**

- Espacios generosos (p-6, gap-4)
- Sombras sutiles (shadow-sm en cards)
- Bordes suaves (rounded-md)
- Colores del design system:
  - Primary: botones principales
  - Destructive: botones de logout/delete
  - Muted: textos secundarios

**Estados globales:**

- Loading: Skeleton loaders
- Empty: Mensaje con ilustración simple
- Error: Toast con mensaje claro + retry
- Success: Toast o redirect
```

---

## Paso 5: Shared Dependencies

Lista todo lo que las stories comparten.

### 5.1 Dependencias técnicas

```markdown
## Shared Dependencies

### NPM Packages

- `@supabase/ssr` - Auth helpers
- `zod` - Validation
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Zod integration

### Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

### External Services

- Supabase Auth - Authentication
- Email service - Verification emails
```

### 5.2 Archivos compartidos

```markdown
### Shared Files

- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/validations/auth.ts` - Zod schemas
- `middleware.ts` - Route protection
```

---

## Paso 6: Architecture Notes

Documenta la estructura de archivos y patrones.

### 6.1 Folder Structure

```markdown
## Architecture Notes

### Folder Structure

src/
├── app/
│ ├── (auth)/ # Auth route group
│ │ ├── login/
│ │ │ └── page.tsx
│ │ ├── signup/
│ │ │ └── page.tsx
│ │ ├── forgot-password/
│ │ │ └── page.tsx
│ │ └── layout.tsx # AuthLayout wrapper
│ └── (dashboard)/ # Protected routes
│ ├── dashboard/
│ │ └── page.tsx
│ └── layout.tsx
├── components/
│ └── auth/
│ ├── auth-layout.tsx
│ ├── login-form.tsx
│ ├── signup-form.tsx
│ └── password-strength.tsx
├── lib/
│ ├── supabase/
│ │ ├── client.ts
│ │ └── server.ts
│ └── validations/
│ └── auth.ts
└── middleware.ts
```

### 6.2 Design Patterns

```markdown
### Design Patterns

1. **Route Groups:**
   - `(auth)` - Rutas públicas de autenticación
   - `(dashboard)` - Rutas protegidas
   - Permite diferentes layouts por grupo

2. **Form Pattern:**
   - Schema Zod → React Hook Form → shadcn Form
   - Validation on submit + real-time feedback

3. **Error Handling:**
   - try/catch en server actions
   - Toast notifications para feedback
   - Redirect on success
```

---

## Paso 7: Implementation Order

Define el orden óptimo de implementación.

### 7.1 Identifica dependencias entre stories

```
Story 1: Signup
    ↓ (necesita cuenta para probar login)
Story 2: Login
    ↓ (necesita login para probar logout)
Story 3: Logout
    ↓ (necesita login para probar password reset)
Story 4: Password Reset
```

### 7.2 Documenta el orden

```markdown
## Implementation Order

**Recomendado:**

1. **STORY-MYM-3: User Signup** (base para todo)
   - Razón: Crea usuarios necesarios para testing de otras stories
   - Duración: 4 horas

2. **STORY-MYM-4: User Login** (depende de signup)
   - Razón: Necesita usuarios existentes
   - Duración: 3 horas

3. **STORY-MYM-5: User Logout** (depende de login)
   - Razón: Necesita sesión activa
   - Duración: 1 hora

4. **STORY-MYM-6: Password Reset** (puede ir en paralelo con logout)
   - Razón: Necesita usuarios existentes, pero no sesión
   - Duración: 3 horas
```

---

## Paso 8: Risks & Mitigations

Identifica riesgos técnicos específicos de implementación.

```markdown
## Risks & Mitigations

### Risk 1: Email delivery delays

**Impact:** Medium - Usuario no puede verificar cuenta inmediatamente
**Likelihood:** Medium
**Mitigation:**

- Implementar resend functionality
- Mostrar mensaje claro de esperar email
- Logging de envío de emails

### Risk 2: Session persistence issues

**Impact:** High - Usuario pierde sesión inesperadamente
**Likelihood:** Low
**Mitigation:**

- Testing extensivo de session refresh
- Middleware verifica y renueva token
- Logging de session events
```

---

## Paso 9: Success Criteria

Define cuándo la feature está completa.

```markdown
## Success Criteria

Esta feature estará completa cuando:

- [ ] Todas las stories implementadas y deployed
- [ ] Tipos del backend aplicados consistentemente
  - [ ] Zero type errors
  - [ ] Imports desde @/lib/types
- [ ] Personalidad UI/UX consistente
  - [ ] Design system aplicado
  - [ ] Bordes, sombras, colores coherentes
- [ ] Content Writing contextual
  - [ ] Sin texto genérico
  - [ ] Vocabulario del dominio
- [ ] Testing
  - [ ] 100% test cases críticos pasando
  - [ ] E2E tests de flows completos
- [ ] Performance
  - [ ] Page load < 2s
  - [ ] No blocking renders
- [ ] Build passing
  - [ ] npm run build exitoso
  - [ ] Zero TypeScript errors
```

---

## Paso 10: Create feature-implementation-plan.md

Consolida todo en un archivo:

```
.context/PBI/epics/EPIC-MYM-2-user-authentication/feature-implementation-plan.md
```

---

# PARTE 2: STORY IMPLEMENTATION PLAN

## Paso 11: Select Story

Elige la story a planificar (según el orden definido).

### 11.1 Lee la story completa

- `story.md` - User story, acceptance criteria
- `test-cases.md` - Test cases a cumplir
- `feature-implementation-plan.md` - Decisiones de la feature

### 11.2 Lista Acceptance Criteria

```markdown
## Overview

Implementar signup con email/password.

**Acceptance Criteria a cumplir:**

- Usuario puede registrarse con email válido
- Password debe cumplir requisitos de seguridad
- Se envía email de verificación
- Se muestra mensaje de éxito
- Se crea perfil en base de datos
```

---

## Paso 12: Technical Approach

Define cómo vas a implementar la story.

### 12.1 Elige el approach

```markdown
## Technical Approach

**Chosen approach:** Server Action + Client Form

**Flow:**

1. Client: Formulario con React Hook Form + Zod
2. Client: Llama Server Action on submit
3. Server: Valida datos con Zod (doble validación)
4. Server: Llama Supabase signUp
5. Server: Crea profile en DB
6. Server: Retorna resultado
7. Client: Muestra success/error

**Alternatives considered:**

- A) API Route + fetch: Más boilerplate, menos type-safe
- B) Client-only Supabase: Expone lógica en client

**Why this approach:**

- ✅ Type-safe de extremo a extremo
- ✅ Validación server-side obligatoria
- ✅ Mejor seguridad
- ❌ Trade-off: Más archivos (action + form)
```

---

## Paso 13: UI/UX Design

Diseña la interfaz de la story.

### 13.1 Identifica componentes

```markdown
## UI/UX Design

**Componentes del Design System:**

- ✅ Button → Submit button
- ✅ Card → Form container
- ✅ Input → Email, password fields
- ✅ Label → Field labels
- ✅ Form → Form wrapper

**Componentes custom:**

- 🆕 SignupForm
  - Propósito: Formulario de registro
  - Ubicación: `components/auth/signup-form.tsx`

- 🆕 PasswordStrengthIndicator (reutilizado)
  - Propósito: Feedback visual de password strength
```

### 13.2 Wireframe

```markdown
### Layout

┌──────────────────────────────────────────┐
│ │
│ Logo / Branding │
│ │
│ ┌────────────────────────────────────┐ │
│ │ Create Account │ │
│ │ │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │ Email │ │ │
│ │ └──────────────────────────────┘ │ │
│ │ │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │ Password │ │ │
│ │ └──────────────────────────────┘ │ │
│ │ [======== ] Strong │ │
│ │ │ │
│ │ ┌──────────────────────────────┐ │ │
│ │ │ Create Account │ │ │
│ │ └──────────────────────────────┘ │ │
│ │ │ │
│ │ Already have an account? Login │ │
│ └────────────────────────────────────┘ │
│ │
└──────────────────────────────────────────┘
```

### 13.3 Estados de UI

```markdown
### Estados

- **Default:** Form vacío, button enabled
- **Filling:** Real-time password strength feedback
- **Submitting:** Button loading state, form disabled
- **Error:** Error message below form, field highlighting
- **Success:** Redirect to /verify-email page
```

### 13.4 Validaciones visuales

```markdown
### Validaciones de Form

| Campo    | Validación  | Mensaje de Error                         |
| -------- | ----------- | ---------------------------------------- |
| Email    | Required    | "Email is required"                      |
| Email    | Format      | "Please enter a valid email"             |
| Password | Required    | "Password is required"                   |
| Password | Min 8 chars | "Password must be at least 8 characters" |
| Password | Uppercase   | "Password must contain uppercase letter" |
| Password | Number      | "Password must contain a number"         |

**Estilos de error:**

- Input: `border-destructive`
- Message: `text-destructive text-sm`
```

---

## Paso 14: Implementation Steps

Define los pasos específicos de implementación.

### 14.1 Estructura de un step

````markdown
### Step 1: Create Zod Schema

**Task:** Definir schema de validación para signup form

**File:** `lib/validations/auth.ts`

**Code:**

```typescript
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export type SignupInput = z.infer<typeof signupSchema>;
```
````

**Testing:**

- Unit test: Validar que schema rechaza emails inválidos
- Unit test: Validar que schema rechaza passwords débiles

**Estimated time:** 30 min

````

### 14.2 Lista todos los steps

```markdown
### Step 1: Create Zod Schema
[Detalle arriba]

### Step 2: Create Server Action

**Task:** Crear server action para signup

**File:** `app/(auth)/signup/actions.ts`

**Details:**
- Import signupSchema
- Validate input
- Call supabase.auth.signUp()
- Create profile in DB
- Return result

**Testing:**
- Integration test: Action creates user
- Integration test: Action creates profile
- Unit test: Action handles validation errors

**Estimated time:** 1 hour

---

### Step 3: Create Signup Form Component

**Task:** Crear formulario de signup

**File:** `components/auth/signup-form.tsx`

**Details:**
- Use React Hook Form
- Connect to Zod schema
- Handle submit → call server action
- Show loading state
- Handle errors

**Testing:**
- Unit test: Form renders correctly
- Unit test: Validation messages appear

**Estimated time:** 1.5 hours

---

### Step 4: Create Signup Page

**Task:** Crear página de signup

**File:** `app/(auth)/signup/page.tsx`

**Details:**
- Import SignupForm
- Add metadata (title, description)
- Link to login page

**Testing:**
- E2E test: Complete signup flow

**Estimated time:** 30 min

---

### Step 5: Create Verify Email Page

**Task:** Crear página post-signup

**File:** `app/(auth)/verify-email/page.tsx`

**Details:**
- Show success message
- Instructions to check email
- Resend email button

**Testing:**
- Visual test: Page renders correctly

**Estimated time:** 30 min

---

### Step 6: Integration

**Task:** Conectar todo y test completo

**Flow completo:**
1. User goes to /signup
2. User fills form
3. User clicks submit
4. Server validates and creates account
5. User redirected to /verify-email
6. User receives email

**Testing:**
- E2E test: Happy path completo
- E2E test: Error scenarios

**Estimated time:** 1 hour
````

---

## Paso 15: Effort Estimation

Resume el esfuerzo estimado.

```markdown
## Estimated Effort

| Step      | Description              | Time        |
| --------- | ------------------------ | ----------- |
| 1         | Create Zod Schema        | 30 min      |
| 2         | Create Server Action     | 1 hour      |
| 3         | Create Signup Form       | 1.5 hours   |
| 4         | Create Signup Page       | 30 min      |
| 5         | Create Verify Email Page | 30 min      |
| 6         | Integration & Testing    | 1 hour      |
| **Total** |                          | **5 hours** |

**Story points:** 5 (matches story.md)
```

---

## Paso 16: Definition of Done

Lista todas las verificaciones.

```markdown
## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Acceptance Criteria pasando
  - [ ] Usuario puede registrarse con email válido
  - [ ] Password cumple requisitos
  - [ ] Email de verificación enviado
  - [ ] Perfil creado en DB
- [ ] Tipos del backend usados
  - [ ] Props tipadas con Profile type
  - [ ] Zero type errors
- [ ] Personalidad UI/UX
  - [ ] Design system aplicado
  - [ ] Estados de UI implementados
- [ ] Content Writing
  - [ ] Sin texto placeholder
  - [ ] Mensajes claros y contextuales
- [ ] Tests
  - [ ] Unit tests para schema
  - [ ] Unit tests para form
  - [ ] Integration test para action
  - [ ] E2E test para happy path
- [ ] Code review aprobado
- [ ] Build passing
- [ ] Deployed to staging
- [ ] Smoke test en staging
```

---

## Paso 17: Create implementation-plan.md

Consolida todo en:

```
.context/PBI/epics/EPIC-MYM-2-.../stories/STORY-MYM-3-.../implementation-plan.md
```

---

## Checklist Final

### Feature Implementation Plan ✅

- [ ] Overview documentado
- [ ] Technical decisions (3-5 decisiones)
- [ ] Types & Type Safety strategy
- [ ] UI/UX Design strategy
- [ ] Shared dependencies listadas
- [ ] Architecture notes (folder structure, patterns)
- [ ] Implementation order definido
- [ ] Risks & mitigations
- [ ] Success criteria
- [ ] `feature-implementation-plan.md` creado

### Story Implementation Plan ✅

- [ ] Overview con acceptance criteria
- [ ] Technical approach con alternatives
- [ ] UI/UX design con wireframe
- [ ] Estados de UI definidos
- [ ] Validaciones de form documentadas
- [ ] Implementation steps (5-10 steps)
- [ ] Effort estimation
- [ ] Definition of Done checklist
- [ ] `implementation-plan.md` creado

---

## Troubleshooting

### "Too many technical decisions"

**Solución:** Enfócate en decisiones que:

- Afectan a múltiples stories
- Tienen trade-offs significativos
- No son obvias

### "Steps too granular or too vague"

**Solución:** Cada step debería:

- Ser completable en 30 min - 2 horas
- Producir algo testeable
- Tener un archivo/output claro

### "Don't know what approach to choose"

**Solución:**

1. Lista pros y cons de cada opción
2. Consulta documentación oficial
3. Considera el stack existente del proyecto
4. Elige lo que simplifica mantenimiento

---

## Próximos Pasos

Con los implementation plans completos, puedes proceder a:

1. **Fase 7: Implementation** → Implementar siguiendo los steps
2. **Fase 8: Code Review** → Revisar código implementado

Los implementation plans:

- Guían al developer durante coding
- Sirven de referencia para code review
- Documentan decisiones para futuros cambios

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
