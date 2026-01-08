# Test Documentation

> Crear Test issues en Jira (con o sin Xray) siguiendo el workflow de estados y transiciones.

---

## Propósito

Documentar los tests priorizados en Jira, aplicando el workflow de estados correcto y asegurando trazabilidad.

**Este prompt se ejecuta DESPUÉS de:**

- Test analysis completado
- Tests priorizados con decisión de path (Candidate/Manual)

---

## Pre-requisitos

**Cargar contexto obligatorio:**

```
Leer: .context/guidelines/QA/jira-test-management.md
```

**Herramientas según modalidad:**

- **Jira nativo:** MCP Atlassian
- **Jira + Xray:** MCP Atlassian + Xray CLI (`bun xray`)

---

## Input Requerido

1. **Lista priorizada de tests** - De `test-prioritization.md`
2. **User Story ID relacionada** - Para trazabilidad
3. **Project Key de Jira** - Para crear issues

---

## Workflow Completo

### Fase 0: Determinar Modalidad y Formato

**Preguntas obligatorias si no se conocen:**

```
PREGUNTA 1: ¿Qué herramienta de Test Management utiliza el proyecto?

1. Xray (plugin de Jira) → Usar Xray CLI (`bun xray`) + MCP Atlassian
2. Solo Jira nativo → Usar solo MCP Atlassian con Issue Type "Test"
```

```
PREGUNTA 2: ¿En qué formato deseas documentar los test cases?

1. Gherkin (Given/When/Then) → Recomendado para automatización
2. Steps tradicionales (Paso/Acción/Datos/Resultado) → Formato clásico de QA
```

**Combinaciones válidas:**

| Herramienta | Formato | Cómo se crea                                           |
| ----------- | ------- | ------------------------------------------------------ |
| Xray        | Gherkin | `bun xray test create --type Cucumber --gherkin "..."` |
| Xray        | Steps   | `bun xray test create --step "Action\|Data\|Expected"` |
| Jira nativo | Gherkin | MCP Atlassian con Gherkin en Description               |
| Jira nativo | Steps   | MCP Atlassian con tabla de steps en Description        |

**Verificar autenticación Xray (si aplica):**

```bash
bun xray auth status
```

Si no está autenticado:

```bash
bun xray auth login --client-id "$XRAY_CLIENT_ID" --client-secret "$XRAY_CLIENT_SECRET"
```

---

### Fase 1: Verificar/Crear Épica de Regresión

**OBLIGATORIO antes de crear cualquier test.**

**Buscar épica existente:**

```
Tool: mcp__atlassian__searchJiraIssues

JQL: project = {PROJECT_KEY} AND issuetype = Epic AND (
  summary ~ "regression" OR
  summary ~ "test repository" OR
  labels = "test-repository"
)
```

**Si NO existe épica:**

1. Preguntar al usuario:

   ```
   No encontré una épica de regresión en el proyecto {PROJECT_KEY}.

   ¿Deseas que cree una con el nombre "{PROJECT_KEY} Test Repository"?

   Esta épica será el contenedor de todos los tests de regresión.
   ```

2. Si acepta, crear:

   ```
   Tool: mcp__atlassian__createJiraIssue

   {
     "project": "{PROJECT_KEY}",
     "issueType": "Epic",
     "summary": "{PROJECT_KEY} Test Repository",
     "description": "Épica contenedora de todos los tests de regresión del proyecto.",
     "labels": ["test-repository", "regression", "qa"]
   }
   ```

**Guardar referencia:**

```
REGRESSION_EPIC_KEY = {EPIC-XXX}
```

---

### Fase 2: Crear Tests

#### Modalidad A: Con Xray CLI

**Para cada test priorizado:**

```bash
# Test Manual con steps
bun xray test create \
  --project {PROJECT_KEY} \
  --summary "[{PRIORITY}] {Test Name}" \
  --labels "regression,{test-type},{priority}" \
  --step "{Paso 1}|{Resultado esperado 1}" \
  --step "{Paso 2}|{Datos}|{Resultado esperado 2}"

# Test Cucumber (para automation)
bun xray test create \
  --project {PROJECT_KEY} \
  --type Cucumber \
  --summary "[{PRIORITY}] {Test Name}" \
  --labels "regression,automation-candidate,{test-type}" \
  --gherkin "Feature: {Feature Name}

@{priority} @regression
Scenario: {Scenario Name}
  Given {precondition}
  When {action}
  Then {expected result}"
```

**Ejemplo concreto:**

