Actúa como Scrum Master y Product Owner.

**Input:**
- PRD: [usar .context/PRD/mvp-scope.md]
- SRS: [usar .context/SRS/functional-specs.md]

**Genera estructura completa de Product Backlog Items:**

---

## **Paso 1: Crear epic-tree.md**

Genera árbol visual high-level de todas las épicas y stories:

**Ejemplo:**

EPIC-[PROYECTO]-1: User Authentication & Authorization
├── STORY-[PROYECTO]-1: Register with email
├── STORY-[PROYECTO]-2: Login with credentials
├── STORY-[PROYECTO]-3: Password reset flow
└── STORY-[PROYECTO]-4: RBAC implementation

EPIC-[PROYECTO]-5: User Profile Management
├── STORY-[PROYECTO]-6: View profile
├── STORY-[PROYECTO]-7: Edit profile
└── STORY-[PROYECTO]-8: Upload avatar

(Continuar con todas las épicas del PRD)

**Total esperado:** 5-7 épicas, 20-30 user stories para MVP

---

## **Paso 2: Crear archivos epic.md**

Por cada épica, genera archivo epic.md dentro de .context/PBI/epics/EPIC-XXX-nombre/

**Estructura del archivo epic.md:**

---
id: EPIC-[PROYECTO]-[NUM]
jira_id: null
title: [Epic Title from PRD]
priority: High | Medium | Low
business_value: High | Medium | Low
estimated_story_points: [suma de story points de todas sus stories]
---

## Description
[Descripción detallada de la épica]

## Scope
**In Scope:**
- Feature 1
- Feature 2

**Out of Scope:**
- Features que NO están incluidas

## Acceptance Criteria (Epic-level)
- [ ] Criterio 1 de aceptación a nivel épica
- [ ] Criterio 2
- [ ] Criterio 3

## Dependencies
- **Épicas dependientes:** [listar si aplica]
- **Recursos externos:** [APIs, services, etc.]
- **Technical pre-requisites:** [configuraciones necesarias]

## User Stories
- STORY-[PROYECTO]-X: [Story title] (X pts)
- STORY-[PROYECTO]-Y: [Story title] (Y pts)
- ...

---

## **Paso 3: Crear archivos story.md**

Por cada story, crear CARPETA .context/PBI/epics/EPIC-XXX/stories/STORY-XXX/

Dentro de cada carpeta, generar archivo story.md:

**Estructura del archivo story.md:**

---
id: STORY-[PROYECTO]-[NUM]
jira_id: null
epic_id: EPIC-[PROYECTO]-[NUM]
title: Como [usuario], quiero [acción], para [beneficio]
priority: High | Medium | Low
story_points: [1, 2, 3, 5, 8, 13]
assignee: null
status: To Do
---

## Description
[Descripción detallada de la user story]

## Acceptance Criteria (Gherkin format)

**Scenario 1: [Happy path scenario]**
- **Given:** [Contexto inicial]
- **When:** [Acción del usuario]
- **Then:** [Resultado esperado]

**Scenario 2: [Error scenario]**
- **Given:** [Contexto inicial]
- **When:** [Acción del usuario]
- **Then:** [Resultado esperado]

**Scenario 3: [Edge case]**
- **Given:** [Contexto inicial]
- **When:** [Acción del usuario]
- **Then:** [Resultado esperado]

## Technical Notes (iniciales)
- [Notas técnicas relevantes]
- [Sugerencias de implementación]
- [Consideraciones de arquitectura]

## Definition of Done
- [ ] Código implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integración (API + DB)
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Deployed to staging

---

## **Output esperado:**

1. **epic-tree.md** en .context/PBI/
2. **Estructura de carpetas /epics** con:
   - 5-7 carpetas de épicas
   - Cada épica con epic.md
   - Cada épica con /stories/ conteniendo carpetas STORY-XXX
   - Cada carpeta STORY-XXX con story.md inicial

**Nota:** Los archivos feature-test-plan.md, feature-implementation-plan.md, test-cases.md e implementation-plan.md se crean en las siguientes fases (3 y 4).

**Post-generación:** Usar Atlassian MCP para crear estos items en Jira y actualizar los jira_id en los archivos locales.

**Formato:** Archivos Markdown listos para copiar a .context/PBI/

**Restricciones:**
- IDs consistentes en todo el proyecto
- Story points estimados realísticamente
- Acceptance Criteria en formato Gherkin
- Épicas balanceadas (no muy grandes ni muy pequeñas)
