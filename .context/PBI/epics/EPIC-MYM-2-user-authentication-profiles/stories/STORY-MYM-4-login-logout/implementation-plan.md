# Implementation Plan: STORY-MYM-4 - User Login and Logout

**Fecha:** 2025-11-28
**Autor:** AI-Generated
**Story Jira Key:** MYM-4
**Epic:** EPIC-MYM-2 - User Authentication & Profiles
**Status:** Ready For Implementation

---

## Overview

Implementar mejoras al flujo de login y logout existente para la plataforma Upex My Mentor, agregando validación con Zod, mejor manejo de errores, y features faltantes según los acceptance criteria refinados.

**Acceptance Criteria a cumplir:**

1. **AC-1 (Successful Login):** Usuario registrado puede iniciar sesión con email y password correctos, sistema autentica y redirige a dashboard
2. **AC-2 (Incorrect Credentials):** Sistema muestra error claro "Invalid login credentials." cuando credenciales son incorrectas
3. **AC-3 (Successful Logout):** Usuario autenticado puede cerrar sesión, sistema termina sesión y redirige a homepage

**Criterios refinados del análisis QA (shift-left):**
- JWT almacenado en HttpOnly+Secure cookie (SameSite=Lax) - Ya configurado via `@supabase/ssr`
- Rate limiting: 5 intentos fallidos en 15 minutos bloquea temporalmente (built-in Supabase)
- Rutas protegidas (`/dashboard/*`) redirigen a `/login` sin sesión
- Preservar URL destino con `redirectTo` query param

---

## Current State Analysis

### Archivos existentes relacionados:

| Archivo | Estado | Acción |
|---------|--------|--------|
| `src/app/login/page.tsx` | ✅ Funcional | MEJORAR: validación Zod, PasswordInput, link forgot password |
| `src/app/signup/page.tsx` | ✅ Funcional | MEJORAR en MYM-3 (fuera de scope MYM-4) |
| `src/contexts/auth-context.tsx` | ✅ Funcional | MANTENER: `login()`, `logout()` ya implementados |
| `src/components/layout/navbar.tsx` | ✅ Funcional | MANTENER: logout button ya integrado |
| `middleware.ts` | ✅ Funcional | MEJORAR: agregar `redirectTo` param |
| `src/lib/validations/auth.ts` | ❌ No existe | CREAR: schemas Zod para login |
| `src/components/auth/password-input.tsx` | ❌ No existe | CREAR: input con visibility toggle |

### Funcionalidades ya implementadas:
- ✅ Login con `signInWithPassword` via AuthContext
- ✅ Logout con `signOut` via AuthContext
- ✅ Estado global de auth con `onAuthStateChange`
- ✅ Route protection en middleware
- ✅ Redirect auth users away from `/login` → `/dashboard`
- ✅ UI con design system (Card, Button, Input, gradientes)
- ✅ Demo credentials para testing
- ✅ Logout button en Navbar (desktop y mobile)

### Gaps identificados (a implementar):
- ❌ Validación Zod client-side
- ❌ PasswordInput con toggle visibility
- ❌ Link "¿Olvidaste tu contraseña?" → `/password-reset`
- ❌ `redirectTo` param para preservar URL destino
- ❌ Mensaje de error exacto "Invalid login credentials."
- ❌ Manejo de rate limiting en UI

---

## Technical Approach

**Chosen approach:** Mejoras incrementales sobre la implementación existente

**Why this approach:**
- ✅ La funcionalidad core ya existe y funciona
- ✅ Minimiza riesgo de regresiones
- ✅ Aprovecha código ya testeado en producción
- ✅ Reduce tiempo de implementación significativamente
- ❌ Trade-off: Refactoring limitado (no cambiar arquitectura que funciona)

---

## UI/UX Design

**Estado actual:** La página `/login` ya tiene el design system aplicado correctamente.

### Mejoras visuales a implementar:

**1. PasswordInput con toggle visibility:**
```
┌─────────────────────────────────────────┐
│ Contraseña                              │
├─────────────────────────────────────────┤
│ ••••••••                          [👁]  │
└─────────────────────────────────────────┘
```

**2. Link a password reset:**
```
┌─────────────────────────────────────────┐
│ [Password field]                        │
│                                         │
│ ¿Olvidaste tu contraseña?  (link)       │
│                                         │
│ [    Iniciar sesión    ]                │
└─────────────────────────────────────────┘
```

**3. Mensajes de error mejorados:**
- Credenciales inválidas: "Email o contraseña incorrectos. Verifica e intenta de nuevo."
- Rate limit: "Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo."
- Validación email: "Ingresa un email válido"

---

## Types & Type Safety

