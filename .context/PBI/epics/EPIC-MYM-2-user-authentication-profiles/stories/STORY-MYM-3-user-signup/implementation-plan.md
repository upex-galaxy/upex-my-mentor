# Implementation Plan: STORY-MYM-3 - User Sign Up

**Fecha:** 2025-11-28
**Autor:** AI-Generated
**Story Jira Key:** MYM-3
**Epic:** EPIC-MYM-2 - User Authentication & Profiles
**Status:** Ready For Implementation

---

## Overview

Implementar el flujo de registro de usuarios para la plataforma Upex My Mentor, permitiendo a nuevos usuarios crear cuentas con email y password, diferenciando entre roles de "mentor" y "mentee" (estudiante).

**Acceptance Criteria a cumplir:**

1. **AC-1 (Mentee Registration):** Usuario puede registrarse como mentee con email válido y password seguro (8+ chars), sistema crea cuenta y perfil básico, usuario queda logueado
2. **AC-2 (Mentor Registration):** Usuario puede registrarse como mentor, sistema crea perfil con status "pending" para vetting
3. **AC-3 (Email Exists):** Sistema muestra error claro cuando email ya está registrado
4. **AC-4 (Password Policy):** Sistema valida password (min 8 chars, max 128, 1 mayúscula, 1 número, 1 especial)

**Decisiones del PO integradas (del test-cases.md):**
- Email verification NO bloquea acceso para mentees (solo banner informativo)
- Mentors NO pueden publicar servicios hasta verificar email
- Password máximo: 128 caracteres
- Role se pasa via URL param o selector en form
- Auto-login después de signup exitoso con JWT

---

## Technical Approach

**Chosen approach:** Supabase Auth `signUp` con metadata de rol + trigger para crear perfil automáticamente

**Alternatives considered:**
- **A) Custom JWT implementation:** Requiere implementar password hashing, session management, refresh tokens manualmente → Mucho código custom, propenso a errores de seguridad
- **B) NextAuth.js con Supabase adapter:** Agrega una capa de abstracción innecesaria cuando ya usamos Supabase nativamente

**Why this approach:**
- ✅ Supabase Auth maneja password hashing (bcrypt) automáticamente
- ✅ Email verification out-of-the-box
- ✅ JWT session management con refresh tokens
- ✅ Integración nativa con RLS policies de Supabase
- ✅ Trigger `handle_new_user()` crea perfil automáticamente
- ❌ Trade-off: Dependencia del ecosistema Supabase

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md` - Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ **Button** → `variant`: `default` para submit, `outline` para link a login
- ✅ **Card** → Container para el formulario de signup
- ✅ **Input** → Para campos de email y password
- ✅ **Badge** → Para mostrar requisitos de password

### Componentes custom a crear:

**1. SignupForm**
- **Propósito:** Formulario completo de registro
- **Props:** `defaultRole?: 'mentor' | 'student'` (desde URL param)
- **Ubicación:** `src/components/auth/signup-form.tsx`

**2. PasswordInput**
- **Propósito:** Input de password con toggle visibility y strength indicator
- **Props:** `showStrength?: boolean`, `value`, `onChange`, `error?`
- **Ubicación:** `src/components/auth/password-input.tsx`

**3. RoleSelector**
- **Propósito:** Selección visual de rol (mentor/estudiante)
- **Props:** `value: 'mentor' | 'student'`, `onChange`
- **Ubicación:** `src/components/auth/role-selector.tsx`

**4. PasswordStrengthIndicator**
- **Propósito:** Muestra requisitos de password con checkmarks
- **Props:** `password: string`
- **Ubicación:** `src/components/auth/password-strength.tsx`

### Wireframes/Layout:

**Estructura de la página `/signup`:**
```
┌──────────────────────────────────────────────────────────────┐
│ [Navbar - Logo + Link Login]                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌────────────────────────────────────────────────────┐    │
│   │  bg-gradient-to-br from-purple-50 via-fuchsia-50   │    │
│   │                                                    │    │
│   │   ┌──────────────────────────────────────────┐    │    │
│   │   │ Card (max-w-md mx-auto)                  │    │    │
│   │   │                                          │    │    │
│   │   │ Header: "Únete a la comunidad"           │    │    │
│   │   │ Subtitle: "Conecta con expertos..."      │    │    │
│   │   │                                          │    │    │
│   │   │ [RoleSelector: Mentor | Estudiante]      │    │    │
│   │   │                                          │    │    │
│   │   │ Email: [________________]                │    │    │
│   │   │                                          │    │    │
│   │   │ Password: [___________][👁]              │    │    │
│   │   │ [PasswordStrengthIndicator]              │    │    │
│   │   │                                          │    │    │
│   │   │ [    Crear Cuenta    ] (Button primary)  │    │    │
│   │   │                                          │    │    │
│   │   │ ¿Ya tienes cuenta? Inicia sesión         │    │    │
│   │   └──────────────────────────────────────────┘    │    │
│   │                                                    │    │
│   └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Button disabled con spinner "Creando cuenta..."
- **Error:** Alert rojo con mensaje específico (email exists, password policy, etc.)
- **Success:** Redirect a `/dashboard` con toast "Cuenta creada"
- **Form validation:** Errores inline debajo de cada campo con `text-red-500`

