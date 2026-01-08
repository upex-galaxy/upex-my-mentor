<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Test Documentation - Manual

> **Fase:** 11 - Test Documentation
> **Tiempo estimado:** 60-90 minutos
> **Herramientas:** Jira, Xray (opcional), CLI de Xray

---

## Objetivo

Documentar casos de prueba validados en Jira **DESPUÉS** de que la funcionalidad ha pasado exploratory testing. Esta fase asegura:

- Trazabilidad entre requirements y tests
- Decisiones de automatización basadas en ROI
- Suite de regresión (manual y automatizada) actualizada

**¿Por qué esta fase viene después de exploratory testing?**

- Las features se validan primero (feedback rápido)
- La documentación ocurre cuando la feature es estable
- Los tests se documentan para regresión futura

---

## Conceptos Clave

### 🔑 Workflow de Test

```
DRAFT → IN DESIGN → READY → [MANUAL | IN REVIEW → CANDIDATE → AUTOMATED]

┌─────────┐    ┌───────────┐    ┌───────┐
│  DRAFT  │───►│ IN DESIGN │───►│ READY │
└─────────┘    └───────────┘    └───┬───┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
              ┌──────────┐                   ┌───────────┐
              │  MANUAL  │                   │ IN REVIEW │
              └──────────┘                   └─────┬─────┘
                                                   │
                                                   ▼
                                             ┌───────────┐
                                             │ CANDIDATE │
                                             └─────┬─────┘
                                                   │ (Fase 12)
                                                   ▼
                                             ┌───────────┐
                                             │ AUTOMATED │
                                             └───────────┘
```

### 🔑 Épica de Regresión

**OBLIGATORIO:** Todos los tests deben pertenecer a una épica de regresión.

```
Proyecto: DEMO
│
└── Epic: "DEMO Test Repository"
    ├── Test: Login exitoso [CANDIDATE]
    ├── Test: Validación password [CANDIDATE]
    ├── Test: Checkout completo [CANDIDATE]
    └── Test: Visual alignment [MANUAL]
```

### 🔑 Fórmula ROI

```
ROI = (Frecuencia × Impacto × Estabilidad) / (Esfuerzo × Dependencias)
```

| Factor       | Descripción                   | Escala 1-5                |
| ------------ | ----------------------------- | ------------------------- |
| Frecuencia   | ¿Cada cuánto se ejecutará?    | 5=Cada PR, 1=Ocasional    |
| Impacto      | ¿Qué tan grave si falla?      | 5=Revenue, 1=Cosmético    |
| Estabilidad  | ¿Qué tan estable es el flujo? | 5=Nunca cambia, 1=Volátil |
| Esfuerzo     | ¿Cuánto cuesta automatizar?   | 1=Trivial, 5=Semana+      |
| Dependencias | ¿Cuántas integraciones?       | 1=Ninguna, 5=Muchas       |

### 🔑 Clasificación por Tipo

| Tipo            | Descripción                 | Ejemplo                       |
| --------------- | --------------------------- | ----------------------------- |
| **E2E**         | Flujo completo de usuario   | Login → Compra → Confirmación |
| **Integration** | Comunicación entre sistemas | API Auth → API Productos      |
| **Functional**  | Funcionalidad aislada       | Validación de formulario      |
| **Smoke**       | Verificación básica         | App carga, login funciona     |

---

## Pre-requisitos

- [ ] **US status: "QA Approved"** - Exploratory testing pasado
- [ ] **Session notes documentadas** - Con escenarios validados
- [ ] **Acceso a Jira** - Permisos para crear issues
- [ ] **Guidelines leídas** - `.context/guidelines/QA/jira-test-management.md`

**Si el proyecto usa Xray:**

- [ ] Xray CLI instalado (`bun xray`)
- [ ] Credenciales Xray configuradas

---

## Paso a Paso

---

## PARTE 1: TEST ANALYSIS (20-30 minutos)

> **Objetivo:** Identificar candidatos de regresión desde el contexto de la US.

### Paso 1.1: Recopilar Contexto

**Fuentes de información:**

