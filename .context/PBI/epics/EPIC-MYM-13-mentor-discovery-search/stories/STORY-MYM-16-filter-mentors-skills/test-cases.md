# Test Cases: STORY-MYM-16 - Filter Mentors by Skills

**Fecha:** 2025-12-12
**QA Engineer:** Claude Code (Shift-Left Analysis)
**Story Jira Key:** MYM-16
**Epic:** EPIC-MYM-13 - Mentor Discovery & Search
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** Laura (Developer Junior) - Necesita encontrar mentores con skills específicos para acelerar su carrera
- **Secondary:** Todos los mentees buscando expertise técnico específico

**Business Value:**
- **Value Proposition:** Permite narrowing efectivo de búsqueda para encontrar matches precisos
- **Business Impact:** Aumenta conversión mentor-match → booking al mostrar exactamente lo que buscan

**Related User Journey:**
- Journey: Mentee Discovery Journey
- Step: "Filtrar y refinar búsqueda" → "Seleccionar mentor"

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- Components: `MentorFilters`, `Badge`, `MentorCard`
- Pages/Routes: `/mentors` (page.tsx)
- State Management: URL search params + React useState

**Backend:**
- API Endpoints: Supabase RPC + Direct queries
- Database: `profiles` table con `specialties` (TEXT[])
- RPC Functions: `get_all_unique_skills()`, `search_mentors_by_keyword()`

**Integration Points:**
- Frontend URL params → Server Component searchParams
- Supabase query con `.contains("specialties", skills)`

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**
- Business logic complexity: Medium - AND logic entre múltiples skills
- Integration complexity: Medium - Coordinación URL ↔ Server ↔ DB
- Data validation complexity: Low - Skills son strings predefinidos
- UI complexity: Low - Badges clickeables existentes

**Estimated Test Effort:** Medium

---

### Known Bugs (Retesting Required)

**MYM-46:** Search input does not trim trailing spaces
- **Status:** OPEN
- **Impact on This Story:** Afecta combinación search + skill filter

**MYM-47:** Skill filtering uses OR logic instead of AND
- **Status:** OPEN
- **Impact on This Story:** Bug principal de esta story - incumple AC1

**MYM-48:** Filters are client-side only, no skill_filter sent to backend
- **Status:** OPEN
- **Impact on This Story:** Arquitectura incorrecta, debe ser server-side

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Comportamiento al deseleccionar skills

- **Location in Story:** Acceptance Criteria
- **Question for PO/Dev:** ¿Al deseleccionar un skill, se mantienen los otros o se limpian todos?
- **Impact on Testing:** Necesario para test de UX flow
- **Suggested Clarification:** Al deseleccionar un skill, se mantienen los demás seleccionados

**Ambiguity 2:** Máximo de skills seleccionables

- **Location in Story:** Technical Notes
- **Question for PO/Dev:** ¿Hay límite de skills que se pueden seleccionar?
- **Impact on Testing:** Boundary testing
- **Suggested Clarification:** No limit (pero en práctica limitado por skills disponibles)

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Búsqueda sin resultados con múltiples skills

- **Scenario:** User selecciona combinación de skills que ningún mentor tiene
- **Expected Behavior:** Mostrar empty state con mensaje y botón "Clear filters"
- **Criticality:** High
- **Action Required:** Add to test cases

**Edge Case 2:** Skills con caracteres especiales

- **Scenario:** Skill contiene caracteres como "C#", "Node.js", "AWS/GCP"
- **Expected Behavior:** Filtrar correctamente sin errores de encoding
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 3:** Seleccionar skill mientras hay keyword activo

- **Scenario:** User tiene keyword "React" y selecciona skill "TypeScript"
- **Expected Behavior:** Combinar ambos filtros (AND logic)
- **Criticality:** High (AC2)
- **Action Required:** Covered in AC2, add specific test

---

### Testability Validation

**Is this story testeable as written?** ✅ Yes

**Testability Issues:** None - ACs están bien definidos en Gherkin

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Mentee applies single skill filter

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Mentee está en la página `/mentors`
  - Existen mentores verificados con diferentes skills
  - Sidebar de filtros muestra badges de skills disponibles

