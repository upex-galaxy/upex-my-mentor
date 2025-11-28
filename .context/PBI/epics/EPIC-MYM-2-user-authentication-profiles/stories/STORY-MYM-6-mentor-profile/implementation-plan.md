# Implementation Plan: STORY-MYM-6 - Mentor Detailed Profile Creation

**Fecha:** 2025-11-27
**Autor:** AI-Generated
**Story Jira Key:** MYM-6
**Epic:** EPIC-MYM-2 - User Authentication & Profiles
**Story Points:** 5
**Status:** Ready For Implementation

---

## Overview

Implementar el formulario completo de perfil de mentor que permite a los mentores registrados crear y editar su perfil profesional, incluyendo nombre, biografía, especialidades técnicas, años de experiencia, tarifa por hora, y URLs de redes sociales (LinkedIn/GitHub).

**Acceptance Criteria a cumplir:**

- [x] **AC1:** Un mentor autenticado puede completar su perfil con nombre, bio, skills, experiencia y tarifa válida, y el sistema guarda la información correctamente.
- [x] **AC2:** El sistema valida que la tarifa por hora sea un número positivo y muestra error apropiado si no lo es.
- [x] **AC3:** El sistema valida que al menos una habilidad sea añadida antes de guardar.
- [x] **AC4:** El perfil público del mentor se actualiza con los nuevos datos guardados.

---

## Technical Approach

**Chosen approach:** Formulario con React Hook Form + Zod validation, Server Action para persistencia, y componentes del design system existente.

**Alternatives considered:**
- **A) API Route tradicional (POST/PUT):** No elegido porque Server Actions ofrecen mejor integración con Next.js App Router y type-safety nativo.
- **B) Formulario sin validación client-side:** No elegido porque la UX requiere feedback inmediato al usuario.
- **C) Crear tabla separada `mentor_profiles`:** No elegido porque el schema actual ya tiene todos los campos en `profiles` (según `supabase.ts` generado).

