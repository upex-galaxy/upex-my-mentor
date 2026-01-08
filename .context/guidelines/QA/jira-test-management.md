# Jira Test Management Guidelines

> **Para**: QA Engineers
> **Fase**: 11 (Test Documentation)
> **Propósito**: Estándares para gestión de pruebas en Jira (con o sin Xray)

---

## Principio Central

El Test Management en Jira comienza **DESPUÉS** de que una funcionalidad está **estable y funcional**. El objetivo es:

1. **Documentar** las pruebas validadas durante exploratory testing
2. **Trazar** las pruebas hacia las historias de usuario
3. **Preparar** las pruebas para automatización
4. **Mantener** un repositorio de regresión organizado

---

## Modalidades de Test Management

### Pregunta Clave al Iniciar

Antes de documentar tests, determinar:

```
¿El proyecto utiliza Xray como plugin de Test Management?

- SÍ → Usar Xray CLI (`bun xray`) + MCP Atlassian
- NO → Usar solo MCP Atlassian con Issue Type "Test" nativo
```

### Comparación de Modalidades

| Aspecto              | Jira Nativo (sin Xray)     | Jira + Xray                               |
| -------------------- | -------------------------- | ----------------------------------------- |
| **Issue Type**       | Test (custom)              | Test, Test Plan, Test Set, Test Execution |
| **Test Steps**       | En Description (markdown)  | Campo estructurado con steps individuales |
| **Ejecución**        | Custom field "Test Status" | Test Execution issues con runs            |
| **Trazabilidad**     | Links manuales             | Links automáticos bidireccionales         |
| **Herramienta**      | MCP Atlassian              | MCP Atlassian + Xray CLI (`bun xray`)     |
| **Resultados CI/CD** | API custom                 | Import JUnit/Cucumber nativo              |

---

## Issue Types de Xray

Cuando el proyecto usa Xray, estos issue types adicionales están disponibles:

| Issue Type         | Propósito                                     | Relación                   |
| ------------------ | --------------------------------------------- | -------------------------- |
| **Test**           | Caso de prueba individual                     | Hijo de Epic/Story         |
| **Test Plan**      | Agrupa tests para un release/sprint           | Contiene Tests             |
| **Test Set**       | Agrupa tests por criterio (smoke, regression) | Contiene Tests             |
| **Test Execution** | Instancia de ejecución de tests               | Ejecuta Tests, genera Runs |
| **Precondition**   | Requisitos previos reutilizables              | Referenciado por Tests     |

---

## Workflow de Test en Jira

### Diagrama de Estados y Transiciones

```
┌─────────┐
│  START  │
└────┬────┘
     │ Create
     ▼
┌─────────┐    automation review    ┌────────────┐
│  DRAFT  │◄────────────────────────│ DEPRECATED │
└────┬────┘                         └────────────┘
     │ start design                        ▲
     ▼                                     │ Any
┌───────────┐                              │
│ IN DESIGN │◄─────┐                       │
└─────┬─────┘      │ back                  │
      │ ready to run                       │
      ▼                                    │
┌─────────┐    for manual    ┌────────┐    │
│  READY  │─────────────────►│ MANUAL │────┤
└────┬────┘                  └────┬───┘    │
     │                            │        │
     │ automation review          │ automated
     ▼                            ▼        │
┌───────────┐  approve      ┌───────────┐  │
│ IN REVIEW │──────────────►│ CANDIDATE │  │
└─────┬─────┘  to automate  └─────┬─────┘  │
      │                           │        │
      │ for automation            │ start automation
      │                           ▼        │
      │                     ┌──────────────┐
      │                     │ IN AUTOMATION │
      │                     └───────┬──────┘
      │                             │ create PR
      │                             ▼
      │                     ┌──────────────┐
      │                     │ PULL REQUEST │
      │                     └───────┬──────┘
      │                             │ merged
      │                             ▼
      │                     ┌───────────┐
      └────────────────────►│ AUTOMATED │
                            └───────────┘
```

### Estados del Workflow