| Fuente            | Dónde Encontrar                         | Qué Buscar                                 |
| ----------------- | --------------------------------------- | ------------------------------------------ |
| User Story        | Jira                                    | Acceptance Criteria, reglas de negocio     |
| Comentarios US    | Jira                                    | Edge cases discutidos, decisiones técnicas |
| Bugs relacionados | Jira (linked issues)                    | Áreas de riesgo, problemas conocidos       |
| Session notes     | `.context/PBI/.../exploratory-notes.md` | Escenarios validados                       |
| Sub-tasks         | Jira                                    | Detalle de implementación                  |

**Pasos:**

1. Abrir Jira → User Story
2. Leer Description y Acceptance Criteria
3. Revisar comentarios (scroll down)
4. Click en "Links" para ver issues relacionadas
5. Leer session notes del exploratory testing

### Paso 1.2: Identificar Escenarios

**Para cada escenario encontrado, clasificar:**

#### Por Prioridad de Negocio

| Clasificación | Criterios                            |
| ------------- | ------------------------------------ |
| **Critical**  | Flujo core de negocio, alto impacto  |
| **High**      | Feature importante, uso frecuente    |
| **Medium**    | Feature secundaria, impacto moderado |
| **Low**       | Edge case, uso raro                  |

#### Por Automatizabilidad

| ✅ Automatizable           | ❌ No Automatizable       |
| -------------------------- | ------------------------- |
| Resultados determinísticos | Requiere juicio humano    |
| Locators/APIs estables     | Solo validación visual    |
| Pasos repetibles           | Setup complejo/manual     |
| Assertions claras          | Integraciones de terceros |
| Pocas dependencias         | Datos muy dinámicos       |

### Paso 1.3: Crear Mapa de Componentes (Lego)

**Concepto:** Cada test atómico puede ser componente de tests más grandes.

```
E2E: Flujo de Compra Completo
├── [1] Login exitoso (Functional) ← REUTILIZABLE
├── [2] Buscar producto (Functional)
├── [3] Agregar al carrito (Functional)
├── [4] Proceso de pago (Integration)
└── [5] Confirmación de orden (Functional)

E2E: Gestión de Perfil
├── [1] Login exitoso (Functional) ← REUTILIZADO
├── [6] Editar perfil (Functional)
└── [7] Cambiar password (Functional)
```

**¿Por qué importa?** Tests reutilizables tienen mayor ROI.

### Paso 1.4: Generar Reporte de Análisis

**Template:**

```markdown
# Test Analysis Report

**User Story:** [STORY-XXX] [Summary]
**Epic:** [EPIC-XXX] [Epic name]
**Fecha:** [Date]
**Analista:** [Tu nombre]

---

## Fuentes Analizadas

| Fuente        | Issues/Docs      | Insights Clave           |
| ------------- | ---------------- | ------------------------ |
| User Story    | STORY-XXX        | [Resumen de AC]          |
| Comentarios   | [N] comentarios  | [Edge cases mencionados] |
| Bugs          | BUG-XXX, BUG-YYY | [Áreas de riesgo]        |
| Session notes | [Path]           | [Escenarios validados]   |

---

## Escenarios Identificados

### Critical Priority

| #   | Escenario         | Tipo       | Automatizable | Componente de             |
| --- | ----------------- | ---------- | ------------- | ------------------------- |
| 1   | Login exitoso     | Functional | Sí            | Checkout E2E, Profile E2E |
| 2   | Checkout completo | E2E        | Sí            | -                         |

### High Priority

| #   | Escenario           | Tipo        | Automatizable | Componente de |
| --- | ------------------- | ----------- | ------------- | ------------- |
| 3   | Validación password | Functional  | Sí            | Login         |
| 4   | Error en pago       | Integration | Sí            | Checkout E2E  |

---

## Mapa de Componentes

(Diagrama tipo árbol como el ejemplo anterior)

---

## Resumen

| Categoría            | Cantidad |
| -------------------- | -------- |
| Total escenarios     | [N]      |
| Candidatos regresión | [N]      |
| Automatizables       | [N]      |
| Manual-only          | [N]      |
```

---

## PARTE 2: TEST PRIORITIZATION (15-20 minutos)

> **Objetivo:** Calcular ROI y decidir qué tests automatizar vs mantener manuales.

### Paso 2.1: Calcular ROI para Cada Candidato

**Para cada escenario, puntuar 1-5:**

