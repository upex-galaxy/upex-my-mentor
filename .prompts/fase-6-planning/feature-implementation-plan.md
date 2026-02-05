Actúa como Senior Software Architect, Tech Lead, y UI/UX Designer.

**Input:**

- Epic: [usar .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/epic.md]
- SRS completo: [usar .context/SRS/*.md]
- Feature Test Plan: [usar .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/feature-test-plan.md]
- **Design System:** [usar .context/design-system.md - para decisiones de UI/UX]

**Genera archivo: feature-implementation-plan.md** (dentro de .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/)

---

# Feature Implementation Plan: EPIC-{PROJECT_KEY}-{ISSUE_NUM} - [Epic Title]

## Overview

Esta feature implementa [descripción high-level de la feature].

**Alcance:**

- [Story 1]: [Título]
- [Story 2]: [Título]
- [Story 3]: [Título]
- ...

**Stack técnico:**

- Frontend: [framework y versión]
- Backend: [framework/plataforma]
- Database: [sistema de BD]
- Deployment: [plataforma]
- Testing: [frameworks]

---

## Technical Decisions

**⚠️ IMPORTANTE - MCPs para Decisión Técnica:**

Antes de tomar decisiones técnicas críticas a nivel feature, DEBES:

1. **Context7 MCP (MCP MÁS IMPORTANTE)**
   - 🔍 Consultar documentación oficial de las librerías que consideras usar
   - ✅ Verificar APIs y capacidades actuales de las librerías
   - 📖 Obtener últimas actualizaciones y best practices
   - **Ejemplo:** Si consideras React Query vs SWR → consulta ambos con Context7

2. **Supabase MCP (si feature requiere backend/DB)**
   - 🔍 Verificar capacidades de Supabase para tu use case
   - ✅ Confirmar APIs disponibles (Auth, Database, Storage, etc.)
   - 📖 Revisar patrones recomendados para tu arquitectura

3. **shadcn MCP (si feature requiere componentes UI)**
   - 🔍 Buscar componentes shadcn que puedan resolver tus necesidades
   - ✅ Evaluar si shadcn tiene componentes complejos (data-table, forms, etc.)
   - 📖 Evitar crear componentes custom si shadcn ya los provee

**Beneficio:** Decisiones basadas en documentación oficial actualizada, no en conocimiento desactualizado.

---

### Decision 1: [Nombre de la decisión]

**Options considered:**

- A) [Opción A]
- B) [Opción B]
- C) [Opción C]

**Chosen:** [Opción elegida]

**Reasoning:**

- ✅ Ventaja 1
- ✅ Ventaja 2
- ✅ Ventaja 3
- ❌ Trade-off: [Desventaja o compromiso]

**Implementation notes:**

- [Detalle de implementación]
- [Consideraciones específicas]

---

### Decision 2: [Otra decisión técnica]

**Chosen:** [Decisión]

**Reasoning:**

- ✅ ...
- ❌ Trade-off: ...

**Implementation notes:**

- [Detalles]

---

(Incluir 3-5 decisiones técnicas críticas a nivel feature)

---

## Types & Type Safety

**⚠️ IMPORTANTE:** Esta feature debe usar tipos del backend para garantizar type-safety consistente en todas las stories.

**Tipos disponibles:**

- `lib/database.types.ts` - Tipos generados desde database schema (Fase 3.2 - Backend Setup)
- `lib/types.ts` - Type helpers extraídos del backend

**Estrategia de tipos a nivel feature:**

1. **Identificar entidades principales:**
   - ¿Qué entidades del backend usa esta feature? (User, Mentor, Product, etc.)
   - Listar tipos disponibles en `lib/database.types.ts` relevantes a esta feature

2. **Crear helpers compartidos (si es necesario):**
   - Si múltiples stories usan transformaciones de tipos similares
   - Ubicación: `lib/types.ts` o `lib/[feature-name]-types.ts`

3. **Directiva para todas las stories de esta feature:**
   - ✅ TODAS las stories deben importar tipos desde `@/lib/types`
   - ✅ TODAS las props de componentes tipadas con tipos del backend
   - ✅ Mock data type-safe que cumpla estructura de tipos
   - ✅ Zero type errors relacionados a entidades del backend

**Ejemplo a nivel feature:**

```typescript
// lib/types.ts (o lib/mentor-types.ts para feature específica)
import type { Database } from './database.types';

export type Mentor = Database['public']['Tables']['mentors']['Row'];
export type MentorInsert = Database['public']['Tables']['mentors']['Insert'];
export type MentorUpdate = Database['public']['Tables']['mentors']['Update'];

// Todas las stories de esta feature usan estos tipos
// Story A: MentorCard component usa Mentor
// Story B: MentorForm component usa MentorInsert
// Story C: EditMentor component usa MentorUpdate
```

**Beneficios a nivel feature:**

- Consistencia de tipos entre todas las stories
- Refactoring seguro (cambio en schema afecta a todas las stories)
- Zero duplicación de definiciones de tipos

---

## UI/UX Design Strategy (Si la feature tiene interfaz)

**⚠️ IMPORTANTE:** Esta feature debe usar el Design System base de Fase 3 (frontend-setup.md).

**Design System disponible:** `.context/design-system.md`

### Componentes compartidos por stories:

**⚠️ IMPORTANTE - Uso de MCP shadcn/ui a nivel feature:**

Si el proyecto usa shadcn/ui, **ANTES** de planificar componentes custom:

- 🔍 **Usa MCP shadcn** para buscar componentes disponibles
- ✅ Identifica componentes complejos que shadcn ya provee (data-table, form, command, etc.)
- 🚫 Evita crear componentes custom si shadcn tiene una solución
- 📖 Planifica integración de componentes shadcn en las stories

**Ejemplo de búsqueda a nivel feature:**

- Feature necesita múltiples diálogos → Busca "dialog" en shadcn MCP
- Feature necesita manejo de formularios complejos → Busca "form" en shadcn MCP
- Feature necesita mostrar data en tablas → Busca "data-table" en shadcn MCP

**Componentes del Design System a usar:**

- ✅ [Componente 1]: [Cómo se usa en esta feature]
- ✅ [Componente 2]: [Cómo se usa en esta feature]
- ✅ [Layout]: [Navbar/Sidebar - si se necesitan ajustes]

**Componentes custom a nivel feature:**

- 🆕 [FeatureComponentName]
  - **Usado por stories:** [Story A, Story B]
  - **Propósito:** [Descripción]
  - **Diseño base:** [Descripción visual usando design system]
  - **Ubicación:** `components/[feature-domain]/`

(Donde [FeatureComponentName] se define según el dominio de la feature. Ejemplos según proyecto: MentorCard en MYM, ProductCard en SHOP, PostCard en BLOG)

### Consistencia visual:

**Paleta aplicada (del design system):**

- Primary: `bg-primary` - [Uso específico en esta feature]
- Secondary: `bg-secondary` - [Uso específico]
- Accent: `bg-accent` - [Uso específico]

**Patrones de diseño comunes:**

- [Patrón 1]: [Descripción de cómo se aplica] (ej: Todas las listas usan Card grid)
- [Patrón 2]: [Descripción]

### Flujos de UX:

**User journeys específicos de esta feature:**

1. [Flujo 1]: [Descripción paso a paso]
   - Estado inicial → [Story A]
   - Acción → [Story B]
   - Resultado → [Story C]

2. [Flujo 2]: [Descripción]

**Estados globales de la feature:**

- Loading: [Cómo se muestra]
- Empty: [Qué mensaje/CTA]
- Error: [Cómo se recupera]

**Nota:** Los diseños específicos de cada story se detallan en sus `implementation-plan.md` respectivos.

### Personalidad UI/UX de la feature:

**⚠️ IMPORTANTE:** Esta feature debe reflejar la personalidad visual elegida en Fase 3 (frontend-setup).

**Estilo visual a seguir:** [Del design system - Minimalista/Bold/Corporativo/Playful]

**Aplicar consistentemente en TODAS las stories de esta feature:**

- **Si Minimalista:**
  - Espacios generosos (padding/margin amplios)
  - Tipografía limpia, jerárquica
  - Sombras sutiles (`shadow-sm`)
  - Bordes suaves (`rounded-md`)

- **Si Bold/Moderno:**
  - Gradientes sutiles en backgrounds
  - Sombras pronunciadas (`shadow-lg`, `shadow-xl`)
  - Bordes redondeados (`rounded-lg`, `rounded-xl`)
  - Hover effects con transforms (scale, translate)

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

**Validar a nivel feature:**

- ✅ Todas las stories usan bordes consistentes
- ✅ Todas las stories usan sombras consistentes
- ✅ Todas las stories usan espaciado consistente
- ✅ Efectos hover/active coherentes en toda la feature

---

## Content Writing Strategy (Si la feature tiene UI con texto)

**⚠️ CRÍTICO:** Esta feature debe usar Content Writing real basado en el contexto del negocio, NO texto genérico.

**Directiva para TODAS las stories de esta feature:**

1. **Leer contexto de negocio:**
   - `.context/PRD/executive-summary.md` - Propuesta de valor, problema que resuelve
   - `.context/idea/README.md` - Problema y solución del negocio
   - `.context/PRD/user-personas.md` - A quién va dirigido
   - `.context/PRD/mvp-scope.md` - Features y vocabulario del dominio

2. **Identificar vocabulario del dominio a nivel feature:**
   - ¿Qué entidades principales aparecen en esta feature?
   - ¿Qué acciones principales realizan los usuarios?
   - ¿Qué lenguaje usa el PRD para describir esta feature?

3. **Evitar frases genéricas en TODA la feature:**
   - ❌ "Bienvenido a nuestra plataforma"
   - ❌ "Gestiona tus recursos fácilmente"
   - ❌ "La mejor solución para..."
   - ❌ "Accede a tu dashboard"

4. **Aplicar tono coherente:**
   - Según personalidad del producto (del PRD)
   - Formal/Casual/Técnico/Amigable
   - Consistente en todas las stories de esta feature

**Ejemplos a nivel feature según dominio:**

**Si feature es "Mentor Discovery" (proyecto MentorYourMind):**

- ❌ Genérico: "Bienvenido a nuestra plataforma de gestión"
- ✅ Contextual: "Encuentra mentores expertos en tu área"
- ✅ Contextual: "Explora perfiles de mentores verificados"
- ✅ Contextual: "Filtra por experiencia, disponibilidad y especialidad"

**Si feature es "Inventory Management" (proyecto ShopFlow):**

- ❌ Genérico: "Administra tus recursos"
- ✅ Contextual: "Controla tu inventario en tiempo real"
- ✅ Contextual: "Recibe alertas cuando el stock esté bajo"
- ✅ Contextual: "Sincroniza automáticamente con tus ventas"

**Si feature es "Content Publishing" (proyecto BlogHub):**

- ❌ Genérico: "Crea y publica contenido"
- ✅ Contextual: "Escribe y monetiza tus artículos"
- ✅ Contextual: "Programa publicaciones para tu audiencia"
- ✅ Contextual: "Analiza el rendimiento de tus posts"

**Resultado esperado:**
Todas las stories de esta feature usan vocabulario consistente del dominio, reflejando el contexto específico del proyecto identificado en PRD/idea.

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

1. **[Dependency 1]**
   - [Detalles de la dependencia]
   - [Configuración necesaria]

2. **[Dependency 2]**
   - [Detalles]

3. **Environment variables:**
   - VAR_NAME: [descripción]
   - VAR_NAME_2: [descripción]

4. **External services:**
   - [Servicio 1]: [para qué se usa]
   - [Servicio 2]: [para qué se usa]

---

## Architecture Notes

### Folder Structure

(Mostrar estructura de carpetas relevante para esta feature)

/app
├── /feature-name
│ ├── /component1
│ └── /component2
/lib
├── /feature-utils
...

### Design Patterns

1. **[Pattern 1]**: [Descripción de uso]
2. **[Pattern 2]**: [Descripción de uso]

### Third-party Libraries

- **[Library 1]**: [versión] - [para qué se usa]
- **[Library 2]**: [versión] - [para qué se usa]

---

## Implementation Order

**Recomendado:**

1. **STORY-{PROJECT_KEY}-{ISSUE_NUM}: [Título]** (base para todo)
   - Razón: [Por qué primero]

2. **STORY-{PROJECT_KEY}-{ISSUE_NUM}: [Título]** (depende de story anterior)
   - Razón: [Por qué después]

3. **STORY-{PROJECT_KEY}-{ISSUE_NUM}: [Título]** (puede ir en paralelo)
   - Razón: [Por qué en paralelo]

(Donde los números de issue específicos se obtienen del epic.md y sus stories)

---

## Risks & Mitigations

### Risk 1: [Descripción del riesgo]

**Impact:** High | Medium | Low (explicar impacto)
**Likelihood:** High | Medium | Low
**Mitigation:**

- [Estrategia de mitigación 1]
- [Estrategia de mitigación 2]

### Risk 2: [Descripción del riesgo]

**Impact:** ...
**Likelihood:** ...
**Mitigation:**

- ...

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las stories implementadas y deployed
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] Todas las stories usan tipos desde `@/lib/types`
  - [ ] Zero type errors relacionados a entidades del backend
  - [ ] Props de componentes tipadas correctamente en todas las stories
- [ ] **Personalidad UI/UX consistente en toda la feature**
  - [ ] Todas las stories aplican el mismo estilo visual (Minimalista/Bold/Corporativo/Playful)
  - [ ] Bordes, sombras y espaciado coherentes entre stories
  - [ ] Paleta de colores aplicada consistentemente (bg-primary, bg-secondary, etc.)
- [ ] **Content Writing contextual (NO genérico)**
  - [ ] Vocabulario del dominio usado consistentemente en todas las stories
  - [ ] Sin frases placeholder en ninguna story
  - [ ] Tono coherente con personalidad del producto
- [ ] **Protección de rutas (si aplica)**
  - [ ] Middleware actualizado con rutas de esta feature (si son privadas)
  - [ ] Rutas públicas/privadas correctamente configuradas
- [ ] 100% de test cases críticos pasando
- [ ] [Criterio específico de la feature]
- [ ] Performance targets alcanzados
- [ ] Documentation actualizada
- [ ] **Build y linting pasando**
  - [ ] `npm run build` (o equivalente) exitoso
  - [ ] Zero TypeScript errors en toda la feature
  - [ ] Linting passes en todas las stories

---

## 📤 SINCRONIZACIÓN CON JIRA (Condicional - UPEX Workspace)

### Custom Field para Feature Implementation Plan

| Field ID            | Nombre                              | Tipo     | Nivel |
| ------------------- | ----------------------------------- | -------- | ----- |
| `customfield_10043` | Feature Implementation Plan (Dev)🛠️ | Textarea | Epic  |

### Instrucciones de Sincronización

**DESPUÉS de generar el archivo `feature-implementation-plan.md` localmente:**

1. **Verificar si el Epic tiene el custom field:**
   - Usar MCP de Atlassian para obtener el Epic
   - Verificar si `customfield_10043` existe y está disponible

2. **Si el campo existe:**
   - Copiar el contenido COMPLETO del `feature-implementation-plan.md` generado
   - Actualizar el Epic en Jira usando MCP:
     ```
     jira_update_issue(
       issue_key: "{EPIC_JIRA_KEY}",
       fields: {
         "customfield_10043": "{CONTENIDO_COMPLETO_DEL_PLAN}"
       }
     )
     ```
   - Agregar label: `implementation-plan-ready`

3. **Si el campo NO existe (Workspace non-UPEX):**
   - Buscar campo equivalente: `jira_search_fields(keyword: "implementation plan")`
   - Si se encuentra alternativa, usar ese field ID
   - Si no existe ningún campo equivalente:
     - Agregar el plan como **comentario** en el Epic
     - Formato del comentario:

       ```
       ## 🛠️ Feature Implementation Plan

       [CONTENIDO COMPLETO DEL PLAN]

       ---
       📄 Full document: .context/PBI/epics/EPIC-{...}/feature-implementation-plan.md
       ```

### Output Esperado

- ✅ Archivo local `feature-implementation-plan.md` generado
- ✅ Epic en Jira actualizado con el plan (campo o comentario)
- ✅ Label `implementation-plan-ready` agregado al Epic

---

**Formato:** Markdown estructurado, listo para copiar a .context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/feature-implementation-plan.md

**Restricciones:**

- Decisiones técnicas justificadas
- Dependencias compartidas claras
- Orden de implementación lógico
- Riesgos identificados con mitigaciones
- **Sincronizar con Jira después de generar archivo local**
