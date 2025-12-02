# Implementation Plan: STORY-MYM-7 - Password Reset

**Fecha:** 2025-12-02 (Actualizado)
**Autor:** AI-Generated
**Story Jira Key:** MYM-7
**Epic:** EPIC-MYM-2 - User Authentication & Profiles
**Branch:** `feat/MYM-7/password-reset`
**Status Jira:** In Progress

---

## Overview

Implementar el flujo completo de recuperación de contraseña para la plataforma Upex My Mentor, permitiendo a usuarios que olvidaron su contraseña recuperar acceso a su cuenta de forma segura.

**Acceptance Criteria a cumplir:**

1. **AC-1 (Request Reset):** Usuario solicita reset en `/password-reset`, sistema envía email con link único, muestra mensaje de confirmación
2. **AC-2 (Reset Password):** Usuario con link válido puede establecer nueva contraseña segura, es redirigido a login con mensaje de éxito
3. **AC-3 (Non-existent Email):** Sistema muestra MISMO mensaje de confirmación para prevenir enumeración de usuarios

**Criterios adicionales del análisis shift-left (Jira):**
- Password policy consistente con signup (min 8, 1 upper, 1 number, 1 special)
- Token válido por 1 hora (default Supabase)
- Confirm password field requerido
- Session invalidation después de reset exitoso
- Rate limiting built-in de Supabase

---

## Current State Analysis

### Archivos existentes relacionados:

| Archivo | Estado | Acción |
|---------|--------|--------|
| `src/app/password-reset/page.tsx` | ❌ No existe | CREAR: página de solicitud |
| `src/app/password-reset/confirm/page.tsx` | ❌ No existe | CREAR: página de reset con token |
| `src/app/auth/confirm/route.ts` | ❌ No existe | CREAR: route handler PKCE |
| `src/contexts/auth-context.tsx` | ✅ Funcional | SIN CAMBIOS |
| `src/lib/validations/auth.ts` | ✅ Ya existe (MYM-4) | SIN CAMBIOS - schemas listos |
| `src/components/auth/password-input.tsx` | ✅ Ya existe (MYM-4) | REUTILIZAR |
| `src/components/auth/password-strength.tsx` | ✅ Ya existe (MYM-4) | REUTILIZAR |
| `middleware.ts` | ✅ Funcional | ACTUALIZAR: agregar rutas públicas |

**Nota:** MYM-4 (Login/Logout) ya fue completado y mergeado. Los schemas `forgotPasswordSchema` y `resetPasswordSchema` ya existen en `auth.ts`.

### Funcionalidades de Supabase Auth a usar:
- `supabase.auth.resetPasswordForEmail(email)` → Envía email con magic link
- `supabase.auth.updateUser({ password })` → Actualiza password con sesión del token
- Supabase maneja: generación de token, email template, expiración, invalidación

---

## Technical Approach

**Chosen approach:** Supabase Auth `resetPasswordForEmail` + Next.js route handler para callback

**Flow técnico:**
```
1. Usuario en /password-reset ingresa email
2. Frontend llama supabase.auth.resetPasswordForEmail(email, { redirectTo })
3. Supabase envía email con link: /password-reset/confirm#access_token=xxx&type=recovery
4. Usuario click link → Next.js page detecta hash params
5. Supabase auto-autentica con token del hash
6. Usuario ingresa nueva contraseña
7. Frontend llama supabase.auth.updateUser({ password })
8. Redirect a /login con success message
```

**Why this approach:**
- ✅ Supabase maneja toda la seguridad del token
- ✅ Email templates configurables en dashboard
- ✅ Rate limiting y expiración built-in
- ✅ No requiere endpoints custom
- ❌ Trade-off: Dependencia del flujo de Supabase (hash params)

---

## UI/UX Design

**Design System:** Moderno/Bold (consistente con login/signup)

### Páginas a crear:

