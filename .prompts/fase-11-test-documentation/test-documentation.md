# Test Documentation

> Crear Test issues en Jira (con o sin Xray) siguiendo el workflow de estados y transiciones.

---

## Propósito

Documentar en Jira los tests que pasaron el filtro de priorización para mantenerlos en regresión.

**⚠️ CONTEXTO CRÍTICO:**

- La User Story está en estado **QA Approved**
- Los tests que documentamos aquí **YA PASARON** durante exploratory testing
- **NO estamos diseñando tests nuevos**, estamos formalizando tests ya validados
- Solo documentamos los tests que pasaron el filtro estricto de priorización

**Este prompt se ejecuta DESPUÉS de:**

- Test analysis completado
- Tests priorizados con filtro estricto (Fase 0 + ROI)
- Decisión de path (Candidate/Manual/Deferred) por cada test

---

## Pre-requisitos

**Cargar contexto obligatorio:**

```
Leer: .context/guidelines/QA/jira-test-management.md
```

**Herramientas según modalidad:**

- **Jira nativo:** MCP Atlassian
- **Jira + Xray:** MCP Atlassian + Xray CLI (`bun xray`)

**Xray CLI - Documentación y Configuración:**

```
Archivo: scripts/xray.ts
```

El CLI de Xray es self-documented. **OBLIGATORIO leerlo** antes de usar para:

- Conocer comandos disponibles y sus opciones
- Verificar variables de entorno requeridas (`XRAY_CLIENT_ID`, `XRAY_CLIENT_SECRET`)
- Entender el formato de output de cada comando

---

## Input Requerido

1. **Lista priorizada de tests** - De `test-prioritization.md` (solo los que pasaron filtro)
2. **User Story ID relacionada** - Para trazabilidad
3. **Project Key de Jira** - Para crear issues
4. **Nomenclatura existente** - Usar nombres de tests del acceptance-test-plan.md o session notes

---

## Preservar Nomenclatura

**⚠️ OBLIGATORIO:** Usar la MISMA nomenclatura que se usó en fases anteriores.

**Fuentes de nomenclatura (en orden de prioridad):**

1. **Test Prioritization Report** → Nombres finales con formato `Validar <CORE> <CONDITIONAL>`
2. **Acceptance Test Plan** → `.context/PBI/epics/.../stories/.../acceptance-test-plan.md`
3. **Session Notes** → Notas de exploratory testing

**Ejemplo de trazabilidad:**

```
Shift-Left (Fase 5):
  → "Validar visualización de reviews cuando el mentor tiene múltiples reseñas"

Test Analysis (Fase 11):
  → "Validar visualización de reviews cuando el mentor tiene múltiples reseñas" (mismo)

Test Prioritization (Fase 11):
  → "Validar visualización de reviews cuando el mentor tiene múltiples reseñas" (mismo)

Test Documentation (Fase 11):
  → "MYM-35: TC1: Validar visualización de reviews cuando el mentor tiene múltiples reseñas"
```

El único cambio es agregar el prefijo `{US_ID}: TC#:` al documentar en Jira.

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

### Fase 2: Validación contra Código Fuente

**⚠️ CRÍTICO:** Antes de documentar cualquier test, validar que el diseño coincida con la implementación real.

**Por qué es necesario:**

- Los tests priorizados vienen del Acceptance Test Plan (Fase 5), que se escribió ANTES de la implementación
- El código real puede diferir del plan original
- Detectar discrepancias AHORA evita tests inválidos en automatización

#### 2.1 Localizar Plan de Implementación (Fuente Primaria)

**PRIMERO: Buscar el plan de implementación de la User Story:**

```
Ruta: .context/PBI/epics/EPIC-{PROJECT}-{NUM}-{nombre}/stories/STORY-{US_ID}-{nombre}/implementation-plan.md
```

**Del plan de implementación extraer:**

- Archivos creados/modificados (lista de rutas)
- Arquitectura decidida (SSR vs API vs Client)
- Componentes principales
- Decisiones técnicas relevantes