- **When:**
  - Mentee hace click en badge "Python"

- **Then:**
  - Badge "Python" cambia a variant="default" (seleccionado)
  - URL actualiza a `?skill=Python`
  - Gallery muestra SOLO mentores con "Python" en specialties
  - Count de resultados actualiza
  - Sección "Filtros Activos" muestra "Python" con botón X

---

### Scenario 2: Mentee applies multiple skill filters (AND logic)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Mentee está en `/mentors`
  - Existe al menos 1 mentor con Python Y Django
  - Existen mentores con solo Python o solo Django

- **When:**
  - Mentee selecciona "Python" Y luego "Django"

- **Then:**
  - URL actualiza a `?skill=Python&skill=Django`
  - Gallery muestra SOLO mentores que tienen AMBOS skills
  - Mentores con solo Python NO aparecen
  - Mentores con solo Django NO aparecen
  - Count refleja mentores con ambos skills

---

### Scenario 3: Combining skill filter with keyword search

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Mentee ha seleccionado skill "JavaScript"
  - Gallery muestra mentores con JavaScript

- **When:**
  - Mentee escribe "Node.js" en search bar

- **Then:**
  - URL actualiza a `?skill=JavaScript&keyword=Node.js`
  - Gallery muestra mentores con JavaScript skill AND "Node.js" en profile
  - Filtros combinados aplican AND logic

---

### Scenario 4: Clear single skill filter

**Type:** Positive
**Priority:** High

- **Given:**
  - Mentee tiene 2 skills seleccionados: Python, Django
  - URL: `?skill=Python&skill=Django`

- **When:**
  - Mentee hace click en X del filtro activo "Python"

- **Then:**
  - Python se deselecciona
  - Django permanece seleccionado
  - URL actualiza a `?skill=Django`
  - Gallery actualiza mostrando mentores con Django

---

### Scenario 5: Clear all filters

**Type:** Positive
**Priority:** High

- **Given:**
  - Mentee tiene keyword "React" y skill "TypeScript" seleccionados

- **When:**
  - Mentee hace click en "Limpiar" (clear all filters)

- **Then:**
  - URL limpia: `/mentors`
  - Search input vacío
  - Todos los skill badges en variant="outline"
  - Gallery muestra todos los mentores verificados

---

### Scenario 6: No results with skill filter

**Type:** Negative
**Priority:** High

- **Given:**
  - Existen mentores verificados pero ninguno tiene "COBOL"

- **When:**
  - Mentee selecciona skill "COBOL" (si existe en lista)
  - O combina skills que ningún mentor tiene

- **Then:**
  - Gallery muestra empty state
  - Mensaje: "No se encontraron mentores con los filtros seleccionados."
  - Botón "Limpiar filtros" visible

---

### Scenario 7: Trailing spaces in search combined with skill filter

**Type:** Edge Case (BUG MYM-46 retest)
**Priority:** High

- **Given:**
  - Mentee tiene skill "Python" seleccionado

- **When:**
  - Mentee escribe "Django " (con espacio al final) en search

- **Then:**
  - Sistema trimea el espacio automáticamente
  - Busca "Django" (sin espacio)
  - Resultados combinan skill Python + keyword Django

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

**Breakdown:**
- Positive: 6 test cases
- Negative: 2 test cases
- Boundary: 2 test cases
- Regression (bugs): 2 test cases

---

### Test Cases

#### **TC-001: Single skill filter selection**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**
- Al menos 3 mentores verificados en DB
- Mentor A con skills: [Python, Django]
- Mentor B con skills: [JavaScript, React]
- Mentor C con skills: [Python, React]

**Test Steps:**

1. Navegar a `/mentors`
2. Verificar que todos los skill badges están en variant="outline"
3. Click en badge "Python"
4. Verificar URL contiene `?skill=Python`

