<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Shift-Left Testing - Manual

> **Fase:** 5 - Shift-Left Testing (Testing Temprano)
> **Tiempo estimado:** 2-4 horas por épica + 30-60 min por story
> **Herramientas:** Jira, Markdown, Git, PRD/SRS como referencia
> **Pre-requisito:** Fase 4 (Specification) completada con épicas y stories

---

## Objetivo

Ejecutar **testing antes de que exista código**:

1. **Feature Test Plan:** Análisis y estrategia de testing a nivel épica
2. **Story Test Cases:** Test cases específicos por cada user story
3. **Feedback Temprano:** Identificar problemas, ambigüedades y riesgos ANTES de implementar

El principio fundamental: **encontrar defectos es más barato cuanto antes los encuentres**.

---

## Conceptos Clave

### 🔑 Shift-Left Testing

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHIFT-LEFT PHILOSOPHY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRADICIONAL:                                                    │
│                                                                  │
│  Requirements → Design → Code → Test → Deploy                   │
│                                         ↑                        │
│                                    Testing here                  │
│                                    (late, expensive)             │
│                                                                  │
│  SHIFT-LEFT:                                                     │
│                                                                  │
│  Requirements → Design → Code → Test → Deploy                   │
│       ↑             ↑                                            │
│  Testing here   Testing here                                     │
│  (early, cheap) (integration)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Por qué funciona:**

- **Costo 1x:** Encontrar bug en requirements
- **Costo 10x:** Encontrar bug en desarrollo
- **Costo 100x:** Encontrar bug en producción

### 🔑 Feature Test Plan vs Story Test Cases

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  EPIC: User Authentication                                       │
│  ┌───────────────────────────────────────────────────────┐      │
│  │          FEATURE TEST PLAN                             │      │
│  │                                                        │      │
│  │  • Risk Analysis (technical, business, integration)   │      │
│  │  • Test Strategy (levels, types, tools)               │      │
│  │  • Test Scope (in/out of scope)                       │      │
│  │  • Entry/Exit Criteria                                │      │
│  │  • NFR Validation Plan                                │      │
│  └───────────────────────────────────────────────────────┘      │
│                          │                                       │
│     ┌────────────────────┼────────────────────┐                 │
│     ▼                    ▼                    ▼                 │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐              │
│  │ STORY 1   │     │ STORY 2   │     │ STORY 3   │              │
│  │ Signup    │     │ Login     │     │ Password  │              │
│  │           │     │           │     │ Reset     │              │
│  │ ┌───────┐ │     │ ┌───────┐ │     │ ┌───────┐ │              │
│  │ │Test   │ │     │ │Test   │ │     │ │Test   │ │              │
│  │ │Cases  │ │     │ │Cases  │ │     │ │Cases  │ │              │
│  │ └───────┘ │     │ └───────┘ │     │ └───────┘ │              │
│  └───────────┘     └───────────┘     └───────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Feature Test Plan:** Vista macro, riesgos globales, estrategia general
- **Story Test Cases:** Vista micro, test cases específicos, datos concretos

### 🔑 Tipos de Test Cases

| Tipo            | Propósito                 | Ejemplo                                     |
| --------------- | ------------------------- | ------------------------------------------- |
| **Positive**    | Happy path, flujo exitoso | Login con credenciales válidas              |
| **Negative**    | Errores y validaciones    | Login con password incorrecto               |
| **Boundary**    | Valores límite            | Email con exactamente 254 caracteres        |
| **Edge Case**   | Escenarios inusuales      | Login con sesión activa en otro dispositivo |
| **Integration** | Puntos de integración     | Frontend → API → Database                   |

### 🔑 Gherkin Format

Formato estándar para escribir acceptance criteria y test cases:

```gherkin
Scenario: [Nombre descriptivo del escenario]

Given [Contexto inicial / precondiciones]
  And [Precondición adicional]
When [Acción del usuario]
  And [Acción adicional]
Then [Resultado esperado]
  And [Verificación adicional]
```

**Ejemplo concreto:**

```gherkin
Scenario: Successful login with valid credentials

Given I am on the login page
  And I have an active account with email "user@example.com"
When I enter email "user@example.com"
  And I enter password "SecurePass123!"
  And I click the "Login" button
Then I should be redirected to "/dashboard"
  And I should see "Welcome back" message
  And my session should be active for 7 days
```

