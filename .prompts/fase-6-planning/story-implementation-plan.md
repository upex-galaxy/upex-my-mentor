Actúa como Senior Full-Stack Developer + UI/UX Designer.

**Input:**

- Story: [usar .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md]
- **Test Cases (Acceptance Test Plan):** Usar el siguiente orden de descubrimiento:
  1. **Jira Comments** (preferido): Buscar en comentarios de la US usando `mcp__atlassian__jira_get_issue` con `comment_limit: 50`. Buscar comentarios que contengan "Test Case", "TC-", "Scenario:", o tablas de test cases.
  2. **Jira Custom Field**: Campo `customfield_12400` ("Acceptance Test Plan (QA)🧪") usando `fields: "*all"`
  3. **Archivo Local** (fallback): `.context/PBI/epics/.../stories/.../test-cases.md` o `acceptance-test-plan.md`
- Feature Implementation Plan: [usar .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/feature-implementation-plan.md]
- SRS relevante: [usar secciones relacionadas de .context/SRS/]
- **Design System:** [usar .context/design-system.md - para decisiones de UI/UX]

**⚠️ IMPORTANTE - Jira es la fuente de verdad para Test Cases:**
Los test cases del Acceptance Test Plan definen los escenarios que la implementación DEBE cubrir. Cada test case debe mapearse a un step de implementación para garantizar cobertura completa. NO omitir ningún test case.

**Genera archivo: implementation-plan.md** (dentro de .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/)

---

# Implementation Plan: STORY-{PROJECT_KEY}-{ISSUE_NUM} - [Story Title]

## Overview

Implementar funcionalidad de [descripción breve].

**Acceptance Criteria a cumplir:**

- [Criterio 1]
- [Criterio 2]
- [Criterio 3]

---

## Technical Approach

**⚠️ IMPORTANTE - Verificación con Context7 MCP:**
Antes de definir el enfoque técnico, si usas librerías externas (React, Next.js, Supabase, etc.):

- 🔍 **Usa Context7 MCP** para verificar capacidades actuales de las APIs
- ✅ Confirma que los métodos/hooks que planeas usar existen en la versión del proyecto
- 📖 Obtén best practices actualizadas de la documentación oficial

**Ejemplo:**

- Necesitas autenticación → Consulta Context7 para Supabase Auth API actual
- Necesitas data fetching → Consulta Context7 para React Query o SWR API actual
- Necesitas routing → Consulta Context7 para Next.js App Router API actual

**Chosen approach:** [Descripción del enfoque técnico]

**Alternatives considered:**

- [Alternativa A]: [Por qué no se eligió]
- [Alternativa B]: [Por qué no se eligió]

**Why this approach:**

- ✅ [Ventaja 1]
- ✅ [Ventaja 2]
- ❌ Trade-off: [Desventaja o compromiso]

---

## UI/UX Design (Si la story tiene interfaz)

**⚠️ IMPORTANTE:** Esta story debe usar el Design System base de Fase 3 (frontend-setup.md).

**Design System disponible:** `.context/design-system.md`

### Componentes del Design System a usar:

**⚠️ IMPORTANTE - Uso de MCP shadcn/ui:**
Si el proyecto usa shadcn/ui como design system, DEBES usar el MCP de shadcn para:

- 🔍 Buscar semánticamente componentes disponibles antes de crear nuevos
- ✅ Confirmar props y API de componentes shadcn
- 📖 Obtener ejemplos de uso actualizados

**Ejemplo de búsqueda:**

- Necesitas un diálogo → Busca "dialog" o "modal" en MCP shadcn
- Necesitas un formulario → Busca "form" en MCP shadcn
- Necesitas una tabla → Busca "table" o "data-table" en MCP shadcn

**Componentes base (ya existen):**

- ✅ Button → `variant`: [primary | secondary | outline | ghost | danger]
- ✅ Card → Para [describir uso específico]
- ✅ Input/Form → Para [formularios específicos]
- ✅ Modal → Para [diálogos/confirmaciones]
- [Listar otros componentes relevantes del design system]

### Componentes custom a crear:

**Componentes específicos del dominio (nuevos):**

