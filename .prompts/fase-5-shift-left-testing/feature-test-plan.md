Actúa como QA Lead experto en Shift-Left Testing, Test Strategy y Quality Analysis.

**⚠️ WORKFLOW:** Este prompt sigue el principio **JIRA-FIRST → LOCAL MIRROR**

---

## 📥 Input Requerido

### 1. Epic Path Local (OBLIGATORIO)

**Formato:** `.context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/`
**Ejemplo:** `.context/PBI/epics/EPIC-UPEX-001-user-authentication/`

**⚠️ IMPORTANTE - Diferencia entre Nomenclaturas:**

- **Path Local (carpeta):** `EPIC-UPEX-001-user-authentication` ← Nomenclatura de carpetas
- **Jira Key (real):** `UPEX-123` ← Key real del issue en Jira

**Proceso:**

1. **Usuario proporciona:** Path de la carpeta epic local
2. **Prompt lee:** Archivo `epic.md` de esa carpeta
3. **Prompt extrae:** Campo `**Jira Key:**` del epic.md (formato real: UPEX-123)
4. **Prompt usa:** Ese Jira Key real para operaciones MCP de Atlassian

**Uso del path:**

- Leer epic.md local para obtener Jira Key real
- Leer el epic actual de Jira con MCP (FASE 5a)
- Actualizar el epic en Jira con findings (FASE 5a)
- Agregar comentario con test plan completo (FASE 5b)
- Generar archivo feature-test-plan.md en esa carpeta (FASE 5c)

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

### 4. Contexto de la Feature (OBLIGATORIO)

**Paso 1: Leer Epic Local y Extraer Jira Key**

- Epic (local): [leer {EPIC_PATH}/epic.md proporcionado por el usuario]
- **Extraer del epic.md:** Campo `**Jira Key:**` (ej: UPEX-123)
- **Guardar:** Jira Key real para usar en operaciones MCP

**Paso 2: Obtener Epic de Jira**

- Epic (Jira): [usar MCP de Atlassian con el Jira Key real extraído del paso 1]

**Paso 3: Leer Stories**

- Todas las stories de la épica: [leer todos los story.md en {EPIC_PATH}/stories/]

---

## 📤 Output Generado

### En Jira (vía MCP de Atlassian):

1. **Epic actualizado** con test strategy summary y label `test-plan-ready`
2. **Comentario agregado** con test plan completo y tags al equipo

### En Local:

1. **Archivo:** `.context/PBI/epics/EPIC-{...}/feature-test-plan.md`
2. **Contenido:** Mirror exacto del comentario en Jira

### Para Usuario:

1. **Reporte:** Resumen ejecutivo con critical questions y next steps (FASE 5d)

---

## 🎯 FLUJO DE TRABAJO

Este prompt trabaja en 5 fases para entregar un plan de pruebas completo con análisis crítico, siguiendo **JIRA-FIRST → LOCAL MIRROR**:

### FASE 1: Análisis de Contexto

- Entender el valor de negocio de la épica
- Identificar usuarios afectados
- Analizar arquitectura involucrada

### FASE 2: Análisis de Riesgos

- Identificar riesgos técnicos
- Identificar riesgos de negocio
- Identificar puntos de integración críticos

### FASE 3: Estrategia de Testing

- Definir niveles de testing requeridos
- Definir tipos de testing por story
- Definir scope de testing

### FASE 4: Análisis Crítico & Plan de Testing

- Identificar ambigüedades en épica/stories
- Generar preguntas para PO/Dev
- Sugerir mejoras antes de implementación
- Entry/Exit criteria
- Test data requirements
- Estimación de test cases por story

### FASE 5: Jira Integration & Local Mirroring

- **FASE 5a:** Update Epic in Jira (agregar test strategy summary y label)
- **FASE 5b:** Add Test Plan as Comment in Jira Epic
- **FASE 5c:** Generate Local feature-test-plan.md (mirroring)
- **FASE 5d:** Final QA Feedback Report (resumen para usuario)

---

# Feature Test Plan: EPIC-{PROYECTO}-{NUM} - [Epic Title]

**Fecha:** [YYYY-MM-DD]
**QA Lead:** [Nombre o "TBD"]
**Epic Jira Key:** [EPIC-XXX]
**Status:** Draft | In Review | Approved

