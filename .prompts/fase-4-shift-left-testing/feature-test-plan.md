Actúa como QA Lead experto en Shift-Left Testing, Test Strategy y Quality Analysis.

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

**Contexto de la Feature:**

- Epic: [usar .context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/epic.md]
- Todas las stories de la épica: [leer todos los story.md de la épica]

**Genera archivo: feature-test-plan.md** (dentro de .context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/)

---

## 🎯 FLUJO DE TRABAJO

Este prompt trabaja en 5 fases para entregar un plan de pruebas completo con análisis crítico:

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

### FASE 4: Análisis Crítico

- Identificar ambigüedades en épica/stories
- Generar preguntas para PO/Dev
- Sugerir mejoras antes de implementación

### FASE 5: Plan de Testing

- Entry/Exit criteria
- Test data requirements
- Estimación de test cases por story

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

**Formato:** Markdown estructurado, listo para copiar a `.context/PBI/epics/EPIC-{PROYECTO}-{NUM}-{nombre}/feature-test-plan.md`

**Prerequisitos:**

- TODOS los archivos de contexto (idea, PRD, SRS) deben estar completos
- Epic.md y todos los story.md de la épica deben existir
- Tiempo para analizar críticamente y no solo generar checklist

**Post-generación:**

- Compartir "Critical Analysis & Questions" con PO/Dev ANTES de que empiecen implementación
- Revisar feedback y ajustar stories si es necesario
- Crear test cases en Jira Xray y linkear con stories

**Versión:** 2.0 - Shift-Left with Complete Context & Critical Analysis
**Última actualización:** 2025-11-04
