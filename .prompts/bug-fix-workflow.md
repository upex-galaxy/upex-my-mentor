# Bug Fix Workflow

> **Contexto Constante para IA** - Este archivo debe leerse al inicio de cada sesión de trabajo con bugs para mantener continuidad y saber exactamente qué hacer.

---

## Propósito

Este documento define la estrategia completa para resolver defectos/bugs reportados en Jira, desde su análisis hasta el despliegue del fix. Sirve como guía para ejecutar un flujo sistemático que garantiza calidad, trazabilidad y documentación.

**Objetivo:** Resolver cada bug de manera eficiente, con análisis profundo de los custom fields de Jira, verificación completa, y despliegue controlado via Pull Request.

---

## Archivos de Contexto Esenciales

### Leer SIEMPRE al inicio de sesión

| Archivo                              | Propósito                                              |
| ------------------------------------ | ------------------------------------------------------ |
| `.prompts/bug-fix-workflow.md`       | **Este archivo** - Estrategia de workflow              |
| `CLAUDE.md` / `GEMINI.md`            | Instrucciones del proyecto y configuración (según AI)  |
| `.context/guidelines/code-standards.md` | Estándares de código a seguir                       |

### Leer según el contexto del bug

| Archivo                          | Cuándo leer                                |
| -------------------------------- | ------------------------------------------ |
| `.context/backend-setup.md`      | Bugs relacionados con DB, Auth, APIs       |
| `.context/api-documentation.md`  | Bugs en endpoints o integraciones          |
| `.context/design-system.md`      | Bugs visuales o de UI                      |
| `.context/frontend-architecture.md` | Bugs en componentes o estado            |

---

## Custom Fields de Bugs en Jira (UPEX Galaxy Workspace)

> **CRÍTICO:** Al analizar un bug, SIEMPRE revisar estos custom fields para entender completamente el problema.

### Campos Requeridos (deben estar poblados)

| Field ID            | Nombre en Jira                    | Tipo     | Qué buscar                                                    |
| ------------------- | --------------------------------- | -------- | ------------------------------------------------------------- |
| `customfield_10109` | 🐞 Actual Result (Comportamiento) | Textarea | Descripción exacta del bug - qué está pasando                 |
| `customfield_10110` | ✅ Expected Result (Output)       | Textarea | Qué DEBERÍA pasar según requerimientos                        |
| `customfield_10112` | Error Type                        | Dropdown | Tipo de error (ver valores abajo)                             |
| `customfield_10041` | Severity                          | Dropdown | Severidad del bug (ver valores abajo)                         |
| `customfield_12210` | Test Environment                  | Dropdown | Dónde se encontró: Development, Staging, Production           |
| `customfield_10049` | Root Cause Text                   | Textarea | Análisis técnico inicial del reporter                         |

### Campos Opcionales (pueden tener información útil)

| Field ID            | Nombre en Jira  | Tipo     | Qué buscar                                      |
| ------------------- | --------------- | -------- | ----------------------------------------------- |
| `customfield_10111` | 🚩 Workaround   | Textarea | Solución temporal existente                     |
| `customfield_10607` | 🧫 EVIDENCE     | Textarea | Notas sobre evidencia adjunta (screenshots, videos) |
| `customfield_12212` | Fix             | Radio    | Tipo de fix esperado                            |

### Valores de Dropdowns

**Error Type (`customfield_10112`):**

| Valor         | Significado                                |
| ------------- | ------------------------------------------ |
| `Functional`  | Feature no funciona según especificación   |
| `UI/Visual`   | Problemas de layout, styling, display      |
| `Performance` | Carga lenta, timeouts, memoria             |
| `Data`        | Datos incorrectos, errores de cálculo      |
| `Integration` | Fallas en APIs externas, webhooks          |
| `Security`    | Bypass de auth, exposición de datos        |

**Severity (`customfield_10041`):**

| Valor      | Criterio                                           |
| ---------- | -------------------------------------------------- |
| `Critical` | Funcionalidad core bloqueada, sin workaround       |
| `High`     | Feature mayor rota, workaround difícil             |
| `Medium`   | Issue con workaround fácil                         |
| `Low`      | Cosmético, no afecta funcionalidad                 |