| Estado            | Descripción                        | Siguiente Paso                        |
| ----------------- | ---------------------------------- | ------------------------------------- |
| **Draft**         | Test recién creado, borrador       | Iniciar diseño                        |
| **In Design**     | Escribiendo steps/gherkin          | Marcar ready cuando complete          |
| **Ready**         | Documentado, listo para decisión   | → Manual o → In Review                |
| **Manual**        | Test de regresión manual           | (puede pasar a In Review después)     |
| **In Review**     | Revisión para automatización (ROI) | → Candidate o → Manual                |
| **Candidate**     | Aprobado para automatizar          | Iniciar automatización                |
| **In Automation** | Automatización en progreso         | Crear PR cuando listo                 |
| **Pull Request**  | PR abierto, esperando merge        | (auto-transita con integración)       |
| **Automated**     | Test automatizado y en CI/CD       | Estado final (regresión automatizada) |
| **Deprecated**    | Test obsoleto/descartado           | Puede recuperarse                     |

### Transiciones Clave

| Transición            | De → A                       | Trigger                          |
| --------------------- | ---------------------------- | -------------------------------- |
| `start design`        | Draft → In Design            | IA inicia documentación          |
| `ready to run`        | In Design → Ready            | Documentación completa           |
| `for manual`          | Ready → Manual               | No es candidato a automatizar    |
| `automation review`   | Ready → In Review            | Evaluar ROI de automatización    |
| `approve to automate` | In Review → Candidate        | ROI positivo, aprobado           |
| `start automation`    | Candidate → In Automation    | Fase 12 inicia                   |
| `create PR`           | In Automation → Pull Request | PR creado (auto con integración) |
| `merged`              | Pull Request → Automated     | PR merged (auto con integración) |

---

## Épica de Regresión (Test Repository)

### Concepto

**TODAS** las pruebas documentadas deben pertenecer a una Épica de Regresión. Esta épica actúa como repositorio central.

### Nomenclatura

```
Nombres válidos para la épica:
- "Test Repository"
- "QA Regression Suite"
- "[Proyecto] Regression Tests"
- Cualquier épica con label "regression" o "test-repository"
```

### Verificación Obligatoria

Antes de crear cualquier Test, verificar:

```
1. ¿Existe una épica de regresión en el proyecto?
   - JQL: project = PROJ AND issuetype = Epic AND (summary ~ "regression" OR summary ~ "test repository" OR labels = "test-repository")

2. Si NO existe:
   - Preguntar al usuario si desea crearla
   - Nombre sugerido: "[PROYECTO] Test Repository"
   - Labels: test-repository, regression

3. Si SÍ existe:
   - Usar esa épica como parent de todos los Tests
```

### Estructura en Jira

```
EPIC: Test Repository (siempre In Progress)
├── TEST-001: [Smoke] Login básico
├── TEST-002: [Smoke] Navegación principal
├── TEST-003: [Regression] Checkout completo
├── TEST-004: [Regression] Perfil de usuario
├── TEST-005: [E2E] Flujo de compra completo
└── ... (se agregan tests continuamente)
```

---

## Herramientas por Modalidad

### Jira Nativo (sin Xray)

| Herramienta                                        | Uso                         |
| -------------------------------------------------- | --------------------------- |
| `mcp__atlassian__createJiraIssue`                  | Crear Test issues           |
| `mcp__atlassian__getJiraIssue`                     | Leer detalles de story/test |
| `mcp__atlassian__searchJiraIssues`                 | Buscar épica de regresión   |
| `mcp__atlassian__updateJiraIssue`                  | Actualizar status/campos    |
| `mcp__atlassian__addCommentToJiraIssue`            | Agregar notas/resultados    |
| `mcp__atlassian__getJiraProjectIssueTypesMetadata` | Obtener schema de Test      |
| `mcp__atlassian__transitionJiraIssue`              | Mover entre estados         |

### Jira + Xray

Usar **ambas** herramientas:

**MCP Atlassian** (para operaciones Jira estándar):

- Crear/leer issues genéricos
- Buscar épicas
- Agregar comentarios
- Links entre issues

**Xray CLI** (para operaciones específicas de Xray):

```bash
# Autenticación (una vez por sesión)
bun xray auth login --client-id "$XRAY_CLIENT_ID" --client-secret "$XRAY_CLIENT_SECRET"

# Crear test con steps estructurados
bun xray test create --project PROJ --summary "Login exitoso" \
  --step "Navegar a /login|Formulario visible" \
  --step "Ingresar credenciales|user@test.com|Login exitoso"

# Crear test Cucumber
bun xray test create --project PROJ --type Cucumber --summary "Login feature" \
  --gherkin "Feature: Login\n  Scenario: Valid login\n    Given I am on login"

# Listar tests del proyecto
bun xray test list --project PROJ

# Crear Test Execution
bun xray exec create --project PROJ --summary "Sprint 10 Regression"

# Importar resultados de automation
bun xray import junit --file results.xml --project PROJ
```

