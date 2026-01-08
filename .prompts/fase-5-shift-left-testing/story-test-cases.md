Actúa como QA Engineer experto en Shift-Left Testing, Test Case Design y Critical Analysis.

**⚠️ WORKFLOW:** Este prompt sigue el principio **JIRA-FIRST → LOCAL MIRROR**

---

## 📥 Input Requerido

### 1. Story Path Local (OBLIGATORIO)

**Formato:** `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/`
**Ejemplo:** `.context/PBI/epics/EPIC-UPEX-13-auth/stories/STORY-UPEX-45-login/`

**⚠️ IMPORTANTE - Diferencia entre Nomenclaturas:**

- **Path Local (carpeta):** `STORY-UPEX-45-login` ← Nomenclatura de carpetas
- **Jira Key (real):** `UPEX-45` ← Key real del issue en Jira

**Nota:** Los números de issue son idénticos en ambos formatos (ej: 45). La diferencia está solo en el prefijo STORY-

**Proceso:**

1. **Usuario proporciona:** Path de la carpeta story local
2. **Prompt lee:** Archivo `story.md` de esa carpeta
3. **Prompt extrae:** Campo `**Jira Key:**` del story.md (formato real: UPEX-456)
4. **Prompt usa:** Ese Jira Key real para operaciones MCP de Atlassian

**Uso del path:**

- Leer story.md local para obtener Jira Key real
- Leer la story actual de Jira con MCP (Paso 5)
- Actualizar la story en Jira con refinamientos (Paso 5)
- Agregar comentario con test cases (Paso 6)
- Generar archivo test-cases.md en esa carpeta (Paso 7)

---

### 2. Contexto de Negocio (OBLIGATORIO)

- Business Model: [leer .context/idea/business-model.md]
- Executive Summary: [leer .context/PRD/executive-summary.md]
- User Personas: [leer .context/PRD/user-personas.md]
- User Journeys: [leer .context/PRD/user-journeys.md]

---

### 3. Contexto Técnico (OBLIGATORIO)

- Functional Specs: [leer .context/SRS/functional-specs.md - COMPLETO]
- Non-Functional Specs: [leer .context/SRS/non-functional-specs.md]
- Architecture Specs: [leer .context/SRS/architecture-specs.md]
- API Contracts: [leer .context/SRS/api-contracts.yaml]

---

### 4. Contexto de la Story (OBLIGATORIO)

**Paso 1: Leer Story Local y Extraer Jira Keys**

- Story (local): [leer {STORY_PATH}/story.md proporcionado por el usuario]
- **Extraer del story.md:**
  - Campo `**Jira Key:**` de la story (ej: UPEX-456)
  - Campo `**Epic:**` para obtener el epic path local
- **Guardar:** Jira Keys reales para usar en operaciones MCP

**Paso 2: Leer Epic Local y Extraer Epic Jira Key**

- Epic (local): [leer epic.md del epic path encontrado en la story]
- **Extraer del epic.md:** Campo `**Jira Key:**` del epic (ej: UPEX-123)
- **Guardar:** Epic Jira Key real para leer comentarios

**Paso 3: Obtener Epic de Jira y Comentarios**

- Epic (Jira): [usar MCP de Atlassian con el Epic Jira Key real extraído]
- **Epic Comments (Jira):** [usar MCP de Atlassian para leer comentarios del epic - buscar "Feature Test Plan"]
- Feature Test Plan (local): [leer feature-test-plan.md del epic path]

**Paso 4: Obtener Story de Jira**

- Story (Jira): [usar MCP de Atlassian con el Story Jira Key real extraído del paso 1]

**⚠️ IMPORTANTE:** Leer los comentarios del epic en Jira proporciona contexto actualizado incluyendo:

- Respuestas de PO/Dev a preguntas críticas
- Discusiones y clarificaciones adicionales
- Updates al test plan después de refinements

---

## 📤 Output Generado

### En Jira (vía MCP Atlassian):

1. **Story actualizada** con refined acceptance criteria y label `shift-left-reviewed`
2. **Comentario agregado** con test cases completos y tags al equipo

### En Local:

1. **Archivo:** `.context/PBI/epics/EPIC-{...}/stories/STORY-{...}/test-cases.md`
2. **Contenido:** Mirror exacto del comentario en Jira

### Para Usuario:

1. **Reporte:** Resumen ejecutivo con critical questions y next steps (Paso 8)

### En Git (Branch Naming Convention):

**Formato de rama:** `test/{JIRA_ISSUE_KEY}/{short-description}`

**Ejemplos:**

- `test/UPEX-45/user-login-flow`
- `test/UPEX-123/profile-update`
- `test/UPEX-78/checkout-validation`

**Reglas:**

1. Prefijo `test/` obligatorio (indica trabajo de QA/testing)
2. Jira Issue Key en mayúsculas (ej: UPEX-45) - extraído del campo `**Jira Key:**` del story.md
3. Descripción corta en kebab-case (máx 3-4 palabras) - derivada del nombre de la story
4. Base branch: siempre `staging` (nunca `main`)

**⚠️ IMPORTANTE:**

- Esta rama SOLO debe contener cambios en archivos de documentación de la story (test-cases.md)
- NO incluir código de producción, configuración de testing frameworks, ni implementación
- El nombre de la rama debe derivarse del contexto de la story analizada

---

## 🎯 FLUJO DE TRABAJO

Este prompt trabaja en **10 pasos** (Paso 0-9) organizados en 3 partes, siguiendo el principio **JIRA-FIRST → LOCAL MIRROR**:

---

### 🌿 PARTE 0: PREPARACIÓN GIT

#### Paso 0: Crear rama de trabajo

- Checkout desde `staging` y pull de cambios
- Crear rama con formato `test/{JIRA_KEY}/{short-description}`
- El Jira Key se extrae del story.md, la descripción del título de la story

---

### 📊 PARTE 1: ANÁLISIS Y DISEÑO