**SI no existe plan de implementación:**

- Documentar: "No existe plan de implementación, validando directamente desde código"
- Proceder a búsqueda directa en código fuente

#### 2.2 Validar contra Código Fuente (Fuente de Verdad)

**DESPUÉS: Validar que el plan coincida con la implementación real:**

1. Verificar que los archivos listados en el plan existen
2. Buscar archivos adicionales no mencionados en el plan
3. Leer componentes para extraer información crítica

**Archivos a buscar:**

- Páginas: `src/app/**/page.tsx`
- Componentes: `src/components/**/*.tsx`
- APIs (si existen): `src/app/api/**/*.ts`
- Servicios/libs: `src/lib/`, `src/services/`
- Tipos: `src/types/`

#### 2.3 Extraer Información Crítica

| Información          | Por qué es importante               | Cómo obtenerla                                     |
| -------------------- | ----------------------------------- | -------------------------------------------------- |
| **Arquitectura**     | Saber si es SSR, API, o Client-side | Leer page.tsx, buscar `fetch`, `use client`, hooks |
| **Test IDs**         | Para automatización E2E             | `grep -r "data-testid=" src/components/`           |
| **Formatos de UI**   | Validar expected results exactos    | Leer JSX de componentes                            |
| **Validaciones**     | Confirmar reglas de negocio         | Leer lógica de componentes                         |
| **Database queries** | Para sección de variables           | Leer queries en pages/services                     |

#### 2.4 Checklist de Validación

**Para cada test case, verificar:**

- [ ] ¿Los endpoints/APIs mencionados existen?
- [ ] ¿Los formatos de texto coinciden con la UI real?
- [ ] ¿Los test-ids están disponibles en el código?
- [ ] ¿La arquitectura es correcta (SSR/API/Client)?
- [ ] ¿Las queries para obtener datos funcionan?

#### 2.5 Documentar Discrepancias

**Si se encuentran diferencias entre el diseño original y la implementación:**

1. Corregir el diseño del test case
2. Añadir sección "Notas de Refinamiento" al test:

```markdown
h2. Notas de Refinamiento

_Refinado:_ {fecha}
_Motivo:_ Validación pre-documentación
_Cambios:_

- {Cambio 1}
- {Cambio 2}
```

**Ejemplos de discrepancias comunes:**

- API `/api/reviews` → No existe, se usa SSR con Supabase directo
- Formato "based on N reviews" → UI real muestra "(N reviews)"
- UUID hardcodeado → Debe ser variable `{mentor_id}`

#### 2.6 Output de esta Fase

Documentar para cada test:

```markdown
## Código de Implementación

| Archivo                                    | Propósito              |
| ------------------------------------------ | ---------------------- |
| src/app/(main)/mentors/[id]/page.tsx       | Página principal (SSR) |
| src/components/reviews/reviews-section.tsx | Contenedor de reviews  |
| src/components/reviews/rating-display.tsx  | Rating promedio        |

## Arquitectura

- **Data Fetching:** {SSR via Supabase | API REST | Client-side}
- **Componente principal:** {ComponentName}
- **Validaciones:** {Descripción}

## Test IDs Disponibles
```

data-testid="component-name"
data-testid="otro-component"

```

```

---

### Fase 3: Crear Tests

#### Modalidad A: Con Xray CLI

**⚠️ IMPORTANTE:** Xray requiere 2 pasos para documentación completa:

1. **Paso 1:** Crear el Test con Xray CLI (registra en Xray)
2. **Paso 2:** Actualizar Description del issue con template completo (backup + contexto)

##### Paso 1: Crear Test en Xray

**Para cada test priorizado:**