| Factor           | Pregunta                         | 5 (Alto)          | 1 (Bajo)        |
| ---------------- | -------------------------------- | ----------------- | --------------- |
| **Frecuencia**   | ¿Cada cuánto se ejecutará?       | Cada PR/commit    | Ocasionalmente  |
| **Impacto**      | ¿Qué tan grave si falla?         | Afecta revenue    | Cosmético       |
| **Estabilidad**  | ¿El flujo cambia frecuentemente? | Muy estable       | Muy volátil     |
| **Esfuerzo**     | ¿Cuánto cuesta automatizar?      | Trivial (minutos) | Semana+         |
| **Dependencias** | ¿Cuántas integraciones?          | Ninguna           | Muchas externas |

**Cálculo:**

```
ROI = (Frecuencia × Impacto × Estabilidad) / (Esfuerzo × Dependencias)
```

**Ejemplo:**

```
Escenario: Login exitoso
- Frecuencia: 5 (cada PR)
- Impacto: 5 (bloquea todo si falla)
- Estabilidad: 5 (login nunca cambia)
- Esfuerzo: 2 (fácil de automatizar)
- Dependencias: 1 (solo auth API)

ROI = (5 × 5 × 5) / (2 × 1) = 125 / 2 = 62.5 ← Excelente!
```

### Paso 2.2: Aplicar Bonus de Componente

**Si el test es reutilizable en múltiples flujos:**

```
ROI Final = ROI Base × (1 + 0.2 × N)

Donde N = número de flujos E2E que lo usan
```

**Ejemplo:**

```
Login exitoso usado en 5 flujos E2E:
- ROI Base = 62.5
- ROI Final = 62.5 × (1 + 0.2 × 5) = 62.5 × 2.0 = 125.0
```

### Paso 2.3: Decidir Path

| ROI Score | Decisión        | Path Workflow                 |
| --------- | --------------- | ----------------------------- |
| > 2.0     | **Automatizar** | Ready → In Review → Candidate |
| 1.5 - 2.0 | **Automatizar** | Ready → In Review → Candidate |
| 1.0 - 1.5 | **Evaluar**     | Ready → In Review             |
| 0.5 - 1.0 | **Manual**      | Ready → Manual                |
| < 0.5     | **Diferir**     | Draft o no documentar         |

### Paso 2.4: Generar Tabla de Priorización

```markdown
# Test Prioritization Report

| #   | Escenario           | Freq | Impact | Stab | Effort | Deps | ROI Base | Bonus | ROI Final | Path      |
| --- | ------------------- | ---- | ------ | ---- | ------ | ---- | -------- | ----- | --------- | --------- |
| 1   | Login exitoso       | 5    | 5      | 5    | 2      | 1    | 62.5     | ×2.0  | 125.0     | Candidate |
| 2   | Checkout completo   | 4    | 5      | 4    | 4      | 3    | 6.7      | ×1.0  | 6.7       | Candidate |
| 3   | Validación password | 4    | 3      | 5    | 2      | 1    | 30.0     | ×1.4  | 42.0      | Candidate |
| 4   | Visual alignment    | 2    | 2      | 3    | 4      | 2    | 1.5      | -     | 1.5       | Manual    |

---

## Orden de Implementación

1. **Login exitoso** (ROI 125.0) - Base para otros tests
2. **Validación password** (ROI 42.0) - Extensión de Login
3. **Checkout completo** (ROI 6.7) - E2E crítico
4. **Visual alignment** (ROI 1.5) - Manual only
```

---

## PARTE 3: TEST DOCUMENTATION (30-40 minutos)

> **Objetivo:** Crear los tests en Jira siguiendo el workflow correcto.

### Paso 3.1: Determinar Modalidad

**Pregunta 1: ¿Qué herramienta usa el proyecto?**

| Opción                    | Herramientas a Usar             |
| ------------------------- | ------------------------------- |
| **Xray** (plugin de Jira) | Xray CLI (`bun xray`) + Jira    |
| **Solo Jira nativo**      | Solo Jira con Issue Type "Test" |

**Pregunta 2: ¿Qué formato para test cases?**

| Formato                 | Cuándo Usar               | Ejemplo                     |
| ----------------------- | ------------------------- | --------------------------- |
| **Gherkin**             | Tests para automatización | Given/When/Then             |
| **Steps tradicionales** | Tests manuales formales   | Paso/Acción/Datos/Resultado |