---

## 📋 Business Context Analysis

### Business Value

[Explicar el valor de negocio de esta épica según Business Model Canvas y Executive Summary]

**Key Value Proposition:**

- [Valor 1 que aporta al usuario]
- [Valor 2 que aporta al negocio]

**Success Metrics (KPIs):**

- [KPI 1 del Executive Summary que esta épica impacta]
- [KPI 2 del Executive Summary que esta épica impacta]

**User Impact:**
[Listar qué user personas son afectadas por esta épica]

- Persona 1: [Nombre] - [Cómo le afecta]
- Persona 2: [Nombre] - [Cómo le afecta]

**Critical User Journeys:**
[Listar user journeys del PRD que esta épica habilita o modifica]

- Journey 1: [Nombre]
- Journey 2: [Nombre]

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- [Componentes React/Vue a crear o modificar]
- [Páginas/rutas afectadas]

**Backend:**

- [APIs a crear o modificar - referenciar api-contracts.yaml]
- [Servicios de negocio afectados]

**Database:**

- [Tablas involucradas - referenciar architecture-specs.md]
- [Queries críticos]

**External Services:**

- [APIs externas involucradas]
- [Third-party services (Stripe, email, etc.)]

### Integration Points (Critical for Testing)

[Basado en architecture-specs.md, identificar puntos de integración]

**Internal Integration Points:**

- Frontend ↔ Backend API
- Backend ↔ Database
- Backend ↔ Auth Service
- [Otros módulos internos]

**External Integration Points:**

- [Sistema] ↔ [Servicio externo 1]
- [Sistema] ↔ [Servicio externo 2]

**Data Flow:**