```bash
# Test Manual con steps
bun xray test create \
  --project {PROJECT_KEY} \
  --summary "[{PRIORITY}] {Test Name}" \
  --labels "regression,{test-type},{priority}" \
  --step "{Paso 1}|{Resultado esperado 1}" \
  --step "{Paso 2}|{Datos}|{Resultado esperado 2}"

# Test Cucumber (para automation) - Ver formato Gherkin de alta calidad abajo
bun xray test create \
  --project {PROJECT_KEY} \
  --type Cucumber \
  --summary "[{PRIORITY}] {Test Name}" \
  --labels "regression,automation-candidate,{test-type}" \
  --gherkin "{GHERKIN_DE_ALTA_CALIDAD}"
```

**Guardar el TEST_KEY retornado por Xray CLI** para el siguiente paso.

##### Formato Gherkin de Alta Calidad para Xray

**⚠️ OBLIGATORIO:** El Gherkin de Xray debe ser completo y de alta calidad:

```gherkin
Feature: {Feature Name}

  Background:
    # Contexto común para todos los escenarios de esta feature
    Given {contexto_comun_si_aplica}

  @{priority} @regression @automation-candidate @{test-id}
  Scenario Outline: {Scenario Name con <variable>}
    """
    Bugs cubiertos: {BUG-ID1}, {BUG-ID2}
    Related Story: {US_ID}
    """

    # === PRECONDICIONES (Variables - el tester/script las construye) ===
    Given existe un <entidad> con <identificador> en la base de datos
    And <entidad> tiene <cantidad> <elementos> donde <cantidad> <condicion>
    And el usuario <estado_autenticacion>

    # === ACCIÓN ===
    When el usuario navega a "<ruta>"
    And el usuario <accion_principal>

    # === VALIDACIONES ===
    Then se muestra <elemento_ui> con formato "<formato_esperado>"
    And <validacion_adicional>

    # === PARTICIONES EQUIVALENTES ===
    Examples: Caso con datos válidos (Happy Path)
      | entidad | identificador | cantidad | elementos | condicion | estado_autenticacion | ruta | accion_principal | elemento_ui | formato_esperado | validacion_adicional |
      | mentor verificado | {mentor_id} | {N} | reviews | > 0 | NO está autenticado | /mentors/{mentor_id} | espera carga completa | rating display | "{promedio}/5.0" | histograma visible |

    Examples: Caso sin datos (Edge Case)
      | entidad | identificador | cantidad | elementos | condicion | estado_autenticacion | ruta | accion_principal | elemento_ui | formato_esperado | validacion_adicional |
      | mentor verificado | {mentor_id} | 0 | reviews | = 0 | NO está autenticado | /mentors/{mentor_id} | espera carga completa | empty state | "No reviews yet" | histograma oculto |

    Examples: Caso singular vs plural
      | entidad | identificador | cantidad | elementos | condicion | estado_autenticacion | ruta | accion_principal | elemento_ui | formato_esperado | validacion_adicional |
      | mentor verificado | {mentor_id} | 1 | review | = 1 | NO está autenticado | /mentors/{mentor_id} | espera carga completa | conteo | "(1 review)" | sin "s" |
      | mentor verificado | {mentor_id} | 5 | reviews | > 1 | NO está autenticado | /mentors/{mentor_id} | espera carga completa | conteo | "(5 reviews)" | con "s" |
```

**Elementos clave del Gherkin de alta calidad:**

| Elemento              | Propósito                       | Ejemplo                                       |
| --------------------- | ------------------------------- | --------------------------------------------- |
| `Background`          | Contexto común reutilizable     | `Given el sistema está en estado inicial`     |
| `Scenario Outline`    | Parametrización con Examples    | Permite iterar múltiples casos                |
| `Examples` con nombre | Particiones equivalentes claras | `Examples: Happy Path`, `Examples: Edge Case` |
| `<variables>`         | Placeholders para datos         | `<mentor_id>`, `<cantidad>`, `<formato>`      |
| Comentarios `# ===`   | Estructura visual clara         | `# === PRECONDICIONES ===`                    |
| Docstring `"""`       | Metadata del test               | Bugs cubiertos, Story relacionada             |
| Tags múltiples        | Categorización y filtrado       | `@critical @regression @MYM-35`               |