- 🆕 [ComponentName]
  - **Propósito:** [Descripción]
  - **Props:** [Listar props principales]
  - **Diseño:** [Breve descripción visual - usa design system base]
  - **Ubicación:** `components/[domain]/[component-name].tsx`

(Donde [ComponentName] se define según el dominio de la story. Ejemplos según proyecto: MentorCard en MYM, ProductCard en SHOP, PostCard en BLOG)

### Wireframes/Layout:

**Estructura de la página/sección:**

```
[Descripción textual del layout - ej:]
┌──────────────────────────────────────┐
│ Header: [Título] + [CTA Button]     │
├──────────────────────────────────────┤
│ Filters: [Input] [Select] [Button]  │
├──────────────────────────────────────┤
│ Grid: [Card] [Card] [Card]          │
│       [Card] [Card] [Card]          │
└──────────────────────────────────────┘
```

### Estados de UI:

**Estados visuales a implementar:**

- **Loading:** [Skeleton loader / Spinner - describir dónde]
- **Empty:** [EmptyState component con mensaje + CTA]
- **Error:** [Error message + retry button]
- **Success:** [Vista normal con datos]
- [Otros estados específicos si aplica]

### Validaciones visuales (Formularios):

**Si la story incluye formularios:**

- **Campo [X]:** [Validación] → Mensaje: "[mensaje]"
- **Campo [Y]:** [Validación] → Mensaje: "[mensaje]"
- **Submit:** [Validación del form completo]

**Estados visuales:**

- Error: `border-red-500` + mensaje en `text-red-500`
- Success: `border-green-500`
- Focus: `ring-primary`

### Responsividad:

**Breakpoints a considerar:**

- **Mobile (< 768px):** [Ajustes específicos - ej: grid → list, sidebar → drawer]
- **Tablet (768px - 1024px):** [Ajustes]
- **Desktop (> 1024px):** [Layout completo]

**Paleta de colores aplicada:**

- Primary actions: `bg-primary` (del design system)
- Secondary elements: `bg-secondary`
- Borders/Dividers: `border-border`
- Text: `text-foreground` / `text-muted-foreground`

### Personalidad UI/UX aplicada:

**⚠️ IMPORTANTE:** Esta story debe reflejar la personalidad visual elegida en Fase 3 (frontend-setup).

**Estilo visual a seguir:** [Del design system - Minimalista/Bold/Corporativo/Playful]

**Según personalidad elegida:**

- **Si Minimalista:**
  - Espacios generosos (padding/margin amplios)
  - Tipografía limpia, jerárquica
  - Sombras sutiles (`shadow-sm`)
  - Bordes suaves (`rounded-md`)

- **Si Bold/Moderno:**
  - Gradientes sutiles en backgrounds
  - Sombras pronunciadas (`shadow-lg`, `shadow-xl`)
  - Bordes redondeados (`rounded-lg`, `rounded-xl`)
  - Hover effects con transforms

- **Si Corporativo:**
  - Líneas rectas, estructura formal
  - Bordes mínimos o rectos (`rounded-sm`)
  - Colores sobrios, sin gradientes
  - Profesional y serio

- **Si Playful:**
  - Colores vibrantes del accent
  - Bordes muy redondeados (`rounded-2xl`, `rounded-full`)
  - Ilustraciones o íconos coloridos
  - Animaciones suaves

**Validar en diseño:**

- ✅ Bordes consistentes con estilo elegido
- ✅ Sombras consistentes con estilo elegido
- ✅ Espaciado consistente con estilo elegido
- ✅ Efectos hover/active coherentes con personalidad

---

## Types & Type Safety

**⚠️ IMPORTANTE:** Esta story debe usar tipos del backend para garantizar type-safety y zero type mismatches.

**Tipos disponibles:**

- `lib/database.types.ts` - Tipos generados desde database schema (Fase 3.2 - Backend Setup)
- `lib/types.ts` - Type helpers extraídos del backend

**Directiva para componentes:**

- ✅ Importar tipos desde `@/lib/types`
- ✅ Tipar props de componentes con tipos del backend
- ✅ Crear mock data (si aplica) que cumpla con la estructura de tipos
- ✅ Usar `z.infer<>` si se usan schemas de Zod