**Why this approach:**
- ✅ Type-safety end-to-end con Zod schemas + TypeScript
- ✅ UX óptima con validación en tiempo real
- ✅ Aprovecha Server Actions de Next.js 15 para mutaciones
- ✅ Reutiliza componentes existentes del design system (Button, Input, Card, Badge)
- ❌ Trade-off: Complejidad moderada del componente de skills dinámico

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md` - Moderno/Bold (Morado Creativo)

### Componentes del Design System a usar:

**Componentes base (ya existen):**
- ✅ `Button` → `variant`: primary para "Guardar Perfil", outline para "Cancelar"
- ✅ `Card` → Contenedor principal del formulario
- ✅ `Input` → Campos de nombre, tarifa, URLs
- ✅ `Textarea` → Campo de biografía
- ✅ `Label` → Etiquetas de campos
- ✅ `Badge` → Mostrar skills seleccionadas (tags removibles)
- ✅ `Select` → Selector de años de experiencia
- ✅ `Alert` → Mensajes de error/éxito

### Componentes custom a crear:

**1. SkillsInput**
- **Propósito:** Input dinámico para añadir/remover especialidades técnicas
- **Props:** `value: string[]`, `onChange: (skills: string[]) => void`, `maxSkills?: number`, `error?: string`
- **Diseño:** Input con botón "Añadir" + badges removibles debajo
- **Ubicación:** `src/components/profile/skills-input.tsx`

**2. MentorProfileForm**
- **Propósito:** Formulario completo de perfil de mentor con validación
- **Props:** `initialData?: MentorProfile`, `onSuccess?: () => void`
- **Diseño:** Card con secciones para info personal, skills, tarifa y URLs
- **Ubicación:** `src/components/profile/mentor-profile-form.tsx`

### Wireframes/Layout:

**Estructura de la página `/profile/edit`:**
```
┌────────────────────────────────────────────────────────────────┐
│ Header (Navbar ya existente)                                    │
├────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Gradient Background (purple-50 via fuchsia-50 to violet-50) │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ │
│ │ │ Card Container (max-w-2xl mx-auto)                     │ │ │
│ │ │ ┌──────────────────────────────────────────────────┐  │ │ │
│ │ │ │ CardHeader: "Construye tu perfil profesional"    │  │ │ │
│ │ │ │ Subtitle: "Tu perfil es tu carta de presentación"│  │ │ │
│ │ │ └──────────────────────────────────────────────────┘  │ │ │
│ │ │ ┌──────────────────────────────────────────────────┐  │ │ │
│ │ │ │ CardContent:                                      │  │ │ │
│ │ │ │  [Avatar Upload - Fase futura]                   │  │ │ │
│ │ │ │  [Input: Nombre completo *]                      │  │ │ │
│ │ │ │  [Textarea: Biografía * (500 chars max)]         │  │ │ │
│ │ │ │  [SkillsInput: Especialidades * (max 20)]        │  │ │ │
│ │ │ │  [Select: Años de experiencia *]                 │  │ │ │
│ │ │ │  [Input: Tarifa por hora (USD) *]                │  │ │ │
│ │ │ │  [Input: URL de LinkedIn]                        │  │ │ │
│ │ │ │  [Input: URL de GitHub]                          │  │ │ │
│ │ │ └──────────────────────────────────────────────────┘  │ │ │
│ │ │ ┌──────────────────────────────────────────────────┐  │ │ │
│ │ │ │ CardFooter:                                       │  │ │ │
│ │ │ │  [Button outline: Cancelar] [Button: Guardar]    │  │ │ │
│ │ │ └──────────────────────────────────────────────────┘  │ │ │
│ │ └────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│ Footer                                                          │
└────────────────────────────────────────────────────────────────┘
```

### Estados de UI:

**Estados visuales a implementar:**
- **Loading:** Botón "Guardar Perfil" con spinner y texto "Guardando..." + disabled
- **Empty:** Formulario con placeholders contextuales (no aplica estado vacío de datos)
- **Error:** Mensajes inline debajo de cada campo + Alert general para errores de servidor
- **Success:** Toast o Alert verde con "Perfil actualizado correctamente"
- **Pristine:** Botón "Guardar" disabled hasta que haya cambios

### Validaciones visuales:

**Campos y validaciones:**
- **Nombre:** Requerido, 2-100 caracteres → Mensaje: "El nombre es requerido" / "Máximo 100 caracteres"
- **Biografía:** Requerida, 10-500 caracteres → Mensaje: "La biografía es requerida" / "Máximo 500 caracteres"
- **Especialidades:** Mínimo 1, máximo 20 skills → Mensaje: "Debes añadir al menos una especialidad"
- **Años de experiencia:** Requerido, 0-50 → Mensaje: "Selecciona tus años de experiencia"
- **Tarifa por hora:** Requerida, 0.01-1000 USD → Mensaje: "La tarifa debe ser un número positivo" / "Máximo $1,000/hora"
- **LinkedIn URL:** Opcional, formato válido → Mensaje: "Introduce una URL de LinkedIn válida"
- **GitHub URL:** Opcional, formato válido → Mensaje: "Introduce una URL de GitHub válida"

**Estados visuales de validación:**
- Error: `border-destructive` + mensaje en `text-destructive text-sm`
- Success (campo válido): Borde normal (no cambiar a verde para evitar ruido visual)
- Focus: `ring-primary`

### Responsividad:

**Breakpoints a considerar:**
- **Mobile (< 768px):**
  - Card full width con padding reducido (`p-4`)
  - Footer buttons stacked verticalmente
  - Skills badges wrap en múltiples líneas
- **Tablet (768px - 1024px):**
  - Card max-width 600px centrado
  - Footer buttons inline
- **Desktop (> 1024px):**
  - Card max-width 672px (`max-w-2xl`) centrado
  - Layout completo con spacing generoso (`p-6`)

**Paleta de colores aplicada:**
- Primary actions: `bg-primary text-primary-foreground` (botón Guardar)
- Secondary elements: `bg-secondary` (badges de skills)
- Borders/Dividers: `border-border`
- Text: `text-foreground` / `text-muted-foreground`
- Errors: `text-destructive border-destructive`
- Gradient header: `bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50`

### Personalidad UI/UX aplicada:

**Estilo visual a seguir:** Moderno/Bold

**Aplicar consistentemente:**
- Gradientes sutiles en background de la página
- Sombras pronunciadas (`shadow-lg`) en Card principal
- Bordes redondeados (`rounded-lg`, `rounded-xl`)
- Hover effects con transforms en botones
- Transiciones suaves (`transition-all duration-200`)

**Validar en diseño:**
- ✅ Bordes `rounded-lg` en Card y inputs
- ✅ Sombras `shadow-lg` en Card, `shadow-md` en hover
- ✅ Spacing consistente (`space-y-6` en form, `gap-4` en footer)
- ✅ Efectos hover/active coherentes con personalidad Bold

---

## Types & Type Safety

**IMPORTANTE:** Esta story debe usar tipos del backend para garantizar type-safety.

**Tipos disponibles:**
- `src/types/supabase.ts` - Tipos generados desde database schema
- `src/types/index.ts` - Type helpers existentes

### Tipos a usar/crear:

```typescript
// Importar desde types/supabase.ts (ya existen)
import type { Database } from '@/types/supabase'