### Validaciones visuales (Formularios):

| Campo | Validación | Mensaje |
|-------|------------|---------|
| Email | Formato válido RFC 5321 | "Ingresa un email válido" |
| Email | No vacío | "El email es requerido" |
| Email | Ya existe (server) | "Este email ya tiene una cuenta. ¿Quieres iniciar sesión?" |
| Password | Min 8 chars | "Mínimo 8 caracteres" |
| Password | Max 128 chars | "Máximo 128 caracteres" |
| Password | 1 mayúscula | "Debe incluir una mayúscula" |
| Password | 1 número | "Debe incluir un número" |
| Password | 1 especial | "Debe incluir un símbolo (!@#$%...)" |
| Role | Requerido | "Selecciona tu rol" |

**Estados visuales:**
- Error: `border-red-500` + mensaje en `text-red-500`
- Success: `border-green-500` (para password strength completo)
- Focus: `ring-primary`

### Responsividad:

- **Mobile (< 768px):** Card full width con `px-4`, padding vertical reducido
- **Tablet (768px - 1024px):** Card centrado `max-w-md`
- **Desktop (> 1024px):** Card centrado `max-w-md` con gradiente de fondo visible

### Personalidad UI/UX aplicada:

**Estilo visual:** Moderno/Bold

- Gradientes sutiles en background de página (`bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50`)
- Sombras pronunciadas en card (`shadow-lg`)
- Bordes redondeados (`rounded-lg` en Card, `rounded-md` en inputs)
- Hover effects con transforms en botones
- Transiciones suaves (`transition-all duration-200`)

---

## Types & Type Safety

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos generados desde database schema
- `src/lib/types.ts` - Type helpers extraídos del backend

**Directiva para componentes:**
- ✅ Importar tipos desde `@/lib/types`
- ✅ Tipar props de componentes con tipos del backend
- ✅ Usar `z.infer<>` para inferir tipos desde Zod schemas

**Tipos a definir/usar:**

```typescript
// src/lib/types.ts (agregar si no existe)
import type { Database } from '@/types/supabase'

// User role enum
export type UserRole = Database['public']['Enums']['user_role'] // 'mentor' | 'student'

// Profile types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

// Auth types específicos para signup
export interface SignupData {
  email: string
  password: string
  role: UserRole
}

export interface SignupResult {
  success: boolean
  userId?: string
  error?: {
    code: string
    message: string
    field?: string
  }
}
```

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod'

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido')
    .transform(val => val.trim().toLowerCase()), // Normalización
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres')
    .regex(/[A-Z]/, 'Debe incluir una mayúscula')
    .regex(/[0-9]/, 'Debe incluir un número')
    .regex(/[^A-Za-z0-9]/, 'Debe incluir un símbolo (!@#$%...)'),
  role: z.enum(['mentor', 'student'], {
    required_error: 'Selecciona tu rol',
  }),
})