**Test Environment (`customfield_12210`):**

| Valor         | Ambiente                              |
| ------------- | ------------------------------------- |
| `Development` | localhost o entorno local             |
| `Staging`     | staging.*, *-staging.*, preview URLs  |
| `Production`  | Dominio de producción live            |

---

## Los 12 Pasos del Workflow

### PASO 0: Obtener y Analizar el Bug

**Objetivo:** Entender completamente el bug antes de intentar reproducirlo.

**Acciones:**

1. Obtener detalles completos del bug en Jira:
   ```
   mcp__atlassian__jira_get_issue
   - issue_key: "{PROJECT_KEY}-{N}"
   - fields: "*all"
   - expand: "changelog"
   - comment_limit: 10
   ```

2. Analizar los custom fields críticos:
   - **Actual Result**: ¿Qué comportamiento exacto reportaron?
   - **Expected Result**: ¿Qué debería pasar?
   - **Error Type**: ¿Es funcional, visual, de datos, etc.?
   - **Severity**: ¿Qué tan crítico es?
   - **Root Cause**: ¿El reporter identificó algo técnico?
   - **Evidence**: ¿Hay screenshots o videos adjuntos?

3. Revisar comentarios anteriores para contexto adicional

4. Identificar issue links (bloqueantes, relacionados, duplicados)

**Criterio de éxito:** Entendimiento claro del bug y su contexto

---

### PASO 1: Retest en Staging

**Objetivo:** Confirmar que el bug es reproducible antes de invertir tiempo en el fix.

**Acciones:**

1. Usar Playwright MCP para navegar al ambiente de staging:
   ```
   mcp__playwright__browser_navigate
   - url: "{STAGING_URL}"
   ```

2. Seguir los Steps to Reproduce del bug exactamente

3. Capturar evidencia si es necesario:
   ```
   mcp__playwright__browser_take_screenshot
   ```

4. Documentar resultado del retest:
   - **Reproducido:** Continuar con Paso 2
   - **No Reproducido:** Ver sección "Manejo de Bugs No Reproducibles"

**Criterio de éxito:** Bug confirmado como reproducible O documentado como no reproducible

---

### PASO 2: Transitar a In Progress

**Objetivo:** Indicar en Jira que se está trabajando en el bug.

**Acciones:**

1. Obtener transiciones disponibles:
   ```
   mcp__atlassian__jira_get_transitions
   - issue_key: "{PROJECT_KEY}-{N}"
   ```

2. Transitar a "In Progress":
   ```
   mcp__atlassian__jira_transition_issue
   - issue_key: "{PROJECT_KEY}-{N}"
   - transition_id: {ID para In Progress}
   ```

3. Verificar asignación (asignar si es necesario):
   ```
   mcp__atlassian__jira_update_issue
   - issue_key: "{PROJECT_KEY}-{N}"
   - fields: {"assignee": "{email}"}
   ```

**Criterio de éxito:** Bug en status "In Progress" y asignado

---

### PASO 3: Crear Rama de Fix

**Objetivo:** Aislar los cambios del fix en una rama dedicada.

**Acciones:**

1. Asegurar estar en la rama base actualizada:
   ```bash
   git checkout staging && git pull origin staging
   ```

2. Crear rama de fix con formato estándar:
   ```bash
   git checkout -b fix/{PROJECT_KEY}-{N}/{short-description}
   ```

   Ejemplos:
   - `fix/MYM-92/toast-notifications`
   - `fix/MYM-91/unread-counter-sync`
   - `fix/PROJ-123/login-redirect`

**Criterio de éxito:** Rama de fix creada desde staging actualizado

---

### PASO 4: Investigar Causa Raíz

**Objetivo:** Identificar exactamente qué causa el bug y dónde está el problema.

**Acciones según Error Type:**

