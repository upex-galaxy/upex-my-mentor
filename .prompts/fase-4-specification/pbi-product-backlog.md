Actúa como Scrum Master y Product Owner.

**Input:**

- PRD: [usar .context/PRD/mvp-scope.md]
- SRS: [usar .context/SRS/functional-specs.md]
- Código del proyecto en Jira: [especificar, ej: MYM]

---

## 🎯 FLUJO DE TRABAJO: JIRA-FIRST → LOCAL

**IMPORTANTE:** Este prompt trabaja de forma incremental para optimizar tokens y mantener contexto definido.

### Flujo por Épica

1. **Crear épica en Jira** (MCP) → obtener ID real
2. **Crear carpeta local** con ID real de Jira
3. **Crear archivo epic.md** local
4. **Crear todas las stories de esa épica en Jira** (MCP) → obtener IDs reales
5. **Crear carpetas locales de stories** con IDs reales
6. **Crear archivos story.md** locales
7. **Repetir para siguiente épica**

---

## 📝 NOMENCLATURA DE CARPETAS

### Reglas para Épicas

**Formato:** `EPIC-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`

**Componentes:**

- `{PROYECTO}`: Código del proyecto en Jira (ej: MYM, UPEX) - MAYÚSCULAS
- `{NUMERO}`: ID numérico de Jira sin ceros a la izquierda (ej: 2, 13, 28)
- `{nombre-descriptivo}`: 2-4 palabras en kebab-case, minúsculas, descriptivo

**Ejemplos válidos:**

- ✅ `EPIC-MYM-2-user-authentication-profiles/`
- ✅ `EPIC-MYM-13-mentor-discovery-search/`
- ✅ `EPIC-UPEX-45-payment-processing/`

**Ejemplos INVÁLIDOS:**

- ❌ `EPIC-001-user-auth/` (falta código proyecto)
- ❌ `EPIC_MYM_2_UserAuth/` (formato incorrecto)
- ❌ `EPIC-MYM-002-auth/` (no usar ceros a la izquierda)
- ❌ `EPIC-MYM-2-user-authentication-and-comprehensive-profile-management-system/` (muy largo)

### Reglas para Stories

**Formato:** `STORY-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`
(Mismas reglas que épicas)

**Ejemplos válidos:**

- ✅ `STORY-MYM-3-user-signup-email/`
- ✅ `STORY-MYM-14-view-all-mentors/`

---

## **PASO 1: Crear epic-tree.md (Vista General)**

**Acción:** Genera árbol visual high-level de TODAS las épicas y stories del MVP.

**IMPORTANTE:** Este paso es SOLO para planificación. NO crea nada en Jira todavía.

**Formato del archivo:**

```markdown
# Product Backlog - Epic Tree

## Overview

Total Epics: [número]
Total User Stories: [número]
Project Code: [PROYECTO]
Jira Project: [URL del proyecto en Jira]

---

## Epic Hierarchy

### EPIC 1: [Epic Title]
**Planned Jira Key:** [PROYECTO]-TBD
**Priority:** CRITICAL | HIGH | MEDIUM | LOW
**Description:** [1-2 líneas]

**User Stories (estimado: X):**
1. [PROYECTO]-TBD - As a [user], I want to [action] so that [benefit]
2. [PROYECTO]-TBD - As a [user], I want to [action] so that [benefit]
...

---

### EPIC 2: [Epic Title]
...

---

## Epic Prioritization

### Phase 1: Foundation (Sprint 1-2)
1. Epic 1 - [Nombre]
2. Epic 2 - [Nombre]

### Phase 2: Core Features (Sprint 3-4)
...

---

## Next Steps

1. Run this prompt again, specifying EPIC 1 to create it incrementally
2. Continue with EPIC 2, EPIC 3, etc.
```

**Output esperado:** `.context/PBI/epic-tree.md`

---

## **PASO 2: Crear Épicas Incrementalmente**