export type SignupFormData = z.infer<typeof signupSchema>
```

---

## Content Writing

**Contexto de negocio (del PRD):**
- **Problema:** Escasez de mentoría personalizada para juniors + falta de canal para seniors
- **Solución:** Marketplace que conecta ingenieros senior verificados con estudiantes tech
- **Target:** Laura (Junior 24), Carlos (Senior 40)

**Copy contextual para la página de signup:**

| Elemento | Texto Contextual |
|----------|------------------|
| Page Title | "Únete a la comunidad de mentoría tech" |
| Page Subtitle | "Conecta con expertos verificados o comparte tu conocimiento" |
| Role Mentor Card | **"Quiero ser Mentor"** - "Comparte tu experiencia y genera ingresos" |
| Role Student Card | **"Busco Mentoría"** - "Aprende de expertos en tu área" |
| Email Label | "Email" |
| Email Placeholder | "tu@email.com" |
| Password Label | "Contraseña" |
| Password Placeholder | "Mínimo 8 caracteres" |
| Submit Button | "Crear cuenta" |
| Login Link | "¿Ya tienes cuenta? Inicia sesión" |
| Success Toast | "¡Cuenta creada! Revisa tu email para verificar tu cuenta." |
| Error Email Exists | "Este email ya tiene una cuenta. ¿Quieres iniciar sesión?" |
| Verification Banner | "Verifica tu email para desbloquear todas las funciones" |

---

## Implementation Steps

### **Step 1: Crear Zod validation schemas**

**Task:** Definir schemas de validación compartidos entre client y server

**File:** `src/lib/validations/auth.ts`

**Details:**
- Crear `signupSchema` con validaciones de email, password, role
- Email normalization (trim, lowercase) como transform
- Password policy: min 8, max 128, 1 upper, 1 number, 1 special
- Role enum: 'mentor' | 'student'
- Exportar tipo `SignupFormData` con `z.infer<>`

**Testing:**
- Unit test: Validar cada regla de password individualmente
- Unit test: Verificar email normalization

---

### **Step 2: Crear PasswordInput component**

**Task:** Input de password con toggle visibility

**File:** `src/components/auth/password-input.tsx`

**Structure:**
```tsx
interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  showStrength?: boolean
  placeholder?: string
}
```

**Details:**
- Input type toggle (password/text) con Eye/EyeOff icons
- Mostrar/ocultar password al click
- Integrar con react-hook-form
- Forward ref para compatibilidad

**Testing:**
- Unit test: Toggle visibility funciona
- Unit test: Render con error state

---

### **Step 3: Crear PasswordStrengthIndicator component**

**Task:** Indicador visual de requisitos de password

**File:** `src/components/auth/password-strength.tsx`

**Structure:**
```tsx
interface PasswordStrengthProps {
  password: string
}
```

**Details:**
- Lista de requisitos con checkmarks (Check icon) o X (X icon)
- Requisitos: 8+ chars, mayúscula, número, símbolo
- Colores: verde si cumple, gris si no cumple
- Animación suave al cambiar estado

**Testing:**
- Unit test: Cada requisito se marca correctamente
- Unit test: Render correcto con password vacío

---

### **Step 4: Crear RoleSelector component**

**Task:** Selector visual de rol mentor/estudiante

**File:** `src/components/auth/role-selector.tsx`

**Structure:**
```tsx
interface RoleSelectorProps {
  value: 'mentor' | 'student' | null
  onChange: (role: 'mentor' | 'student') => void
  error?: string
}
```

**Details:**
- Dos cards seleccionables lado a lado
- Mentor: Icon GraduationCap, title, description
- Student: Icon BookOpen, title, description
- Estado seleccionado: border-primary, bg-primary/5
- Estado no seleccionado: border-border, hover:border-primary/50

**Testing:**
- Unit test: Cambio de selección funciona
- Unit test: Render con valor preseleccionado (desde URL)

---

### **Step 5: Crear Server Action para signup**

**Task:** Server Action que maneja el registro

**File:** `src/app/(auth)/signup/actions.ts`

**Structure:**
```typescript
'use server'