| Error Type    | Dónde buscar                                        |
| ------------- | --------------------------------------------------- |
| Functional    | `src/app/`, `src/lib/actions/`, `src/lib/services/` |
| UI/Visual     | `src/components/`, `src/app/globals.css`, Tailwind  |
| Data          | Supabase queries, `src/lib/actions/`, API routes    |
| Integration   | `src/app/api/`, env vars, external service configs  |
| Performance   | Network waterfall, bundle size, database queries    |
| Security      | Middleware, RLS policies, auth checks               |

**Herramientas de investigación:**

```
# Buscar en código
Grep tool con pattern relevante

# Verificar en Supabase
mcp__supabase__execute_sql
mcp__supabase__list_tables
mcp__supabase__get_logs

# Verificar logs de edge functions
mcp__supabase__get_logs
- service: "edge-function" | "auth" | "postgres"
```

**Documentar hallazgos:**
- Archivo(s) afectado(s)
- Línea(s) específica(s)
- Causa técnica del problema

**Criterio de éxito:** Causa raíz identificada y documentada

---

### PASO 5: Implementar Fix

**Objetivo:** Corregir el bug con el mínimo cambio necesario.

**Principios:**

1. **KISS (Keep It Simple):** Solo arreglar el bug específico
2. **No over-engineer:** Evitar refactors o mejoras no solicitadas
3. **No efectos secundarios:** Verificar que no rompe otra funcionalidad
4. **Seguir code-standards.md:** Mantener consistencia con el codebase

**Acciones:**

1. Editar solo los archivos necesarios
2. Mantener cambios mínimos y focalizados
3. Agregar comentarios si la lógica no es obvia

**Criterio de éxito:** Fix implementado siguiendo principios

---

### PASO 6: Verificar Localmente

**Objetivo:** Asegurar que el fix no rompe el build ni introduce nuevos problemas.

**Acciones:**

1. Ejecutar verificaciones de código:
   ```bash
   bun run typecheck   # Verificar tipos TypeScript
   bun run lint        # Verificar estilo de código
   bun run build       # Verificar build completo
   ```

2. Si alguno falla, corregir antes de continuar

**Criterio de éxito:** Todos los checks pasan (typecheck, lint, build)

---

### PASO 7: Testear en Localhost

**Objetivo:** Verificar que el fix resuelve el bug y no causa regresiones.

**Acciones:**

1. Iniciar servidor local:
   ```bash
   bun run dev
   ```

2. Usar Playwright MCP para testear:
   ```
   mcp__playwright__browser_navigate
   - url: "http://localhost:3000"
   ```

3. Reproducir los pasos del bug original
4. Verificar que el bug está resuelto
5. Verificar flujos relacionados para detectar regresiones

**Criterio de éxito:** Bug resuelto, sin regresiones detectadas

---

### PASO 8: Commit con ID del Bug

**Objetivo:** Crear commit atómico con mensaje estandarizado.

**Formato obligatorio:**

```
fix({PROJECT_KEY}-{N}): Descripción breve del fix
```

**Ejemplos:**

```
fix(MYM-92): Use toast.info() for better visibility with richColors
fix(MYM-91): Replace optimistic +1 with server refetch for unread count
fix(PROJ-88): Configure Stripe secret key in environment
```

**Acciones:**

```bash
git add .
git commit -m "fix({PROJECT_KEY}-{N}): {descripción}"
```

**Criterio de éxito:** Commit creado con mensaje estandarizado

---

### PASO 9: Comentar en Jira

**Objetivo:** Documentar el fix para el equipo de QA.

**Template de comentario:**

```markdown
## Fix Aplicado ✅

**Causa Raíz:** [Descripción técnica breve]

**Archivos modificados:**
- `path/to/file1.ts`
- `path/to/file2.tsx`

**Cambio específico:**
```code
// Antes:
[código anterior]

// Después:
[código nuevo]
```

**Verificación local:**
- ✅ typecheck
- ✅ lint
- ✅ build
- ✅ test manual en localhost

**Commit:** `{hash} fix({PROJECT_KEY}-{N}): {mensaje}`
```

**Acción:**