// Tipo del perfil desde la DB
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type UserRole = Database['public']['Enums']['user_role']

// Tipo específico para mentor (derivado)
export type MentorProfile = Profile & { role: 'mentor' }

// Tipo para el formulario (validación con Zod)
export interface MentorProfileFormData {
  name: string
  description: string
  specialties: string[]
  years_of_experience: number
  hourly_rate: number
  linkedin_url?: string
  github_url?: string
}
```

**Directiva para componentes:**
- ✅ Importar tipos desde `@/types/supabase` para datos de DB
- ✅ Crear Zod schema que infiera `MentorProfileFormData`
- ✅ Props de componentes tipadas con tipos del backend
- ✅ Server Action tipada con `ProfileUpdate` para el return
- ✅ Zero type errors relacionados a entidades del backend

**Ejemplo de uso en componente:**

```typescript
// src/components/profile/mentor-profile-form.tsx
import type { Profile } from '@/types/supabase'
import { z } from 'zod'

// Zod schema para validación
export const mentorProfileSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100),
  description: z.string().min(10, 'La biografía es requerida').max(500),
  specialties: z.array(z.string()).min(1, 'Debes añadir al menos una especialidad').max(20),
  years_of_experience: z.number().min(0).max(50),
  hourly_rate: z.number().min(0.01, 'La tarifa debe ser un número positivo').max(1000),
  linkedin_url: z.string().url('URL de LinkedIn inválida').optional().or(z.literal('')),
  github_url: z.string().url('URL de GitHub inválida').optional().or(z.literal('')),
})

export type MentorProfileFormData = z.infer<typeof mentorProfileSchema>

interface MentorProfileFormProps {
  initialData?: Profile  // ✅ Tipo del backend
  userId: string
}
```

---

## Content Writing

**CRÍTICO:** Esta story debe usar Content Writing contextual del dominio, NO texto genérico.

### Textos a implementar:

**Page Header:**
- Título: "Construye tu perfil profesional"
- Subtítulo: "Tu perfil es tu carta de presentación ante estudiantes que buscan crecer"

**Form Labels & Placeholders:**
| Campo | Label | Placeholder |
|-------|-------|-------------|
| Nombre | "Nombre completo" | "Ej: Carlos Ramírez" |
| Biografía | "Sobre ti" | "Cuéntanos sobre tu experiencia, logros y qué te motiva a ser mentor..." |
| Especialidades | "Especialidades técnicas" | "Escribe una habilidad y presiona Enter" |
| Experiencia | "Años de experiencia" | "Selecciona" |
| Tarifa | "Tarifa por hora (USD)" | "85.00" |
| LinkedIn | "URL de LinkedIn" | "https://linkedin.com/in/tu-perfil" |
| GitHub | "URL de GitHub" | "https://github.com/tu-usuario" |

**Mensajes de validación (contextuales):**
- Nombre vacío: "El nombre es requerido para que los estudiantes te identifiquen"
- Biografía muy corta: "Cuéntanos más sobre ti (mínimo 10 caracteres)"
- Sin skills: "Añade al menos una especialidad para que los estudiantes te encuentren"
- Tarifa inválida: "La tarifa por hora debe ser un número positivo"
- URL inválida: "Introduce una URL válida de [LinkedIn/GitHub]"

**Mensajes de estado:**
- Loading: "Guardando perfil..."
- Success: "¡Perfil actualizado! Ya puedes recibir solicitudes de mentoría."
- Error (server): "No pudimos actualizar tu perfil. Por favor, intenta de nuevo."
- Info (incomplete): "Completa tu perfil para aparecer en las búsquedas de mentores"

**Botones:**
- Primary: "Guardar perfil"
- Secondary: "Cancelar"

**Tono aplicado:** Profesional pero cercano (tuteo), enfocado en el valor de la mentoría.

---

## Implementation Steps

### **Step 1: Crear Zod Schema para validación del formulario**

**Task:** Crear schema de validación con Zod para el formulario de perfil de mentor

**File:** `src/lib/validations/profile.ts`

**Details:**
- Crear `mentorProfileSchema` con todas las reglas de validación
- Exportar tipo inferido `MentorProfileFormData`
- Incluir validaciones custom para URLs de LinkedIn/GitHub
- Mensajes de error contextuales en español

**Structure:**
```typescript
export const mentorProfileSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  specialties: z.array(z.string().min(1).max(50)).min(1).max(20),
  years_of_experience: z.number().int().min(0).max(50),
  hourly_rate: z.number().positive().max(1000),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
})
```

**Testing:**
- Unit test: Validar casos positivos y negativos de cada campo
- Unit test: Verificar mensajes de error correctos

---

### **Step 2: Crear componente SkillsInput**

**Task:** Crear componente reutilizable para input de especialidades/skills

**File:** `src/components/profile/skills-input.tsx`

**Details:**
- Input controlado con estado de "nuevo skill"
- Añadir skill al presionar Enter o botón "Añadir"
- Mostrar skills como badges removibles (con X)
- Validar duplicados y límite máximo (20)
- Prop `error` para mostrar mensaje de validación

**Props:**
```typescript
interface SkillsInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  maxSkills?: number
  error?: string
  disabled?: boolean
}
```

**Edge cases handled:**
- Skill duplicado: No añadir, mostrar feedback visual
- Skill vacío: Ignorar
- Límite alcanzado: Deshabilitar input, mostrar mensaje

**Testing:**
- Unit test: Añadir skill
- Unit test: Remover skill
- Unit test: Prevenir duplicados
- Unit test: Respetar límite máximo

---

### **Step 3: Crear Server Action para actualizar perfil**

**Task:** Crear Server Action que actualice el perfil del mentor en Supabase

**File:** `src/app/profile/edit/actions.ts`

**Details:**
- Validar datos con Zod schema antes de persistir
- Obtener user ID de la sesión autenticada
- Verificar que el usuario tiene role 'mentor'
- Ejecutar UPDATE en tabla `profiles`
- Retornar resultado tipado (success/error)
- Revalidar caché de la página

**Structure:**
```typescript
'use server'