export async function signupAction(formData: SignupFormData): Promise<SignupResult>
```

**Logic:**
1. Validar datos con `signupSchema.safeParse()`
2. Normalizar email (ya hecho en schema transform)
3. Llamar `supabase.auth.signUp()` con email, password, options.data.role
4. Manejar errores de Supabase (user_already_exists, etc.)
5. Retornar resultado estructurado

**Edge cases handled:**
- Email ya existe: Return error code `EMAIL_ALREADY_EXISTS`
- Password inválido (server-side): Return error code `INVALID_PASSWORD`
- Supabase down: Return error code `SERVICE_UNAVAILABLE`

**Testing:**
- Integration test: Signup exitoso crea usuario y perfil
- Integration test: Email duplicado retorna error correcto

---

### **Step 6: Crear SignupForm component**

**Task:** Formulario completo de registro

**File:** `src/components/auth/signup-form.tsx`

**Structure:**
```tsx
interface SignupFormProps {
  defaultRole?: 'mentor' | 'student'
}
```

**Details:**
- Usar `react-hook-form` con `zodResolver(signupSchema)`
- Integrar: RoleSelector, Input (email), PasswordInput, PasswordStrengthIndicator
- Estado loading durante submit
- Mostrar errores inline y generales
- Llamar `signupAction` en submit
- Redirect a `/dashboard` en success con toast

**Testing:**
- E2E test: Flujo completo de mentee signup (TC-001)
- E2E test: Flujo completo de mentor signup (TC-002)

---

### **Step 7: Crear página de signup**

**Task:** Página `/signup` con layout y form

**File:** `src/app/(auth)/signup/page.tsx`

**Details:**
- Server Component que lee URL param `role` si existe
- Renderiza SignupForm con defaultRole
- Background con gradiente
- Card centrado con max-width
- Meta tags para SEO

**URL params:**
- `/signup` → Sin rol preseleccionado
- `/signup?role=mentor` → Mentor preseleccionado
- `/signup?role=student` → Student preseleccionado

**Testing:**
- E2E test: URL param preselecciona rol

---

### **Step 8: Actualizar AuthContext para manejar signup**

**Task:** Integrar nuevo usuario en contexto global

**File:** `src/contexts/auth-context.tsx`

**Details:**
- Verificar que `onAuthStateChange` detecta nuevo signup
- Usuario debe aparecer como `isAuthenticated: true` después de signup
- Profile data debe estar disponible

**Testing:**
- Integration test: AuthContext refleja usuario después de signup

---

### **Step 9: Actualizar middleware para rutas de auth**

**Task:** Asegurar redirects correctos

**File:** `middleware.ts`

**Details:**
- `/signup` debe ser ruta pública
- Si usuario ya está autenticado en `/signup`, redirect a `/dashboard`
- Verificar que `/dashboard` requiere auth

**Testing:**
- E2E test: Usuario autenticado en /signup es redirigido

---

### **Step 10: Integration - Conectar todos los componentes**

**Task:** Verificar flujo completo end-to-end

**Flow completo:**
1. Usuario navega a `/signup` o `/signup?role=mentor`
2. Selecciona rol (si no viene en URL)
3. Ingresa email y password
4. Ve indicador de strength en tiempo real
5. Click "Crear cuenta"
6. Server Action valida y crea usuario en Supabase
7. Trigger de DB crea perfil en `profiles` table
8. JWT se almacena en cookies
9. Usuario es redirigido a `/dashboard`
10. Toast de success se muestra
11. Banner de verificación de email aparece

**Testing:**
- E2E test: TC-001 (Mentee signup completo)
- E2E test: TC-002 (Mentor signup completo)
- E2E test: TC-003 (Email already exists)
- E2E test: TC-004-007 (Password policy violations)

---

## Technical Decisions (Story-specific)

### Decision 1: Email normalization location

**Chosen:** En Zod schema como `transform`

**Reasoning:**
- ✅ Normalización ocurre automáticamente durante validación
- ✅ Mismo comportamiento en client y server
- ✅ Email normalizado antes de cualquier operación
- ❌ Trade-off: Usuario ve email normalizado después de blur (puede confundir)

### Decision 2: Password strength indicator - client only

**Chosen:** Mostrar indicador solo en client-side, validación real en server

**Reasoning:**
- ✅ Feedback inmediato para UX
- ✅ Server-side validation como seguridad real
- ✅ No expone lógica de validación completa al client
- ❌ Trade-off: Pequeña duplicación de lógica

### Decision 3: Role selection - form field vs URL param

**Chosen:** Ambos - URL param como default, form permite cambiar

**Reasoning:**
- ✅ Links directos desde landing ("Únete como Mentor") funcionan
- ✅ Usuario puede cambiar de opinión en el form
- ✅ Flexible para diferentes flujos de entrada

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Supabase project configurado con Auth habilitado
- [x] Tabla `profiles` existe con trigger `handle_new_user()`
- [x] Variables de entorno configuradas (NEXT_PUBLIC_SUPABASE_URL, etc.)
- [x] AuthContext implementado con Supabase client
- [x] Design system components (Button, Card, Input)
- [ ] **BLOCKER si falta:** react-hook-form + @hookform/resolvers instalados

**Verificar instalación:**
```bash
bun add react-hook-form @hookform/resolvers zod lucide-react
```

---

## Risks & Mitigations

### Risk 1: Email delivery failures prevent verification

**Impact:** Medium (no bloquea signup, pero afecta experiencia)
**Mitigation:**
- Implementar "Resend verification email" button prominente
- Mensaje claro: "Revisa tu carpeta de spam"
- Log de envíos para debugging

### Risk 2: Concurrent signup race condition

**Impact:** Low (DB unique constraint previene duplicados)
**Mitigation:**
- Supabase maneja a nivel de DB
- Error message específico si ocurre

### Risk 3: Password policy confusion

**Impact:** Medium (usuarios frustrados si no entienden requisitos)
**Mitigation:**
- PasswordStrengthIndicator muestra cada requisito claramente
- Mensajes de error específicos por cada regla faltante
- Tooltips explicativos si es necesario

### Risk 4: High abandonment rate

**Impact:** High (afecta KPI de 500 estudiantes)
**Mitigation:**
- Form simple (solo 3 campos)
- Feedback inmediato (strength indicator)
- Copy motivacional y contextual
- Link prominente a login si ya tiene cuenta

---

## Estimated Effort

| Step | Task | Time |
|------|------|------|
| 1 | Zod validation schemas | 30 min |
| 2 | PasswordInput component | 45 min |
| 3 | PasswordStrengthIndicator | 30 min |
| 4 | RoleSelector component | 45 min |
| 5 | Server Action signup | 1 hour |
| 6 | SignupForm component | 1.5 hours |
| 7 | Signup page | 30 min |
| 8 | AuthContext updates | 30 min |
| 9 | Middleware updates | 15 min |
| 10 | Integration & testing | 2 hours |
| **Total** | | **~8 hours** |

**Story points:** 5 (Medium complexity, multiple components)

---

## Definition of Done Checklist

### Code Implementation
- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] AC-1: Mentee registration flow completo
  - [ ] AC-2: Mentor registration flow completo
  - [ ] AC-3: Email exists error handling
  - [ ] AC-4: Password policy validation

### Types & Type Safety
- [ ] Imports desde `@/lib/types` en componentes
- [ ] Props de componentes tipadas con tipos del backend
- [ ] Zod schemas con tipos inferidos correctamente
- [ ] Zero type errors relacionados a entidades del backend

### UI/UX Consistency
- [ ] Estilo Moderno/Bold aplicado:
  - [ ] Gradiente de fondo en página
  - [ ] Card con `shadow-lg` y `rounded-lg`
  - [ ] Buttons con hover effects
  - [ ] Transiciones suaves en interacciones
- [ ] Paleta de colores aplicada:
  - [ ] `bg-primary` en botón principal
  - [ ] `text-muted-foreground` en textos secundarios
  - [ ] `border-red-500` en estados de error
- [ ] Responsive design verificado (mobile, tablet, desktop)

### Content Writing
- [ ] Vocabulario del dominio usado (Mentor/Estudiante, no Usuario)
- [ ] Sin frases placeholder genéricas
- [ ] Tono profesional pero cercano
- [ ] Mensajes de error específicos y útiles

### Route Protection
- [ ] `/signup` es ruta pública
- [ ] Usuario autenticado en `/signup` redirige a `/dashboard`
- [ ] Middleware actualizado correctamente

### Testing
- [ ] Unit tests escritos (coverage > 80%):
  - [ ] `signupSchema` validation
  - [ ] `PasswordInput` component
  - [ ] `PasswordStrengthIndicator` component
  - [ ] `RoleSelector` component
- [ ] Integration tests pasando:
  - [ ] Server Action signup con Supabase
- [ ] E2E tests pasando (referencia: test-cases.md):
  - [ ] TC-001: Mentee signup
  - [ ] TC-002: Mentor signup
  - [ ] TC-003: Email already exists
  - [ ] TC-004-007: Password policy violations
  - [ ] TC-013: Email normalization
  - [ ] TC-014: Password min boundary (8 chars)
  - [ ] TC-035: Password max boundary (128 chars)

### Quality Gates
- [ ] `bun run build` exitoso
- [ ] `bun run typecheck` sin errores
- [ ] `bun run lint` pasando
- [ ] Zero TypeScript errors

### Verification
- [ ] Code review aprobado
- [ ] Deployed to staging
- [ ] Manual smoke test en staging:
  - [ ] UI se ve correcta en desktop
  - [ ] UI se ve correcta en mobile
  - [ ] Design system aplicado consistentemente
  - [ ] Flujo de signup funciona E2E

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-3-user-signup/story.md`
- **Test Cases:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-3-user-signup/test-cases.md`
- **Feature Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-implementation-plan.md`
- **Design System:** `.context/design-system.md`
- **Backend Setup:** `.context/backend-setup.md`
- **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-3

---

**Generated:** 2025-11-28
**Ready for implementation**