**Cuándo usar cada tipo:**

| Tipo                            | Usar cuando...                                    |
| ------------------------------- | ------------------------------------------------- |
| `Scenario` simple               | Solo hay 1 caso, sin variaciones                  |
| `Scenario Outline` + `Examples` | Hay múltiples particiones equivalentes que probar |
| `Background`                    | Varios scenarios comparten precondiciones         |

##### Paso 2: Actualizar Description con Template Completo

**OBLIGATORIO después de crear cada test en Xray:**

```
Tool: mcp__atlassian__jira_update_issue

{
  "issue_key": "{TEST_KEY}",
  "fields": {
    "description": "{GHERKIN_DE_XRAY + TEMPLATE_ADICIONAL}"
  }
}
```

**La Description de Jira contiene:**

1. **Copia del Gherkin de Xray** (el mismo que se pasó a `--gherkin`)
2. **Secciones adicionales del template:** Variables, Código de Implementación, Arquitectura, Test IDs, etc.

**Usar el "Formato de Description - Template Completo" documentado en Modalidad B.**

##### Ejemplo concreto (ambos pasos):

```bash
# Paso 1: Crear en Xray con Gherkin de alta calidad
bun xray test create \
  --project MYM \
  --type Cucumber \
  --summary "[Critical] MYM-35: TC1: Validar visualización de reviews y rating promedio" \
  --labels "regression,automation-candidate,e2e,critical" \
  --gherkin "Feature: Visualización de Reviews en Perfil de Mentor

  @critical @regression @automation-candidate @MYM-35-TC1
  Scenario Outline: Usuario visualiza perfil de mentor con reviews y rating promedio
    \"\"\"
    Bugs cubiertos: MYM-99, MYM-100
    Related Story: MYM-35
    \"\"\"

    # === PRECONDICIONES ===
    Given existe un mentor verificado con <mentor_id> en la base de datos
    And el mentor tiene <N> reviews donde <N> <condicion>
    And el rating promedio es <promedio>
    And el usuario NO está autenticado

    # === ACCIÓN ===
    When el usuario navega a \"/mentors/<mentor_id>\"
    And la página completa su carga

    # === VALIDACIONES ===
    Then el rating display muestra \"<promedio>/5.0\"
    And el conteo muestra \"<formato_conteo>\"
    And el histograma de distribución es <estado_histograma>

    Examples: Con múltiples reviews (Happy Path)
      | mentor_id | N | condicion | promedio | formato_conteo | estado_histograma |
      | {mentor_id} | {N} | > 1 | {promedio} | ({N} reviews) | visible con 5 barras |

    Examples: Con una sola review (Singular)
      | mentor_id | N | condicion | promedio | formato_conteo | estado_histograma |
      | {mentor_id} | 1 | = 1 | {promedio} | (1 review) | visible con 5 barras |

    Examples: Sin reviews (Edge Case)
      | mentor_id | N | condicion | promedio | formato_conteo | estado_histograma |
      | {mentor_id} | 0 | = 0 | N/A | Sin reviews | oculto |"

# Output: Created test MYM-138
```

```
# Paso 2: Actualizar Description con Gherkin + Template
Tool: mcp__atlassian__jira_update_issue

{
  "issue_key": "MYM-138",
  "fields": {
    "description": "h2. Test Case Information\n\n_Related Story:_ MYM-35\n_Type:_ E2E\n...\n\nh2. Diseño del Test\n\n{code:language=gherkin}\n[COPIA DEL GHERKIN DE ARRIBA]\n{code}\n\nh2. Variables del Test Case\n\n|| Variable || Descripción || Cómo obtenerla ||\n| {mentor_id} | UUID mentor verificado | SELECT id FROM profiles WHERE role='mentor' LIMIT 1 |\n...\n\nh2. Código de Implementación\n\n|| Archivo || Propósito ||\n| src/app/(main)/mentors/[id]/page.tsx | Página principal |\n..."
  }
}
```

---

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

**Formato de Description (Gherkin) - Template Completo:**