**Tipos existentes a usar (`src/types/index.ts`):**
```typescript
export interface LoginCredentials {
  email: string;
  password: string;
}
```

**Schema Zod a crear (`src/lib/validations/auth.ts`):**
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido')
    .transform(val => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

---

## Implementation Steps

### **Step 1: Crear archivo de validaciones auth**

**Task:** Crear schemas Zod para auth (login y preparar para signup)

**File:** `src/lib/validations/auth.ts` (CREAR)

**Details:**
- `loginSchema` con email (normalize) y password (required)
- Exportar tipos inferidos
- Preparar estructura para `signupSchema` (MYM-3)

**Code outline:**
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido')
    .transform(val => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

**Testing:**
- Unit test: Email normalization funciona
- Unit test: Password required valida

---

### **Step 2: Crear PasswordInput component**

**Task:** Crear input de password reutilizable con toggle visibility

**File:** `src/components/auth/password-input.tsx` (CREAR)

**Details:**
- Extiende Input del design system
- Toggle button con Eye/EyeOff icons
- Forwarded ref para compatibilidad con react-hook-form
- Opcional: prop para mostrar strength indicator (para MYM-3)

**Code outline:**
```tsx
"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn(error && "border-red-500", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"
```

**Testing:**
- Unit test: Toggle visibility funciona
- Unit test: Render con error state

---

### **Step 3: Actualizar login page con mejoras**

**Task:** Refactorizar login page existente

**File:** `src/app/login/page.tsx` (MODIFICAR)

**Changes:**
1. Integrar `react-hook-form` con `zodResolver(loginSchema)`
2. Reemplazar Input de password con PasswordInput
3. Agregar link "¿Olvidaste tu contraseña?"
4. Mejorar mensajes de error (específicos)
5. Leer `redirectTo` de searchParams para redirect post-login
6. Mantener demo credentials (útil para desarrollo)

**Key modifications:**
```tsx
// Agregar imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/lib/validations/auth'
import { PasswordInput } from '@/components/auth/password-input'
import { useSearchParams } from 'next/navigation'

// En el componente
const searchParams = useSearchParams()
const redirectTo = searchParams.get('redirectTo') || '/dashboard'

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' }
})

// En handleSubmit
router.push(redirectTo)

// Agregar link después del password field
<Link href="/password-reset" className="text-sm text-primary hover:underline">
  ¿Olvidaste tu contraseña?
</Link>
```

**Testing:**
- E2E test: TC-001 (Login exitoso)
- E2E test: TC-002 (Password inválido)
- E2E test: Redirect con redirectTo param

---

### **Step 4: Actualizar middleware para redirectTo param**

**Task:** Preservar URL original cuando redirect a login

**File:** `middleware.ts` (MODIFICAR)

**Changes:**
```typescript
// Cambiar línea 43-46
if (!session && !isPublicRoute && !isMentorsRoute) {
  const redirectUrl = new URL('/login', req.url)
  // Agregar redirectTo param
  redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}
```

**Testing:**
- E2E test: TC-006 (Ruta protegida sin sesión redirige con redirectTo)

---

### **Step 5: Mejorar manejo de errores de auth**

**Task:** Mapear errores de Supabase a mensajes user-friendly

**File:** `src/contexts/auth-context.tsx` (MODIFICAR)

**Changes:**
- Crear función `mapAuthError(error)` que retorna mensaje apropiado
- Errores específicos: invalid_credentials, rate_limit, etc.

**Code outline:**
```typescript
const mapAuthError = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Email o contraseña incorrectos. Verifica e intenta de nuevo.'
    case 'Email not confirmed':
      return 'Por favor verifica tu email antes de iniciar sesión.'
    case 'Too many requests':
      return 'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.'
    default:
      return 'Error al iniciar sesión. Intenta de nuevo.'
  }
}
```

**Testing:**
- Unit test: Cada error mapeado correctamente

---

### **Step 6: Crear test-cases.md para MYM-4**

**Task:** Documentar test cases basados en análisis de Jira

**File:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-4-login-logout/test-cases.md` (CREAR)

**Details:**
- Copiar y formatear los 7 test cases del comentario de Jira
- Agregar formato consistente con otros test-cases.md

---

### **Step 7: Integration Testing**

**Task:** Verificar todos los flujos end-to-end

**Flows a verificar:**

**Login Flow:**
1. Usuario navega a `/login`
2. Ingresa email y password (o usa demo)
3. Click "Iniciar sesión"
4. Zod valida client-side
5. AuthContext llama `signInWithPassword`
6. `onAuthStateChange` actualiza user state
7. Redirect a `redirectTo` o `/dashboard`

**Logout Flow:**
1. Usuario autenticado en cualquier página
2. Click en logout (Navbar)
3. AuthContext llama `signOut`
4. User state se limpia
5. Redirect a homepage
6. Middleware bloquea acceso a rutas protegidas

**Testing:**
- E2E test: TC-001 - TC-007 de Jira

---

## Technical Decisions (Story-specific)

### Decision 1: Mantener AuthContext existente

**Chosen:** Usar AuthContext actual sin cambiar a Server Actions

**Reasoning:**
- ✅ Ya funciona y está testeado
- ✅ Consistente con el patrón del proyecto
- ✅ Menos cambios = menos riesgo
- ❌ Trade-off: No es el pattern más "moderno" de Next.js 15

### Decision 2: Validación Zod client-side only

**Chosen:** Zod solo para validación de form, Supabase valida en servidor

**Reasoning:**
- ✅ Supabase ya valida credenciales server-side
- ✅ Zod mejora UX con feedback inmediato
- ✅ No duplica lógica de auth
- ❌ Trade-off: Menos type-safety en server action (no aplica, usamos Supabase SDK)

### Decision 3: Mantener demo credentials

**Chosen:** Conservar la sección de credenciales demo en login page

**Reasoning:**
- ✅ Útil para desarrollo y testing
- ✅ Facilita onboarding de nuevos devs
- ✅ Puede ocultarse con flag de ambiente en producción
- ❌ Trade-off: UI más cargada (aceptable para MVP)

---

## Dependencies

**Pre-requisitos (ya cumplidos):**
- [x] AuthContext con `login()` funcional
- [x] Middleware con route protection
- [x] Supabase client configurado
- [x] Design system components (Button, Card, Input)
- [x] react-hook-form instalado (verificar: `@hookform/resolvers`)

**Verificar instalación:**
```bash
bun add @hookform/resolvers  # Si no está instalado
```

---

## Risks & Mitigations

### Risk 1: Regresión en auth flow existente

**Impact:** High
**Likelihood:** Low
**Mitigation:**
- Cambios incrementales y testeados
- Mantener estructura existente
- E2E tests antes y después

### Risk 2: Conflicto con demo credentials

**Impact:** Low
**Mitigation:**
- Mantener demo credentials funcionales
- Verificar que fillMentorDemo/fillStudentDemo funcionan con nuevo form

---

## Estimated Effort

| Step | Task | Time |
|------|------|------|
| 1 | Crear validations/auth.ts | 15 min |
| 2 | Crear PasswordInput component | 30 min |
| 3 | Actualizar login page | 45 min |
| 4 | Actualizar middleware | 15 min |
| 5 | Mejorar error handling | 30 min |
| 6 | Crear test-cases.md | 20 min |
| 7 | Integration testing | 45 min |
| **Total** | | **~3.5 hours** |

**Story points:** 2 (Mejoras sobre código existente, bajo riesgo)

---

## Definition of Done Checklist

### Code Implementation
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] AC-1: Login exitoso redirect a dashboard
  - [ ] AC-2: Error "Invalid login credentials." para creds incorrectas
  - [ ] AC-3: Logout termina sesión y redirige a homepage

### Files Modified/Created
- [ ] `src/lib/validations/auth.ts` creado con `loginSchema`
- [ ] `src/components/auth/password-input.tsx` creado
- [ ] `src/app/login/page.tsx` actualizado con mejoras
- [ ] `middleware.ts` actualizado con `redirectTo`
- [ ] `src/contexts/auth-context.tsx` mejorado (error mapping)
- [ ] `test-cases.md` creado en carpeta de story

### Functionality Preserved
- [ ] Demo credentials siguen funcionando
- [ ] Logout desde Navbar sigue funcionando
- [ ] Route protection sigue funcionando

### UI/UX
- [ ] PasswordInput con toggle visibility
- [ ] Link "¿Olvidaste tu contraseña?" presente
- [ ] Mensajes de error claros y en español

### Testing
- [ ] TC-001: Login exitoso
- [ ] TC-002: Password inválido
- [ ] TC-003: Email formato inválido
- [ ] TC-006: Ruta protegida sin sesión redirige
- [ ] TC-007: Logout limpia sesión

### Quality Gates
- [ ] `bun run build` exitoso
- [ ] `bun run typecheck` sin errores
- [ ] `bun run lint` pasando

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-4-login-logout/story.md`
- **Test Cases (Jira):** Comment en MYM-4 con 7 test cases
- **Feature Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-implementation-plan.md`
- **Design System:** `.context/design-system.md`
- **Backend Setup:** `.context/backend-setup.md`
- **Existing Code:**
  - `src/app/login/page.tsx`
  - `src/contexts/auth-context.tsx`
  - `src/components/layout/navbar.tsx`
  - `middleware.ts`
- **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-4

---

**Generated:** 2025-11-28
**Ready for implementation**