---

## Pre-requisitos

### Documentación Lista

- [ ] `.context/PRD/` - Product Requirements Document completo
- [ ] `.context/SRS/` - Software Requirements Specification completo
- [ ] `.context/PBI/epics/EPIC-XXX/epic.md` - Épica documentada
- [ ] `.context/PBI/epics/EPIC-XXX/stories/STORY-YYY/story.md` - Stories documentadas

### Jira Configurado

- [ ] Épica existe en Jira con ID real
- [ ] Stories existen en Jira vinculadas a la épica
- [ ] Permisos para comentar y editar issues

---

# PARTE 1: FEATURE TEST PLAN (Nivel Épica)

## Paso 1: Analizar Contexto de Negocio

Antes de pensar en tests, entiende el **valor de negocio** de la épica.

### 1.1 Revisar Business Model Canvas

Abre `.context/idea/business-model.md` y responde:

- ¿Qué **Value Proposition** habilita esta épica?
- ¿Qué **segmentos de clientes** se benefician?
- ¿Qué **revenue stream** impacta?

### 1.2 Revisar User Personas

Abre `.context/PRD/user-personas.md` y responde:

- ¿Qué personas usan esta funcionalidad?
- ¿Cuáles son sus goals y pain points?
- ¿Qué nivel de expertise técnico tienen?

### 1.3 Revisar User Journeys

Abre `.context/PRD/user-journeys.md` y responde:

- ¿Qué journeys habilita o modifica esta épica?
- ¿En qué paso del journey encaja?
- ¿Qué pasa si falla en este punto del journey?

### 1.4 Documentar Business Context

```markdown
## Business Context Analysis

### Business Value

- **Value Proposition:** [Qué valor aporta al usuario]
- **Business Impact:** [Cómo contribuye a KPIs]

### User Impact

- **Primary User:** [Persona X] - [Cómo le afecta]
- **Secondary User:** [Persona Y] - [Cómo le afecta]

### Critical User Journeys

- [Journey 1] - Step [X]
- [Journey 2] - Step [Y]
```

---

## Paso 2: Analizar Contexto Técnico

Entiende la **arquitectura** involucrada en esta épica.

### 2.1 Revisar Architecture Specs

Abre `.context/SRS/architecture-specs.md` e identifica:

**Frontend:**

- Componentes a crear/modificar
- Páginas/rutas afectadas
- State management involucrado

**Backend:**

- APIs a crear/modificar
- Servicios de negocio afectados
- Tablas de base de datos involucradas

**Servicios Externos:**

- Integraciones con terceros (payments, email, etc.)
- APIs externas consumidas

### 2.2 Revisar API Contracts

Abre `.context/SRS/api-contracts.yaml` e identifica:

- Endpoints que esta épica crea/modifica
- Request/Response formats
- Status codes esperados
- Autenticación/autorización requerida

### 2.3 Identificar Integration Points

**Integration Points** son los lugares donde diferentes sistemas se comunican:

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION POINTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INTERNOS:                                                       │
│  • Frontend ↔ Backend API                                        │
│  • Backend ↔ Database                                            │
│  • Backend ↔ Auth Service                                        │
│  • Backend ↔ File Storage                                        │
│                                                                  │
│  EXTERNOS:                                                       │
│  • Backend ↔ Payment Provider (Stripe, etc.)                    │
│  • Backend ↔ Email Service (SendGrid, etc.)                     │
│  • Backend ↔ Third-party APIs                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Por qué importan:** Los integration points son donde más bugs ocurren.

### 2.4 Documentar Technical Context

```markdown
## Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Components: [Button, Form, Modal, ...]
- Pages: [/signup, /login, /dashboard]
- State: [AuthContext, user state]

**Backend:**

- APIs: [POST /auth/signup, POST /auth/login]
- Services: [AuthService, UserService]
- Database: [profiles table, sessions table]

**External Services:**

- [Supabase Auth]
- [Email service for verification]

### Integration Points (Critical for Testing)

1. Frontend ↔ Backend Auth API
2. Backend ↔ Supabase Auth
3. Backend ↔ Database (profiles table)
4. Backend ↔ Email Service (verification emails)
```

---

## Paso 3: Risk Analysis