```bash
# Test de login - Candidato a automatización
bun xray test create \
  --project DEMO \
  --type Cucumber \
  --summary "[Critical] Login exitoso con credenciales válidas" \
  --labels "regression,automation-candidate,e2e,critical" \
  --gherkin "Feature: User Login

@critical @regression @automation-candidate
Scenario: Successful login with valid credentials
  Given I am on the login page
  When I enter email \"user@example.com\"
  And I enter password \"Password123!\"
  And I click the submit button
  Then I should be redirected to the dashboard
  And I should see a welcome message"
```

#### Modalidad B: Solo Jira (sin Xray)

```
Tool: mcp__atlassian__createJiraIssue

{
  "project": "{PROJECT_KEY}",
  "issueType": "Test",
  "summary": "[{PRIORITY}] {Test Name}",
  "description": "{Contenido en Gherkin o formato tradicional}",
  "labels": ["regression", "{test-type}", "{priority}"],
  "parent": "{REGRESSION_EPIC_KEY}"
}
```

**Formato de Description (Gherkin):**

```
h2. Test Case

{code:language=gherkin}
Feature: User Login

@critical @regression
Scenario: Successful login with valid credentials
  Given I am on the login page
  When I enter email "user@example.com"
  And I enter password "Password123!"
  And I click the submit button
  Then I should be redirected to the dashboard
{code}

h2. Metadata

* *Priority:* Critical
* *Test Type:* E2E
* *Automation Status:* Candidate
* *Related Story:* STORY-XXX
```

---

### Fase 3: Vincular a User Story

**Después de crear cada Test:**

```
Tool: mcp__atlassian__updateJiraIssue

Agregar link:
- Type: "is tested by" / "tests"
- Outward: Test issue
- Inward: User Story
```

**O agregar comentario en la US:**

```
Tool: mcp__atlassian__addCommentToJiraIssue

Issue: {STORY-XXX}
Comment: "Test case documentado: [{TEST-XXX}] - {Test Name}"
```

---

### Fase 4: Transitar Estados del Workflow

**Secuencia de transiciones por cada test:**

```
1. Test creado → Status: DRAFT (automático al crear)

2. Iniciar documentación:
   Tool: mcp__atlassian__transitionJiraIssue
   Transition: "start design"
   → Status: IN DESIGN

3. Completar documentación:
   Tool: mcp__atlassian__transitionJiraIssue
   Transition: "ready to run"
   → Status: READY

4. Decidir path según priorización:

   SI (Path = Candidate):
     Tool: mcp__atlassian__transitionJiraIssue
     Transition: "automation review"
     → Status: IN REVIEW

     Luego (si ROI confirmado):
     Transition: "approve to automate"
     → Status: CANDIDATE

   SI (Path = Manual):
     Tool: mcp__atlassian__transitionJiraIssue
     Transition: "for manual"
     → Status: MANUAL
```

**Flujo visual:**

```
[Crear Test]
     │
     ▼
  DRAFT ──"start design"──► IN DESIGN ──"ready to run"──► READY
                                                            │
                                    ┌───────────────────────┴───────────────────────┐
                                    │                                               │
                            "for manual"                                "automation review"
                                    │                                               │
                                    ▼                                               ▼
                                 MANUAL                                         IN REVIEW
                                                                                    │
                                                                        "approve to automate"
                                                                                    │
                                                                                    ▼
                                                                               CANDIDATE
                                                                                    │
                                                                        (Fase 12 continúa)
```

---

### Fase 5: Resumen y Confirmación

**Generar reporte final:**

```markdown
# Test Documentation Complete

**Proyecto:** {PROJECT_KEY}
**Épica de Regresión:** {REGRESSION_EPIC_KEY}
**User Story:** {STORY-XXX}
**Fecha:** {Date}

---

## Tests Creados

| Test ID  | Nombre                 | Tipo       | Status Final | Path     |
| -------- | ---------------------- | ---------- | ------------ | -------- |
| TEST-001 | Login exitoso          | E2E        | Candidate    | Automate |
| TEST-002 | Validación password    | Functional | Candidate    | Automate |
| TEST-003 | Visual alignment check | Manual     | Manual       | Manual   |

---

## Resumen

| Métrica               | Valor |
| --------------------- | ----- |
| Tests creados         | [N]   |
| Automation Candidates | [N]   |
| Manual Only           | [N]   |
| Vinculados a US       | [N]   |

---

## Trazabilidad
```

STORY-XXX: {Story Summary}
├── TEST-001: Login exitoso [Candidate]
├── TEST-002: Validación password [Candidate]
└── TEST-003: Visual alignment [Manual]