#### Paso 1: Critical Analysis

- Analizar la story desde perspectiva de negocio
- Identificar ambigüedades en acceptance criteria
- Identificar qué falta en la story

#### Paso 2: Story Refinement & Gap Identification

- Refinar acceptance criteria con datos específicos
- Identificar edge cases NO mencionados en story original
- Validar que TODO sea testeable

#### Paso 3: Test Strategy Planning

- Determinar cuántos test cases se necesitan realmente
- Identificar oportunidades para parametrización
- Planear integration/API tests si aplican

#### Paso 4: Test Design

- Generar test cases (positive, negative, boundary)
- Diseñar parametrized tests cuando aplique
- Diseñar integration/API tests basados en arquitectura

---

### 🔄 PARTE 2: INTEGRACIÓN Y OUTPUT

#### Paso 5: Update Story in Jira

- Refinar description y acceptance criteria en Jira

#### Paso 6: Add Test Cases as Comment in Jira

- Agregar test cases completos como comentario con tags al equipo

#### Paso 7: Generate Local test-cases.md

- Crear mirror local del comentario de Jira

#### Paso 8: Final QA Feedback Report

- Generar resumen ejecutivo para el usuario

#### Paso 9: Commit del archivo test-cases.md

- Hacer commit del archivo `test-cases.md` en la rama de trabajo
- Mensaje de commit: `test({JIRA_KEY}): add shift-left test cases for {story-title}`

---

# Test Cases: STORY-{PROJECT_KEY}-{ISSUE_NUM} - [Story Title]

**Fecha:** [YYYY-MM-DD]
**QA Engineer:** [Nombre o "TBD"]
**Story Jira Key:** [{PROJECT_KEY}-{ISSUE_NUM}]
**Epic:** EPIC-{PROJECT_KEY}-{ISSUE_NUM} - [Epic Title]
**Status:** Draft | In Review | Approved

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
[De User Personas, identificar quién usa esta funcionalidad]

- **Primary:** [Nombre de persona] - [Cómo le afecta]
- **Secondary:** [Nombre de persona] - [Si aplica]

**Business Value:**
[Del Business Model y Executive Summary, explicar el valor de esta story]

- **Value Proposition:** [Qué valor aporta al usuario]
- **Business Impact:** [Cómo contribuye a KPIs del negocio]

**Related User Journey:**
[De User Journeys, identificar en qué journey encaja esta story]

- Journey: [Nombre del journey]
- Step: [En qué paso del journey está esta funcionalidad]

---

### Technical Context of This Story

**Architecture Components:**
[De Architecture Specs, identificar componentes involucrados]

**Frontend:**

- Components: [Listar componentes React/Vue específicos]
- Pages/Routes: [Rutas afectadas]
- State Management: [Si aplica - Redux, Context, etc.]

**Backend:**

- API Endpoints: [Listar endpoints - según api-contracts.yaml]
- Services: [Servicios de negocio involucrados]
- Database: [Tablas/colecciones afectadas]

**External Services:**

- [Si la story integra con servicios externos - listar]

**Integration Points:**

- [Listar puntos de integración específicos de esta story]

---

### Story Complexity Analysis

**Overall Complexity:** Low | Medium | High

**Complexity Factors:**

- Business logic complexity: [Low | Medium | High] - [Razón]
- Integration complexity: [Low | Medium | High] - [Razón]
- Data validation complexity: [Low | Medium | High] - [Razón]
- UI complexity: [Low | Medium | High] - [Si aplica]

**Estimated Test Effort:** [Low | Medium | High]
**Rationale:** [Explicar por qué este nivel de esfuerzo]

---

### Epic-Level Context (From Feature Test Plan in Jira)

**⚠️ IMPORTANTE:** Esta sección extrae información del comentario "Feature Test Plan" en el epic de Jira para proporcionar contexto actualizado.

**Critical Risks Already Identified at Epic Level:**

[Extraer del comentario del epic en Jira - sección "Critical Risks"]

- Risk 1: [Descripción del riesgo identificado a nivel epic]
  - **Relevance to This Story:** [Cómo este riesgo afecta específicamente esta story]
- Risk 2: [Si aplica a esta story]
  - **Relevance to This Story:** [Cómo afecta]

**Integration Points from Epic Analysis:**

[Extraer del comentario del epic - sección "Integration Points"]

- Integration Point 1: [Ej: Frontend ↔ Backend API]
  - **Applies to This Story:** ✅ Yes | ❌ No
  - **If Yes:** [Cómo esta story usa este integration point]
- Integration Point 2: [Si aplica]
  - **Applies to This Story:** ...

**Critical Questions Already Asked at Epic Level:**

[Extraer del comentario del epic - sección "Critical Questions"]

**Questions for PO:**

- Question 1: [Pregunta ya hecha a nivel epic]
  - **Status:** ⏳ Pending | ✅ Answered | ❌ Not Relevant to This Story
  - **If Answered:** [Respuesta del PO - buscar en comentarios del epic]
  - **Impact on This Story:** [Cómo la respuesta afecta esta story]

**Questions for Dev:**

- Question 1: [Pregunta ya hecha a nivel epic]
  - **Status:** ⏳ Pending | ✅ Answered | ❌ Not Relevant to This Story
  - **If Answered:** [Respuesta del Dev - buscar en comentarios del epic]
  - **Impact on This Story:** [Cómo la respuesta afecta esta story]

**Test Strategy from Epic:**

[Extraer del comentario del epic - sección "Test Strategy"]

- Test Levels: [Unit, Integration, E2E, API - según epic]
- Tools: [Playwright, Vitest, etc. - según epic]
- **How This Story Aligns:** [Explicar qué niveles/tools aplican a esta story específica]

**Updates and Clarifications from Epic Refinement:**

[Si hay respuestas de PO/Dev en comentarios del epic después del test plan inicial, extraerlas aquí]

- Update 1: [Clarificación importante]
- Update 2: [Si aplica]