**Expected Result:**
- Badge "Python" cambia a variant="default"
- Gallery muestra Mentor A y Mentor C (ambos tienen Python)
- Mentor B (JavaScript, React) NO aparece
- Count muestra "2 mentores encontrados"
- Sección "Filtros Activos" muestra "Python"

---

#### **TC-002: Multiple skill filter with AND logic**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**
- Mentor A: [Python, Django]
- Mentor B: [Python, React]
- Mentor C: [Django, JavaScript]

**Test Steps:**

1. Navegar a `/mentors`
2. Click en badge "Python"
3. Click en badge "Django"
4. Verificar URL: `?skill=Python&skill=Django`

**Expected Result:**
- Solo Mentor A aparece (tiene AMBOS Python Y Django)
- Mentor B NO aparece (tiene Python pero no Django)
- Mentor C NO aparece (tiene Django pero no Python)
- Count: "1 mentor encontrado"

---

#### **TC-003: Skill filter combined with keyword search**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**
- Mentor A: skills=[JavaScript], bio="Expert in Node.js backend"
- Mentor B: skills=[JavaScript], bio="Frontend specialist"
- Mentor C: skills=[Python], bio="Node.js and Python"

**Test Steps:**

1. Navegar a `/mentors`
2. Click en badge "JavaScript"
3. Escribir "Node.js" en search input
4. Esperar debounce (300ms)

**Expected Result:**
- URL: `?skill=JavaScript&keyword=Node.js`
- Solo Mentor A aparece (tiene JavaScript skill + "Node.js" en bio)
- Mentor B NO aparece (tiene JavaScript pero no "Node.js" en bio)
- Mentor C NO aparece (tiene "Node.js" pero no skill JavaScript)

---

#### **TC-004: Deselect single skill keeps others**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**
- URL: `/mentors?skill=Python&skill=Django`
- 2 skills seleccionados visualmente

**Test Steps:**

1. Click en X del filtro activo "Python"

**Expected Result:**
- Python badge vuelve a variant="outline"
- Django badge permanece variant="default"
- URL: `?skill=Django`
- Gallery actualiza con mentores que tienen Django

---

#### **TC-005: Clear all filters button**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**
- URL: `/mentors?skill=React&keyword=TypeScript`

**Test Steps:**

1. Click en botón "Limpiar" en sidebar de filtros

**Expected Result:**
- URL: `/mentors` (sin params)
- Search input vacío
- Todos badges en variant="outline"
- Gallery muestra todos mentores verificados

---

#### **TC-006: Empty results with skill filter shows message**

**Related Scenario:** Scenario 6
**Type:** Negative
**Priority:** High
**Test Level:** E2E

**Preconditions:**
- No existe ningún mentor con combinación Python + Rust

**Test Steps:**

1. Navegar a `/mentors`
2. Seleccionar "Python"
3. Seleccionar "Rust" (si existe, o usar combinación imposible)

**Expected Result:**
- Empty state visible con data-testid="empty_state_no_results"
- Mensaje indica que no hay resultados
- Botón "Clear filters" o ClearSearchButton visible

---

#### **TC-007: URL with skill params loads correctly on refresh**

**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**
- Mentores con skill Python existen

**Test Steps:**

1. Navegar directamente a `/mentors?skill=Python&skill=Django`
2. Page loads (refresh)

**Expected Result:**
- Skills Python y Django pre-seleccionados (badges variant="default")
- Gallery muestra mentores filtrados
- Filtros Activos muestra ambos skills

---

#### **TC-008: Skill filter works server-side (not client-only)**

**Related Bug:** MYM-48
**Type:** Regression
**Priority:** Critical
**Test Level:** E2E + Network inspection

**Preconditions:**
- DevTools Network tab open

**Test Steps:**

1. Navegar a `/mentors`
2. Seleccionar skill "Python"
3. Observar Network tab

**Expected Result:**
- Page hace navigation request (Next.js server component)
- URL cambia a `?skill=Python`
- NO hay client-side filtering - data viene filtrada del server
- Si SSR: HTML response ya contiene solo mentores con Python

---

#### **TC-009: Search trims trailing spaces with skill filter**