```

---

## Próximos Pasos

### Para Candidates (Automation):
Los siguientes tests están listos para **Fase 12: Test Automation**:
- TEST-001 (E2E)
- TEST-002 (Functional)

### Para Manual:
Los siguientes tests entran en la **Regresión Manual**:
- TEST-003

---

¿Deseas proceder a Fase 12 con los candidates identificados?
```

---

### Fase 6: Documentar Localmente (Caché)

**OBLIGATORIO:** Crear archivos markdown locales como caché de los tests documentados.

**Propósito:**

- Evitar re-leer Jira/Xray en futuras sesiones
- Proveer contexto inmediato para Fase 12 (Automation)
- Mantener trazabilidad local ↔ Jira

**Estructura de directorio:**

```
.context/PBI/epics/EPIC-XXX-{nombre}/stories/STORY-YYY-{nombre}/
├── story.md                    # (existente)
├── test-cases.md               # (existente - de Fase 5)
├── implementation-plan.md      # (existente)
└── tests/                      # ← NUEVO directorio
    ├── {TEST-ID}-{nombre}.md
    └── ...
```

**Template de archivo (uno por test):**

```markdown
# {TEST-ID}: {Test Name}

**Jira:** [{TEST-ID}]({JIRA_URL}/browse/{TEST-ID})
**Status:** {CANDIDATE | MANUAL}
**Type:** {E2E | Integration | Functional | Smoke}
**Related Story:** {STORY-XXX}
**ROI Score:** {X.X}

---

## Diseño del Test

{Contenido del test según el formato elegido: Gherkin o Steps tradicionales}
```

**Ejemplo con formato Gherkin:**

```markdown
# GX-101-TC1: Validar login exitoso con credenciales válidas

**Jira:** [GX-101-TC1](https://company.atlassian.net/browse/GX-101-TC1)
**Status:** CANDIDATE
**Type:** Functional
**Related Story:** GX-100
**ROI Score:** 12.5

---

## Diseño del Test

Feature: User Login

@critical @regression
Scenario: Successful login with valid credentials
Given I am on the login page
When I enter email "user@example.com"
And I enter password "Password123!"
And I click the submit button
Then I should be redirected to the dashboard
```

**Ejemplo con formato Steps tradicional:**

```markdown
# GX-101-TC2: Validar error al ingresar password incorrecto

**Jira:** [GX-101-TC2](https://company.atlassian.net/browse/GX-101-TC2)
**Status:** MANUAL
**Type:** Functional
**Related Story:** GX-100
**ROI Score:** 0.8

---

## Diseño del Test

| Paso | Acción                     | Datos            | Resultado Esperado          |
| ---- | -------------------------- | ---------------- | --------------------------- |
| 1    | Navegar a /login           | -                | Formulario de login visible |
| 2    | Ingresar email válido      | user@example.com | Campo poblado               |
| 3    | Ingresar password inválido | wrongpass        | Campo enmascarado           |
| 4    | Click en Submit            | -                | Mensaje de error visible    |
```

---

## Referencia de Comandos Xray CLI

### Crear Tests

```bash
# Manual con steps
bun xray test create --project PROJ --summary "Test name" \
  --step "Action|Expected" \
  --step "Action|Data|Expected"

# Cucumber
bun xray test create --project PROJ --type Cucumber \
  --summary "Feature name" \
  --gherkin "Feature: X\n  Scenario: Y\n    Given Z"

# Generic (para scripts)
bun xray test create --project PROJ --type Generic \
  --summary "Automation script" \
  --definition "path/to/script.ts"
```

### Listar y Consultar

```bash
# Listar tests
bun xray test list --project PROJ --limit 50

# Ver detalles
bun xray test get PROJ-123

# Agregar step a test existente
bun xray test add-step --test {issueId} \
  --action "Step action" \
  --data "Test data" \
  --result "Expected result"
```

### Test Executions (para regresión)

```bash
# Crear ejecución
bun xray exec create --project PROJ --summary "Sprint X Regression" \
  --tests "123,456,789"

# Agregar tests a ejecución existente
bun xray exec add-tests --execution {execId} --tests "123,456"
```

---

## Nomenclatura de Test Cases

**OBLIGATORIO:** Seguir la convención estándar de nomenclatura para test cases formales en Jira/Xray.

### Formato según Herramienta

| Herramienta     | Formato                                      |
| --------------- | -------------------------------------------- |
| **Xray**        | `<TS_ID>: TC#: Validar <CORE> <CONDITIONAL>` |
| **Jira nativo** | `<US_ID>: TC#: Validar <CORE> <CONDITIONAL>` |

### Definición de Componentes