export async function updateMentorProfile(
  formData: MentorProfileFormData
): Promise<{ success: boolean; error?: string }> {
  // 1. Validar con Zod
  // 2. Obtener sesión
  // 3. Verificar role mentor
  // 4. Update en Supabase
  // 5. Revalidate path
  // 6. Return result
}
```

**Edge cases handled:**
- Usuario no autenticado: Retornar error y redirigir
- Usuario no es mentor: Retornar error 403
- Error de Supabase: Capturar y retornar mensaje amigable
- Validación fallida: Retornar errores de campos específicos

**Testing:**
- Integration test: Update exitoso
- Integration test: Validación server-side
- Integration test: Usuario no autorizado

---

### **Step 4: Crear componente MentorProfileForm**

**Task:** Crear formulario completo de perfil de mentor con React Hook Form

**File:** `src/components/profile/mentor-profile-form.tsx`

**Details:**
- Usar React Hook Form con resolver de Zod
- Integrar todos los campos con componentes UI existentes
- Usar SkillsInput para especialidades
- Select para años de experiencia (0-50, con opciones descriptivas)
- Loading state en submit
- Mostrar errores inline por campo
- Mostrar toast/alert en success/error

**Structure:**
```typescript
'use client'

interface MentorProfileFormProps {
  initialData?: Profile
  userId: string
}

export function MentorProfileForm({ initialData, userId }: MentorProfileFormProps) {
  const form = useForm<MentorProfileFormData>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      // ...
    }
  })

  async function onSubmit(data: MentorProfileFormData) {
    // Call server action
    // Handle response
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

**Testing:**
- Unit test: Render con datos vacíos
- Unit test: Render con datos existentes
- Unit test: Validación client-side
- Unit test: Submit handler llamado correctamente

---

### **Step 5: Crear página /profile/edit**

**Task:** Crear página de edición de perfil de mentor

**File:** `src/app/profile/edit/page.tsx`

**Details:**
- Server Component que obtiene datos del perfil actual
- Verificar autenticación y role mentor
- Pasar datos al MentorProfileForm como initialData
- Layout con gradiente de fondo y Card centrado
- Metadata de página (título, descripción)

**Structure:**
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MentorProfileForm } from '@/components/profile/mentor-profile-form'

export const metadata = {
  title: 'Editar Perfil | Upex My Mentor',
  description: 'Construye tu perfil profesional de mentor'
}