**1. Forgot Password Page (`/password-reset`):**
```
┌──────────────────────────────────────────────────────────────┐
│ [Navbar]                                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   bg-gradient-to-br from-purple-50 via-fuchsia-50            │
│                                                              │
│   ┌──────────────────────────────────────────┐              │
│   │ Card (max-w-md)                          │              │
│   │                                          │              │
│   │ [🔑 Icon]                                │              │
│   │ "¿Olvidaste tu contraseña?"              │              │
│   │ "Te enviaremos un enlace para crear..."  │              │
│   │                                          │              │
│   │ Email: [_____________________]           │              │
│   │                                          │              │
│   │ [  Enviar enlace de recuperación  ]      │              │
│   │                                          │              │
│   │ Volver a iniciar sesión                  │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**2. Reset Password Page (`/password-reset/confirm`):**
```
┌──────────────────────────────────────────────────────────────┐
│ [Navbar]                                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────────────────────────┐              │
│   │ Card (max-w-md)                          │              │
│   │                                          │              │
│   │ [🔐 Icon]                                │              │
│   │ "Crear nueva contraseña"                 │              │
│   │ "Ingresa tu nueva contraseña"            │              │
│   │                                          │              │
│   │ Nueva contraseña: [___________][👁]      │              │
│   │ [PasswordStrengthIndicator]              │              │
│   │                                          │              │
│   │ Confirmar contraseña: [_______][👁]      │              │
│   │                                          │              │
│   │ [    Actualizar contraseña    ]          │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**3. Estados de error (token inválido/expirado):**
```
┌──────────────────────────────────────────┐
│ Card                                      │
│                                          │
│ [⚠️ Icon]                                │
│ "Enlace inválido o expirado"             │
│ "Este enlace ya no es válido..."         │
│                                          │
│ [  Solicitar nuevo enlace  ]             │
└──────────────────────────────────────────┘
```

### Estados de UI:

| Estado | Página | Comportamiento |
|--------|--------|----------------|
| Loading | Request | Button disabled "Enviando..." |
| Success | Request | Mensaje verde de confirmación |
| Error | Request | Alert rojo (rate limit, network) |
| Valid Token | Confirm | Formulario de nueva contraseña |
| Invalid Token | Confirm | Mensaje de error + link a request |
| Expired Token | Confirm | Mensaje específico de expiración |
| Password Mismatch | Confirm | Error inline en campos |

---

## Types & Type Safety

**Schemas Zod a agregar (`src/lib/validations/auth.ts`):**

```typescript
// Schema para solicitud de reset
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido')
    .transform(val => val.trim().toLowerCase()),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Schema para nueva contraseña (reutiliza password policy de signup)
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres')
    .regex(/[A-Z]/, 'Debe incluir una mayúscula')
    .regex(/[0-9]/, 'Debe incluir un número')
    .regex(/[^A-Za-z0-9]/, 'Debe incluir un símbolo'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
```

---

## Content Writing

**Copy contextual:**

| Elemento | Texto |
|----------|-------|
| Request Page Title | "¿Olvidaste tu contraseña?" |
| Request Page Subtitle | "Te enviaremos un enlace para crear una nueva" |
| Email Placeholder | "tu@email.com" |
| Request Submit Button | "Enviar enlace de recuperación" |
| Request Success Message | "Si existe una cuenta con este email, recibirás un enlace de recuperación en los próximos minutos. Revisa también tu carpeta de spam." |
| Back to Login Link | "Volver a iniciar sesión" |
| Confirm Page Title | "Crear nueva contraseña" |
| Confirm Page Subtitle | "Ingresa tu nueva contraseña segura" |
| New Password Label | "Nueva contraseña" |
| Confirm Password Label | "Confirmar contraseña" |
| Confirm Submit Button | "Actualizar contraseña" |
| Confirm Success Toast | "Contraseña actualizada. Inicia sesión con tu nueva contraseña." |
| Error Invalid Token | "Este enlace de recuperación no es válido o ya fue utilizado." |
| Error Expired Token | "Este enlace ha expirado. Los enlaces son válidos por 1 hora." |
| Request New Link Button | "Solicitar nuevo enlace" |

---

## Implementation Steps

### **Step 1: Verificar schemas existentes** ✅ COMPLETADO

**Task:** Verificar que los schemas de validación existen

**File:** `src/lib/validations/auth.ts`

**Status:** ✅ Ya implementado en MYM-4

**Schemas disponibles:**
- `forgotPasswordSchema` → `{ email: string }`
- `resetPasswordSchema` → `{ password: string, confirmPassword: string }` con refine
- `getPasswordRequirements()` → Helper para strength indicator

**No requiere cambios** - Proceder al Step 2

---

### **Step 2: Crear ForgotPasswordForm component**

**Task:** Formulario de solicitud de reset

**File:** `src/components/auth/forgot-password-form.tsx` (CREAR)

**Details:**
- react-hook-form con zodResolver
- Campo email con normalización
- Submit llama `supabase.auth.resetPasswordForEmail`
- Loading state durante submit
- Success state con mensaje genérico
- Link para volver a login