**Summary: How This Story Fits in Epic:**

[Sintetizar cómo esta story específica encaja en el contexto más amplio del epic basado en toda la información anterior]

- **Story Role in Epic:** [Ej: "Esta story implementa el frontend del integration point identificado en el epic"]
- **Inherited Risks:** [Qué riesgos del epic aplican directamente]
- **Unique Considerations:** [Qué es único de esta story que NO se cubrió a nivel epic]

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

[Analizar story.md en detalle para identificar ambigüedades]

**Ambiguity 1:** [Descripción de ambigüedad]

- **Location in Story:** [Dónde está - acceptance criteria, description, etc.]
- **Question for PO/Dev:** [Pregunta específica para clarificar]
- **Impact on Testing:** [Qué no podemos probar sin clarificar esto]
- **Suggested Clarification:** [Cómo debería clarificarse]

**Ambiguity 2:** [Si aplica]

- **Location in Story:** ...
- **Question for PO/Dev:** ...
- **Impact on Testing:** ...
- **Suggested Clarification:** ...

**If NO ambiguities found:** ✅ Story is clear and well-defined

---

### Missing Information / Gaps

[Identificar qué falta en la story para poder testearse correctamente]

**Gap 1:** [Qué información falta]

- **Type:** [Acceptance Criteria | Technical Details | Business Rule | etc.]
- **Why It's Critical:** [Por qué lo necesitamos para testing]
- **Suggested Addition:** [Qué debería agregarse a la story]
- **Impact if Not Added:** [Qué riesgo tiene no agregarlo]

**Gap 2:** [Si aplica]

- **Type:** ...
- **Why It's Critical:** ...
- **Suggested Addition:** ...
- **Impact if Not Added:** ...

**If NO gaps found:** ✅ Story has complete information for testing

---

### Edge Cases NOT Covered in Original Story

[Identificar edge cases que la story NO menciona pero son críticos]

**Edge Case 1:** [Descripción del edge case]

- **Scenario:** [Qué pasa si...]
- **Expected Behavior:** [Cómo debería comportarse el sistema - inferir o preguntar]
- **Criticality:** High | Medium | Low
- **Action Required:** [Add to story | Add to test cases only | Ask PO]

**Edge Case 2:** [Si aplica]

- **Scenario:** ...
- **Expected Behavior:** ...
- **Criticality:** ...
- **Action Required:** ...

**If NO edge cases identified:** ✅ Story covers all edge cases adequately

---

### Testability Validation

**Is this story testeable as written?** ✅ Yes | ⚠️ Partially | ❌ No

**Testability Issues (if any):**

- [ ] Acceptance criteria are vague or subjective
- [ ] Expected results are not specific enough
- [ ] Missing test data examples
- [ ] Missing error scenarios
- [ ] Missing performance criteria (if NFR applies)
- [ ] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**
[Si hay issues, listar recomendaciones específicas]

---

## ✅ Paso 3: Refined Acceptance Criteria

[Tomar acceptance criteria del story.md y refinarlos con datos específicos + agregar edge cases identificados]

### Scenario 1: [Nombre del escenario refinado - Happy Path]

**Type:** Positive
**Priority:** Critical

- **Given:**
  - [Estado inicial del sistema - MUY ESPECÍFICO con datos]
  - [Precondiciones - usuario logged in como X, datos existentes Y, etc.]

- **When:**
  - [Acción del usuario - ESPECÍFICA con datos exactos]
  - [Ej: User enters email "john@example.com" and clicks "Submit"]

- **Then:**
  - [Resultado esperado 1 - ESPECÍFICO y VERIFICABLE]
  - [Resultado esperado 2 - con datos exactos]
  - [Resultado esperado 3 - cambios en sistema/DB]
  - [Status code esperado si es API: 200 OK]
  - [Response format esperado si es API]

---

### Scenario 2: [Error scenario - datos inválidos]

**Type:** Negative
**Priority:** High

- **Given:**
  - [Estado inicial]

- **When:**
  - [Acción con datos INVÁLIDOS específicos]
  - [Ej: User enters invalid email "notanemail"]

- **Then:**
  - [Mensaje de error EXACTO que debe mostrarse]
  - [Status code: 400 Bad Request]
  - [Response: {success: false, error: {code: "INVALID_EMAIL", message: "Email format is invalid"}}]
  - [Verificación: sistema NO cambió estado/DB]

---

### Scenario 3: [Edge case - caso límite]

**Type:** Boundary
**Priority:** Medium/High

- **Given:**
  - [Estado inicial]

- **When:**
  - [Acción con valor límite - min, max, empty, etc.]

- **Then:**
  - [Comportamiento esperado específico]

---

### Scenario 4: [Edge case adicional NO en story original]

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis (Paso 2)

- **Given:**
  - [Estado inicial del edge case]

- **When:**
  - [Acción específica del edge case]

- **Then:**
  - [Comportamiento esperado - NECESITA VALIDACIÓN CON PO/DEV]
  - **⚠️ NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation

---

[Continuar con todos los scenarios necesarios - NO forzar número mínimo]

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** [Número realista basado en complejidad]

**Breakdown:**

- Positive: [X] test cases
- Negative: [Y] test cases
- Boundary: [Z] test cases
- Integration: [W] test cases (si aplica)
- API: [V] test cases (si la story tiene API endpoints)

**Rationale for This Number:**
[Explicar por qué este número es adecuado - considerar complejidad, integration points, edge cases identificados]

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes | ❌ No

**If Yes:**

**Parametrized Test Group 1:** [Nombre descriptivo]

- **Base Scenario:** [Qué se está probando]
- **Parameters to Vary:** [Qué datos varían]
- **Test Data Sets:**

| Parameter 1 | Parameter 2 | Parameter 3 | Expected Result |
| ----------- | ----------- | ----------- | --------------- |
| [value 1]   | [value 2]   | [value 3]   | [result 1]      |
| [value 4]   | [value 5]   | [value 6]   | [result 2]      |
| [value 7]   | [value 8]   | [value 9]   | [result 3]      |