Identifica qué puede salir mal y cómo mitigarlo.

### 3.1 Identificar Riesgos Técnicos

Para cada componente técnico, pregúntate:

- **Performance:** ¿Puede ser lento? ¿Hay operaciones costosas?
- **Security:** ¿Hay datos sensibles? ¿Puntos de entrada de ataques?
- **Scalability:** ¿Qué pasa con muchos usuarios concurrentes?
- **Reliability:** ¿Qué pasa si un servicio externo falla?

### 3.2 Identificar Riesgos de Negocio

- **User Experience:** ¿Puede frustrar al usuario?
- **Data Integrity:** ¿Puede perderse o corromperse data?
- **Revenue Impact:** ¿Puede afectar ingresos?
- **Reputation:** ¿Puede dañar la imagen de la empresa?

### 3.3 Identificar Riesgos de Integración

Para cada integration point:

- ¿Qué pasa si falla la conexión?
- ¿Qué pasa si la respuesta es lenta?
- ¿Qué pasa si el formato de datos cambia?

### 3.4 Documentar Risks

```markdown
## Risk Analysis

### Technical Risks

**Risk 1:** Password storage compromise

- **Impact:** High
- **Likelihood:** Low (if bcrypt used correctly)
- **Area:** Security
- **Mitigation:**
  - Validate bcrypt implementation
  - Test for SQL injection
  - Verify HTTPS enforcement
- **Test Coverage:** Security test cases, penetration testing

**Risk 2:** Session hijacking

- **Impact:** High
- **Likelihood:** Medium
- **Area:** Security
- **Mitigation:**
  - Validate JWT implementation
  - Test token expiration
  - Test secure cookie flags
- **Test Coverage:** Auth flow tests, session management tests

### Business Risks

**Risk 1:** User abandonment during signup

- **Impact:** Lost conversion, lost revenue
- **Likelihood:** High (if UX is poor)
- **Mitigation:**
  - Test form validation UX
  - Test error message clarity
  - Test mobile experience
- **Test Coverage:** UX tests, mobile tests

### Integration Risks

**Risk 1:** Email service failure during signup

- **Impact:** User can't verify email, can't use app
- **Likelihood:** Low
- **Mitigation:**
  - Implement retry logic
  - Allow manual verification fallback
- **Test Coverage:** Integration tests with mocked email, fallback tests
```

---

## Paso 4: Critical Analysis & Questions

Revisa las épicas y stories buscando **ambigüedades** y **gaps**.

### 4.1 Revisar Epic y Stories

Lee cada story de la épica y pregúntate:

- ¿El acceptance criteria es específico o vago?
- ¿Los resultados esperados son verificables?
- ¿Qué pasa si [escenario de error]?
- ¿Hay edge cases no mencionados?

### 4.2 Identificar Ambigüedades

**Ambigüedad:** Algo que puede interpretarse de más de una manera.

**Ejemplo de ambigüedad:**

```
❌ Vago: "El usuario debe poder iniciar sesión fácilmente"
         ↑
         ¿Qué significa "fácilmente"? ¿En cuántos clicks?

✅ Claro: "El usuario completa el login en máximo 2 pasos:
          1. Ingresar email y password
          2. Click en Login button
          El proceso toma menos de 10 segundos."
```

### 4.3 Identificar Missing Information

**Ejemplos de información faltante:**

- Mensaje de error exacto cuando password es incorrecto
- Tiempo máximo de sesión activa
- Comportamiento cuando hay sesión activa en otro dispositivo
- Límite de intentos fallidos de login

### 4.4 Generar Preguntas para PO/Dev

Convierte cada ambigüedad en una pregunta específica:

```markdown
## Critical Questions for Team

### Questions for PO (Product Owner)

**Q1:** ¿Cuál es el mensaje exacto cuando el password es incorrecto?

- **Context:** Story STORY-XX no especifica mensajes de error
- **Impact if not clarified:** Podemos implementar mensaje genérico que confunda al usuario
- **Suggested Answer:** "Incorrect password. Please try again."

**Q2:** ¿Qué pasa si el usuario tiene sesión activa en otro dispositivo?

- **Context:** No está claro si permitimos múltiples sesiones
- **Impact if not clarified:** Podríamos tener inconsistencias de datos
- **Suggested Answer:** Invalidar sesión anterior al hacer nuevo login

### Questions for Dev (Developer)

**Q1:** ¿Cómo manejamos rate limiting en el endpoint de login?

- **Context:** Necesitamos proteger contra brute force attacks
- **Impact on Testing:** Necesito saber los límites para diseñar test cases
- **Suggested Answer:** 5 intentos por minuto, luego lockout de 15 minutos
```

