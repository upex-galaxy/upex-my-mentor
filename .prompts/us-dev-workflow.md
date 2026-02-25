# US Development Workflow Strategy

> **Contexto Constante para IA** - Este archivo debe leerse al inicio de cada sesion de trabajo para mantener continuidad y saber exactamente que hacer y donde estamos.

---

## Proposito

Este documento define la estrategia completa de desarrollo por User Story (US), desde que tiene Shift-Left Testing hasta su despliegue a staging. Sirve como guia para ejecutar las **Fases 6-9** del blueprint de manera sistematica.

**Objetivo:** Implementar cada US que tenga Shift-Left completado, siguiendo un flujo estandarizado que garantiza calidad, trazabilidad y documentacion automatica.

---

## Archivos de Contexto Esenciales

### Leer SIEMPRE al inicio de sesion

| Archivo                                    | Proposito                                                  |
| ------------------------------------------ | ---------------------------------------------------------- |
| `.context/PRD/shift-left-status-report.md` | Lista de US con Shift-Left listas para implementar         |
| `.prompts/us-dev-workflow.md`              | **Este archivo** - Estrategia de workflow                  |
| `CLAUDE.md` / `GEMINI.md` / `AGENTS.md`    | Instrucciones del proyecto y configuracion (según AI tool) |

### Leer segun la US en trabajo

| Archivo                                                                                            | Cuando leer                        |
| -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `.context/PBI/epics/EPIC-{PROJECT_KEY}-{N}-{name}/feature-test-plan.md`                            | Paso 0: Verificar precondiciones   |
| `.context/PBI/epics/EPIC-{PROJECT_KEY}-{N}-{name}/feature-implementation-plan.md`                  | Paso 0: Verificar precondiciones   |
| `.context/PBI/epics/EPIC-{PROJECT_KEY}-{N}-{name}/stories/STORY-{PROJECT_KEY}-{N}-{name}/story.md` | Antes de planificar                |
| **Acceptance Test Plan** (ver orden de descubrimiento abajo)                                       | Durante planificacion              |
| `.context/backend-setup.md`                                                                        | Durante implementacion con DB/Auth |
| `.context/api-auth.md`                                                                             | Durante implementacion con auth    |
| `.context/design-system.md`                                                                        | Durante implementacion UI          |
| `.context/guidelines/code-standards.md`                                                            | Durante code review                |

### Orden de Descubrimiento del Acceptance Test Plan (IMPORTANTE)

El Acceptance Test Plan contiene los **test cases** que validan cada Acceptance Criterion. **Jira es la fuente de verdad**, no los archivos locales.

**Orden de busqueda (usar el primero que exista):**

1. **Jira Comments** - Buscar en comentarios de la US usando `mcp__atlassian__jira_get_issue` con `comment_limit: 50`
   - Buscar comentarios que contengan "Test Case", "TC-", "Scenario:", o tablas de test cases
   - Los QA suelen dejar el acceptance test plan como comentario durante Shift-Left

2. **Jira Custom Field** - Campo `customfield_12400` ("Acceptance Test Plan (QA)🧪")
   - Usar `mcp__atlassian__jira_get_issue` con `fields: "*all"` para obtener custom fields
   - Este campo contiene el plan de pruebas aprobado por QA

3. **Archivo Local** (fallback) - Solo si Jira no tiene la informacion:
   - `.context/PBI/epics/.../stories/.../test-cases.md`
   - `.context/PBI/epics/.../stories/.../acceptance-test-plan.md`

**Ejemplo de obtencion desde Jira:**

```javascript
// Primero obtener issue con comentarios
const issue = await mcp__atlassian__jira_get_issue({
  issue_key: 'SQ-15',
  fields: '*all',
  comment_limit: 50,
});

// Buscar en comentarios primero
const testPlanComment = issue.comments?.find(
  c => c.body.includes('Test Case') || c.body.includes('TC-')
);

// Si no hay en comentarios, buscar en custom field
const testPlanField = issue.fields?.customfield_12400;

// Si ninguno existe, usar archivo local como fallback
```

**Nota:** Los test cases deben usarse como checklist durante la implementacion (PASO 3) para verificar que cada escenario esta cubierto.

### Prompts a ejecutar (leer UNO a la vez, cuando toque)

| Fase | Prompt                                                  | Cuando ejecutar       |
| ---- | ------------------------------------------------------- | --------------------- |
| 6    | `.prompts/fase-6-planning/story-implementation-plan.md` | Paso 2: Crear plan    |
| 7    | `.prompts/fase-7-implementation/implement-story.md`     | Paso 3: Implementar   |
| Git  | `.prompts/git-flow.md`                                  | Paso 4: Git flow y PR |
| 8    | `.prompts/fase-8-code-review/review-pr.md`              | Paso 6: Code review   |