```
h2. Test Case Information

_Related Story:_ {US_ID}
_Type:_ {E2E | Functional | Integration}
_Priority:_ {Critical | High | Medium | Low}
_Status:_ Candidate (para automatización)
_ROI Score:_ {X.X}

h2. Bugs Previos Cubiertos

* {BUG-ID}: {Descripción del bug corregido}

h2. Diseño del Test (Patrón de Variables)

{code:language=gherkin}
Feature: {Feature Name}

  @{priority} @regression @automation-candidate
  Scenario: {Scenario Name}

    # === PRECONDICIONES (Variables - el tester las construye) ===
    Given {precondición con {variable_1}}
    And {precondición con {variable_2}}

    # === ACCIÓN ===
    When {acción del usuario}

    # === VALIDACIONES ===
    Then {validación 1}
    And {validación 2}
{code}

h2. Variables del Test Case

|| Variable || Descripción || Cómo obtenerla ||
| {variable_1} | Descripción | Query SQL o instrucción |
| {variable_2} | Descripción | Query SQL o instrucción |

h2. Código de Implementación

|| Archivo || Propósito ||
| src/app/.../page.tsx | Página principal |
| src/components/... | Componente de UI |

h2. Arquitectura

* *Data Fetching:* {SSR via Supabase | API REST | Client-side fetch}
* *Componente principal:* {ComponentName}

h2. Test IDs Disponibles para Automatización

{code}
data-testid="component-1"
data-testid="component-2"
{code}

h2. Precondiciones

* {Precondición 1}
* {Precondición 2}

h2. Expected Results

* *UI:* {Descripción de lo que se espera ver}
* *Data:* {Cómo se cargan los datos}
* *Database:* {Cambios esperados en DB, si aplica}

h2. Notas de Refinamiento

_Refinado:_ {fecha}
_Motivo:_ Validación pre-automatización
_Cambios:_
* {Cambio realizado}
```

---

### Fase 4: Vincular a User Story

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

### Fase 5: Transitar Estados del Workflow

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

### Fase 6: Resumen y Confirmación

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

### Fase 7: Documentar Localmente (Caché)

**OBLIGATORIO:** Crear archivos markdown locales como caché de los tests documentados.

**Propósito:**

- Evitar re-leer Jira/Xray en futuras sesiones
- Proveer contexto inmediato para Fase 12 (Automation)
- Mantener trazabilidad local ↔ Jira

**Estructura de directorio:**

```
.context/PBI/epics/EPIC-XXX-{nombre}/stories/STORY-YYY-{nombre}/
├── story.md                    # (existente)
├── acceptance-test-plan.md               # (existente - de Fase 5)
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

## Código de Implementación

| Archivo              | Propósito         |
| -------------------- | ----------------- |
| src/app/.../page.tsx | Página principal  |
| src/components/...   | Componentes de UI |

## Arquitectura

- **Data Fetching:** {SSR via Supabase | API REST | Client-side}
- **Componente principal:** {ComponentName}

## Test IDs Disponibles
```

data-testid="component-1"
data-testid="component-2"

```

---

## Variables del Test Case

| Variable | Descripción | Cómo obtenerla |
|----------|-------------|----------------|
| {var_1} | Descripción | Query SQL |
| {var_2} | Descripción | Query SQL |

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

## Patrón de Variables para Test Data

**⚠️ CRÍTICO:** Los test cases NO deben contener datos hardcodeados de la aplicación real.

### Principio Fundamental

Un test case se ejecuta **repetidamente a lo largo de la vida del proyecto**. Los datos de producción/staging **cambian, iteran, se destruyen**. Por tanto:

- ❌ **NO usar valores reales específicos** (UUIDs, IDs, emails de usuarios reales)
- ✅ **Usar variables/placeholders** que describan el TIPO de dato requerido
- ✅ **El tester construye las precondiciones** buscando o creando los datos necesarios

### Cuándo SÍ usar datos específicos

Solo cuando el **criterio de aceptación** define un valor explícito ligado a una regla de negocio:

```gherkin
# ✅ CORRECTO - La regla de negocio define el límite
Then el campo debe aceptar máximo 500 caracteres