---

## Paso 5: Define Test Strategy

Con todo el análisis previo, define la estrategia de testing.

### 5.1 Define Test Scope

```markdown
## Test Scope

### In Scope

- Functional testing (UI, API, Database)
- Integration testing (internal + external services)
- Security testing (auth, injection, XSS)
- Performance testing (page load, API response time)
- Cross-browser (Chrome, Firefox, Safari)
- Mobile responsiveness (iOS, Android)

### Out of Scope (For This Epic)

- Load testing extremo (1000+ usuarios concurrentes)
- Penetration testing profesional (contratado aparte)
- Accessibility testing profundo (cubierto en epic específico)
```

### 5.2 Define Test Levels

```markdown
## Test Levels

### Unit Testing

- **Goal:** >80% code coverage
- **Focus:** Validation functions, auth utilities
- **Responsibility:** Dev team (QA validates existence)

### Integration Testing

- **Goal:** All integration points covered
- **Focus:**
  - Frontend ↔ Backend API
  - Backend ↔ Database
  - Backend ↔ External Services (mocked)
- **Responsibility:** QA + Dev (pair testing)

### End-to-End Testing

- **Goal:** Critical user journeys covered
- **Tool:** Playwright
- **Focus:**
  - Complete signup flow
  - Complete login flow
  - Password reset flow
- **Responsibility:** QA team

### API Testing

- **Goal:** 100% endpoints covered
- **Tool:** Postman/Newman or Playwright API
- **Focus:**
  - Contract validation (OpenAPI spec)
  - Status codes
  - Error handling
  - Authentication
- **Responsibility:** QA team
```

### 5.3 Define Entry/Exit Criteria

```markdown
## Entry/Exit Criteria

### Entry Criteria (Testing Can Start When)

- [ ] Story deployed to staging
- [ ] Code review approved
- [ ] Unit tests passing (>80% coverage)
- [ ] Dev smoke testing done
- [ ] Test data available

### Exit Criteria (Story Done When)

- [ ] All test cases executed
- [ ] Critical/High tests: 100% passing
- [ ] Medium/Low tests: ≥95% passing
- [ ] All Critical/High bugs resolved
- [ ] Regression tests passing
- [ ] NFRs validated
```

---

## Paso 6: Estimate Test Cases

Estima cuántos test cases necesitas por story.

### 6.1 Analyze Story Complexity

Para cada story, evalúa:

| Factor             | Low                | Medium         | High                 |
| ------------------ | ------------------ | -------------- | -------------------- |
| Business Logic     | Simple validations | Multiple rules | Complex calculations |
| Integration Points | None               | 1-2 points     | 3+ points            |
| Data Validations   | 1-3 fields         | 4-6 fields     | 7+ fields            |
| Error Scenarios    | 1-2 cases          | 3-5 cases      | 6+ cases             |
| UI Complexity      | 1 form             | Multiple forms | Complex UI           |

### 6.2 Estimate Per Story

```markdown
## Test Cases Summary by Story

### STORY-MYM-3: Signup with Email

**Complexity:** Medium
**Estimated Test Cases:** 8

- Positive: 2 (happy path, variations)
- Negative: 3 (invalid email, weak password, existing email)
- Boundary: 2 (min/max password length, email length)
- Integration: 1 (email verification flow)

**Rationale:** Signup has multiple validations and email integration.

### STORY-MYM-4: Login

**Complexity:** Medium
**Estimated Test Cases:** 6

- Positive: 1 (successful login)
- Negative: 3 (wrong password, non-existent user, unverified email)
- Boundary: 1 (session timeout)
- Integration: 1 (session management)

**Rationale:** Fewer fields but critical security implications.
```

---

## Paso 7: Document and Share Test Plan

### 7.1 Create feature-test-plan.md

Consolida todo en un archivo:

```
.context/PBI/epics/EPIC-MYM-2-user-authentication/feature-test-plan.md
```