**Code outline:**
```tsx
"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth'
// ... UI components

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/password-reset/confirm`,
    })
    setIsSubmitted(true) // Always show success (prevent enumeration)
  }

  if (isSubmitted) {
    return <SuccessMessage />
  }

  return <Form ... />
}
```

**Testing:**
- E2E test: TC-001 (Request reset with valid email)
- E2E test: TC-003 (Request with non-existent email - same message)

---

### **Step 3: Crear página /password-reset**

**Task:** Página de solicitud de recuperación

**File:** `src/app/password-reset/page.tsx` (CREAR)

**Details:**
- Server Component con metadata SEO
- Renderiza ForgotPasswordForm
- Layout consistente con login/signup (gradiente, Card)

**Testing:**
- Visual test: Diseño consistente

---

### **Step 4: Crear ResetPasswordForm component**

**Task:** Formulario para establecer nueva contraseña

**File:** `src/components/auth/reset-password-form.tsx` (CREAR)

**Details:**
- Recibe session/user del token via props
- Dos campos: password + confirmPassword
- Usa PasswordInput con strength indicator
- Submit llama `supabase.auth.updateUser({ password })`
- Redirect a /login con success toast

**Code outline:**
```tsx
"use client"

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth'
import { PasswordInput } from './password-input'
import { PasswordStrengthIndicator } from './password-strength'

export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()

  const onSubmit = async (data: ResetPasswordFormData) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (!error) {
      await supabase.auth.signOut() // Invalidate all sessions
      router.push('/login?reset=success')
    }
  }

  return <Form ... />
}
```

**Testing:**
- E2E test: TC-002 (Successful password reset)
- E2E test: TC-004-010 (Password policy violations)
- E2E test: TC-018 (Passwords don't match)

---

### **Step 5: Crear página /password-reset/confirm**

**Task:** Página que maneja el callback del email

**File:** `src/app/password-reset/confirm/page.tsx` (CREAR)

**Details:**
- Client Component para leer hash params
- Detectar `access_token` y `type=recovery` en URL hash
- Si token válido → mostrar ResetPasswordForm
- Si token inválido/expirado → mostrar error con link a request

**Code outline:**
```tsx
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { TokenErrorState } from '@/components/auth/token-error-state'