**Total Tests from Parametrization:** [Número de combinaciones]
**Benefit:** [Por qué parametrizar este caso - reduce duplicación, mejor coverage, etc.]

---

**Parametrized Test Group 2:** [Si aplica]

- **Base Scenario:** ...
- **Parameters to Vary:** ...
- **Test Data Sets:** [Tabla similar]

---

**If No Parametrization:**
[Explicar por qué no se recomienda - ej: scenarios are too different, no common pattern, etc.]

---

### Nomenclatura de Test Outlines (Shift-Left)

**Contexto:** En Shift-Left Testing, los test cases son **Test Outlines** - guías para testing exploratorio, no test cases formales. La nomenclatura es más simple que en Test Documentation (Fase 11).

**Formato:**

```
Validar <CORE> <CONDITIONAL>
```

**Definición de componentes:**

| Componente    | Qué es                                                                 | Ejemplos                                                                                                  |
| ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `CORE`        | **El comportamiento principal** que se está validando (verbo + objeto) | `login exitoso`, `error de validación`, `creación de usuario`, `cálculo de total`                         |
| `CONDITIONAL` | **La condición o contexto** que hace único este escenario              | `con credenciales válidas`, `cuando el campo está vacío`, `para usuarios premium`, `al exceder el límite` |

**Fórmula mental:**

```
"Validar [QUÉ comportamiento] [BAJO QUÉ condición]"
```

**Ejemplos por tipo de test:**

| Tipo     | CORE                         | CONDITIONAL                          | Título Completo                                                       |
| -------- | ---------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| Positive | `login exitoso`              | `con credenciales válidas`           | Validar login exitoso con credenciales válidas                        |
| Negative | `error de autenticación`     | `cuando el password es incorrecto`   | Validar error de autenticación cuando el password es incorrecto       |
| Boundary | `límite de caracteres`       | `al ingresar exactamente 50 chars`   | Validar límite de caracteres al ingresar exactamente 50 chars         |
| Edge     | `comportamiento del carrito` | `cuando hay múltiples ítems iguales` | Validar comportamiento del carrito cuando hay múltiples ítems iguales |

**Para proyectos en inglés:**

```
Should <BEHAVIOR> <CONDITION>
```

| Tipo     | Título                                                    |
| -------- | --------------------------------------------------------- |
| Positive | Should login successfully with valid credentials          |
| Negative | Should display error message when password is incorrect   |
| Boundary | Should accept exactly 50 characters in name field         |
| Edge     | Should calculate total correctly with multiple same items |

**Anti-patrones (evitar):**

| ❌ Incorrecto          | ✅ Correcto                                            | Por qué                              |
| ---------------------- | ------------------------------------------------------ | ------------------------------------ |
| `Test de login`        | `Validar login exitoso con credenciales válidas`       | Falta CORE específico y CONDITIONAL  |
| `Login - error`        | `Validar error de autenticación con password inválido` | Demasiado vago, no describe contexto |
| `Probar el formulario` | `Validar envío de formulario con todos los campos`     | No indica qué comportamiento         |
| `Caso negativo`        | `Validar rechazo de registro cuando email ya existe`   | No describe el escenario             |

**Nota:** En Fase 11 (Test Documentation), se agrega el prefijo `<TS_ID>: TC#:` para test cases formales en Jira/Xray. Ver `.context/guidelines/QA/jira-test-management.md`.

---

### Test Outlines

#### **Validar [CORE: comportamiento principal] [CONDITIONAL: condición específica]**

**Related Scenario:** Scenario 1 (Refined AC above)
**Type:** Positive | Negative | Boundary
**Priority:** Critical | High | Medium | Low
**Test Level:** UI | API | Integration | E2E
**Parametrized:** ✅ Yes (Group 1) | ❌ No

---

**Preconditions:**

- [Estado inicial del sistema necesario]
- [Datos pre-existentes en DB si aplica - SER ESPECÍFICO]
- [Usuario logged in como: [role/email]]
- [Configuración necesaria del sistema]

---

**Test Steps:**

1. [Paso 1 - acción específica con datos exactos]
   - **Data:** Field1: "value1", Field2: "value2"
2. [Paso 2 - acción específica]
   - **Data:** [Si aplica]
3. [Paso 3 - verificación específica]
   - **Verify:** [Qué verificar exactamente - elemento UI, response API, DB state]

---

**Expected Result:**

- **UI:** [Si aplica - qué debe verse, qué mensaje, qué cambio visual]
- **API Response:** [Si aplica]
  - Status Code: [200 OK | 201 Created | etc.]
  - Response Body:

    ```json
    {
      "success": true,
      "data": {
        "field1": "expected value",
        "field2": 123
      }
    }
    ```

- **Database:** [Si aplica - qué debe cambiar en DB]
  - Table: [tabla]
  - Record: [qué record se creó/modificó/eliminó]
  - Fields: [campos específicos con valores esperados]
- **System State:** [Cambios en estado del sistema]

---

**Test Data:**

```json
{
  "input": {
    "field1": "specific value",
    "field2": 123,
    "field3": true
  },
  "user": {
    "email": "testuser@example.com",
    "role": "user_role_from_PRD"
  }
}
```

---

**Post-conditions:**

- [Estado del sistema después del test]
- [Cleanup necesario si aplica]

---

#### **Validar [CORE: error/rechazo] [CONDITIONAL: condición de error]**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:**

- [Estado inicial]

**Test Steps:**

1. [Paso con datos INVÁLIDOS específicos]
2. [Verificar error response]

**Expected Result:**