Incluye todas las secciones que documentaste.

### 7.2 Add to Jira Epic

1. Abre la épica en Jira
2. Edita la descripción
3. Agrega sección:

```markdown
---

## 🧪 QA Test Strategy - Shift-Left Analysis

**Analysis Date:** [YYYY-MM-DD]
**Status:** Test Plan Ready

### Critical Risks Identified
1. [Risk 1 - resumen]
2. [Risk 2 - resumen]
3. [Risk 3 - resumen]

### Test Coverage Summary
- **Total Estimated Test Cases:** [X]
- **Integration Points:** [Y]
- **Critical User Journeys:** [Z]

### Critical Questions
See comment below for full list.

---
```

4. Agrega label: `test-plan-ready`

### 7.3 Add Comment with Full Test Plan

Agrega un comentario a la épica con:

- Test plan completo
- Preguntas para PO/Dev
- Taggea a los miembros del equipo (@PO, @Dev, @QA)

---

# PARTE 2: STORY TEST CASES (Nivel Story)

## Paso 8: Select Story

Elige la story a analizar. Generalmente en orden de dependencias.

### 8.1 Read Story Completely

Abre el `story.md` y lee:

- User Story (As a... I want to... So that...)
- Description
- Acceptance Criteria
- Technical Notes
- Dependencies

### 8.2 Review Feature Test Plan

Revisa el `feature-test-plan.md` de la épica para contexto:

- ¿Qué riesgos aplican a esta story?
- ¿Qué integration points afectan a esta story?
- ¿Qué preguntas del epic aplican aquí?

---

## Paso 9: Critical Analysis of Story

### 9.1 Identify Ambiguities

Lee cada acceptance criteria y pregunta:

- ¿Es específico? ¿Puedo verificarlo objetivamente?
- ¿Qué datos exactos se usan?
- ¿Qué mensaje exacto se muestra?

**Ejemplo:**

```
Original Acceptance Criteria:
"When user enters invalid email, show error message"
               ↑
               Ambiguo: ¿Qué mensaje? ¿Dónde se muestra?

Refined:
"When user enters invalid email format (e.g., 'notanemail')
 Then display error message 'Please enter a valid email address'
 And the error should appear below the email field
 And the email field should have red border"
               ↑
               Específico: Mensaje exacto, ubicación, estilo
```

### 9.2 Identify Missing Information

Lista qué falta:

```markdown
## Missing Information

**Gap 1:** No se especifica el formato del error response de la API

- **Why Critical:** Necesito saber qué validar en API tests
- **Suggested:** { "error": { "code": "INVALID_EMAIL", "message": "..." } }

**Gap 2:** No se especifica timeout de sesión

- **Why Critical:** Necesito testear comportamiento al expirar
- **Suggested:** 7 días de inactividad
```

### 9.3 Identify Edge Cases

Piensa en escenarios que la story NO menciona:

```markdown
## Edge Cases NOT in Story

**Edge Case 1:** User submits form twice (double-click)

- **Expected Behavior:** Should prevent duplicate submissions
- **Criticality:** Medium
- **Action:** Add to test cases, ask Dev about implementation

**Edge Case 2:** Network disconnection during submit

- **Expected Behavior:** Show offline message, retry option
- **Criticality:** Medium
- **Action:** Ask PO about expected behavior

**Edge Case 3:** Browser back button after successful login

- **Expected Behavior:** Should not show login form again
- **Criticality:** Low
- **Action:** Add to test cases
```

---

## Paso 10: Refine Acceptance Criteria

Reescribe los acceptance criteria con datos específicos.

### 10.1 Add Specific Data

```gherkin
# BEFORE (vago)
Scenario: Successful signup
Given I am on signup page
When I enter valid email and password
Then I should be registered

# AFTER (específico)
Scenario: Successful signup with valid credentials
Given I am on the "/signup" page
  And no account exists with email "newuser@example.com"
When I enter email "newuser@example.com"
  And I enter password "SecurePass123!"
  And I click "Create Account" button
Then I should see a loading indicator for < 3 seconds
  And I should see message "Account created! Check your email to verify."
  And I should be redirected to "/verify-email"
  And a new record should exist in "profiles" table with email "newuser@example.com"
  And a verification email should be sent to "newuser@example.com"
```