# ✅ CORRECTO - El formato es parte del requerimiento
Then el rating se muestra en formato "X.X/5.0"
```

### Formato de Variables

Usar llaves `{variable}` para indicar datos parametrizables:

| Variable      | Descripción                  | Cómo la obtiene el tester                                          |
| ------------- | ---------------------------- | ------------------------------------------------------------------ |
| `{user_id}`   | UUID de un usuario existente | Consultar DB o crear usuario de prueba                             |
| `{mentor_id}` | UUID de un mentor verificado | `SELECT id FROM profiles WHERE role='mentor' AND is_verified=true` |
| `{N}`         | Cantidad de elementos        | Contar en DB o definir en setup                                    |
| `{promedio}`  | Valor calculado              | Se deriva de los datos del setup                                   |

### Ejemplo: Antes vs Después

**❌ INCORRECTO (datos hardcodeados):**

```gherkin
Given a mentor exists with user_id "550e8400-e29b-41d4-a716-446655440000"
And the mentor has 23 reviews with average rating 4.7/5.0
And rating distribution is: 15 five-star, 5 four-star, 2 three-star, 0 two-star, 1 one-star
```

**✅ CORRECTO (patrón de variables):**

```gherkin
Given existe un mentor verificado con {mentor_id} en la base de datos
And el mentor tiene {N} reviews donde {N} > 0
And cada review tiene un rating entre 1 y 5 estrellas
And el rating promedio {promedio} = suma de ratings / {N}
And la distribución de ratings es calculable desde los {N} reviews
```

### Particiones Equivalentes

Cuando una regla de negocio acepta un **rango de valores**, documentar la partición, no un valor específico:

| Partición           | Clase               | Ejemplo de dato                        |
| ------------------- | ------------------- | -------------------------------------- |
| Cantidad de reviews | N > 0 (con reviews) | Cualquier mentor con al menos 1 review |
| Cantidad de reviews | N = 0 (sin reviews) | Mentor nuevo sin reviews               |
| Rating promedio     | 1.0 ≤ X ≤ 5.0       | El promedio calculado                  |
| Pluralización       | N = 1 (singular)    | "1 review"                             |
| Pluralización       | N > 1 (plural)      | "N reviews"                            |

### Sección de Variables en el Test Case

**OBLIGATORIO:** Incluir una tabla de variables con queries para obtenerlas:

```markdown
## Variables del Test Case

| Variable    | Descripción               | Cómo obtenerla                                                             |
| ----------- | ------------------------- | -------------------------------------------------------------------------- |
| {mentor_id} | UUID de mentor verificado | `SELECT id FROM profiles WHERE role='mentor' AND is_verified=true LIMIT 1` |
| {N}         | Cantidad de reviews       | `SELECT COUNT(*) FROM reviews WHERE subject_id = {mentor_id}`              |
| {promedio}  | Rating promedio           | `SELECT AVG(rating) FROM reviews WHERE subject_id = {mentor_id}`           |
```

### Notas para el Tester

Incluir siempre una sección que explique cómo construir las precondiciones:

```gherkin
# === NOTAS PARA EL TESTER ===
# - {mentor_id}: Consultar en DB un mentor con is_verified=true y role='mentor'
# - {N}: Contar reviews existentes para ese mentor donde is_hidden=false
# - {promedio}: Se calcula automáticamente, validar contra DB o UI
# - Si no hay data suficiente, crear precondiciones insertando datos de prueba
```

### Beneficios de Este Patrón

1. **Durabilidad:** El test case no necesita actualizarse cuando cambia la data
2. **Portabilidad:** Funciona en cualquier ambiente (local, staging, QA)
3. **Claridad:** El tester entiende QUÉ necesita, no depende de un valor mágico
4. **Automatización:** El script puede parametrizar los valores dinámicamente

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