- **Status Code:** 400 Bad Request
- **Response Body:**

  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_INPUT",
      "message": "Email format is invalid",
      "field": "email"
    }
  }
  ```

- **Database:** NO changes (verify data was NOT created/modified)
- **UI:** [Si aplica - mensaje de error debe mostrarse]

**Test Data:**

```json
{
  "input": {
    "email": "invalid-email-format",
    "password": "Valid123!"
  }
}
```

---

#### **Validar [CORE: comportamiento límite] [CONDITIONAL: valor/condición boundary]**

**Related Scenario:** Scenario 3
**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1)

[... estructura similar ...]

---

[Continuar con TODOS los test cases necesarios - tantos como se identificaron en "Test Coverage Analysis"]

---

## 🔗 Integration Test Cases (If Applicable)

[Si la story involucra integration points identificados en Paso 1]

### Integration Test 1: [Descripción - ej: Frontend ↔ Backend API]

**Integration Point:** [Frontend → Backend API]
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API is running
- Frontend can reach API endpoint
- [Otros pre-requisitos]

**Test Flow:**

1. Frontend sends request to API endpoint [URL]
2. API processes request
3. API returns response
4. Frontend receives and processes response

**Contract Validation:**
[Basado en api-contracts.yaml, validar contract]

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes

**Expected Result:**

- Integration successful
- Data flows correctly: Frontend → API → DB → API → Frontend
- No data loss or transformation errors

---

### Integration Test 2: [Si aplica - ej: Backend ↔ External Service]

**Integration Point:** [Backend → External Service (Stripe/Email/etc.)]
**Type:** Integration
**Priority:** High

**Mock Strategy:**

- External service will be MOCKED for automated tests
- Real integration tested manually in staging environment
- Mock tool: [MSW | Nock | etc.]

**Test Flow:**

1. [Paso de integración]
2. [Verificación]

**Expected Result:**

- [Resultado esperado de integración]

---

## 📊 Edge Cases Summary

[Consolidar todos los edge cases identificados]

| Edge Case     | Covered in Original Story? | Added to Refined AC?     | Test Case | Priority |
| ------------- | -------------------------- | ------------------------ | --------- | -------- |
| [Edge case 1] | ❌ No                      | ✅ Yes (Scenario 4)      | TC-XXX    | High     |
| [Edge case 2] | ✅ Yes                     | ✅ Yes (Scenario 3)      | TC-YYY    | Medium   |
| [Edge case 3] | ❌ No                      | ⚠️ Needs PO confirmation | TBD       | Low      |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                |
| --------------- | ----- | --------------- | ----------------------- |
| Valid data      | [X]   | Positive tests  | [Ejemplos específicos]  |
| Invalid data    | [Y]   | Negative tests  | [Ejemplos específicos]  |
| Boundary values | [Z]   | Boundary tests  | [min, max, empty, null] |
| Edge case data  | [W]   | Edge case tests | [Ejemplos específicos]  |

### Data Generation Strategy

**Static Test Data:**
[Datos que se hardcodean porque son críticos/específicos]

- [Ejemplo 1]
- [Ejemplo 2]

**Dynamic Test Data (using Faker.js):**
[Datos que se generan dinámicamente]

- User data: `faker.internet.email()`, `faker.person.firstName()`
- Numbers: `faker.number.int({ min: X, max: Y })`
- Dates: `faker.date.recent()`

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 📝 PARTE 2: Integración y Output

**⚠️ IMPORTANTE:** Esta parte implementa el flujo **JIRA-FIRST → LOCAL MIRROR** para mantener consistencia con el proceso de gestión de stories.

---

### Paso 5: Update Story in Jira

**Objetivo:** Refinar la story en Jira CON los refinamientos identificados en Paso 2, ANTES de generar test cases.

**Herramienta:** MCP de Atlassian

**Pasos a ejecutar:**

1. **Leer story actual de Jira:**
   - Usar MCP de Atlassian para obtener la issue
   - Input: Jira Key real extraído de story.md (ej: UPEX-45)
   - ⚠️ **NO usar** nomenclatura de carpeta (STORY-UPEX-45)
   - Obtener: description, acceptance criteria actuales

2. **Preparar contenido refinado:**

   Basado en análisis de Paso 2, preparar:
   - **Refined Acceptance Criteria** (de Paso 3)
   - **Edge Cases Identificados** (de Paso 2)
   - **Clarified Business Rules** (de Paso 2)

3. **Actualizar story en Jira:**
   - Usar MCP de Atlassian para editar la issue
   - Agregar nueva sección al description con el siguiente contenido:

   ***

   ## 🧪 QA Refinements (Shift-Left Analysis)

   **Analysis Date:** [YYYY-MM-DD]
   **Status:** Refined by QA

   ### Refined Acceptance Criteria

   [Pegar refined scenarios de Paso 3]

   ### Edge Cases Identified

   [Listar edge cases de Paso 2]

   ### Clarified Business Rules

   [Agregar clarificaciones de Paso 2]

   ***
   - Agregar label: `shift-left-reviewed`

**Output esperado:**

- ✅ Story actualizada en Jira con refinamientos
- ✅ Label `shift-left-reviewed` agregada
- ✅ Description enriquecida con análisis de QA

---

### Paso 6: Add Test Cases Comment in Jira

**Objetivo:** Agregar TODOS los test cases como comentario en la story de Jira para máxima visibilidad del equipo.

**Herramienta:** MCP de Atlassian

**Estructura del comentario:**

```
## 🧪 Shift-Left Test Cases - Generated [Date]

**QA Engineer:** [Nombre o "AI-Generated"]
**Status:** Draft - Pending PO/Dev Review

---

[PEGAR AQUÍ TODO EL CONTENIDO GENERADO DESDE "Test Cases: STORY-..." HASTA "Test Execution Tracking"]

---

## 📢 Action Required

**@[Product Owner]:**

- [ ] Review and answer Critical Questions (see Paso 8 below)
- [ ] Validate suggested story improvements
- [ ] Confirm expected behavior for identified edge cases

**@[Dev Lead]:**

- [ ] Review Technical Questions (see Paso 8 below)
- [ ] Validate integration points and test approach
- [ ] Confirm test data strategy