export default async function ProfileEditPage() {
  const supabase = createServerClient()

  // 1. Get session
  // 2. Verify mentor role
  // 3. Fetch profile data
  // 4. Render form with data
}
```

**Edge cases handled:**
- No autenticado: Redirect a /login
- No es mentor: Redirect a /dashboard con mensaje
- Perfil no existe: Mostrar form vacío (crear nuevo)

**Testing:**
- E2E test: Carga de página con usuario mentor
- E2E test: Redirect sin autenticación

---

### **Step 6: Actualizar middleware para ruta /profile**

**Task:** Agregar /profile/* a las rutas protegidas en middleware

**File:** `middleware.ts`

**Details:**
- Añadir `/profile` y `/profile/*` a rutas que requieren autenticación
- Mantener configuración existente de otras rutas

**Testing:**
- Manual: Verificar redirect a /login si no autenticado

---

### **Step 7: Integration & Testing**

**Task:** Conectar todos los componentes y verificar flujo completo

**Flow completo:**
1. Usuario mentor navega a /profile/edit
2. Si no autenticado → redirect a /login
3. Si autenticado como mentor → carga form con datos existentes
4. Usuario modifica campos
5. Validación client-side en blur/submit
6. Click "Guardar perfil"
7. Loading state en botón
8. Server Action valida y persiste
9. Success → toast verde, datos actualizados
10. Error → toast rojo, mantener datos en form

**Testing:**
- E2E test (TC-MYM6-01): Actualización exitosa de todos los campos
- E2E test (TC-MYM6-06): Validación de tarifa inválida
- E2E test (TC-MYM6-08): Validación de URL inválida
- E2E test (TC-MYM6-12): Manejo de error de servidor (mock)
- E2E test (TC-MYM6-13): Tarifa en límite inferior (0.01)

---

## Technical Decisions (Story-specific)

### Decision 1: Skills como array de strings vs tabla relacionada

**Chosen:** Array de strings en campo `specialties` de tabla `profiles`

**Reasoning:**
- ✅ Schema actual ya tiene `specialties: string[] | null`
- ✅ Queries más simples (no JOINs)
- ✅ Suficiente para MVP (búsqueda por skills ya funciona con `get_all_unique_skills()`)
- ❌ Trade-off: No hay normalización de skills (puede haber "React" y "react")

### Decision 2: Años de experiencia como Select vs Input numérico

**Chosen:** Select con opciones predefinidas

**Reasoning:**
- ✅ UX más clara y rápida para el usuario
- ✅ Evita errores de tipeo (ej: "quince" en vez de 15)
- ✅ Permite agrupar en rangos si es necesario en el futuro
- ❌ Trade-off: Menos granularidad (intervalos fijos)

**Opciones del Select:**
- 0-1 años (Junior)
- 2-4 años (Mid)
- 5-9 años (Senior)
- 10-14 años (Staff/Principal)
- 15-19 años (Director)
- 20+ años (Executive)

### Decision 3: Validación de URLs de LinkedIn/GitHub

**Chosen:** Validación de formato URL básico, no verificación de existencia

**Reasoning:**
- ✅ UX inmediata (no esperar llamada HTTP)
- ✅ Evita dependencia de APIs externas
- ✅ Privacidad (no hacer requests a LinkedIn/GitHub)
- ❌ Trade-off: URLs pueden ser inválidas pero con formato correcto

---

## Dependencies

**Pre-requisitos técnicos:**
- [x] Supabase client configurado (`src/lib/supabase/client.ts`, `server.ts`)
- [x] AuthContext funcionando (`src/contexts/auth-context.tsx`)
- [x] Tabla `profiles` con campos de mentor (`specialties`, `hourly_rate`, `years_of_experience`, `linkedin_url`, `github_url`)
- [x] Componentes UI del design system (Button, Card, Input, Textarea, Label, Badge, Select)
- [ ] Ruta `/profile/edit` creada - **A CREAR**
- [ ] Middleware actualizado para proteger `/profile/*` - **A ACTUALIZAR**
- [ ] Zod instalado (`bun add zod`) - **VERIFICAR**
- [ ] React Hook Form instalado (`bun add react-hook-form @hookform/resolvers`) - **VERIFICAR**

**Dependencias de otras stories:**
- [x] MYM-3 (Signup): Usuario puede registrarse como mentor
- [x] MYM-4 (Login): Usuario puede autenticarse
- [ ] MYM-5 (Mentee Profile): Base form pattern - **PUEDE IMPLEMENTARSE EN PARALELO**

---

## Risks & Mitigations

### Risk 1: Skills duplicados o inconsistentes en BD

**Impact:** Medium
**Likelihood:** High
**Mitigation:**
- Normalizar skills a lowercase en Server Action antes de guardar
- Usar función RPC `get_all_unique_skills()` existente para sugerencias de autocomplete (futuro)
- Validar duplicados en cliente antes de añadir

### Risk 2: Tarifa extremadamente alta por error de tipeo

**Impact:** Low
**Likelihood:** Medium
**Mitigation:**
- Límite máximo de $1,000/hora en validación
- Confirmación visual del monto antes de guardar
- Campo con placeholder y formato claro ("85.00")

### Risk 3: URLs de redes sociales apuntan a perfiles incorrectos

**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Validar que URL contenga dominio correcto (linkedin.com, github.com)
- Mostrar preview del perfil vinculado en la UI (futuro)
- Disclaimer de verificación en proceso de vetting

### Risk 4: Pérdida de datos por error de red durante submit

**Impact:** High
**Likelihood:** Low
**Mitigation:**
- No limpiar formulario en error
- Mostrar mensaje claro con opción de reintentar
- Deshabilitar botón durante submit para evitar doble envío

---

## Estimated Effort

| Step                                    | Time    |
| --------------------------------------- | ------- |
| 1. Zod Schema                           | 30 min  |
| 2. SkillsInput component                | 1.5 hrs |
| 3. Server Action                        | 1 hr    |
| 4. MentorProfileForm component          | 2 hrs   |
| 5. Profile Edit page                    | 1 hr    |
| 6. Middleware update                    | 15 min  |
| 7. Integration & Testing                | 2 hrs   |
| **Total**                               | **8-9 hrs** |

**Story points:** 5 (match con estimación en Jira)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando:
  - [ ] AC1: Mentor puede guardar perfil completo
  - [ ] AC2: Validación de tarifa positiva
  - [ ] AC3: Validación de al menos 1 skill
  - [ ] AC4: Perfil público actualizado
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/types/supabase` en componentes
  - [ ] Props de componentes tipadas con tipos del backend
  - [ ] Zod schema consistente con Database types
  - [ ] Zero type errors relacionados a entidades del backend
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [ ] Bordes `rounded-lg` según estilo Bold
  - [ ] Sombras `shadow-lg` en Card principal
  - [ ] Spacing consistente (`space-y-6`, `gap-4`)
  - [ ] Paleta de colores aplicada (bg-primary, bg-secondary, etc.)
  - [ ] Efectos hover/active coherentes con personalidad Bold
  - [ ] Gradiente de fondo en página
- [ ] **Content Writing contextual (NO genérico)**
  - [ ] Vocabulario del dominio usado (Mentor/Estudiante)
  - [ ] Sin frases placeholder ("Bienvenido", "La mejor plataforma")
  - [ ] Tono profesional pero cercano
  - [ ] Mensajes de error específicos y útiles
- [ ] **Protección de rutas**
  - [ ] Middleware actualizado con `/profile/*`
  - [ ] Redirect a /login si no autenticado
  - [ ] Verificación de role mentor
- [ ] Tests unitarios escritos (coverage > 80%)
  - [ ] `mentorProfileSchema` validations
  - [ ] `SkillsInput` component
  - [ ] `MentorProfileForm` component
- [ ] Tests de integración pasando
  - [ ] Server Action `updateMentorProfile`
- [ ] Tests E2E pasando (referencia: test-cases.md)
  - [ ] TC-MYM6-01: Actualización exitosa
  - [ ] TC-MYM6-06: Tarifa inválida
  - [ ] TC-MYM6-08: URL inválida
  - [ ] TC-MYM6-12: Error de servidor
  - [ ] TC-MYM6-13: Tarifa límite inferior
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
  - [ ] `bun run typecheck` passes (zero TypeScript errors)
- [ ] Deployed to staging
- [ ] Manual smoke test en staging
  - [ ] UI se ve correcta en desktop
  - [ ] UI se ve correcta en mobile
  - [ ] Design system aplicado consistentemente
  - [ ] Datos persisten correctamente en BD

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-6-mentor-profile/story.md`
- **Test Cases:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-6-mentor-profile/test-cases.md`
- **Feature Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-implementation-plan.md`
- **Design System:** `.context/design-system.md`
- **Backend Setup:** `.context/backend-setup.md`
- **PRD:** `.context/PRD/executive-summary.md`
- **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-6

---

**Output:** Archivo listo para `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-6-mentor-profile/implementation-plan.md`

**Generated:** 2025-11-27