### 10.2 Add Error Scenarios

```gherkin
Scenario: Signup with invalid email format
Given I am on the "/signup" page
When I enter email "notanemail"
  And I try to submit the form
Then I should see error message "Please enter a valid email address"
  And the error should appear below the email field
  And the email field should have class "error"
  And the form should NOT be submitted
  And NO record should be created in database
```

### 10.3 Add Boundary Scenarios

```gherkin
Scenario: Signup with password at minimum length (8 characters)
Given I am on the "/signup" page
When I enter email "user@example.com"
  And I enter password "Pass123!" (exactly 8 characters)
Then the signup should succeed

Scenario: Signup with password below minimum length (7 characters)
Given I am on the "/signup" page
When I enter email "user@example.com"
  And I enter password "Pass12!" (only 7 characters)
Then I should see error "Password must be at least 8 characters"
```

---

## Paso 11: Design Test Cases

Convierte los scenarios en test cases ejecutables.

### 11.1 Test Case Structure

````markdown
### TC-01: Validar signup exitoso con credenciales válidas

**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

---

**Preconditions:**

- User is not logged in
- No account exists with email "newuser@example.com"
- Staging environment is accessible

---

**Test Steps:**

1. Navigate to "/signup"
   - **Verify:** Signup form is displayed

2. Enter email: "newuser@example.com"
   - **Verify:** Email field accepts the value

3. Enter password: "SecurePass123!"
   - **Verify:** Password is masked
   - **Verify:** Password strength indicator shows "Strong"

4. Click "Create Account" button
   - **Verify:** Loading indicator appears

---

**Expected Results:**

- **UI:** Success message "Account created! Check your email to verify."
- **UI:** Redirect to "/verify-email" page
- **Database:** New record in `profiles` table with:
  - email: "newuser@example.com"
  - created_at: [current timestamp]
  - email_verified: false
- **Email:** Verification email sent to "newuser@example.com"

---

**Test Data:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!"
}
```
````

---

**Post-conditions:**

- Clean up: Delete test user from database after test

```

### 11.2 Nomenclatura de Test Cases

Usa formato claro:

```

Validar [COMPORTAMIENTO] [CONDICIÓN]

````

**Ejemplos:**
- `Validar signup exitoso con credenciales válidas`
- `Validar error de validación cuando email tiene formato inválido`
- `Validar límite de caracteres al ingresar exactamente 50 chars`
- `Validar rechazo de login cuando password es incorrecto`

### 11.3 Parametrized Tests

Cuando tienes el mismo test con diferentes datos, usa parametrización:

```markdown
### TC-XX: Validar rechazo de email con formato inválido (Parametrizado)

**Type:** Negative
**Priority:** High
**Test Level:** UI + API

---

**Test Data Sets:**

| # | Email Input | Expected Error Message |
|---|-------------|----------------------|
| 1 | "notanemail" | "Please enter a valid email address" |
| 2 | "@example.com" | "Please enter a valid email address" |
| 3 | "user@" | "Please enter a valid email address" |
| 4 | "user@.com" | "Please enter a valid email address" |
| 5 | "" (empty) | "Email is required" |

---

**Base Test Steps:**

1. Navigate to signup page
2. Enter email from data set
3. Try to submit form
4. **Verify:** Error message matches expected

---

**Benefit:** 5 test scenarios en 1 test case parametrizado
````

---

## Paso 12: Design Integration Tests

Si la story tiene integration points, diseña tests específicos.

### 12.1 API Integration Test

```markdown
### IT-01: Validar integración Frontend → Backend (Signup API)

**Integration Point:** Frontend → POST /auth/signup
**Type:** Integration
**Priority:** High

---

**Test Flow:**

1. **Frontend sends request:**
```

POST /auth/signup
Content-Type: application/json

{
"email": "test@example.com",
"password": "SecurePass123!"
}

```

2. **Backend processes:**
- Validates input
- Creates user in Supabase Auth
- Creates profile in database
- Sends verification email

3. **Backend responds:**
```

HTTP 201 Created

{
"success": true,
"message": "Account created",
"user": {
"id": "uuid-xxx",
"email": "test@example.com"
}
}