---

## Los 12 Pasos del Workflow

### PASO 0: Verificar Precondiciones del Epic

**Objetivo:** Asegurar que el Epic tiene los artefactos de planificacion necesarios antes de trabajar en sus stories.

**Acciones:**

1. Identificar el Epic al que pertenece la US (de `story.md` o estructura de carpetas)
2. Verificar que existen los siguientes archivos en la carpeta del Epic:
   - `feature-test-plan.md` (Shift-Left Testing a nivel Epic)
   - `feature-implementation-plan.md` (Plan tecnico a nivel Epic)

**Si alguno NO existe:**

```
⚠️ PRECONDICION NO CUMPLIDA

El Epic {EPIC-{PROJECT_KEY}-N} no tiene los siguientes artefactos:
- [ ] feature-test-plan.md (crear con: .prompts/fase-5-shift-left/feature-test-plan.md)
- [ ] feature-implementation-plan.md (crear con: .prompts/fase-6-planning/feature-implementation-plan.md)

¿Desea proceder sin estos artefactos o crearlos primero?
```

**Si ambos existen:**

- Leer ambos archivos para contexto
- Continuar con Paso 1

**Criterio de exito:** Ambos archivos existen O usuario confirma proceder sin ellos

---

### PASO 1: Verificar Status en Jira

**Objetivo:** Asegurar que la US esta en estado correcto para trabajar.

**Acciones:**

1. Obtener detalles de la US en Jira usando `mcp__atlassian__getJiraIssue`
2. Verificar que el status sea `Ready For Dev`
3. Si no esta en `Ready For Dev`, transitar al estado correcto
4. Transitar a `In Progress` usando `mcp__atlassian__transitionJiraIssue`

**Criterio de exito:** US en Jira con status `In Progress`

---

### PASO 2: Crear Plan de Implementacion (Fase 6)

**Objetivo:** Definir como se implementara la US tecnicamente.

**Acciones:**

1. Leer el prompt `.prompts/fase-6-planning/story-implementation-plan.md`
2. Leer la story (`story.md`) de la carpeta local
3. **Obtener el Acceptance Test Plan desde Jira** (ver "Orden de Descubrimiento" arriba):
   - Primero: Buscar en comentarios de la US en Jira
   - Segundo: Buscar en `customfield_12400` de la US en Jira
   - Tercero (fallback): Leer `test-cases.md` o `acceptance-test-plan.md` local
4. **Usar como contexto** el `feature-implementation-plan.md` del Epic (verificado en Paso 0)
5. Crear rama local: `git checkout -b feat/{PROJECT_KEY}-{N}/{short-name}`
6. Generar `implementation-plan.md` en la carpeta de la story
7. Commit del plan

**Nota:** El plan de la story debe alinearse con las decisiones tecnicas del `feature-implementation-plan.md` del Epic.

**IMPORTANTE:** Los test cases del Acceptance Test Plan son la especificacion de comportamiento esperado. Cada test case debe mapearse a un step de implementacion para garantizar cobertura completa.

**Criterio de exito:** Archivo `implementation-plan.md` creado y commiteado, con todos los test cases mapeados

---

### PASO 3: Implementar el Plan (Fase 7)

**Objetivo:** Escribir el codigo funcional segun el plan.

**Acciones:**

1. Leer el prompt `.prompts/fase-7-implementation/implement-story.md`
2. Seguir los steps del `implementation-plan.md` creado
3. Implementar codigo respetando:
   - Frontend Design System (`.context/design-system.md`)
   - Backend Setup (`.context/backend-setup.md`)
   - API Auth (`.context/api-auth.md`)
   - Code standards (`.context/guidelines/code-standards.md`)
   - Types del backend (`src/lib/types.ts`)
4. **Verificar cada test case del Acceptance Test Plan:**
   - Usar los test cases obtenidos en PASO 2 como checklist
   - Marcar mentalmente cada escenario cubierto por la implementacion
   - Si un test case no esta cubierto, ajustar la implementacion
5. Verificar que pasa linting y build: `bun run lint && bun run build`
6. Commits atomicos por cada step completado

**Criterio de exito:** Codigo implementado, linting y build pasan, **todos los test cases del Acceptance Test Plan estan cubiertos**

---

### PASO 4: Git Flow y Crear PR

**Objetivo:** Subir cambios y crear Pull Request hacia staging.

**Acciones:**

1. Seguir instrucciones de `.prompts/git-flow.md`
2. Push de la rama: `git push -u origin feat/{PROJECT_KEY}-{N}/{short-name}`
3. Crear PR con `gh pr create`:
   - Base branch: `staging`
   - Titulo: `feat({PROJECT_KEY}-{N}): {descripcion corta}`
   - Body: Resumen de cambios + link a Jira