**IMPORTANTE:** Este paso se ejecuta UNA VEZ POR ÉPICA. Repite el proceso para cada épica del epic-tree.

### **2.1 - Crear Épica en Jira (MCP)**

**Acción:** Usa las herramientas MCP de Atlassian disponibles para crear la épica en Jira.

**Datos necesarios para crear la épica:**

- **Proyecto:** Código del proyecto en Jira (ej: MYM, UPEX)
- **Tipo de issue:** Epic
- **Título (Summary):** Nombre de la épica del PRD
- **Descripción:** Descripción detallada de la épica (2-3 párrafos)
- **Prioridad:** High | Medium | Low
- **Labels:** mvp, fase-1 (ajustar según corresponda)

**Instrucciones:**

1. Usa las herramientas MCP para crear un issue de tipo "Epic" en Jira
2. Completa todos los campos requeridos
3. **IMPORTANTE:** Captura el ID/Key que Jira asigna a la épica (ej: MYM-13)

**Resultado esperado:**

- Épica creada exitosamente en Jira
- Obtener y guardar el **Jira Key real** (ej: MYM-13) para usarlo en nomenclatura

---

### **2.2 - Crear Carpeta Local de Épica**

**Acción:** Crear carpeta usando el ID real de Jira obtenido en 2.1

**Nomenclatura:** `EPIC-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`

**Ejemplo:** Si Jira devolvió `MYM-13`, crear:

```
.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/
```

---

### **2.3 - Crear Archivo epic.md**

**Acción:** Generar archivo `epic.md` dentro de la carpeta creada en 2.2

**Estructura del archivo:**

```markdown
# [Epic Title]

**Jira Key:** [KEY real de Jira, ej: MYM-13]
**Status:** [ASSIGNED | IN PROGRESS | DONE]
**Priority:** [CRITICAL | HIGH | MEDIUM | LOW]
**Phase:** [Foundation | Core Features | etc.]

---

## Epic Description

[Descripción detallada de la épica - 2-3 párrafos]

**Business Value:**
[Explicar el valor de negocio - por qué esta épica es importante]

---

## User Stories

1. **[PROYECTO]-TBD** - As a [user], I want to [action] so that [benefit]
2. **[PROYECTO]-TBD** - As a [user], I want to [action] so that [benefit]
...

**NOTA:** Los IDs serán actualizados cuando se creen las stories en Jira (siguiente paso)

---

## Scope

### In Scope
- Feature 1
- Feature 2
- ...

### Out of Scope (Future)
- Features que NO están incluidas en MVP
- Mejoras futuras
- ...

---

## Acceptance Criteria (Epic Level)

1. ✅ Criterio 1 de aceptación a nivel épica
2. ✅ Criterio 2
3. ✅ Criterio 3
...

---

## Related Functional Requirements

- **FR-XXX:** [Descripción del FR]
- **FR-YYY:** [Descripción del FR]

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### [Subsección relevante]
[Consideraciones técnicas específicas de esta épica]

### Database Schema
**Tables:**
[Listar tablas relevantes con campos principales]

**IMPORTANTE:** NO hardcodear schema SQL completo. Usar Supabase MCP para schema real.

### Security Requirements
[Requerimientos de seguridad específicos si aplican]

---

## Dependencies

### External Dependencies
[APIs, services externos, etc.]

### Internal Dependencies
[Otras épicas que deben completarse primero]

### Blocks
[Qué épicas están bloqueadas por esta]

---

## Success Metrics

### Functional Metrics
[Métricas técnicas de éxito]

### Business Metrics
[Métricas de negocio del Executive Summary]

---

## Risks & Mitigations

| Risk     | Impact          | Probability     | Mitigation           |
| -------- | --------------- | --------------- | -------------------- |
| [Riesgo] | High/Medium/Low | High/Medium/Low | [Plan de mitigación] |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-[PROYECTO]-[NUM]/feature-test-plan.md` (se crea en Fase 4)