**Ejemplo:**

```typescript
import type { User, Mentor } from '@/lib/types'

interface MentorCardProps {
  mentor: Mentor  // ✅ Tipo del backend
  onSelect: (id: string) => void
}

// Mock data type-safe
const mockMentors: Mentor[] = [
  { id: '1', name: 'John Doe', ... } // ✅ TypeScript valida estructura
]
```

**Beneficios:**

- Zero type mismatches entre frontend y backend
- Autocomplete completo en componentes
- Refactoring seguro (cambios en schema se detectan automáticamente)

---

## Content Writing (Si la story tiene UI con texto)

**⚠️ CRÍTICO:** NO usar texto genérico o placeholder.

**Directiva para la IA:**

1. **Leer contexto de negocio:**
   - `.context/PRD/executive-summary.md` - Propuesta de valor, problema que resuelve
   - `.context/idea/README.md` - Problema y solución del negocio
   - `.context/PRD/user-personas.md` - A quién va dirigido
2. **Usar vocabulario del dominio:**
   - Identificar entidades principales del proyecto (del PRD/PBI)
   - Usar nombres reales, NO genéricos
3. **Evitar frases placeholder:**
   - ❌ "Bienvenido a nuestra plataforma"
   - ❌ "La mejor solución para..."
   - ❌ "Gestiona tus recursos fácilmente"
4. **Aplicar tono coherente:**
   - Según personalidad del producto (del PRD)
   - Formal/Casual/Técnico/Amigable

**Ejemplos según dominio:**

- ❌ Genérico: "Bienvenido a nuestra plataforma de gestión"
- ✅ Contextual (si proyecto es MentorYourMind): "Encuentra mentores expertos en tu área"
- ✅ Contextual (si proyecto es ShopFlow): "Administra tu inventario en tiempo real"
- ✅ Contextual (si proyecto es BlogHub): "Publica y monetiza tus artículos"

**Resultado esperado:**
Textos que reflejan el contexto específico del proyecto, usando vocabulario del dominio identificado en el PRD/idea.

---

## Implementation Steps

### **Step 1: [Nombre del paso]**

**Task:** [Descripción de la tarea]

**Details:**

- [Detalle 1]
- [Detalle 2]
- [Detalle 3]

**⚠️ IMPORTANTE (si aplica DB):**

- NO incluir SQL estático en el plan
- Describir cambios necesarios de schema/tablas
- **Usar Supabase MCP** durante implementación para ejecutar migrations
- Si Supabase MCP no está disponible: proporcionar SQL para ejecución manual

**Testing:**

- [Tipo de test]: [Qué verificar]

**Estimated time:** [tiempo]

---

### **Step 2: [Nombre del paso]**

**Task:** [Descripción]

**File:** [ruta del archivo a crear/modificar]

**Structure/Logic:**

- [Elemento 1]
- [Elemento 2]

**Edge cases handled:**

- [Edge case 1]: [Cómo se maneja]
- [Edge case 2]: [Cómo se maneja]

**Testing:**

- [Tests a realizar]

**Estimated time:** [tiempo]

---

(Continuar con todos los steps necesarios)

### **Step N: Integration**

**Task:** Conectar todos los componentes

**Flow completo:**

1. [Paso 1 del flujo]
2. [Paso 2 del flujo]
3. [Paso 3 del flujo]
   ...

**Testing:**

- E2E test: [Escenario completo]

**Estimated time:** [tiempo]

---

## Technical Decisions (Story-specific)

### Decision 1: [Nombre de decisión específica de esta story]

**Chosen:** [Decisión]

**Reasoning:**

- ✅ [Razón]
- ❌ Trade-off: [Compromiso]

---

## Dependencies

**Pre-requisitos técnicos:**

- [ ] [Pre-requisito 1]
- [ ] [Pre-requisito 2 - BLOCKER si no está]

---

## Risks & Mitigations

**Risk 1:** [Descripción del riesgo específico de esta story]

- **Impact:** High | Medium | Low
- **Mitigation:** [Estrategia]

**Risk 2:** ...

- **Impact:** ...
- **Mitigation:** ...

---

## Estimated Effort