**@[QA Team]:**

- [ ] Review test cases for completeness
- [ ] Validate parametrization strategy
- [ ] Prepare test environment

---

**Next Steps:**

1. Team discusses critical questions and ambiguities
2. PO/Dev provide answers and clarifications
3. QA updates test cases based on feedback
4. Dev starts implementation with clear acceptance criteria

---

**Documentation:** Full test cases also available at:
`.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md`
```

**Pasos a ejecutar:**

1. Usar MCP de Atlassian para agregar comentario a la issue
2. Input: Story Jira Key + contenido completo del comentario
3. Mencionar en el comentario a los miembros del equipo (@PO, @Dev, @QA) según configuración del proyecto

**Output esperado:**

- ✅ Comentario creado en Jira con test cases completos
- ✅ Equipo notificado vía mentions
- ✅ Checklist de acciones agregado para follow-up

---

### Paso 7: Generate Local test-cases.md (Mirroring)

**Objetivo:** Crear archivo local `.md` como MIRROR del comentario en Jira para version control y documentación offline.

**Path:** `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md`

**Contenido:** IDÉNTICO al contenido generado en Paso 6 (todo el template de Test Cases)

**Output esperado:**

- ✅ Archivo `test-cases.md` creado localmente
- ✅ Contenido es MIRROR exacto del comentario en Jira
- ✅ Disponible para git versioning

---

### Paso 8: Final QA Feedback Report

**Objetivo:** Reportar al USUARIO el resumen ejecutivo y acciones pendientes.

**Formato del reporte:**

---

## ✅ Shift-Left Test Cases - Execution Summary

**Story:** [STORY-KEY] - [Title]
**Analysis Date:** [YYYY-MM-DD]

---

### 📊 Summary for PO/Dev

**Story Quality Assessment:** ✅ Good | ⚠️ Needs Improvement | ❌ Significant Issues

**Key Findings:**

1. [Finding 1 - ej: Story is clear but missing edge case X]
2. [Finding 2 - ej: Acceptance criteria should specify error messages]
3. [Finding 3 - si aplica]

---

### 🚨 Critical Questions for PO

[Preguntas que DEBEN responderse antes de implementación]

**Question 1:** [Pregunta específica sobre negocio o comportamiento]

- **Context:** [Por qué preguntamos esto]
- **Impact if not answered:** [Qué riesgo tiene]
- **Suggested Answer:** [Si tenemos sugerencia basada en user journey/business model]

**Question 2:** [Si aplica]

- **Context:** ...
- **Impact if not answered:** ...
- **Suggested Answer:** ...

---

### 🔧 Technical Questions for Dev

[Preguntas técnicas que afectan testing approach]

**Question 1:** [Pregunta técnica - ej: cómo se maneja concurrencia]

- **Context:** [Por qué preguntamos]
- **Impact on Testing:** [Cómo afecta nuestros test cases]

**Question 2:** [Si aplica]

- **Context:** ...
- **Impact on Testing:** ...

---

### 💡 Suggested Story Improvements

[Sugerencias para mejorar la story ANTES de implementar - basadas en análisis de Paso 2]

**Improvement 1:** [Sugerencia específica]

- **Current State:** [Cómo está ahora el acceptance criteria / description]
- **Suggested Change:** [Cómo debería estar]
- **Benefit:**
  - Clarity: [Cómo mejora claridad]
  - Testability: [Cómo mejora testability]
  - Quality: [Cómo reduce riesgos]

**Improvement 2:** [Si aplica]

- **Current State:** ...
- **Suggested Change:** ...
- **Benefit:** ...

---

### 🧪 Testing Recommendations

**Pre-Implementation Testing:**

- ✅ Recommended: Exploratory testing with mockups/prototypes
- ✅ Recommended: Review API contracts with Dev before implementation
- [Otras recomendaciones específicas]

**During Implementation:**

- ✅ Pair with Dev for integration testing approach
- ✅ Review unit tests as Dev writes them
- [Otras recomendaciones]

**Post-Implementation:**

- ✅ Run all test cases designed here
- ✅ Additional exploratory testing session
- ✅ Performance testing (if NFRs apply)
- [Otras recomendaciones]

---

### ⚠️ Risks & Mitigation

[Riesgos específicos de esta story]

**Risk 1:** [Descripción del riesgo]

- **Likelihood:** High | Medium | Low
- **Impact:** High | Medium | Low
- **Mitigation:** [Qué test cases mitigan este riesgo]

**Risk 2:** [Si aplica]

- **Likelihood:** ...
- **Impact:** ...
- **Mitigation:** ...

---

### ✅ What Was Done

**Jira Updates:**

- ✅ Story refined in Jira with acceptance criteria improvements
- ✅ Label `shift-left-reviewed` added
- ✅ Test cases added as comment in Jira story
- ✅ Team members tagged for review (@PO, @Dev, @QA)

**Local Files:**

- ✅ `test-cases.md` created at: `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/`

**Test Coverage:**

- Total test cases designed: [X]
  - Positive: [Y]
  - Negative: [Z]
  - Boundary: [W]
  - Integration: [V]

---

### 🎯 Next Steps (Team Action Required)

1. **PO:** Review critical questions in Jira comment and provide answers
2. **Dev:** Review technical questions and validate test approach
3. **Team:** Discuss suggested story improvements in refinement session
4. **QA:** Wait for clarifications, then finalize test cases
5. **Dev:** Start implementation ONLY after critical questions are resolved

---

**⚠️ BLOCKER:** Dev should NOT start implementation until critical questions are answered by PO.

**Jira Link:** [Link to story in Jira]
**Local Test Cases:** `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md`

---

---

## 🎯 Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved
- [ ] Story is updated with suggested improvements (if accepted by PO)
- [ ] All test cases are executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium/Low test cases: ≥95% passing
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing (if applicable)
- [ ] API contract validation passed (if applicable)
- [ ] NFRs validated (if applicable)
- [ ] Regression tests passed
- [ ] Exploratory testing completed
- [ ] Test execution report generated
- [ ] No blockers for next stories in epic

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md`
- **Epic:** `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/feature-test-plan.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: [X]
- Passed: [Y]
- Failed: [Z]
- Blocked: [W]

**Bugs Found:**

- [Bug ID 1]: [Descripción breve]
- [Bug ID 2]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

**Formato:** Markdown estructurado siguiendo flujo **JIRA-FIRST → LOCAL MIRROR**

---

## 🔧 Prerequisitos para Ejecutar Este Prompt

- ✅ TODOS los archivos de contexto (idea, PRD, SRS) deben estar completos
- ✅ Feature test plan debe existir
- ✅ Story.md local debe existir
- ✅ **Story Path local disponible** (ej: `.context/PBI/epics/EPIC-UPEX-13-name/stories/STORY-UPEX-45-name/`)
- ✅ **Story.md debe contener campo `Jira Key:`** con el key real (ej: UPEX-45)
- ✅ **Epic.md debe contener campo `Jira Key:`** con el epic key real (ej: UPEX-13)
- ✅ **Acceso a MCP de Atlassian configurado y funcionando**
- ✅ Tiempo para analizar críticamente y no solo generar test cases mecánicamente

**⚠️ Validación de story.md:**

El archivo story.md debe contener en su metadata:

```markdown
**Jira Key:** UPEX-45
**Epic:** EPIC-UPEX-13-feature-name
```

Estos son los datos reales. Nota: El número de issue (45, 13) es el mismo en la nomenclatura de carpeta y en el Jira Key.

---

## 📋 Flujo de Ejecución (Para la IA)

### Paso 0: Crear rama de trabajo

**Objetivo:** Crear una rama específica para el trabajo de Shift-Left Testing antes de generar los test cases.

**Pasos a ejecutar:**

1. Checkout desde `staging`: `git checkout staging && git pull`
2. Crear rama usando el formato: `test/{JIRA_KEY}/{short-description}`
3. El `{JIRA_KEY}` se extrae del campo `**Jira Key:**` del story.md
4. El `{short-description}` se deriva del nombre/título de la story en kebab-case (máx 3-4 palabras)

**Ejemplo:**

```bash
git checkout staging && git pull
git checkout -b test/UPEX-45/user-login-flow
```

**⚠️ IMPORTANTE:** Esta rama solo contendrá el archivo `test-cases.md` generado. NO incluir otros cambios.

---

### Input requerido del usuario:

```
Story Path: .context/PBI/epics/EPIC-UPEX-13-nombre/stories/STORY-UPEX-45-nombre/
```

**⚠️ Proceso Automático:**

1. Prompt lee: `{STORY_PATH}/story.md`
2. Prompt extrae: Campo `**Jira Key:**` (ej: UPEX-45)
3. Prompt extrae: Campo `**Epic:**` para encontrar epic path
4. Prompt lee: Epic.md y extrae Epic Jira Key (ej: UPEX-13)
5. Prompt usa: Jira Keys reales para operaciones MCP

### Orden de ejecución:

**Paso 0: Crear rama de trabajo**

1. Leer `{STORY_PATH}/story.md` proporcionado por usuario
2. Extraer campo `**Jira Key:**` de story (ej: UPEX-45)
3. Derivar `{short-description}` del título de la story en kebab-case
4. Ejecutar: `git checkout staging && git pull`
5. Crear rama: `git checkout -b test/{JIRA_KEY}/{short-description}`

**Pre-requisito: Extraer Jira Keys** 6. Extraer campo `**Epic:**` para obtener epic path 7. Leer epic.md y extraer Epic Jira Key (ej: UPEX-13) 8. Guardar ambos Jira Keys reales para Pasos 5 y 6

**Leer Contexto Completo:** 9. Leer todos los archivos de contexto (PRD, SRS, epic.md local, feature-test-plan.md, story.md) 10. Leer story actual de Jira con MCP (usando Story Jira Key real) 11. Leer epic de Jira con MCP (usando Epic Jira Key real) 12. **Leer comentarios del epic en Jira** - especialmente "Feature Test Plan"

**PARTE 1 - Análisis y Diseño:** 13. **Paso 1:** Critical Analysis (incluye Epic-Level Context de comentarios) 14. **Paso 2:** Story Quality Analysis 15. **Paso 3:** Refined Acceptance Criteria 16. **Paso 4:** Test Design

**PARTE 2 - Integración y Output:** 17. **Paso 5:** Actualizar story en Jira con refinamientos (MCP + Story Jira Key real) 18. **Paso 6:** Crear comentario en Jira con test cases completos (MCP + Story Jira Key real) 19. **Paso 7:** Generar archivo local `test-cases.md` en {STORY_PATH}/ (Write tool) 20. **Paso 8:** Reportar resumen al usuario (Output) 21. **Paso 9:** Commit del archivo `test-cases.md` en la rama de trabajo

### Herramientas a usar:

**Git (Bash):**

- Para checkout de `staging` y pull de cambios recientes
- Para crear rama de trabajo con formato `test/{JIRA_KEY}/{short-description}`
- Para commit del archivo `test-cases.md` generado

**MCP de Atlassian:**

- Para leer story de Jira
- Para leer epic de Jira (description actualizado)
- **Para leer comentarios del epic en Jira** (especialmente "Feature Test Plan")
- Para actualizar story description y labels
- Para agregar comentarios a issues

**File Operations:**

- Para crear archivo local test-cases.md
- Para leer archivos de contexto (PRD, SRS, epic, feature-test-plan, story.md)

---

## ⚠️ IMPORTANTE: Principios de Ejecución

### Shift-Left Testing Philosophy:

- ✅ **Análisis crítico primero, test design después**
- ✅ **Feedback temprano es MÁS valioso que test cases perfectos**
- ✅ **Refinar la story ANTES de implementación** (shift-left!)
- ✅ **Test cases exploratorios = comentarios en Jira** (no incidencias separadas)
- ✅ **Contexto epic es crítico** - SIEMPRE leer comentarios del epic en Jira para obtener:
  - Riesgos ya identificados
  - Preguntas ya respondidas por PO/Dev
  - Integration points críticos
  - Updates posteriores al test plan inicial

### Test Design Guidelines:

- ❌ **NO forzar número mínimo de test cases** - depende de complejidad
- ✅ **Usar parametrización cuando aplique** - reduce duplicación
- ✅ **Identificar edge cases NO cubiertos** en story original
- ✅ **Hacer preguntas críticas a PO/Dev** - mejor clarificar que asumir

### Jira-First Workflow:

- ✅ **SIEMPRE actualizar Jira primero, luego local** (consistencia con flujo de stories)
- ✅ **Test cases van en comentarios, NO en subtareas** (naturaleza exploratoria)
- ✅ **Taggear al equipo** (@PO, @Dev, @QA) para visibilidad
- ✅ **Agregar label `shift-left-reviewed`** para tracking

---

## 🎯 Post-Generación: Acciones del Equipo

### Inmediatamente después de ejecutar este prompt:

1. **PO debe:**
   - Revisar comentario en Jira con test cases
   - Responder "Critical Questions for PO" en Paso 8
   - Validar "Suggested Story Improvements"
   - Confirmar expected behavior de edge cases identificados

2. **Dev debe:**
   - Revisar comentario en Jira con test cases
   - Responder "Technical Questions for Dev" en Paso 8
   - Validar integration points y test approach
   - **NO empezar implementación** hasta resolver preguntas críticas

3. **QA debe:**
   - Esperar respuestas de PO/Dev
   - Actualizar test cases basado en feedback
   - Preparar test environment

4. **Usuario (quien ejecutó el prompt) debe:**
   - Compartir link de Jira story con equipo
   - Facilitar discusión de preguntas críticas
   - Asegurar que preguntas sean respondidas antes de sprint

---

## 🚀 Evolución de Test Cases (Post Shift-Left)

### Opciones para formalizar test cases:

Una vez que PO/Dev han clarificado todas las preguntas y la story está refinada:

**Opción A: Mantener en comentarios** (Recomendado para stories simples)

- Test cases quedan en comentario de Jira
- Archivo local sirve como documentación
- QA ejecuta desde archivo local o comentario

**Opción B: Migrar a Xray/Zephyr** (Para stories complejas o críticas)

- Crear Test Set/Suite en herramienta de gestión de tests
- Linkear con story usando "IsTestedBy"
- Mantener archivo local como mirror

**Opción C: Automatizar** (Una vez test cases son estables)

- Usar test cases como base para automation scripts
- Generar tests con Playwright/Cypress basados en test-cases.md
- Integrar a CI/CD pipeline

---

## 🔄 Workflow Integrado: Epic ↔ Story Context

### Flujo de Información:

```
1. Epic Test Plan generado → Comentario en Epic (Jira)
                           ↓