### Test Coverage Requirements
- **Unit Tests:** [Qué cubrir]
- **Integration Tests:** [Qué cubrir]
- **E2E Tests:** [Qué cubrir]

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-[PROYECTO]-[NUM]/feature-implementation-plan.md` (se crea en Fase 5)

### Recommended Story Order
1. [KEY-1] - [Story title] - Foundation
2. [KEY-2] - [Story title] - Core logic
...

### Estimated Effort
- **Development:** [X sprints / Y weeks]
- **Testing:** [X sprint / Y weeks]
- **Total:** [X sprints]

---

## Notes

[Notas adicionales, consideraciones especiales, etc.]

---

## Related Documentation

- **PRD:** `.context/PRD/executive-summary.md`, `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-XXX to FR-YYY)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
```

**Output esperado:** `.context/PBI/epics/EPIC-[PROYECTO]-[NUM]-[nombre]/epic.md`

---

## **PASO 3: Crear Stories de la Épica**

**IMPORTANTE:** Ahora crea TODAS las stories de esta épica en Jira, una por una.

### **3.1 - Crear Story en Jira (MCP)**

**Acción:** Por cada user story de la épica, créala en Jira usando las herramientas MCP disponibles.

**Datos necesarios para crear cada story:**

- **Proyecto:** Código del proyecto en Jira (mismo que la épica)
- **Tipo de issue:** Story
- **Título (Summary):** As a [user], I want to [action] so that [benefit]
- **Descripción:** Descripción detallada + acceptance criteria en formato Gherkin
- **Epic Link:** Jira Key de la épica padre (el que obtuviste en paso 2.1, ej: MYM-13)
- **Prioridad:** High | Medium | Low
- **Story Points:** 1, 2, 3, 5, 8, o 13 (escala Fibonacci)
- **Labels:** mvp, sprint-1 (ajustar según corresponda)

**Instrucciones:**

1. Usa las herramientas MCP para crear un issue de tipo "Story" en Jira
2. Vincula la story a la épica usando el epic link
3. Completa todos los campos requeridos
4. **IMPORTANTE:** Captura el ID/Key que Jira asigna a cada story (ej: MYM-14, MYM-15, etc.)

**Resultado esperado:**

- Story creada exitosamente en Jira
- Story vinculada a su épica
- Obtener y guardar el **Jira Key real** (ej: MYM-14) para usarlo en nomenclatura

---

### **3.2 - Crear Carpeta Local de Story**

**Acción:** Por cada story creada en Jira, crear su carpeta local.

**Nomenclatura:** `STORY-{PROYECTO}-{NUMERO}-{nombre-descriptivo}/`

**Ubicación:** `.context/PBI/epics/EPIC-[PROYECTO]-[NUM]-[nombre]/stories/`

**Ejemplo:** Si Jira devolvió `MYM-14`, crear:

```
.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-14-view-all-mentors/
```

---

### **3.3 - Crear Archivo story.md**

**Acción:** Generar archivo `story.md` dentro de cada carpeta de story.

**Estructura del archivo:**

```markdown
# [Story Title]

**Jira Key:** [KEY real de Jira, ej: MYM-14]
**Epic:** [EPIC-PROYECTO-NUM] ([Epic Title])
**Priority:** [High | Medium | Low]
**Story Points:** [1, 2, 3, 5, 8, 13]
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** [tipo de usuario]
**I want to** [acción/funcionalidad]
**So that** [beneficio/valor]

---

## Description

[Descripción detallada de la user story - 2-3 párrafos]
[Contexto adicional, problema que resuelve, valor que aporta]

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: [Happy path scenario name]
- **Given:** [Contexto inicial / precondiciones]
- **When:** [Acción del usuario]
- **Then:** [Resultado esperado]

### Scenario 2: [Error/edge case scenario name]
- **Given:** [Contexto inicial]
- **When:** [Acción del usuario]
- **Then:** [Resultado esperado / manejo del error]

### Scenario 3: [Additional scenario if needed]
- **Given:** [Contexto inicial]
- **When:** [Acción del usuario]
- **Then:** [Resultado esperado]