```
mcp__atlassian__jira_add_comment
- issue_key: "{PROJECT_KEY}-{N}"
- comment: "{contenido del template}"
```

**Criterio de éxito:** Comentario agregado con detalles del fix

---

### PASO 10: Crear Pull Request

**Objetivo:** Subir cambios y crear PR para review.

**Acciones:**

1. Push de la rama:
   ```bash
   git push -u origin fix/{PROJECT_KEY}-{N}/{short-description}
   ```

2. Crear PR hacia staging:
   ```bash
   gh pr create \
     --base staging \
     --title "fix({PROJECT_KEY}-{N}): {descripción}" \
     --body "## Summary

   Fixes #{PROJECT_KEY}-{N}

   **Root Cause:** {causa raíz}

   **Changes:**
   - {cambio 1}
   - {cambio 2}

   ## Test Plan
   - [ ] Bug no longer reproduces
   - [ ] No regressions in related flows

   🤖 Generated with [Claude Code](https://claude.com/claude-code)"
   ```

3. Obtener URL del PR creado

**Criterio de éxito:** PR creado apuntando a staging

---

### PASO 11: Merge y Transitar a Ready For QA

**Objetivo:** Mergear el fix y notificar que está listo para QA.

**Acciones:**

1. Verificar que checks del PR pasan

2. Mergear el PR:
   ```bash
   gh pr merge {PR_NUMBER} --squash --delete-branch
   ```

3. Obtener transiciones y mover a Ready For QA:
   ```
   mcp__atlassian__jira_get_transitions
   mcp__atlassian__jira_transition_issue
   - transition_id: {ID para Ready For QA o "Hard pushed"}
   ```

4. Actualizar staging local:
   ```bash
   git checkout staging && git pull origin staging
   ```

**Criterio de éxito:** PR mergeado, bug en Ready For QA, staging actualizado

---

### PASO 12: Notificar y Continuar

**Objetivo:** Informar al reporter/tester y preparar siguiente bug.

**Acciones:**

1. Si hay un reporter o tester específico, mencionarlo en comentario:
   ```
   mcp__atlassian__jira_add_comment
   - comment: "[~accountid:{ACCOUNT_ID}] Fix desplegado en staging, listo para retest.

   **Ambiente:** {STAGING_URL}
   **PR:** #{PR_NUMBER}"
   ```

2. Continuar con el siguiente bug (volver a Paso 0)

**Criterio de éxito:** Stakeholders notificados, listo para siguiente bug

---

## Manejo de Casos Especiales

### Bug No Reproducible

Si el bug no se puede reproducir en staging:

1. Agregar comentario en Jira explicando:
   - Pasos exactos intentados
   - Ambiente y condiciones de prueba
   - Posibles razones por las que no se reproduce

2. Obtener transición para cerrar como "Cannot Reproduce":
   ```
   mcp__atlassian__jira_get_transitions
   ```

3. Transitar al estado correspondiente

4. Mencionar al reporter para clarificación si es necesario

### Bug es "Works As Designed" (WAD)

Si después de investigar se determina que el comportamiento es correcto:

1. Agregar comentario detallado explicando:
   - Por qué el comportamiento es correcto
   - Referencia a documentación o código relevante
   - Evidencia de que funciona según diseño

2. Transitar a "REJECTED" o "WAD" según el workflow de Jira

3. Mencionar al reporter para discusión si es necesario

### Bug Duplicado

Si se encuentra que el bug ya fue reportado:

1. Agregar comentario indicando el duplicado:
   ```
   Este bug es duplicado de {PROJECT_KEY}-{N}.
   ```

2. Crear link de duplicado:
   ```
   mcp__atlassian__jira_create_issue_link
   - link_type: "Duplicate"
   - inward_issue_key: "{CURRENT_BUG}"
   - outward_issue_key: "{ORIGINAL_BUG}"
   ```

3. Transitar a estado de duplicado

---

## Herramientas MCP Disponibles