```

4. **Frontend handles:**
- Shows success message
- Redirects to verify-email page

---

**Contract Validation (from api-contracts.yaml):**
- [ ] Request format matches spec
- [ ] Response format matches spec
- [ ] Status code is 201 for success
- [ ] Error responses match spec
```

---

## Paso 13: Document and Share Test Cases

### 13.1 Create test-cases.md

```
.context/PBI/epics/EPIC-MYM-2-.../stories/STORY-MYM-3-.../test-cases.md
```

Incluye:

- Critical Analysis (ambiguities, gaps, edge cases)
- Refined Acceptance Criteria
- All Test Cases
- Integration Tests
- Test Data Summary
- Questions for PO/Dev

### 13.2 Update Story in Jira

1. Edita la descripción de la story
2. Agrega sección:

```markdown
---

## 🧪 QA Refinements (Shift-Left Analysis)

**Analysis Date:** [YYYY-MM-DD]
**Status:** Refined by QA

### Refined Acceptance Criteria
[Pegar scenarios refinados]

### Edge Cases Identified
1. [Edge case 1]
2. [Edge case 2]

### Test Coverage
- Test Cases: [X]
- Positive: [Y]
- Negative: [Z]
- Boundary: [W]

---
```

3. Agrega label: `shift-left-reviewed`

### 13.3 Add Comment with Test Cases

Agrega comentario con test cases completos y taggea al equipo.

---

## Checklist Final

### Feature Test Plan (Epic Level) ✅

- [ ] Business context analyzed
- [ ] Technical architecture analyzed
- [ ] Risk analysis completed (technical, business, integration)
- [ ] Critical questions documented
- [ ] Test strategy defined (scope, levels, tools)
- [ ] Entry/Exit criteria defined
- [ ] Test cases estimated per story
- [ ] `feature-test-plan.md` created
- [ ] Epic updated in Jira
- [ ] Team notified

### Story Test Cases ✅

- [ ] Story analyzed for ambiguities
- [ ] Missing information identified
- [ ] Edge cases identified
- [ ] Acceptance criteria refined with specific data
- [ ] Test cases designed (positive, negative, boundary)
- [ ] Integration tests designed (if applicable)
- [ ] Parametrization used where beneficial
- [ ] `test-cases.md` created
- [ ] Story updated in Jira
- [ ] Team notified

### Questions Resolved ✅

- [ ] PO answered business questions
- [ ] Dev answered technical questions
- [ ] Test cases updated based on answers

---

## Troubleshooting

### "Story is too vague to test"

**Solución:** Convierte cada ambigüedad en una pregunta específica para el PO. No asumas - pregunta.

### "Too many test cases"

**Solución:** Usa parametrización. Si tienes 10 tests que solo varían en datos, hazlo 1 test parametrizado con 10 data sets.

### "Don't know what edge cases to consider"

**Solución:** Usa estas categorías:

- **Empty/Null:** ¿Qué pasa si el campo está vacío?
- **Boundary:** ¿Qué pasa en los límites min/max?
- **Timing:** ¿Qué pasa si es muy lento/rápido?
- **Concurrency:** ¿Qué pasa si dos usuarios hacen lo mismo?
- **State:** ¿Qué pasa si el sistema está en estado inesperado?

### "PO/Dev don't respond to questions"

**Solución:**

1. Tag directamente en Jira comment
2. Menciona que la implementación está bloqueada
3. Propón respuestas sugeridas para facilitar la discusión

---

## Recursos Adicionales

- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Test Case Design Techniques](https://www.guru99.com/test-case-design-techniques.html)
- [Boundary Value Analysis](https://www.softwaretestinghelp.com/boundary-value-analysis/)
- [Equivalence Partitioning](https://www.softwaretestinghelp.com/equivalence-partitioning-technique/)

---

## Próximos Pasos

Con el shift-left testing completado, puedes proceder a:

1. **Fase 6: Planning** → Crear implementation plans técnicos
2. **Fase 7: Implementation** → Dev implementa (con tests claros)
3. **Fase 10: Exploratory Testing** → Ejecutar tests diseñados + exploratorio

Los test cases creados aquí se usarán:

- Durante implementation (Dev tiene criterios claros)
- En exploratory testing (Fase 10)
- Para test documentation formal (Fase 11)
- Como base para automation (Fase 12)

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
**Autor:** UPEX Galaxy - DOJO AI-Powered Quality Engineer