| Step           | Time             |
| -------------- | ---------------- |
| 1. [Step name] | [time]           |
| 2. [Step name] | [time]           |
| 3. [Step name] | [time]           |
| ...            | ...              |
| **Total**      | **[total time]** |

**Story points:** [número] (debe match estimación en story.md)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/lib/types` en componentes
  - [ ] Props de componentes tipadas con tipos del backend
  - [ ] Mock data (si aplica) cumple estructura de tipos
  - [ ] Zero type errors relacionados a entidades del backend
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [ ] Bordes según estilo elegido (Minimalista/Bold/Corporativo/Playful)
  - [ ] Sombras según estilo elegido
  - [ ] Espaciado según estilo elegido
  - [ ] Paleta de colores aplicada (bg-primary, bg-secondary, etc.)
  - [ ] Efectos hover/active coherentes con personalidad
- [ ] **Content Writing contextual (NO genérico)**
  - [ ] Vocabulario del dominio usado (del PRD/idea)
  - [ ] Sin frases placeholder ("Bienvenido", "La mejor plataforma")
  - [ ] Tono coherente con personalidad del producto
- [ ] **Protección de rutas (si aplica)**
  - [ ] Middleware actualizado si se agregaron rutas privadas
  - [ ] Rutas públicas/privadas correctamente configuradas
- [ ] Tests unitarios escritos (coverage > 80%)
  - [ ] [Componente específico 1]
  - [ ] [Componente específico 2]
- [ ] Tests de integración pasando
  - [ ] [Escenario específico]
- [ ] Tests E2E pasando (referencia: Acceptance Test Plan de Jira o test-cases.md)
  - [ ] TC-001: [nombre]
  - [ ] TC-002: [nombre]
  - [ ] ...
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] Linting passes
  - [ ] Build passes (`npm run build` o equivalente)
  - [ ] Zero TypeScript errors
- [ ] Deployed to staging
- [ ] Manual smoke test en staging
  - [ ] UI se ve correcta en desktop
  - [ ] UI se ve correcta en mobile
  - [ ] Design system aplicado consistentemente

---

**Output:** Archivo Markdown listo para .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/implementation-plan.md

**Nota para IA:**

- Si story es compleja, considera crear archivos adicionales opcionales (components.md, api-details.md, database-changes.md)
- Esto es decisión de la IA según complejidad real

**Restricciones:**

- Steps específicos y ejecutables
- Estimated time realista
- Total debe match story points
- Testing strategy por cada step

---

## 📤 SINCRONIZACIÓN CON JIRA (Condicional - UPEX Workspace)

### Custom Field para Story Implementation Plan

| Field ID            | Nombre                           | Tipo     | Nivel |
| ------------------- | -------------------------------- | -------- | ----- |
| `customfield_12401` | Spec Implementation Plan (Dev)🛠️ | Textarea | Story |

### Instrucciones de Sincronización

**DESPUÉS de generar el archivo `implementation-plan.md` localmente:**

1. **Verificar si la Story tiene el custom field:**
   - Usar MCP de Atlassian para obtener la Story: `jira_get_issue`
   - Verificar si `customfield_12401` existe y está disponible en el response

2. **Si el campo existe:**
   - Copiar el contenido COMPLETO del `implementation-plan.md` generado
   - Actualizar la Story en Jira usando MCP `jira_update_issue`:
     ```
     fields: {
       "customfield_12401": "[contenido del implementation-plan.md]"
     }
     ```
   - Agregar label: `implementation-plan-ready`

3. **Si el campo NO existe (Workspace non-UPEX):**
   - Buscar campo equivalente con nombre similar ("Implementation Plan", "Dev Plan", "Technical Plan")
   - Si no existe ningún campo equivalente, agregar como **comentario** en la Story:

     ```
     📋 **Spec Implementation Plan (Dev)**

     [contenido del implementation-plan.md]
     ```

### Output Esperado

- [ ] Archivo `implementation-plan.md` creado en `.context/PBI/epics/.../stories/.../`
- [ ] Custom field `customfield_12401` actualizado en Jira (si existe)
- [ ] Label `implementation-plan-ready` agregado a la Story
- [ ] Comentario agregado como fallback (si campo no existe)