```
[Describir flujo de datos crítico]
User → Frontend → API Gateway → Service X → Database
                              ↓
                         External Service
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: [Descripción del riesgo técnico]

- **Impact:** High | Medium | Low
- **Likelihood:** High | Medium | Low
- **Area Affected:** [Frontend | Backend | Database | Integration]
- **Mitigation Strategy:**
  - [Estrategia 1]
  - [Testing approach específico]
- **Test Coverage Required:** [Qué test cases necesitamos para mitigar]

#### Risk 2: [Descripción del riesgo técnico]

- **Impact:** ...
- **Likelihood:** ...
- **Area Affected:** ...
- **Mitigation Strategy:** ...
- **Test Coverage Required:** ...

---

### Business Risks

#### Risk 1: [Descripción del riesgo de negocio]

- **Impact on Business:** [Cómo afecta KPIs o user experience]
- **Impact on Users:** [Qué user personas se ven afectadas]
- **Likelihood:** High | Medium | Low
- **Mitigation Strategy:**
  - [Qué testing hacemos para prevenir]
  - [Qué validaciones de negocio agregamos]
- **Acceptance Criteria Validation:** [Validar que acceptance criteria cubran este riesgo]

#### Risk 2: [Descripción del riesgo de negocio]

- **Impact on Business:** ...
- **Impact on Users:** ...
- **Likelihood:** ...
- **Mitigation Strategy:** ...

---

### Integration Risks

[Identificar riesgos en puntos de integración identificados anteriormente]

#### Integration Risk 1: [Descripción]

- **Integration Point:** [Frontend ↔ API | API ↔ Database | etc.]
- **What Could Go Wrong:** [Escenarios de falla]
- **Impact:** High | Medium | Low
- **Mitigation:**
  - Integration tests específicos
  - Contract testing (si aplica)
  - Mocking strategy para testing aislado

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

[Analizar epic.md y todos los story.md de la épica para identificar ambigüedades]

**Ambiguity 1:** [Descripción de la ambigüedad]

- **Found in:** STORY-{PROYECTO}-{NUM}
- **Question for PO:** [Pregunta específica]
- **Impact if not clarified:** [Qué problemas puede causar]

**Ambiguity 2:** [Descripción]

- **Found in:** EPIC-{PROYECTO}-{NUM} scope
- **Question for Dev:** [Pregunta técnica]
- **Impact if not clarified:** ...

---

### Missing Information

[Identificar qué información falta en epic.md o stories para poder testear correctamente]

**Missing 1:** [Qué falta]

- **Needed for:** [Por qué es crítico para testing]
- **Suggestion:** [Qué agregar a la story/epic]

**Missing 2:** [Qué falta]

- **Needed for:** ...
- **Suggestion:** ...

---

### Suggested Improvements (Before Implementation)

[Sugerencias para mejorar stories ANTES de que Dev empiece a implementar]

**Improvement 1:** [Sugerencia]

- **Story Affected:** STORY-{PROYECTO}-{NUM}
- **Current State:** [Cómo está ahora]
- **Suggested Change:** [Cómo debería estar]
- **Benefit:** [Por qué mejora la quality]

**Improvement 2:** [Sugerencia]

- **Story Affected:** ...
- **Current State:** ...
- **Suggested Change:** ...
- **Benefit:** ...

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, Database)
- Integration testing (internal + external services)
- Non-functional testing (Performance, Security según NFRs)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (iOS Safari, Android Chrome)
- API contract validation (según api-contracts.yaml)
- Data validation (input/output según SRS)

**Out of Scope (For This Epic):**

- [Features que NO se testean en esta épica]
- [Testing que se deja para otras épicas]
- [Testing que se contrata externo: penetration testing, load testing extremo, etc.]

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80% code coverage
- **Focus Areas:**
  - Business logic functions/methods
  - Data validation functions
  - Utility functions
- **Responsibility:** Dev team (pero QA valida que existan)

#### Integration Testing

- **Coverage Goal:** All integration points identified above
- **Focus Areas:**
  - Frontend ↔ Backend API (según api-contracts.yaml)
  - Backend ↔ Database
  - Backend ↔ External Services (mocked)
- **Responsibility:** QA + Dev (pair programming)

#### End-to-End (E2E) Testing

- **Coverage Goal:** Critical user journeys completos
- **Tool:** Playwright
- **Focus Areas:**
  - [User Journey 1 identificado arriba]
  - [User Journey 2 identificado arriba]
  - Happy paths completos
  - Error scenarios críticos
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% de endpoints de esta épica (según api-contracts.yaml)
- **Tool:** Postman/Newman o Playwright API
- **Focus Areas:**
  - Contract validation (request/response según OpenAPI spec)
  - Status codes correctos
  - Error handling
  - Authentication/Authorization
- **Responsibility:** QA team

---

### Test Types per Story

Por cada story de esta épica, se deben cubrir:

**Positive Test Cases:**

- Happy path (flujo exitoso)
- Valid data variations (diferentes datos válidos)

**Negative Test Cases:**

- Invalid input data
- Missing required fields
- Unauthorized access attempts
- Boundary violations

**Boundary Test Cases:**

- Min/max values
- Empty/null values
- Edge cases específicos del dominio

**Exploratory Testing:**

- [Áreas que requieren exploratory testing - explicar por qué]
- Sugerencia: Hacer exploratory testing ANTES de implementación (usando mockups/prototypes)

---

## 📊 Test Cases Summary by Story

[Por cada story de la épica, estimar cuántos test cases se necesitan - SIN forzar número mínimo]

### STORY-{PROYECTO}-{NUM}: [Story Title]

**Complexity:** Low | Medium | High
**Estimated Test Cases:** [Número realista - puede ser 1, puede ser 20]

- Positive: [X] test cases
- Negative: [Y] test cases
- Boundary: [Z] test cases
- Integration: [W] test cases (si aplica)
- API: [V] test cases (si aplica)

**Rationale for estimate:**
[Explicar por qué ese número - complejidad, integration points, edge cases identificados]

**Parametrized Tests Recommended:** Yes | No
[Si Yes, explicar qué tests se benefician de parametrización]

---

### STORY-{PROYECTO}-{NUM}: [Story Title]

**Complexity:** ...
**Estimated Test Cases:** ...

- ...

**Rationale for estimate:** ...
**Parametrized Tests Recommended:** ...

---

[Repetir para todas las stories de la épica]

---

### Total Estimated Test Cases for Epic

**Total:** [Suma de todos los test cases estimados]
**Breakdown:**

- Positive: [X]
- Negative: [Y]
- Boundary: [Z]
- Integration: [W]
- API: [V]

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**
[Basado en user personas y SRS, definir datos válidos realistas]

- User data: [Ejemplos de usuarios válidos según personas]
- Transaction data: [Ejemplos de transacciones/operaciones válidas]
- [Otros datos según el dominio]

**Invalid Data Sets:**

- [Ejemplos de datos inválidos que debemos probar]
- [Casos de input malicioso - SQL injection, XSS, etc.]

**Boundary Data Sets:**

- Min/Max values: [Según validaciones del SRS]
- Empty/null values
- Special characters
- Unicode characters (si aplica internacionalización)

**Test Data Management:**

- ✅ Use Faker.js for generating realistic test data
- ✅ Create data factories for common entities
- ❌ NO hardcodear datos estáticos en tests
- ✅ Clean up test data after test execution

---

### Test Environments

**Staging Environment:**

- URL: [Staging URL]
- Database: [Staging DB]
- External Services: [Mocked | Real staging versions]
- **Purpose:** Primary testing environment

**Production Environment:**

- URL: [Production URL]
- **Purpose:** ONLY smoke tests post-deployment
- **Restrictions:** NO destructive tests, NO test data creation

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story is fully implemented and deployed to staging
- [ ] Code review is approved by 2+ reviewers
- [ ] Unit tests exist and are passing (>80% coverage)
- [ ] Dev has done smoke testing and confirms basic functionality works
- [ ] No blocker bugs exist in dependent stories
- [ ] Test data is prepared and available in staging
- [ ] API documentation is updated (if API changes)

### Exit Criteria (Per Story)

Story is considered "Done" from QA perspective when:

- [ ] All test cases are executed
- [ ] Critical/High priority test cases: 100% passing
- [ ] Medium/Low priority test cases: ≥95% passing
- [ ] All critical and high bugs are resolved and verified
- [ ] Medium bugs have mitigation plan or are scheduled
- [ ] Regression testing passed (if changes affect other features)
- [ ] Non-functional requirements validated (performance, security)
- [ ] Test execution report is generated and shared
- [ ] Known issues are documented in release notes

### Epic Exit Criteria

Epic is considered "Done" from QA perspective when:

- [ ] ALL stories meet individual exit criteria
- [ ] Integration testing across all stories is complete
- [ ] E2E testing of critical user journeys is complete and passing
- [ ] API contract testing is complete (all endpoints validated)
- [ ] Non-functional testing is complete (NFRs from SRS validated)
- [ ] Exploratory testing session completed (findings documented)
- [ ] No critical or high bugs open
- [ ] QA sign-off document is created and approved

---

## 📝 Non-Functional Requirements Validation

[Basado en .context/SRS/non-functional-specs.md, identificar NFRs que aplican a esta épica]

### Performance Requirements

**NFR-P-XXX:** [Descripción del NFR de performance]

- **Target:** [Métrica específica - ej: "Page load < 2s"]
- **Test Approach:** [Cómo lo vamos a validar]
- **Tools:** [Lighthouse, WebPageTest, etc.]

### Security Requirements

**NFR-S-XXX:** [Descripción del NFR de seguridad]

- **Requirement:** [Requerimiento específico - ej: "All passwords hashed with bcrypt"]
- **Test Approach:** [Cómo lo vamos a validar]
- **Tools:** [OWASP ZAP, manual testing, etc.]

### Usability Requirements

**NFR-U-XXX:** [Descripción del NFR de usabilidad]

- **Requirement:** [Requerimiento específico]
- **Test Approach:** [Cómo lo vamos a validar]

---

## 🔄 Regression Testing Strategy

**Regression Scope:**
[Identificar qué áreas del sistema existente pueden verse afectadas por esta épica]

- [ ] Feature A: [Cómo puede afectarse]
- [ ] Feature B: [Cómo puede afectarse]

**Regression Test Execution:**

- Run automated regression suite before starting epic testing
- Re-run after all stories are complete
- Focus on integration points identified in architecture analysis

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** [X sprints | Y weeks]

**Breakdown:**

- Test case design: [X days]
- Test data preparation: [Y days]
- Test execution (per story): [Z days per story]
- Regression testing: [W days]
- Bug fixing cycles: [V days - buffer]
- Exploratory testing: [U days]

**Dependencies:**

- Depends on: [Épicas que deben completarse primero]
- Blocks: [Épicas que dependen de esta]

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- E2E Testing: Playwright
- API Testing: Postman/Newman or Playwright API
- Unit Testing: Vitest (frontend), Jest (backend)
- Performance Testing: Lighthouse, WebPageTest
- Security Testing: OWASP ZAP (if applicable)
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests run automatically on PR creation
- [ ] Tests run on merge to main branch
- [ ] Tests run on deployment to staging
- [ ] Smoke tests run on deployment to production

**Test Management:**

- Jira Xray (test cases linked to stories)
- Test execution reports in Xray
- Bug tracking in Jira

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- Test cases executed vs. total
- Test pass rate
- Bug detection rate
- Bug fix rate
- Test coverage (code coverage from unit tests)
- Time to test (per story)

**Reporting Cadence:**

- Daily: Test execution status
- Per Story: Test completion report
- Per Epic: Comprehensive QA sign-off report

---

## 📝 FASE 5: Jira Integration & Local Mirroring

**⚠️ IMPORTANTE:** Esta fase implementa el flujo **JIRA-FIRST → LOCAL MIRROR** para mantener consistencia con el proceso de gestión de epics.

---

### FASE 5a: Update Epic in Jira

**Objetivo:** Actualizar el epic en Jira CON los findings críticos del análisis de testing, ANTES de generar archivo local.

**Herramienta:** MCP de Atlassian

**Pasos a ejecutar:**

1. **Leer epic actual de Jira:**
   - Usar MCP de Atlassian para obtener el epic
   - Input: Jira Key real extraído de epic.md (ej: UPEX-123)
   - ⚠️ **NO usar** nomenclatura de carpeta (EPIC-UPEX-001)
   - Obtener: description actual

2. **Preparar contenido del summary:**

   Basado en análisis de FASE 1-4, preparar:

   - **Top Critical Risks** (de FASE 2)
   - **Test Coverage Summary** (de FASE 4)
   - **Critical Questions** (de FASE 4)

3. **Actualizar epic en Jira:**
   - Usar MCP de Atlassian para editar el epic
   - Agregar nueva sección al description con el siguiente contenido:

   ---
   ## 🧪 QA Test Strategy - Shift-Left Analysis

   **Analysis Date:** [YYYY-MM-DD]
   **Status:** Test Plan Ready

   ### Critical Risks Identified
   [Resumen de top 3 riesgos técnicos/negocio con mayor impacto]

   ### Test Coverage Summary
   - **Total Estimated Test Cases:** [X]
   - **Integration Points:** [Y]
   - **Critical User Journeys:** [Z]
   - **Test Complexity:** Low | Medium | High

   ### Critical Questions for Team
   [Indicar que hay preguntas críticas en comentario - ver detalles abajo]

   ### Test Strategy
   - Levels: Unit, Integration, E2E, API
   - Tools: Playwright, Vitest, Postman
   - Timeline: [X sprints/weeks estimated]

   ---

   - Agregar label: `test-plan-ready`

**Output esperado:**

- ✅ Epic actualizado en Jira con test strategy summary
- ✅ Label `test-plan-ready` agregado
- ✅ Description enriquecido con análisis de QA

---

### FASE 5b: Add Feature Test Plan as Comment in Jira

**Objetivo:** Agregar TODO el feature test plan como comentario en el epic de Jira para máxima visibilidad del equipo.

**Herramienta:** MCP de Atlassian

**Estructura del comentario:**

```
## 📋 Feature Test Plan - Generated [Date]