### Paso 3.2: Verificar/Crear Épica de Regresión

**Buscar en Jira (JQL):**

```
project = PROJ AND issuetype = Epic AND (
  summary ~ "regression" OR
  summary ~ "test repository" OR
  labels = "test-repository"
)
```

**Si NO existe → Crear:**

| Campo       | Valor                                   |
| ----------- | --------------------------------------- |
| Project     | [Tu proyecto]                           |
| Issue Type  | Epic                                    |
| Summary     | "[PROJECT] Test Repository"             |
| Description | Épica contenedora de tests de regresión |
| Labels      | `test-repository`, `regression`, `qa`   |

### Paso 3.3: Nomenclatura de Test Cases

**Formato estándar:**

```
[US_ID]: TC#: Validar [CORE] [CONDITIONAL]
```

| Componente    | Qué es                   | Ejemplo                  |
| ------------- | ------------------------ | ------------------------ |
| `US_ID`       | ID de User Story         | GX-101                   |
| `TC#`         | Número secuencial        | TC1, TC2, TC3            |
| `CORE`        | Comportamiento principal | login exitoso            |
| `CONDITIONAL` | Condición/contexto       | con credenciales válidas |

**Ejemplos:**

| Tipo     | Título                                                                         |
| -------- | ------------------------------------------------------------------------------ |
| Positive | `GX-101: TC1: Validar login exitoso con credenciales válidas`                  |
| Negative | `GX-101: TC2: Validar error de autenticación cuando el password es incorrecto` |
| Boundary | `GX-101: TC3: Validar límite de caracteres al ingresar exactamente 50 chars`   |

### Paso 3.4: Crear Tests

#### Si usas XRAY CLI:

**Test con Steps:**

```bash
bun xray test create \
  --project PROJ \
  --summary "GX-101: TC1: Validar login exitoso con credenciales válidas" \
  --labels "regression,functional,critical" \
  --step "Navegar a /login|Formulario visible" \
  --step "Ingresar email válido|user@test.com|Campo poblado" \
  --step "Ingresar password válido|Test123!|Campo enmascarado" \
  --step "Click Submit|Dashboard visible"
```

**Test Cucumber (Gherkin):**

```bash
bun xray test create \
  --project PROJ \
  --type Cucumber \
  --summary "GX-101: TC1: Validar login exitoso con credenciales válidas" \
  --labels "regression,automation-candidate,functional" \
  --gherkin "Feature: User Login

@critical @regression
Scenario: Successful login with valid credentials
  Given I am on the login page
  When I enter email \"user@example.com\"
  And I enter password \"Password123!\"
  And I click the submit button
  Then I should be redirected to the dashboard"
```

#### Si usas SOLO JIRA:

**Crear issue en Jira:**

| Campo       | Valor                                                         |
| ----------- | ------------------------------------------------------------- |
| Project     | [Tu proyecto]                                                 |
| Issue Type  | Test                                                          |
| Summary     | `GX-101: TC1: Validar login exitoso con credenciales válidas` |
| Description | (Ver template abajo)                                          |
| Labels      | `regression`, `functional`, `critical`                        |
| Epic Link   | [EPIC de Test Repository]                                     |

**Template de Description (Gherkin):**

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
* *Test Type:* Functional
* *Automation Status:* Candidate
* *Related Story:* GX-101
```

**Template de Description (Steps):**

```
h2. Test Case

|| Paso || Acción || Datos || Resultado Esperado ||
| 1 | Navegar a /login | - | Formulario de login visible |
| 2 | Ingresar email válido | user@test.com | Campo poblado |
| 3 | Ingresar password válido | Test123! | Campo enmascarado |
| 4 | Click en Submit | - | Redirect a Dashboard |

h2. Metadata

* *Priority:* Critical
* *Test Type:* Functional
* *Automation Status:* Candidate
* *Related Story:* GX-101
```

### Paso 3.5: Vincular a User Story

**Opción A: Link en Jira**

1. Abrir el Test creado
2. Click en "Link" → "Link issue"
3. Link type: "tests" / "is tested by"
4. Buscar la User Story (ej: GX-101)
5. Guardar

**Opción B: Comentario en User Story**

1. Abrir la User Story
2. Agregar comentario:
   ```
   Test case documentado: [TEST-XXX] - GX-101: TC1: Validar login exitoso
   ```

### Paso 3.6: Transitar Estados

**Para cada test, ejecutar transiciones en orden:**

```
1. Test creado → Status: DRAFT (automático)