**Mínimo:** 3 scenarios por story (1 happy path + 2 edge/error cases)

---

## Technical Notes

### Frontend
[Componentes a crear/modificar, libraries a usar]

### Backend
[APIs a crear/modificar, servicios necesarios]

### Database
[Tablas afectadas, queries relevantes]

**IMPORTANTE:** NO hardcodear SQL. Usar Supabase MCP.

### External Services
[APIs externas, servicios de terceros si aplican]

---

## Dependencies

### Blocked By
[Otras stories que deben completarse primero]

### Blocks
[Qué stories dependen de esta]

### Related Stories
[Stories relacionadas en otras épicas]

---

## UI/UX Considerations

[Mockups, wireframes, design system components a usar]
[Interacciones, flujos de navegación]

---

## Definition of Done

- [ ] Código implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integración (API + DB)
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado (2 reviewers)
- [ ] Documentación actualizada (README, API docs)
- [ ] Deployed to staging
- [ ] QA testing passed
- [ ] Acceptance criteria validated
- [ ] No critical/high bugs open

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-[PROYECTO]-[NUM]/stories/STORY-[PROYECTO]-[NUM]/test-cases.md` (se crea en Fase 4)

**Test Cases Expected:** 6+ detailed test cases covering:
- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-[PROYECTO]-[NUM]/stories/STORY-[PROYECTO]-[NUM]/implementation-plan.md` (se crea en Fase 5)

**Implementation Steps Expected:**
- Step-by-step technical plan
- File structure
- Function signatures
- API endpoints
- Database operations

---

## Notes

[Notas adicionales, consideraciones especiales, decisiones técnicas]

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-[PROYECTO]-[NUM]/epic.md`
- **PRD:** `.context/PRD/user-journeys.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-XXX)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
```

**Output esperado:** `.context/PBI/epics/EPIC-[...]/stories/STORY-[...]/story.md`

---

### **3.4 - Actualizar epic.md con IDs Reales**

**Acción:** Actualizar el archivo `epic.md` de la épica con los IDs reales de las stories creadas.

**Buscar sección "User Stories" y reemplazar:**

```markdown
## User Stories

1. **MYM-14** - As a Mentee, I want to see a gallery of all available mentors
2. **MYM-15** - As a Mentee, I want to search for mentors by keyword
3. **MYM-16** - As a Mentee, I want to filter mentors by their skills
4. **MYM-17** - As a Mentee, I want to view a mentor's detailed profile
```

---

## **PASO 4: Repetir para Siguiente Épica**

Una vez completada la épica actual (épica en Jira + carpeta local + epic.md + todas las stories), repetir desde el **PASO 2** para la siguiente épica del epic-tree.

**Workflow incremental:**

```
ÉPICA 1:
  ├─ Crear épica en Jira → ID: MYM-2
  ├─ Crear carpeta: EPIC-MYM-2-user-authentication-profiles/
  ├─ Crear epic.md
  ├─ Crear stories en Jira → IDs: MYM-3, MYM-4, MYM-5, MYM-6, MYM-7
  ├─ Crear carpetas: STORY-MYM-3-..., STORY-MYM-4-..., etc.
  ├─ Crear story.md para cada una
  └─ Actualizar epic.md con IDs reales ✅

ÉPICA 2:
  ├─ Crear épica en Jira → ID: MYM-8
  ├─ Crear carpeta: EPIC-MYM-8-mentor-vetting-onboarding/
  ├─ Crear epic.md
  ...