---

## Formato de Test Cases

### Opción 1: Gherkin (Recomendado)

```gherkin
Feature: Login de Usuario

@critical @regression
Scenario: Login exitoso con credenciales válidas
  Given estoy en la página de login
  When ingreso email "usuario@ejemplo.com"
  And ingreso password "Password123!"
  And hago click en el botón de submit
  Then debería ser redirigido al dashboard
  And debería ver un mensaje de bienvenida

@high @regression
Scenario Outline: Login fallido con credenciales inválidas
  Given estoy en la página de login
  When ingreso email "<email>"
  And ingreso password "<password>"
  And hago click en el botón de submit
  Then debería ver el mensaje de error "<error>"

  Examples:
    | email              | password   | error                    |
    | invalido           | Pass123!   | Formato de email inválido|
    | usuario@ejemplo.com| incorrecto | Credenciales inválidas   |
```

### Opción 2: Formato Tradicional (Steps)

| Paso | Acción            | Datos de Prueba     | Resultado Esperado   |
| ---- | ----------------- | ------------------- | -------------------- |
| 1    | Navegar a /login  | -                   | Formulario visible   |
| 2    | Ingresar email    | usuario@ejemplo.com | Campo poblado        |
| 3    | Ingresar password | Password123!        | Campo enmascarado    |
| 4    | Click en Submit   | -                   | Redirect a dashboard |

---

## Análisis de Automatización (ROI)

### Criterios para Automatizar

| Factor           | Automatizar (ROI+)      | Mantener Manual (ROI-) |
| ---------------- | ----------------------- | ---------------------- |
| **Frecuencia**   | Ejecutar frecuentemente | Una sola vez           |
| **Estabilidad**  | Flujo estable           | Flujo cambiante        |
| **Complejidad**  | Pasos repetitivos       | Requiere juicio humano |
| **Riesgo**       | Alto impacto si falla   | Bajo riesgo            |
| **Dependencias** | Pocas dependencias      | Muchas integraciones   |
| **Tecnología**   | Soportado por framework | No automatizable       |

### Fórmula ROI Simplificada

```
ROI = (Frecuencia × Impacto × Estabilidad) / (Esfuerzo × Dependencias)

- Si ROI > 1.5 → Candidate
- Si ROI 0.5-1.5 → Evaluar caso por caso
- Si ROI < 0.5 → Manual
```

### Tests como Componentes (Lego)

Un test individual puede ser parte de un flujo más grande:

```
Test atómico: "Login exitoso"
    └── Componente de E2E: "Flujo de compra completo"
        ├── Login exitoso (este test)
        ├── Agregar producto al carrito
        ├── Proceso de checkout
        └── Confirmación de orden

Beneficio: Automatizar atómicamente, componer en E2E
```

---

## Trazabilidad

### Estructura de Links

```
User Story (STORY-XXX)
    ↓ is tested by
Test (TEST-XXX)
    ↓ is blocked by (opcional)
Bug (BUG-XXX)
```

### Links Requeridos

| Desde | Hacia      | Tipo de Link                |
| ----- | ---------- | --------------------------- |
| Test  | User Story | "tests" / "is tested by"    |
| Test  | Epic       | Parent (Épica de Regresión) |
| Test  | Bug        | "is blocked by" (si aplica) |

---

## Labels Estándar

| Label                            | Significado              |
| -------------------------------- | ------------------------ |
| `smoke`                          | Test de humo, crítico    |
| `regression`                     | Suite de regresión       |
| `e2e`                            | End-to-end test          |
| `integration`                    | Test de integración API  |
| `manual-only`                    | No automatizable         |
| `automation-candidate`           | Marcado para automatizar |
| `critical`/`high`/`medium`/`low` | Prioridad                |

---

## Nomenclatura de Tickets en Jira

### Estándar de Nomenclatura por Tipo de Issue

Esta guía estandariza la forma de nombrar cada tipo de ticket para facilitar la trazabilidad y organización.

---

### Test Case (TC)

**Formato según herramienta:**