2. PO/Dev responden preguntas en comentarios del Epic
                           ↓
3. Story Test Cases lee comentarios del Epic
                           ↓
4. Story Test Cases hereda contexto:
   - Riesgos identificados
   - Preguntas ya respondidas
   - Integration points
   - Test strategy
                           ↓
5. Story Test Cases enfoca en gaps específicos de la story
                           ↓
6. Comentario agregado a Story (Jira) con test cases
                           ↓
7. PO/Dev responden preguntas específicas de la story
                           ↓
8. Implementación comienza con contexto completo
```

**Beneficios de este flujo:**

- ✅ **Evita duplicación** de preguntas entre epic y stories
- ✅ **Contexto acumulativo** - cada story hereda conocimiento del epic
- ✅ **Trazabilidad completa** - todo está documentado en Jira comments
- ✅ **Colaboración mejorada** - PO/Dev ven evolución del análisis
- ✅ **Decisiones informadas** - Dev implementa con contexto completo de riesgos

---

## 📚 Filosofía CATA (Component-Action-Test-Architecture)

Este prompt sigue principios CATA:

- **Component:** Stories en Jira + archivos .md locales
- **Action:** Shift-Left Testing - análisis y refinamiento temprano
- **Test:** Test cases exploratorios en comentarios → formalización posterior
- **Architecture:** Jira-First → Local Mirror → Version Control → Automation (eventual)

**Trazabilidad:**

```
Epic (Jira)
  ↓ contains