| Componente    | Qué es                                                                 | Ejemplos                                                                         |
| ------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `TS_ID`       | **Test Set ID** - ID del Test Set en Xray (solo si usa Xray)           | `GX-150` (donde GX-150 es un Test Set)                                           |
| `US_ID`       | **User Story ID** - ID de la US relacionada (si usa Jira nativo)       | `GX-101` (donde GX-101 es una User Story)                                        |
| `TC#`         | Número secuencial del test case                                        | `TC1`, `TC2`, `TC3`...                                                           |
| `CORE`        | **El comportamiento principal** que se está validando (verbo + objeto) | `login exitoso`, `error de validación`, `creación de usuario`                    |
| `CONDITIONAL` | **La condición o contexto** que hace único este escenario              | `con credenciales válidas`, `cuando el campo está vacío`, `al exceder el límite` |

### Fórmula Mental

```
"[ID]: TC#: Validar [QUÉ comportamiento] [BAJO QUÉ condición]"
```

### Ejemplos por Tipo de Test

| Tipo     | CORE                         | CONDITIONAL                          | Título Completo                                                                      |
| -------- | ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| Positive | `login exitoso`              | `con credenciales válidas`           | `GX-101: TC1: Validar login exitoso con credenciales válidas`                        |
| Negative | `error de autenticación`     | `cuando el password es incorrecto`   | `GX-101: TC2: Validar error de autenticación cuando el password es incorrecto`       |
| Boundary | `límite de caracteres`       | `al ingresar exactamente 50 chars`   | `GX-101: TC3: Validar límite de caracteres al ingresar exactamente 50 chars`         |
| Edge     | `comportamiento del carrito` | `cuando hay múltiples ítems iguales` | `GX-101: TC4: Validar comportamiento del carrito cuando hay múltiples ítems iguales` |

### Anti-patrones (evitar)

| ❌ Incorrecto            | ✅ Correcto                                                         | Por qué                           |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| `Test de login`          | `GX-101: TC1: Validar login exitoso con credenciales válidas`       | Falta ID, TC#, CORE y CONDITIONAL |
| `Login - error`          | `GX-101: TC2: Validar error de autenticación con password inválido` | Demasiado vago                    |
| `TC1: Probar formulario` | `GX-101: TC1: Validar envío de formulario con todos los campos`     | Falta ID, CORE no es específico   |

### Para Proyectos en Inglés

```
[Should] [Feature-Expected-Behavior] [Condition(If/When/With/At)]
```

| Tipo     | Título                                                    |
| -------- | --------------------------------------------------------- |
| Positive | Should login successfully with valid credentials          |
| Negative | Should display error message when password is incorrect   |
| Boundary | Should accept exactly 50 characters in name field         |
| Edge     | Should calculate total correctly with multiple same items |

**Referencia completa:** `.context/guidelines/QA/jira-test-management.md` → Sección "Nomenclatura de Tickets en Jira"

---

## Labels Estándar

| Label                            | Uso                          |
| -------------------------------- | ---------------------------- |
| `regression`                     | Todos los tests de regresión |
| `smoke`                          | Tests de humo (críticos)     |
| `e2e`                            | End-to-end tests             |
| `integration`                    | Tests de integración API     |
| `functional`                     | Tests funcionales unitarios  |
| `automation-candidate`           | Marcado para automatizar     |
| `manual-only`                    | No automatizable             |
| `critical`/`high`/`medium`/`low` | Prioridad                    |

---

## Errores Comunes

| Error                       | Solución                          |
| --------------------------- | --------------------------------- |
| "Not logged in"             | Ejecutar `bun xray auth login`    |
| "Issue type Test not found" | Verificar que Xray está instalado |
| "Epic not found"            | Crear épica de regresión primero  |
| "Transition not allowed"    | Verificar status actual del issue |

---

## Output

### Si se usa Xray CLI (`bun xray`):

- Tests creados en Jira con Issue Type "Test" de Xray
- Steps estructurados (si formato Steps) o Gherkin embebido (si formato Cucumber)
- Tests vinculados a User Story
- Tests dentro de Épica de Regresión
- Estados transitados según workflow

### Si se usa solo Jira nativo (MCP Atlassian):

- Tests creados en Jira con Issue Type "Test" (custom)
- Contenido en Description (Gherkin o tabla de Steps)
- Tests vinculados a User Story
- Tests dentro de Épica de Regresión
- Estados transitados según workflow

### Output Local (Caché):

- Directorio `tests/` en carpeta de la story
- Un archivo `.md` por cada test documentado
- Formato según lo elegido (Gherkin o Steps)

### Para siguientes fases:

- Tests con status **CANDIDATE** → Listos para Fase 12 (Automation)
- Tests con status **MANUAL** → Suite de regresión manual