**Related Bug:** MYM-46
**Type:** Regression
**Priority:** High
**Test Level:** E2E

**Preconditions:**
- Mentor con skill Python y "Django" en bio

**Test Steps:**

1. Navegar a `/mentors`
2. Seleccionar skill "Python"
3. Escribir "Django " (con espacio al final) en search
4. Esperar resultados

**Expected Result:**
- Sistema trimea espacio automáticamente
- URL: `?skill=Python&keyword=Django` (sin espacio)
- Resultados correctos (mentor con Python skill + Django en bio)

---

#### **TC-010: Multiple skills use AND not OR**

**Related Bug:** MYM-47
**Type:** Regression
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**
- Mentor A: [Python, Django]
- Mentor B: [Python] (solo)
- Mentor C: [Django] (solo)

**Test Steps:**

1. Navegar a `/mentors`
2. Seleccionar "Python"
3. Seleccionar "Django"

**Expected Result:**
- SOLO Mentor A aparece
- Mentor B NO aparece (OR logic mostraría B porque tiene Python)
- Mentor C NO aparece (OR logic mostraría C porque tiene Django)
- AND logic confirmado

---

#### **TC-011: Skills with special characters filter correctly**

**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E

**Preconditions:**
- Mentor con skills: ["C#", "Node.js", "AWS"]

**Test Steps:**

1. Navegar a `/mentors`
2. Seleccionar skill "C#" (si existe)
3. O seleccionar "Node.js"

**Expected Result:**
- Filtro funciona correctamente
- URL encoding correcto (`?skill=C%23` o `?skill=Node.js`)
- No errores de JavaScript

---

#### **TC-012: Maximum skills selected**

**Type:** Boundary
**Priority:** Low
**Test Level:** E2E

**Preconditions:**
- 10+ skills disponibles en sistema

**Test Steps:**

1. Navegar a `/mentors`
2. Seleccionar 5+ skills diferentes

**Expected Result:**
- Todos los skills se agregan a URL
- Filtro AND aplica a todos
- Sistema no crashea
- Probablemente 0 resultados (narrowing extremo)

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Test Case | Priority |
|-----------|---------------------------|-----------|----------|
| AND vs OR logic | ✅ Yes (AC1) | TC-002, TC-010 | Critical |
| Keyword + Skill combo | ✅ Yes (AC2) | TC-003 | Critical |
| Trailing spaces | ❌ No (Bug MYM-46) | TC-009 | High |
| Server-side filtering | ❌ No (Bug MYM-48) | TC-008 | Critical |
| Special characters in skills | ❌ No | TC-011 | Medium |
| Max skills selected | ❌ No | TC-012 | Low |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid skills | 5-10 | Positive tests | Python, Django, JavaScript, React, TypeScript |
| Skill combos | 3 | AND logic tests | [Python+Django], [JS+React], [Python+React] |
| Edge skills | 2 | Boundary tests | C#, Node.js |
| Invalid combos | 1 | Negative tests | Skills que ningún mentor tiene |

### Test Data Cleanup

- ✅ Tests use existing verified mentors in DB
- ✅ No test data creation needed (query existing)
- ✅ Tests are idempotent

---

## ✅ Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] TC-001 to TC-012 ejecutados y pasando
- [ ] Bug MYM-46 verificado como fixed (TC-009)
- [ ] Bug MYM-47 verificado como fixed (TC-002, TC-010)
- [ ] Bug MYM-48 verificado como fixed (TC-008)
- [ ] Acceptance Criteria AC1 y AC2 pasando
- [ ] Build y linting sin errores

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-16-filter-mentors-skills/story.md`
- **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/feature-test-plan.md`
- **Feature Implementation Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/feature-implementation-plan.md`

---

## 📋 Test Execution Tracking

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [TBD]

**Results:**
- Total Tests: 12
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Verified:**
- [ ] MYM-46: Trailing spaces
- [ ] MYM-47: OR vs AND logic
- [ ] MYM-48: Client-side filtering

**Sign-off:** [TBD]

---

**Generado por:** Claude Code
**Fecha:** 2025-12-12