4. Obtener URL del PR creado

**Criterio de exito:** PR creado apuntando a staging, URL obtenida

---

### PASO 5: Verificar Transicion Automatica en Jira

**Objetivo:** Confirmar que la automation rule de Jira detecto el PR.

**Acciones:**

1. Esperar ~30 segundos para que la automation se ejecute
2. Verificar status de la US en Jira con `mcp__atlassian__getJiraIssue`
3. El status deberia ser `In Review` automaticamente

**Si el status NO cambio:**

- Informar al usuario que la automation rule no funciono
- Puede ser necesario revisar la configuracion de Jira

**Criterio de exito:** US en Jira con status `In Review` (o informar si no cambio)

---

### PASO 6: Code Review (Fase 8)

**Objetivo:** Verificar calidad del codigo antes de merge.

**Acciones:**

1. Leer el prompt `.prompts/fase-8-code-review/review-pr.md`
2. Revisar el codigo en local siguiendo el checklist:
   - Acceptance Criteria cumplidos
   - Linting y build pasan
   - Code standards respetados
   - Security checks
   - UI/UX segun design system
3. Si hay issues criticos o medium:
   - Corregir en la misma rama
   - Hacer push de los fixes
   - Re-verificar

**Criterio de exito:** Code review aprobado, todos los checks pasan

---

### PASO 7: Actualizar Documentacion (en rama de la US)

**Objetivo:** Mantener el status report y release notes actualizados ANTES del merge.

**Acciones:**

1. En la rama de la US (antes del merge), actualizar:
   - `.context/PRD/shift-left-status-report.md`:
     - Marcar implementation plan como completado
     - Actualizar estado del PR (indicar que sera MERGED)
     - Actualizar contadores
   - `.context/PRD/release-notes.md` (opcional):
     - Agregar entrada para la US implementada
     - Formato changelog estandar

2. Commit y push de los cambios de documentacion:

   ```bash
   git add .context/ && git commit -m "docs: update status report for {PROJECT_KEY}-{N}"
   git push
   ```

**Criterio de exito:** Cambios de documentacion incluidos en el PR de la US

**Nota importante:** Los docs viajan junto con el codigo de la US en el mismo PR. NO se pushean directo a staging.

---

### PASO 8: Merge del PR

**Objetivo:** Mergear el PR a staging (auto-deploy).

**Acciones:**

1. Verificar que todos los checks del PR estan en verde
2. Mergear usando `gh pr merge {PR_NUMBER} --squash`
3. Eliminar rama local: `git checkout staging && git branch -d feat/{PROJECT_KEY}-{N}/{short-name}`
4. Pull de staging: `git checkout staging && git pull`

**Criterio de exito:** PR mergeado, rama eliminada, staging actualizado

---

### PASO 9: Verificar Transicion a Ready For QA

**Objetivo:** Confirmar que la automation rule detecto el merge.

**Acciones:**

1. Esperar ~30 segundos para que la automation se ejecute
2. Verificar status de la US en Jira con `mcp__atlassian__getJiraIssue`
3. El status deberia ser `Ready For QA` automaticamente

**Si el status NO cambio:**

- Informar al usuario que la automation rule no funciono
- Puede ser necesario transitar manualmente

**Criterio de exito:** US en Jira con status `Ready For QA` (o informar si no cambio)

---

### PASO 10: Notificar en Jira

**Objetivo:** Informar al equipo de QA que la feature esta lista para pruebas.

**Acciones:**

1. Identificar quien realizo el Shift-Left Testing (buscar en comentarios de Jira)
2. Agregar comentario en Jira usando `mcp__atlassian__addCommentToJiraIssue`:

   ```
   Feature implementada y desplegada en staging.

   PR: [URL del PR]
   Branch: feat/{PROJECT_KEY}-{N}/{short-name}

   @{qa-person} La funcionalidad esta lista para pruebas en el ambiente de staging.
   ```

**Criterio de exito:** Comentario agregado en Jira

---

### PASO 11: Sincronizar y Esperar Instrucciones

**Objetivo:** Sincronizar staging local con los cambios mergeados y preparar para la siguiente US.

**Acciones:**

1. Moverse a staging y hacer pull de los cambios mergeados:

   ```bash
   git checkout staging && git pull origin staging
   ```

2. Verificar que el merge se refleja localmente:

   ```bash
   git log --oneline -3
   ```

3. Esperar instrucciones del usuario sobre cual US trabajar a continuacion

4. Cuando se indique la siguiente US, crear o moverse a su rama:

   ```bash
   # Si la rama no existe:
   git checkout -b feat/{PROJECT_KEY}-{N}/{short-name}

   # Si la rama ya existe:
   git checkout feat/{PROJECT_KEY}-{N}/{short-name}
   git merge staging -m "chore: sync with staging after {PROJECT_KEY}-{prev} completion"
   ```