| Herramienta     | Formato                                      |
| --------------- | -------------------------------------------- |
| **Xray**        | `<TS_ID>: TC#: Validar <CORE> <CONDITIONAL>` |
| **Jira nativo** | `<US_ID>: TC#: Validar <CORE> <CONDITIONAL>` |

**Definición de Componentes:**

| Componente    | Qué es                                                                 | Ejemplos                                                                         |
| ------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `TS_ID`       | **Test Set ID** - ID del Test Set en Xray (solo si usa Xray)           | `GX-150` (donde GX-150 es un Test Set)                                           |
| `US_ID`       | **User Story ID** - ID de la US relacionada (si usa Jira nativo)       | `GX-101` (donde GX-101 es una User Story)                                        |
| `TC#`         | Número secuencial del test case                                        | `TC1`, `TC2`, `TC3`...                                                           |
| `CORE`        | **El comportamiento principal** que se está validando (verbo + objeto) | `login exitoso`, `error de validación`, `creación de usuario`                    |
| `CONDITIONAL` | **La condición o contexto** que hace único este escenario              | `con credenciales válidas`, `cuando el campo está vacío`, `al exceder el límite` |

**Fórmula Mental:**

```
"[ID]: TC#: Validar [QUÉ comportamiento] [BAJO QUÉ condición]"
```

**Ejemplos por Tipo de Test:**

| Tipo     | CORE                         | CONDITIONAL                          | Título Completo                                                                      |
| -------- | ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| Positive | `login exitoso`              | `con credenciales válidas`           | `GX-101: TC1: Validar login exitoso con credenciales válidas`                        |
| Negative | `error de autenticación`     | `cuando el password es incorrecto`   | `GX-101: TC2: Validar error de autenticación cuando el password es incorrecto`       |
| Boundary | `límite de caracteres`       | `al ingresar exactamente 50 chars`   | `GX-101: TC3: Validar límite de caracteres al ingresar exactamente 50 chars`         |
| Edge     | `comportamiento del carrito` | `cuando hay múltiples ítems iguales` | `GX-101: TC4: Validar comportamiento del carrito cuando hay múltiples ítems iguales` |

**Anti-patrones (evitar):**

| ❌ Incorrecto            | ✅ Correcto                                                         | Por qué                           |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| `Test de login`          | `GX-101: TC1: Validar login exitoso con credenciales válidas`       | Falta ID, TC#, CORE y CONDITIONAL |
| `Login - error`          | `GX-101: TC2: Validar error de autenticación con password inválido` | Demasiado vago                    |
| `TC1: Probar formulario` | `GX-101: TC1: Validar envío de formulario con todos los campos`     | Falta ID, CORE no es específico   |

**Para proyectos en inglés:**

```
[Should] [Feature-Expected-Behavior] [Condition(If/When/With/At)]
```

| Tipo     | Título                                                    |
| -------- | --------------------------------------------------------- |
| Positive | Should login successfully with valid credentials          |
| Negative | Should display error message when password is incorrect   |
| Boundary | Should accept exactly 50 characters in name field         |
| Edge     | Should calculate total correctly with multiple same items |

---

### Test Suite (TS)

**Formato:**

```
<ExecutionStrategy>: <ID>: <SUITE_SUMMARY>
```

| Tipo de Suite                  | ExecutionStrategy    | ID          | SUITE_SUMMARY         |
| ------------------------------ | -------------------- | ----------- | --------------------- |
| Para User Story específica     | `Sanity`             | ID de la US | Título breve de la US |
| Para funcionalidades generales | `Smoke`/`Regression` | (opcional)  | Título identificador  |

**Ejemplos:**

```
Sanity: GX-101: Permitir pago con tarjeta de crédito
Smoke: Core Features v2.0
Regression: Sprint 50
```

---

### Test Plan

**Formato:**

```
QA: TestPlan: <ExecutionStrategy> <ReleaseVersion(opcional)>
```

**Ejemplos:**

```
QA: TestPlan: Regression S50
QA: TestPlan: Smoke v2
QA: TestPlan: Sanity ShoppingCart v2
```

---

### Test Execution (TX)

**Formato:**

```
<ExecutionStrategy>: <ID>: <TX_SUMMARY>
```

**Ejemplos:**

```
Sanity: GX-101: Permitir pago con tarjeta de crédito
Regression: TP-50: Sprint 50 Regression
```

---

### ReTesting (RTX)

