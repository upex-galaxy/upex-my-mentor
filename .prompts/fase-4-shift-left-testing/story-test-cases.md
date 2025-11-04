Actúa como QA Engineer experto en Shift-Left Testing, Test Case Design y Critical Analysis.

**Input (Contexto Completo Obligatorio):**

**Contexto de Negocio:**

- Business Model: [usar .context/idea/business-model.md]
- Executive Summary: [usar .context/PRD/executive-summary.md]
- User Personas: [usar .context/PRD/user-personas.md]
- User Journeys: [usar .context/PRD/user-journeys.md]

**Contexto Técnico:**

- Functional Specs: [usar .context/SRS/functional-specs.md - COMPLETO]
- Non-Functional Specs: [usar .context/SRS/non-functional-specs.md]
- Architecture Specs: [usar .context/SRS/architecture-specs.md]
- API Contracts: [usar .context/SRS/api-contracts.yaml]

**Contexto de la Story:**

- Epic: [usar .context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/epic.md]
- Feature Test Plan: [usar .context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/feature-test-plan.md]
- Story: [usar .context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/stories/STORY-{PROYECTO}-{NUM}-{nombre}/story.md]

**Genera archivo: test-cases.md** (dentro de .context/PBI/epics/EPIC-{...}/stories/STORY-{...}/)

---

## 🎯 FLUJO DE TRABAJO

Este prompt trabaja en 5 fases para entregar test cases completos con análisis crítico previo:

### FASE 1: Critical Analysis

- Analizar la story desde perspectiva de negocio
- Identificar ambigüedades en acceptance criteria
- Identificar qué falta en la story

### FASE 2: Story Refinement & Gap Identification

- Refinar acceptance criteria con datos específicos
- Identificar edge cases NO mencionados en story original
- Validar que TODO sea testeable

### FASE 3: Test Strategy Planning

- Determinar cuántos test cases se necesitan realmente
- Identificar oportunidades para parametrización
- Planear integration/API tests si aplican

### FASE 4: Test Design

- Generar test cases (positive, negative, boundary)
- Diseñar parametrized tests cuando aplique
- Diseñar integration/API tests basados en arquitectura

### FASE 5: QA Feedback Report

- Documentar hallazgos y preguntas para PO/Dev
- Sugerir mejoras a la story ANTES de implementación

---

# Test Cases: STORY-{PROYECTO}-{NUM} - [Story Title]

**Fecha:** [YYYY-MM-DD]
**QA Engineer:** [Nombre o "TBD"]
**Story Jira Key:** [STORY-XXX]
**Epic:** EPIC-{PROYECTO}-{NUM} - [Epic Title]
**Status:** Draft | In Review | Approved

---

## 📋 FASE 1: Critical Analysis

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

## 🚨 FASE 2: Story Quality Analysis

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

## ✅ FASE 3: Refined Acceptance Criteria

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
**Source:** Identified during critical analysis (FASE 2)

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

## 🧪 FASE 4: Test Design

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

### Test Cases

#### **TC-001: [Título descriptivo y específico]**

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
    "role": "mentee"
  }
}
```

---

**Post-conditions:**

- [Estado del sistema después del test]
- [Cleanup necesario si aplica]

---

#### **TC-002: [Título - test negativo]**

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

#### **TC-003: [Título - boundary test]**

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

[Si la story involucra integration points identificados en FASE 1]

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

| Edge Case     | Covered in Original Story? | Added to Refined AC?    | Test Case | Priority |
| ------------- | -------------------------- | ----------------------- | --------- | -------- |
| [Edge case 1] | ❌ No                       | ✅ Yes (Scenario 4)      | TC-XXX    | High     |
| [Edge case 2] | ✅ Yes                      | ✅ Yes (Scenario 3)      | TC-YYY    | Medium   |
| [Edge case 3] | ❌ No                       | ⚠️ Needs PO confirmation | TBD       | Low      |

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

## 📝 FASE 5: QA Feedback Report

### Summary for PO/Dev

**Story Quality Assessment:** ✅ Good | ⚠️ Needs Improvement | ❌ Significant Issues

**Key Findings:**

1. [Finding 1 - ej: Story is clear but missing edge case X]
2. [Finding 2 - ej: Acceptance criteria should specify error messages]
3. [Finding 3 - si aplica]

---

### Critical Questions for PO

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

### Technical Questions for Dev

[Preguntas técnicas que afectan testing approach]

**Question 1:** [Pregunta técnica - ej: cómo se maneja concurrencia]

- **Context:** [Por qué preguntamos]
- **Impact on Testing:** [Cómo afecta nuestros test cases]

**Question 2:** [Si aplica]

- **Context:** ...
- **Impact on Testing:** ...

---

### Suggested Story Improvements

[Sugerencias para mejorar la story ANTES de implementar - basadas en análisis de FASE 2]

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

### Testing Recommendations

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

### Risks & Mitigation

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

- **Story:** `.context/PBI/epics/EPIC-{...}/stories/STORY-{...}/story.md`
- **Epic:** `.context/PBI/epics/EPIC-{...}/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-{...}/feature-test-plan.md`
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

**Formato:** Markdown estructurado, listo para copiar a `.context/PBI/epics/EPIC-{...}/stories/STORY-{...}/test-cases.md`

**Prerequisitos:**

- TODOS los archivos de contexto (idea, PRD, SRS) deben estar completos
- Feature test plan debe existir
- Story.md debe existir
- Tiempo para analizar críticamente y no solo generar test cases mecánicamente

**Post-generación:**

- Compartir "QA Feedback Report" (FASE 5) con PO/Dev INMEDIATAMENTE
- Esperar resolución de ambiguities/questions antes de que Dev empiece
- Actualizar story.md si PO acepta mejoras sugeridas
- Crear test cases en Jira Xray y linkear con story

**IMPORTANTE:**

- NO forzar número mínimo de test cases - depende de complejidad
- Usar parametrización cuando aplique - reduce duplicación
- Análisis crítico primero, test design después
- Feedback temprano es MÁS valioso que test cases perfectos

**Versión:** 2.0 - Critical Analysis First + Parametrization + Flexible Coverage
**Última actualización:** 2025-11-04