**QA Lead:** [Nombre o "AI-Generated"]
**Status:** Draft - Pending Team Review

---

[PEGAR AQUÍ TODO EL CONTENIDO GENERADO DESDE "Feature Test Plan: EPIC-..." HASTA "Metrics & Reporting"]

---

## 📢 Action Required

**@[Product Owner]:**

- [ ] Review ambiguities and missing information (see Critical Analysis section)
- [ ] Answer critical questions for PO
- [ ] Validate risk analysis and business impact
- [ ] Confirm test scope is complete and correct

**@[Dev Lead]:**

- [ ] Review technical risks and mitigation strategies
- [ ] Validate integration points identified
- [ ] Confirm architecture analysis is accurate
- [ ] Answer technical questions

**@[QA Team]:**

- [ ] Review test strategy and estimates
- [ ] Validate test levels and types per story
- [ ] Confirm test data requirements
- [ ] Prepare test environments and tools

---

**Next Steps:**

1. Team discusses critical questions and ambiguities in refinement
2. PO/Dev provide answers and clarifications
3. QA begins test case design per story (use story-test-cases.md prompt)
4. Team validates entry/exit criteria before sprint starts
5. Dev starts implementation ONLY after critical questions resolved

---

**Documentation:** Full test plan also available at:
`.context/PBI/epics/EPIC-{...}/feature-test-plan.md`
```

**Pasos a ejecutar:**

1. Usar MCP de Atlassian para agregar comentario al epic
2. Input: Epic Jira Key + contenido completo del comentario
3. Mencionar en el comentario a los miembros del equipo (@PO, @Dev, @QA) según configuración del proyecto

**Output esperado:**

- ✅ Comentario creado en Jira con test plan completo
- ✅ Equipo notificado vía mentions
- ✅ Checklist de acciones agregado para follow-up

---

### FASE 5c: Generate Local feature-test-plan.md (Mirroring)

**Objetivo:** Crear archivo local `.md` como MIRROR del comentario en Jira para version control y documentación offline.

**Path:** `.context/PBI/epics/EPIC-{...}/feature-test-plan.md`

**Contenido:** IDÉNTICO al contenido generado en FASE 5b (todo el test plan)

**Output esperado:**

- ✅ Archivo `feature-test-plan.md` creado localmente
- ✅ Contenido es MIRROR exacto del comentario en Jira
- ✅ Disponible para git versioning

---

### FASE 5d: Final QA Feedback Report

**Objetivo:** Reportar al USUARIO el resumen ejecutivo y acciones pendientes.

**Formato del reporte:**

---

## ✅ Feature Test Plan - Execution Summary

**Epic:** [EPIC-KEY] - [Title]
**Analysis Date:** [YYYY-MM-DD]

---

### 📊 Summary

**Epic Complexity:** Low | Medium | High
**Total Estimated Test Cases:** [X]
**Critical Risks Identified:** [Y]
**Integration Points:** [Z]
**Estimated Testing Duration:** [X sprints/weeks]

---

### 🚨 Top 3 Critical Risks

**Risk 1:** [Descripción]
- **Impact:** High
- **Area:** [Technical | Business | Integration]
- **Mitigation:** [Estrategia]

**Risk 2:** [Descripción]
- **Impact:** High/Medium
- **Area:** [Technical | Business | Integration]
- **Mitigation:** [Estrategia]

**Risk 3:** [Descripción]
- **Impact:** Medium
- **Area:** [Technical | Business | Integration]
- **Mitigation:** [Estrategia]

---

### ❓ Critical Questions Requiring PO/Dev Input

**Question 1 (For PO):** [Pregunta sobre negocio]
- **Context:** [Por qué es importante]
- **Impact if not answered:** [Qué riesgo representa]

**Question 2 (For Dev):** [Pregunta técnica]
- **Context:** [Por qué es importante]
- **Impact if not answered:** [Qué riesgo representa]

**Question 3 (For PO/Dev):** [Pregunta adicional si aplica]
- **Context:** ...
- **Impact if not answered:** ...

---

### 💡 Suggested Epic/Story Improvements

**Improvement 1:** [Sugerencia]
- **Story/Epic Affected:** [KEY]
- **Current State:** [Problema identificado]
- **Suggested Change:** [Cómo mejorarlo]
- **Benefit:** [Por qué es importante]

**Improvement 2:** [Si aplica]
- **Story/Epic Affected:** ...
- **Current State:** ...
- **Suggested Change:** ...
- **Benefit:** ...

---

### 🎯 Test Strategy Highlights

**Test Levels:**
- Unit Testing: Dev responsibility (>80% coverage goal)
- Integration Testing: QA + Dev collaboration
- E2E Testing: [X] critical user journeys
- API Testing: [Y] endpoints to validate

**Test Types per Story:**
- Positive: [X] test cases
- Negative: [Y] test cases
- Boundary: [Z] test cases
- Integration: [W] test cases

**Key Integration Points:**
- [Integration Point 1]
- [Integration Point 2]
- [Integration Point 3]

---

### ✅ What Was Done

**Jira Updates:**

- ✅ Epic updated with test strategy summary
- ✅ Label `test-plan-ready` added
- ✅ Test plan added as comment in Jira epic
- ✅ Team members tagged for review (@PO, @Dev, @QA)

**Local Files:**

- ✅ `feature-test-plan.md` created at: `.context/PBI/epics/EPIC-{...}/`

**Analysis Completed:**

- ✅ Business context analyzed (value, users, journeys)
- ✅ Technical architecture analyzed (components, integration points)
- ✅ Risk analysis completed (technical, business, integration)
- ✅ Test strategy defined (levels, types, scope)
- ✅ Test estimates per story calculated
- ✅ Entry/Exit criteria defined

---

### 🎯 Next Steps (Team Action Required)

**Immediate Actions:**

1. **PO:** Review critical questions in Jira comment and provide answers
2. **Dev Lead:** Review technical risks and validate integration points
3. **Team:** Schedule refinement session to discuss ambiguities and improvements
4. **QA:** Wait for clarifications before starting test case design per story

**Before Sprint Starts:**

5. **All:** Ensure all critical questions are answered
6. **PO:** Approve or provide feedback on suggested improvements
7. **QA:** Begin test case design for each story using `story-test-cases.md` prompt
8. **Team:** Validate entry criteria can be met for each story

**During Epic Implementation:**

9. **QA:** Execute test cases as stories are completed
10. **Team:** Address bugs and issues as they arise
11. **QA:** Track metrics and report progress daily

---

**⚠️ BLOCKER:** Epic should NOT start implementation until critical questions are resolved by PO/Dev.

**Jira Link:** [Link to epic in Jira]
**Local Test Plan:** `.context/PBI/epics/EPIC-{...}/feature-test-plan.md`

---

---

## 🎓 Notes & Assumptions

**Assumptions:**

- [Listar assumptions que se están haciendo para este plan]

**Constraints:**

- [Listar constraints - tiempo, recursos, herramientas, etc.]

**Known Limitations:**

- [Qué NO se puede testear o validar completamente]

**Exploratory Testing Sessions:**

- Recommended: [X] exploratory testing sessions BEFORE implementation
  - Session 1: [Objetivo - ej: Test with mockups/prototypes]
  - Session 2: [Objetivo - ej: Test edge cases not covered in stories]

---

## 📎 Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/stories/STORY-*/story.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

**Formato:** Markdown estructurado siguiendo flujo **JIRA-FIRST → LOCAL MIRROR**

---

## 🔧 Prerequisitos para Ejecutar Este Prompt

- ✅ TODOS los archivos de contexto (idea, PRD, SRS) deben estar completos
- ✅ Epic.md y todos los story.md de la épica deben existir
- ✅ **Epic Path local disponible** (ej: `.context/PBI/epics/EPIC-UPEX-001-feature/`)
- ✅ **Epic.md debe contener campo `Jira Key:`** con el key real (ej: UPEX-123)
- ✅ **Acceso a MCP de Atlassian configurado y funcionando**
- ✅ Tiempo para analizar críticamente, no solo generar checklist

**⚠️ Validación de epic.md:**

El archivo epic.md debe contener en su metadata:
```markdown
**Jira Key:** UPEX-123
```
Este es el Jira Key REAL del issue en Jira (NO la nomenclatura de carpeta).

---

## 📋 Flujo de Ejecución (Para la IA)

### Input requerido del usuario:

```
Epic Path: .context/PBI/epics/EPIC-UPEX-XXX-nombre-feature/
```

**⚠️ Proceso Automático:**
1. Prompt lee: `.context/PBI/epics/EPIC-UPEX-XXX-nombre-feature/epic.md`
2. Prompt extrae: Campo `**Jira Key:**` (ej: UPEX-123)
3. Prompt usa: Jira Key real UPEX-123 para operaciones MCP

### Orden de ejecución:

**Pre-requisito: Extraer Jira Key**
1. Leer `{EPIC_PATH}/epic.md` proporcionado por usuario
2. Extraer campo `**Jira Key:**` (ej: UPEX-123)
3. Guardar Jira Key real para usar en FASE 5a y 5b

**Análisis y Diseño:**
4. **FASE 1-4:** Analizar contexto, riesgos, estrategia, test cases (contenido Markdown)

**Jira Integration:**
5. **FASE 5a:** Actualizar epic en Jira con test strategy summary (MCP Atlassian + Jira Key real)
6. **FASE 5b:** Crear comentario en Jira con test plan completo (MCP Atlassian + Jira Key real)
7. **FASE 5c:** Generar archivo local `feature-test-plan.md` en {EPIC_PATH}/ (Write tool)
8. **FASE 5d:** Reportar resumen al usuario (Output)

### Herramientas a usar:

**MCP de Atlassian:**
- Para leer epic de Jira
- Para actualizar epic description y labels
- Para agregar comentario al epic

**File Operations:**
- Para crear archivo local feature-test-plan.md
- Para leer archivos de contexto (PRD, SRS, epic, stories)

---

## ⚠️ IMPORTANTE: Principios de Ejecución

### Shift-Left Testing Philosophy:

- ✅ **Análisis crítico primero, test planning después**
- ✅ **Feedback temprano es MÁS valioso que test plan perfecto**
- ✅ **Identificar riesgos ANTES de implementación** (shift-left!)
- ✅ **Test plan en comentarios** para visibilidad del equipo

### Test Planning Guidelines:

- ❌ **NO forzar número mínimo de test cases** - depende de complejidad de cada story
- ✅ **Analizar riesgos exhaustivamente** - técnicos, negocio, integración
- ✅ **Identificar ambigüedades** en epic y stories
- ✅ **Hacer preguntas críticas** - mejor clarificar que asumir

### Jira-First Workflow:

- ✅ **SIEMPRE actualizar Jira primero, luego local** (consistencia)
- ✅ **Test plan va en comentario** para máxima visibilidad
- ✅ **Taggear al equipo** (@PO, @Dev, @QA)
- ✅ **Agregar label `test-plan-ready`** para tracking

---

## 🎯 Post-Generación: Acciones del Equipo

### Inmediatamente después de ejecutar este prompt:

1. **PO debe:**
   - Revisar comentario en Jira con test plan
   - Responder "Critical Questions for PO"
   - Validar risk analysis y business impact
   - Confirmar test scope es completo y correcto

2. **Dev Lead debe:**
   - Revisar comentario en Jira con test plan
   - Responder "Technical Questions for Dev"
   - Validar integration points identificados
   - Confirmar architecture analysis es preciso
   - **NO empezar epic** hasta resolver preguntas críticas

3. **QA debe:**
   - Revisar test strategy y estimates
   - Esperar respuestas de PO/Dev antes de empezar test case design
   - Preparar test environments y tools
   - Comenzar test case design por story usando `story-test-cases.md` prompt

4. **Usuario (quien ejecutó el prompt) debe:**
   - Compartir link de Jira epic con equipo
   - Facilitar discusión de preguntas críticas en refinement
   - Asegurar que preguntas sean respondidas antes de sprint

---

## 🚀 Workflow Completo: Epic → Stories

### Orden recomendado:

1. ✅ **Ejecutar `feature-test-plan.md` prompt** para el epic completo
2. ⏸️ **Esperar feedback** de PO/Dev sobre critical questions
3. ✅ **Ejecutar `story-test-cases.md` prompt** para cada story individual
4. ⏸️ **Esperar feedback** de PO/Dev sobre cada story
5. ✅ **Comenzar sprint** solo cuando todas las preguntas estén resueltas

**Beneficio de este workflow:**
- Test plan a nivel epic identifica riesgos globales
- Test cases a nivel story identifican gaps específicos
- Ambos retroalimentan al PO/Dev ANTES de implementación
- Reduce bugs, retrabajos y malentendidos

---

**Versión:** 3.0 - Jira-First + MCP Atlassian + Shift-Left Philosophy
**Última actualización:** 2025-01-05
**Cambios principales:**

- ✅ Agregado flujo Jira-First (FASE 5a, 5b, 5c, 5d)
- ✅ Integración con MCP de Atlassian
- ✅ Test plan en comentarios (no artefactos separados)
- ✅ Refinamiento automático de epic en Jira
- ✅ Consistencia con `story-test-cases.md` prompt