| Tarea                    | MCP Tool                                   |
| ------------------------ | ------------------------------------------ |
| Obtener bug de Jira      | `mcp__atlassian__jira_get_issue`           |
| Buscar bugs              | `mcp__atlassian__jira_search`              |
| Transitar bug            | `mcp__atlassian__jira_transition_issue`    |
| Comentar en bug          | `mcp__atlassian__jira_add_comment`         |
| Actualizar bug           | `mcp__atlassian__jira_update_issue`        |
| Navegar/testear UI       | `mcp__playwright__browser_*`               |
| Consultar/modificar DB   | `mcp__supabase__*`                         |
| Ver logs                 | `mcp__supabase__get_logs`                  |
| Buscar documentación     | `mcp__context7__*`                         |

---

## Checklist Pre-Commit

- [ ] Bug analizado (custom fields revisados)
- [ ] Bug reproducido en staging
- [ ] Rama de fix creada (`fix/{PROJECT_KEY}-{N}/...`)
- [ ] Causa raíz identificada
- [ ] Fix implementado (mínimo necesario)
- [ ] `bun run typecheck` pasa
- [ ] `bun run lint` pasa
- [ ] `bun run build` pasa
- [ ] Testeado manualmente en localhost
- [ ] Commit message: `fix({PROJECT_KEY}-{N}): ...`
- [ ] Comentario agregado en Jira con detalles del fix

## Checklist Pre-Merge

- [ ] PR creado hacia staging
- [ ] Checks del PR pasan
- [ ] PR mergeado con squash
- [ ] Bug transitado a Ready For QA
- [ ] Reporter/tester notificado (si aplica)

---

## Sistema de Tracking de Progreso

### Template de Estado por Bug

Usar este template para identificar dónde quedamos:

```markdown
## Bug en Trabajo: {PROJECT_KEY}-{N}

| Paso                      | Estado                             | Notas                        |
| ------------------------- | ---------------------------------- | ---------------------------- |
| 0. Analizar Bug           | [Pendiente/Completado]             | Custom fields revisados      |
| 1. Retest en Staging      | [Pendiente/Reproducido/No Repro]   |                              |
| 2. Jira In Progress       | [Pendiente/Completado]             |                              |
| 3. Rama de Fix            | [Pendiente/Completado]             | fix/{PROJECT_KEY}-{N}/...    |
| 4. Investigar Causa       | [Pendiente/Completado]             |                              |
| 5. Implementar Fix        | [Pendiente/Completado]             |                              |
| 6. Verificar Local        | [Pendiente/Completado]             | typecheck, lint, build       |
| 7. Testear Localhost      | [Pendiente/Completado]             |                              |
| 8. Commit                 | [Pendiente/Completado]             |                              |
| 9. Comentar Jira          | [Pendiente/Completado]             |                              |
| 10. Crear PR              | [Pendiente/Completado]             | PR #...                      |
| 11. Merge + Ready For QA  | [Pendiente/Completado]             |                              |
| 12. Notificar             | [Pendiente/Completado]             |                              |

**Siguiente paso:** [Número y descripción del paso pendiente]
**Blocker actual:** [Si hay alguno]
```

---

## Cómo Identificar Dónde Quedamos

Al inicio de cada sesión, verificar:

1. **Ramas de fix locales:**
   ```bash
   git branch --list 'fix/*'
   ```

2. **PRs abiertos:**
   ```bash
   gh pr list --state open
   ```

3. **Bugs asignados en Jira:**
   ```
   mcp__atlassian__jira_search
   - jql: "assignee = currentUser() AND type = Bug AND status != Done"
   ```

---

## Mejores Prácticas

1. **Analizar antes de actuar:** Leer todos los custom fields del bug
2. **Reproducir primero:** No asumir que el bug existe - verificar
3. **Commits atómicos:** Un bug = un commit = un PR
4. **Documentar siempre:** Comentar en Jira con detalles técnicos
5. **Verificar todo:** typecheck, lint, build antes de commit
6. **No over-engineer:** Solo arreglar el bug específico
7. **Notificar stakeholders:** Mencionar al reporter cuando esté listo

---

_Última actualización: 2025-12-28_
_Generado por Claude Code_