**Formato:**

```
ReTest: <BUGID>: <ISSUE_SUMMARY>
```

**Ejemplo:**

```
ReTest: GX-202: No muestra error al ingresar contraseña incorrecta
```

---

### Precondiciones (PRC)

**Formato:**

```
<EPICNAME>: <COMPONENT>: PRC: Para <NEXT_ACTION>
```

**Ejemplo:**

```
CheckoutFlow: Payment: PRC: Para procesar el cobro con tarjeta
```

---

### Tabla Resumen de Nomenclaturas

| Issue Type      | Formato                                      | Ejemplo                                               |
| --------------- | -------------------------------------------- | ----------------------------------------------------- |
| Test Case (TC)  | `<TS_ID>: TC#: Validar <CORE> <CONDITIONAL>` | `GX-101: TC2: Validar agregar producto al carrito...` |
| Test Suite (TS) | `<Strategy>: <ID>: <SUMMARY>`                | `Sanity: GX-101: Permitir pago con tarjeta`           |
| Test Plan       | `QA: TestPlan: <Strategy> <Version>`         | `QA: TestPlan: Regression v1.3`                       |
| Test Execution  | `<Strategy>: <ID>: <SUMMARY>`                | `Sanity: GX-101: Permitir pago con tarjeta`           |
| ReTesting       | `ReTest: <BUGID>: <ISSUE_SUMMARY>`           | `ReTest: GX-202: No muestra error al ingresar...`     |
| Precondición    | `<EPIC>: <COMP>: PRC: Para <ACTION>`         | `CheckoutFlow: Payment: PRC: Para procesar cobro`     |

---

### Recomendaciones

- **Uniformidad:** Mantener este formato en todas las creaciones de tickets
- **Claridad:** Usar títulos cortos y concisos, detalles van en la descripción
- **Trazabilidad:** Enlazar Test Cases con User Stories y Test Suites
- **Consistencia:** Asegurar que todo el equipo adopte el estándar

---

## Flujo Completo de Documentación

```
1. EXPLORAR (Fase 10)
   └── Validar funcionalidad
   └── Identificar escenarios

2. ANALIZAR (Fase 11 - test-analysis.md)
   └── Leer US, comentarios, issues enlazadas
   └── Clasificar escenarios
   └── Identificar componentes E2E/Integration

3. PRIORIZAR (Fase 11 - test-prioritization.md)
   └── Calcular ROI
   └── Decidir: Automated vs Manual
   └── Ordenar por prioridad

4. DOCUMENTAR (Fase 11 - test-documentation.md)
   └── Verificar/crear épica de regresión
   └── Crear Test issues (Jira o Xray)
   └── Transitar: Draft → In Design → Ready
   └── Decidir path: → Manual o → In Review
   └── Si In Review: evaluar → Candidate

5. AUTOMATIZAR (Fase 12)
   └── Candidate → In Automation → PR → Automated
```

---

## Integración CI/CD

### Con Xray

```yaml
# GitHub Actions example
- name: Import test results to Xray
  run: bun xray import junit --file ./test-results/junit.xml --project PROJ
```

### Sin Xray (Jira nativo)

Actualizar campo "Test Status" via API o MCP después de ejecución.

---

## Mejores Prácticas

### DO (Hacer)

- ✅ Crear tests **DESPUÉS** de que la feature esté estable
- ✅ Verificar épica de regresión antes de crear tests
- ✅ Vincular tests a User Stories
- ✅ Usar formato Gherkin para tests automatizables
- ✅ Transitar estados según el workflow
- ✅ Marcar claramente candidatos de automatización
- ✅ Pensar en tests como componentes reutilizables

### DON'T (No Hacer)

- ❌ Crear tests antes de explorar la funcionalidad
- ❌ Tests sin parent (épica de regresión)
- ❌ Tests sin trazabilidad a requirements
- ❌ Saltar estados del workflow
- ❌ Automatizar sin evaluar ROI
- ❌ Duplicar tests para la misma funcionalidad

---

## Ver También

- `.context/guidelines/QA/spec-driven-testing.md` - Principio SDT
- `.context/guidelines/TAE/tms-integration.md` - Integración con TMS
- `.prompts/fase-11-test-documentation/` - Prompts de documentación
- `.prompts/us-qa-workflow.md` - Workflow completo de QA

---

**Última actualización**: 2025-12-25