export default function ResetPasswordConfirmPage() {
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Supabase auto-processes hash params and establishes session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidToken(true)
        } else if (!session) {
          setIsValidToken(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  if (isValidToken === null) return <Loading />
  if (!isValidToken) return <TokenErrorState />

  return <ResetPasswordForm />
}
```

**Testing:**
- E2E test: TC-019 (Expired token)
- E2E test: TC-020 (Already-used token)
- E2E test: TC-021 (Invalid/malformed token)

---

### **Step 6: Crear TokenErrorState component**

**Task:** UI para mostrar errores de token

**File:** `src/components/auth/token-error-state.tsx` (CREAR)

**Details:**
- Card con mensaje de error
- Link para solicitar nuevo enlace
- Mensaje genérico (no revelar si expirado vs usado)

---

### **Step 7: Actualizar middleware para rutas de reset**

**Task:** Agregar rutas públicas de password reset

**File:** `middleware.ts` (MODIFICAR)

**Changes:**
```typescript
// Agregar a publicRoutes
const publicRoutes = ['/', '/login', '/signup', '/password-reset']

// Agregar path check
const isPasswordResetRoute = req.nextUrl.pathname.startsWith('/password-reset')

// En la condición de redirect
if (!session && !isPublicRoute && !isMentorsRoute && !isPasswordResetRoute) {
```

**Testing:**
- E2E test: Acceso a /password-reset sin sesión funciona

---

### **Step 8: Actualizar login page para mostrar success message**

**Task:** Detectar query param `?reset=success` y mostrar toast

**File:** `src/app/login/page.tsx` (MODIFICAR)

**Changes:**
- Leer searchParams `reset`
- Si `reset=success`, mostrar Alert de éxito verde

---

### **Step 9: Agregar link en login page**

**Task:** Ya implementado en MYM-4 - verificar funciona

**File:** `src/app/login/page.tsx`

**Verify:** Link "¿Olvidaste tu contraseña?" apunta a `/password-reset`

---

### **Step 10: Integration Testing**

**Task:** Verificar flujo completo

**Flow Request:**
1. Usuario en `/login` click "¿Olvidaste tu contraseña?"
2. Navega a `/password-reset`
3. Ingresa email y submit
4. Ve mensaje de confirmación genérico
5. (Email enviado por Supabase)

**Flow Reset:**
1. Usuario click link en email
2. Navega a `/password-reset/confirm#access_token=...`
3. Supabase procesa token, establece sesión temporal
4. Ve formulario de nueva contraseña
5. Ingresa password + confirm, submit
6. Password actualizado, sesiones invalidadas
7. Redirect a `/login?reset=success`
8. Ve mensaje de éxito, puede loguearse

**Testing:**
- E2E manual con email real (staging)
- Mock tests para validaciones

---

## Technical Decisions (Story-specific)

### Decision 1: Hash params vs Server-side token handling

**Chosen:** Hash params (default Supabase flow)

**Reasoning:**
- ✅ Supabase maneja automáticamente con `onAuthStateChange`
- ✅ Token en hash no se envía al server (más seguro)
- ✅ No requiere API route custom
- ❌ Trade-off: Requiere client component para leer hash

### Decision 2: Session invalidation después de reset

**Chosen:** Llamar `signOut()` después de updateUser

**Reasoning:**
- ✅ Security: Invalida todas las sesiones activas
- ✅ Usuario debe loguearse con nueva contraseña
- ✅ Previene uso de sesiones comprometidas
- ❌ Trade-off: UX ligeramente peor (login extra)

### Decision 3: Mensaje de confirmación genérico

**Chosen:** Mismo mensaje para email existente y no existente

**Reasoning:**
- ✅ Previene enumeración de usuarios
- ✅ Security best practice
- ❌ Trade-off: Usuario no sabe si escribió mal el email

---

## Dependencies

**Pre-requisitos (MYM-4 completado):** ✅
- [x] `PasswordInput` component creado
- [x] `PasswordStrength` component creado
- [x] `src/lib/validations/auth.ts` con schemas de reset
- [x] Link "¿Olvidaste tu contraseña?" en login page

**Nuevas dependencias:**
- Ninguna adicional (usa Supabase SDK existente)

**Configuración Supabase requerida:**
- Verificar Redirect URLs en Authentication > URL Configuration
- Agregar `http://localhost:3000/auth/confirm` (dev)
- Agregar URL de producción cuando se despliegue

---

## Risks & Mitigations

### Risk 1: Email no llega (spam, delays)

**Impact:** Medium
**Mitigation:**
- Mensaje instruye revisar spam
- Supabase tiene retry logic
- Puede re-solicitar (con rate limit)

### Risk 2: Token expira mientras usuario está en página

**Impact:** Low
**Mitigation:**
- Token válido 1 hora es suficiente
- Error claro si expira con link a re-solicitar

### Risk 3: Brute force de tokens

**Impact:** Low (mitigado por Supabase)
**Mitigation:**
- Supabase genera tokens criptográficamente seguros
- Rate limiting en reset requests
- Tokens single-use

---

## Estimated Effort

| Step | Task | Time |
|------|------|------|
| 1 | Extender validations/auth.ts | 20 min |
| 2 | ForgotPasswordForm component | 45 min |
| 3 | /password-reset page | 20 min |
| 4 | ResetPasswordForm component | 1 hour |
| 5 | /password-reset/confirm page | 45 min |
| 6 | TokenErrorState component | 20 min |
| 7 | Middleware updates | 10 min |
| 8 | Login page success message | 15 min |
| 9 | Verify forgot password link | 5 min |
| 10 | Integration testing | 1 hour |
| **Total** | | **~5.5 hours** |

**Story points:** 5 (Complejidad media, 2 páginas nuevas, múltiples estados)

---

## Definition of Done Checklist

### Code Implementation
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] AC-1: Request reset envía email y muestra confirmación
  - [ ] AC-2: Reset con token válido actualiza password
  - [ ] AC-3: Email no existente muestra mismo mensaje

### Files Created/Modified
- [ ] `src/lib/validations/auth.ts` extendido
- [ ] `src/components/auth/forgot-password-form.tsx` creado
- [ ] `src/components/auth/reset-password-form.tsx` creado
- [ ] `src/components/auth/token-error-state.tsx` creado
- [ ] `src/app/password-reset/page.tsx` creado
- [ ] `src/app/password-reset/confirm/page.tsx` creado
- [ ] `middleware.ts` actualizado

### UI/UX
- [ ] Design consistente con login/signup
- [ ] Estados de loading, success, error
- [ ] Password strength indicator en reset form
- [ ] Mensajes de error claros

### Security
- [ ] Mismo mensaje para email existente/no existente
- [ ] Session invalidation después de reset
- [ ] Password policy aplicada

### Testing
- [ ] TC-001: Request reset (valid email)
- [ ] TC-002: Successful password reset
- [ ] TC-003: Non-existent email (same message)
- [ ] TC-004-010: Password policy violations
- [ ] TC-018: Passwords don't match
- [ ] TC-019: Expired token
- [ ] TC-020: Already-used token
- [ ] TC-021: Invalid token

### Quality Gates
- [ ] `bun run build` exitoso
- [ ] `bun run typecheck` sin errores
- [ ] `bun run lint` pasando

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-7-password-reset/story.md`
- **Test Cases (Jira):** Comment en MYM-7 con 28 test cases detallados
- **Feature Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-implementation-plan.md`
- **Design System:** `.context/design-system.md`
- **Backend Setup:** `.context/backend-setup.md`
- **Depends on:** MYM-4 (PasswordInput, validations base)
- **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-7

---

**Generated:** 2025-11-28
**Actualizado:** 2025-12-02
**Ready for implementation**