```

---

## **RESUMEN DEL FLUJO COMPLETO**

### Primera Ejecución (Planificación)

1. Generar `epic-tree.md` con TODAS las épicas y stories planificadas

### Por Cada Épica (Incremental)

2. **Jira:** Crear épica → Obtener ID real (ej: MYM-13)
3. **Local:** Crear carpeta `EPIC-MYM-13-mentor-discovery-search/`
4. **Local:** Crear archivo `epic.md` con datos completos
5. **Jira:** Crear story 1 de épica → Obtener ID (ej: MYM-14)
6. **Local:** Crear carpeta `STORY-MYM-14-view-all-mentors/`
7. **Local:** Crear archivo `story.md` con datos completos
8. Repetir pasos 5-7 para todas las stories de la épica
9. **Local:** Actualizar `epic.md` con IDs reales de stories
10. ✅ Épica completada, pasar a siguiente

---

## **BENEFICIOS DE ESTE ENFOQUE**

✅ **Nomenclatura correcta desde el inicio** - IDs reales de Jira en carpetas
✅ **No hay sincronización posterior** - Jira y local en sync desde el principio
✅ **Trabajo incremental** - Menos tokens, contexto definido por épica
✅ **Trazabilidad perfecta** - Carpeta local → Issue Jira (1:1)
✅ **Facilita fases posteriores** - Testing y Planning ya tienen IDs correctos

---

## **RESTRICCIONES Y VALIDACIONES**

### Nomenclatura

- ✅ Usar kebab-case en nombres de carpetas
- ✅ IDs sin ceros a la izquierda (MYM-2, no MYM-002)
- ✅ Nombres descriptivos pero concisos (2-4 palabras)
- ❌ NO usar snake_case, CamelCase, o espacios
- ❌ NO usar caracteres especiales excepto guiones

### Story Points

- Usar escala Fibonacci: 1, 2, 3, 5, 8, 13
- Stories > 8 puntos deben dividirse

### Acceptance Criteria

- Formato Gherkin obligatorio (Given-When-Then)
- Mínimo 3 scenarios por story
- Incluir al menos 1 happy path y 2 edge/error cases

### Datos Dinámicos

- ❌ NO hardcodear SQL schemas (usar Supabase MCP)
- ❌ NO hardcodear datos de configuración
- ✅ Referenciar fuentes de verdad (.context/SRS/, Supabase)

---

## **NOTAS IMPORTANTES**

1. **MCP Atlassian debe estar configurado** antes de ejecutar este prompt
2. **Especificar código del proyecto** (ej: MYM, UPEX) al inicio
3. **Trabajar épica por épica** - NO intentar crear todo de una vez
4. **Validar IDs** después de cada creación en Jira antes de crear carpetas
5. **Mantener epic-tree.md actualizado** con IDs reales conforme avanzas

---

## **ARCHIVOS GENERADOS**

Al completar este prompt para todo el MVP (todas las épicas), tendrás:

```
.context/PBI/
├── epic-tree.md                                    [Paso 1]
├── ALIGNMENT-REPORT.md                             [Opcional: mapeo PRD → Jira]
└── epics/
    ├── EPIC-MYM-2-user-authentication-profiles/
    │   ├── epic.md                                 [Paso 2.3]
    │   └── stories/
    │       ├── STORY-MYM-3-user-signup-email/
    │       │   └── story.md                        [Paso 3.3]
    │       ├── STORY-MYM-4-user-login-logout/
    │       │   └── story.md
    │       └── ...
    ├── EPIC-MYM-8-mentor-vetting-onboarding/
    │   ├── epic.md
    │   └── stories/
    │       └── ...
    └── ...
```

**Archivos que se crean en fases posteriores:**

- `feature-test-plan.md` - Fase 4 (Shift-Left Testing)
- `story-xxx/test-cases.md` - Fase 4
- `feature-implementation-plan.md` - Fase 5 (Planning)
- `story-xxx/implementation-plan.md` - Fase 5

---

**Formato:** Archivos Markdown listos para copiar a `.context/PBI/`

**Prerequisitos:**

- `.context/PRD/mvp-scope.md` (generado en Fase 2)
- `.context/SRS/functional-specs.md` (generado en Fase 2)
- Atlassian MCP configurado y funcional
- Proyecto existente en Jira con permisos de creación

---

**Versión:** 4.0 - Jira-First Incremental Flow
**Última actualización:** 2025-11-04