2. Click "Start Design"
   → Status: IN DESIGN

3. Click "Ready to Run"
   → Status: READY

4. Decidir path:

   SI es Candidate:
   → Click "Automation Review"
   → Status: IN REVIEW

   → Click "Approve to Automate"
   → Status: CANDIDATE

   SI es Manual:
   → Click "For Manual"
   → Status: MANUAL
```

### Paso 3.7: Documentar Localmente (Cache)

**Crear archivo local para cada test:**

**Ruta:**

```
.context/PBI/epics/EPIC-XXX/stories/STORY-YYY/tests/
└── TEST-ID-nombre.md
```

**Template:**

```markdown
# TEST-001: Validar login exitoso con credenciales válidas

**Jira:** [TEST-001](https://company.atlassian.net/browse/TEST-001)
**Status:** CANDIDATE
**Type:** Functional
**Related Story:** GX-101
**ROI Score:** 125.0

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

---

## Labels Estándar

| Label                            | Uso                          |
| -------------------------------- | ---------------------------- |
| `regression`                     | Todos los tests de regresión |
| `smoke`                          | Tests de humo (críticos)     |
| `e2e`                            | End-to-end tests             |
| `integration`                    | Tests de integración API     |
| `functional`                     | Tests funcionales            |
| `automation-candidate`           | Marcado para automatizar     |
| `manual-only`                    | No automatizable             |
| `critical`/`high`/`medium`/`low` | Prioridad                    |

---

## Checklist Final

### Test Analysis

- [ ] Contexto de US recopilado (AC, comentarios, bugs)
- [ ] Escenarios identificados y clasificados
- [ ] Mapa de componentes (Lego) creado
- [ ] Reporte de análisis documentado

### Test Prioritization

- [ ] ROI calculado para cada candidato
- [ ] Bonus de componente aplicado donde corresponde
- [ ] Path decidido (Candidate/Manual/Deferred)
- [ ] Orden de implementación definido

### Test Documentation

- [ ] Modalidad determinada (Xray/Jira nativo)
- [ ] Formato elegido (Gherkin/Steps)
- [ ] Épica de regresión verificada/creada
- [ ] Tests creados con nomenclatura correcta
- [ ] Tests vinculados a User Story
- [ ] Estados transitados correctamente
- [ ] Archivos locales creados (cache)

### Trazabilidad

- [ ] US → Tests documentado
- [ ] Tests → Épica de Regresión
- [ ] Candidates listos para Fase 12

---

## Comandos Xray CLI Referencia

```bash
# Autenticación
bun xray auth login --client-id "$XRAY_CLIENT_ID" --client-secret "$XRAY_CLIENT_SECRET"
bun xray auth status

# Crear test manual con steps
bun xray test create --project PROJ --summary "Test name" \
  --step "Action|Expected" \
  --step "Action|Data|Expected"

# Crear test Cucumber
bun xray test create --project PROJ --type Cucumber \
  --summary "Feature" --gherkin "Feature: X\n  Scenario: Y"

# Listar tests
bun xray test list --project PROJ --limit 50

# Ver detalles
bun xray test get PROJ-123
```

---

## Troubleshooting

| Problema                    | Causa             | Solución                |
| --------------------------- | ----------------- | ----------------------- |
| "Not logged in"             | Sesión expirada   | `bun xray auth login`   |
| "Issue type Test not found" | Xray no instalado | Verificar plugin        |
| "Epic not found"            | No existe épica   | Crear épica primero     |
| "Transition not allowed"    | Status incorrecto | Verificar status actual |
| "Field required"            | Campo faltante    | Agregar campo requerido |

---

## Próximos Pasos

| Status Final  | Siguiente Fase            |
| ------------- | ------------------------- |
| **CANDIDATE** | Fase 12: Test Automation  |
| **MANUAL**    | Suite de regresión manual |
| **IN REVIEW** | Pendiente de decisión     |

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