5. Continuar con Paso 1 de la nueva US

**Criterio de exito:** Staging local actualizado, listo para siguiente US

**Nota:** No se pushea nada a staging directamente. Los cambios de docs viajan con el PR de cada US.

---

## Sistema de Tracking de Progreso

### Template de Estado por US

Usar este template al inicio de cada sesion para identificar donde quedamos:

```markdown
## US en Trabajo: {PROJECT_KEY}-{N}

| Paso                      | Estado                                  | Notas                                                |
| ------------------------- | --------------------------------------- | ---------------------------------------------------- |
| 0. Precondiciones Epic    | [Pendiente/Completado/Omitido]          | feature-test-plan.md, feature-implementation-plan.md |
| 1. Jira In Progress       | [Pendiente/Completado]                  |                                                      |
| 2. Implementation Plan    | [Pendiente/Completado]                  | Branch: feat/{PROJECT_KEY}-{N}/...                   |
| 3. Implementacion         | [Pendiente/En progreso/Completado]      |                                                      |
| 4. PR Creado              | [Pendiente/Completado]                  | PR #...                                              |
| 5. Jira In Review         | [Pendiente/Completado/Manual requerido] |                                                      |
| 6. Code Review            | [Pendiente/Completado]                  |                                                      |
| 7. Docs Actualizados      | [Pendiente/Completado]                  | En rama de la US                                     |
| 8. Merge PR               | [Pendiente/Completado]                  |                                                      |
| 9. Jira Ready For QA      | [Pendiente/Completado/Manual requerido] |                                                      |
| 10. Comentario Jira       | [Pendiente/Completado]                  |                                                      |
| 11. Preparar Siguiente US | [Pendiente/Completado]                  | Rama: feat/{PROJECT_KEY}-{next}/...                  |

**Siguiente paso:** [Numero y descripcion del paso pendiente]
**Blocker actual:** [Si hay alguno]
```

---

## Como Identificar Donde Quedamos

Al inicio de cada sesion, la IA debe:

1. **Verificar ramas locales:**

   ```bash
   git branch --list 'feat/{PROJECT_KEY}-*'
   ```

2. **Verificar PRs abiertos:**

   ```bash
   gh pr list --state open
   ```

3. **Revisar shift-left-status-report.md:**
   - Ver columna "Implementation Plan"
   - Ver columna "PR"

4. **Consultar Jira si es necesario:**
   - Status actual de la US
   - Ultimo comentario

Con esta informacion, construir el estado actual y determinar el siguiente paso.

---

## Release Notes Format

Archivo: `.context/PRD/release-notes.md`

```markdown
# Release Notes - {PRODUCT_NAME}

## [Unreleased]

### Features Implementadas

#### {PROJECT_KEY}-{N}: {Titulo de la Story}

- **Epic:** EPIC-{PROJECT_KEY}-{N} ({nombre del epic})
- **PR:** #{numero}
- **Implementado por:** Claude + Developer
- **Descripcion:** {Descripcion breve de la funcionalidad}
- **Cambios principales:**
  - {Cambio 1}
  - {Cambio 2}

---

## [v0.x.x] - {YYYY-MM-DD}

### Added

- ...

### Fixed

- ...

### Changed

- ...
```

---

## Reglas Importantes

1. **Leer un prompt a la vez:** No leer prompts de fases futuras hasta que toque ejecutarlas
2. **Commits atomicos:** Un commit por step o cambio logico
3. **Verificar siempre:** Linting y build antes de push
4. **Documentar progreso:** Actualizar el tracking despues de cada paso
5. **No asumir:** Verificar estados en Jira, no asumir que las automations funcionaron

---

## Configuracion del Proyecto (Referencia)

> **Nota:** Los siguientes valores deben estar definidos en el archivo de configuración del AI tool que se esté usando (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`, `CURSOR.md`, etc.):
>
> - `PROJECT_KEY`: Key del proyecto en Jira (ej: MYM, UPEX, etc.)
> - `PRODUCT_NAME`: Nombre del producto para release notes
> - `JIRA_CLOUD_ID`: ID del cloud de Jira (si se usa MCP Atlassian)
> - `SUPABASE_PROJECT_ID`: ID del proyecto en Supabase (si aplica)

**Transiciones comunes en Jira:**

- `Ready For Dev` -> `In Progress`: Usar transition disponible
- `In Progress` -> `In Review`: Automatico via PR
- `In Review` -> `Ready For QA`: Automatico via Merge

---

_Ultima actualizacion: 2025-12-08_
_Generado por Claude Code_