Story (Jira + .md)
  ↓ IsTestedBy (via comment)
Test Cases (Comment + test-cases.md)
  ↓ eventually migrates to
Test Suite (Xray/Zephyr - opcional)
  ↓ automates to
Test Scripts (Playwright/Cypress - opcional)
```

---

**Versión:** 3.2 - Git Branch Naming Convention + Paso 0
**Última actualización:** 2025-12-06
**Cambios principales:**

- ✅ Agregado flujo Jira-First (Pasos 5-8)
- ✅ Integración con MCP de Atlassian
- ✅ Test cases en comentarios (no subtareas)
- ✅ Refinamiento automático de story en Jira
- ✅ Filosofía CATA integrada
- ✅ **Lectura de comentarios del epic en Jira** para contexto actualizado
- ✅ **Nueva sub-sección "Epic-Level Context"** en Paso 1 que extrae:
  - Riesgos críticos identificados a nivel epic
  - Integration points del epic analysis
  - Preguntas críticas ya hechas y respondidas
  - Test strategy del epic
  - Updates y clarificaciones del refinement
  - Cómo la story encaja en el epic
- ✅ **Branch Naming Convention para Git** - formato `test/{JIRA_KEY}/{short-description}`
- ✅ **Paso 0: Crear rama de trabajo** - checkout desde `staging` antes de generar test cases
- ✅ **Paso 9: Commit del archivo** - commit del `test-cases.md` en la rama de trabajo
