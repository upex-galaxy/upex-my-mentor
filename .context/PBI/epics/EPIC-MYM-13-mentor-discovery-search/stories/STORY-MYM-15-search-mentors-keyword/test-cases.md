# Test Cases: STORY-MYM-15 - Search Mentors by Keyword

**Fecha:** 2025-12-07
**QA Engineer:** AI-Generated (Shift-Left Testing)
**Story Jira Key:** MYM-15
**Epic:** EPIC-MYM-13 - Mentor Discovery & Search
**Status:** ✅ Ready for Test Implementation

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Laura, la Desarrolladora Junior - Necesita encontrar rápidamente un mentor experto en una tecnología específica (ej. React) para resolver problemas puntuales de código
- **Secondary:** Sofía, la Cambiadora de Carrera - Busca mentores especializados en Data Science/ML para guiar su transición profesional

**Business Value:**

- **Value Proposition:** Permite a los mentees encontrar mentores relevantes de forma rápida y eficiente mediante búsqueda por palabra clave
- **Business Impact:** Directamente vinculado al KPI de 25% conversion rate (profile view → booking) y al target de $5K GMV

**Related User Journey:**

- Journey: Registro de Estudiante y Reserva de Primera Sesión
- Step: Step 3 - "Laura busca mentores usando el filtro 'React' y 'Frontend'"

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: SearchBar (controlled input), MentorGallery (grid), MentorCard
- Pages/Routes: `/mentors` (mentor listing page)
- State Management: URL search params for query persistence

**Backend:**

- API Endpoints: `GET /api/mentors?keyword={keyword}`
- Services: Mentor search service
- Database: `profiles` table, `mentor_profiles` table con columnas `bio`, `full_name`, `specialties[]`

**Integration Points:**

- Frontend SearchBar ↔ API `/api/mentors`
- API ↔ Supabase PostgreSQL (ILIKE query)

---

### Story Complexity Analysis

**Overall Complexity:** Medium (reducido después del refinamiento)

**Complexity Factors:**

- Business logic complexity: **Medium** - Algoritmo de búsqueda bien definido
- Integration complexity: **Medium** - Frontend ↔ API ↔ DB
- Data validation complexity: **Low** - Reglas claras de validación
- UI complexity: **Low** - Search bar con controlled input

**Estimated Test Effort:** Medium
**Rationale:** Con las especificaciones técnicas claras, los test cases son predecibles y ejecutables.

---

### Technical Decisions Summary (From Refined Story)

| Aspecto | Decisión | Test Implication |
|---------|----------|------------------|
| Case-sensitivity | Case-insensitive (ILIKE) | Test "react" → finds "React" |
| Match type | Partial match (`%keyword%`) | Test "Java" → finds "JavaScript" |
| Fuzzy search | NO (MVP) | Test "Raect" → NO finds "React" |
| Search fields | `full_name`, `bio`, `specialties[]` | Test each field separately |
| Multiple words | OR logic | Test "React TypeScript" → finds either |
| Only verified | YES | Test unverified mentors excluded |
| Max input | 100 chars | Test truncation/validation |

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Status:** ✅ All ambiguities resolved in refined story

| Original Ambiguity | Resolution |
|--------------------|------------|
| Algoritmo de búsqueda | Case-insensitive ILIKE, partial match, 3 fields |
| Búsqueda vacía | Muestra todos los mentores verificados |
| Múltiples palabras | OR logic |
| Mensaje "no results" | "No mentors found matching '[keyword]'. Try a different search term." |

---

### Missing Information / Gaps

**Status:** ✅ All gaps addressed

| Original Gap | Resolution |
|--------------|------------|
| Límite de caracteres | 100 caracteres max, truncar silenciosamente |
| Caracteres especiales | Sanitizados para SQL safety |
| Debounce | 300ms + Enter |

---

### Edge Cases Coverage

| Edge Case | Covered in Story? | Test Case |
|-----------|-------------------|-----------|
| Whitespace-only input | ✅ Yes (Scenario 5) | TC-006 |
| SQL Injection | ✅ Yes (Security Requirements) | TC-007 |
| XSS Attack | ✅ Yes (Security Requirements) | TC-008 |
| Long input (500+ chars) | ✅ Yes (Input Validation) | TC-012 |
| Multiple words | ✅ Yes (Scenario 6) | TC-009 |
| Only verified mentors | ✅ Yes (Scenario 7) | TC-010 |

---

### Testability Validation

**Is this story testeable as written?** ✅ Yes

**Testability Checklist:**

- [x] Acceptance criteria son específicos y verificables
- [x] Expected results definidos con mensajes exactos
- [x] Error scenarios cubiertos (validación, seguridad)
- [x] Test data requirements definidos
- [x] Technical implementation especificada

---

## ✅ Paso 3: Refined Acceptance Criteria

> **Note:** Los 7 scenarios de la story refinada son directamente testeables. Ver `story.md` para detalles completos.

| Scenario | Type | Priority | Testeable |
|----------|------|----------|-----------|
| 1. Successful search | Positive | Critical | ✅ |
| 2. No results | Negative | High | ✅ |
| 3. Case-insensitive | Positive | High | ✅ |
| 4. Partial match | Positive | High | ✅ |
| 5. Empty search clears | Boundary | Medium | ✅ |
| 6. Multiple words (OR) | Edge Case | High | ✅ |
| 7. Only verified mentors | Security | Critical | ✅ |

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 15

**Breakdown:**

- Positive: 6 test cases
- Negative: 3 test cases
- Boundary: 3 test cases
- Security: 3 test cases

**Rationale:** Story bien definida permite cobertura completa con menos casos pero más específicos.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Search Term Variations

| Search Term | Expected Mentors | Notes |
|-------------|------------------|-------|
| "React" | María, Carlos, Ana | Exact match in specialties |
| "react" | María, Carlos, Ana | Case-insensitive |
| "REACT" | María, Carlos, Ana | Uppercase |
| "Rea" | María, Carlos, Ana | Partial match |
| "Native" | Ana | Match in bio |

**Parametrized Test Group 2:** Invalid/Edge Case Inputs

| Input | Expected Result |
|-------|-----------------|
| "" (empty) | Show all mentors |
| "   " (spaces) | Show all mentors |
| "'; DROP TABLE" | Safe query, no results |
| `<script>alert()</script>` | Safe query, no results |

---

### Test Cases

#### **TC-001: Successful Search - Exact Match in Specialties**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**

- User on `/mentors` page
- Database has verified mentors:
  - María García: specialties=["React", "TypeScript"]
  - Carlos López: specialties=["React", "Node.js"]
  - Pedro Sánchez: specialties=["Python"]

**Test Steps:**

1. Navigate to `/mentors`
2. Enter "React" in search bar
3. Press Enter

**Expected Result:**

- Gallery shows María and Carlos cards
- Pedro does NOT appear
- URL is `/mentors?keyword=React`
- Loading skeleton shown during search

**Test Data:**

```json
{
  "input": { "keyword": "React" },
  "expected": {
    "results": 2,
    "mentors": ["María García", "Carlos López"],
    "url": "/mentors?keyword=React"
  }
}
```

---

#### **TC-002: Search Returns No Results**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** E2E

**Preconditions:**

- No mentors have "COBOL" in their profile

**Test Steps:**

1. Navigate to `/mentors`
2. Enter "COBOL" in search bar
3. Press Enter

**Expected Result:**

- Message: "No mentors found matching 'COBOL'. Try a different search term."
- "Clear search" button visible
- No mentor cards displayed
- URL is `/mentors?keyword=COBOL`

---

#### **TC-003: Case-Insensitive Search**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** High
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1)

**Test Data:**

| Input | Expected |
|-------|----------|
| "react" | Finds "React" mentors |
| "REACT" | Finds "React" mentors |
| "ReAcT" | Finds "React" mentors |

**Expected Result:**

- All variations return same results
- Case does NOT affect search

---

#### **TC-004: Partial Match Search**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** High
**Test Level:** Integration

**Preconditions:**

- Mentor exists with specialty "JavaScript"
- Mentor exists with specialty "Java"

**Test Steps:**

1. Search "Java"

**Expected Result:**

- Both "JavaScript" and "Java" mentors appear
- Partial match works (`ILIKE '%Java%'`)

---

#### **TC-005: Empty Search Shows All Mentors**

**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E

**Preconditions:**

- User has active search with filtered results

**Test Steps:**

1. Clear search input
2. Press Enter OR click "Clear search"

**Expected Result:**

- Gallery shows ALL verified mentors
- URL updates to `/mentors` (no query param)
- Search bar is empty

---

#### **TC-006: Whitespace-Only Search**

**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration

**Test Steps:**

1. Enter "   " (only spaces)
2. Press Enter

**Expected Result:**

- Treated as empty search
- Shows all verified mentors
- Input trimmed to empty

---

#### **TC-007: SQL Injection Prevention**

**Type:** Security
**Priority:** Critical
**Test Level:** API

**Test Steps:**

1. Call `GET /api/mentors?keyword='; DROP TABLE profiles; --`

**Expected Result:**

- Status Code: 200 OK
- Response: Empty results or normal search (NOT error)
- Database: No damage, profiles table intact

**Test Data:**

```json
{
  "payloads": [
    "'; DROP TABLE profiles; --",
    "1; SELECT * FROM users",
    "' OR '1'='1",
    "'; UPDATE profiles SET is_verified=true; --"
  ],
  "expected": {
    "status": 200,
    "results": 0,
    "database_intact": true
  }
}
```

---

#### **TC-008: XSS Prevention**

**Type:** Security
**Priority:** Critical
**Test Level:** E2E

**Test Steps:**

1. Enter `<script>alert('XSS')</script>` in search
2. Submit search

**Expected Result:**

- Input is sanitized/escaped
- No script execution
- Normal search behavior (no results)
- Input displayed safely (escaped)

---

#### **TC-009: Search with Multiple Words (OR Logic)**

**Related Scenario:** Scenario 6
**Type:** Edge Case
**Priority:** High
**Test Level:** E2E

**Preconditions:**

- María: specialties=["React", "TypeScript"]
- Carlos: specialties=["React", "Node.js"]
- Ana: specialties=["TypeScript", "Angular"]

**Test Steps:**

1. Search "React TypeScript"

**Expected Result:**

- All 3 mentors appear (María, Carlos, Ana)
- OR logic applied (has React OR TypeScript)

---

#### **TC-010: Only Verified Mentors in Results**

**Related Scenario:** Scenario 7
**Type:** Security / Business Rule
**Priority:** Critical
**Test Level:** API + E2E

**Preconditions:**

- Verified mentor with "Python"
- Unverified mentor with "Python"

**Test Steps:**

1. Search "Python"

**Expected Result:**

- ONLY verified mentor appears
- Unverified mentor NEVER shown

**API Response:**

```json
{
  "success": true,
  "data": [
    { "id": "...", "is_verified": true, "specialties": ["Python"] }
  ]
}
```

---

#### **TC-011: Search Performance**

**Type:** NFR / Performance
**Priority:** High
**Test Level:** API

**Preconditions:**

- Database has 100+ mentors

**Test Steps:**

1. Call `GET /api/mentors?keyword=React` 100 times
2. Measure response times

**Expected Result:**

- p95 response time < 500ms
- No timeouts

---

#### **TC-012: Long Input Validation**

**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration

**Test Steps:**

1. Enter 200+ character string in search

**Expected Result:**

- Input truncated to 100 characters
- Search executed with truncated value
- No error shown to user
- No server crash

---

#### **TC-013: Search in Bio Field**

**Type:** Positive
**Priority:** Medium
**Test Level:** Integration

**Preconditions:**

- Mentor "Ana" has bio: "Expert in React Native development"
- Mentor "Ana" does NOT have "React" in specialties

**Test Steps:**

1. Search "React"

**Expected Result:**

- Ana appears in results (match in bio)

---

#### **TC-014: URL Shareability**

**Type:** Positive / UX
**Priority:** Medium
**Test Level:** E2E

**Test Steps:**

1. Search "React"
2. Copy URL (`/mentors?keyword=React`)
3. Open URL in new tab/browser

**Expected Result:**

- New tab shows same search results
- Search bar pre-filled with "React"
- Results match original search

---

#### **TC-015: Loading State During Search**

**Type:** Positive / UX
**Priority:** Medium
**Test Level:** E2E

**Test Steps:**

1. Initiate search (use network throttling if needed)
2. Observe UI during loading

**Expected Result:**

- Skeleton loader or spinner shown
- Previous results fade or are replaced
- New results appear when loaded
- No UI jumping/flickering

---

## 🔗 Integration Test Cases

### Integration Test 1: Frontend ↔ Backend API Search

**Integration Point:** SearchBar Component → API `/api/mentors`
**Type:** Integration
**Priority:** Critical

**Test Flow:**

1. User types in SearchBar component
2. Debounce triggers after 300ms (or Enter pressed)
3. Frontend calls `GET /api/mentors?keyword={value}`
4. API queries database with parameterized ILIKE query
5. API returns paginated results
6. Frontend renders MentorCard components

**Contract Validation:**

- Request: Query param `keyword` is URL encoded
- Response: Matches api-contracts.yaml schema

**Expected Result:**

- End-to-end flow works
- Data integrity maintained
- No data loss in transformation

---

### Integration Test 2: Search + Filters Combined

**Integration Point:** Search ↔ Filter components (MYM-16)
**Type:** Integration
**Priority:** High

**Test Flow:**

1. User searches "React"
2. User applies price filter $50-$100
3. Both filters combined in API call

**Expected Result:**

- API called with `?keyword=React&min_price=50&max_price=100`
- Results match BOTH criteria (AND logic between search and filters)

---

## 📊 Test Data Summary

### Required Test Mentors

```json
[
  {
    "name": "María García",
    "specialties": ["React", "TypeScript"],
    "bio": "Frontend developer",
    "is_verified": true,
    "hourly_rate": 75
  },
  {
    "name": "Carlos López",
    "specialties": ["React", "Node.js"],
    "bio": "Full-stack developer",
    "is_verified": true,
    "hourly_rate": 50
  },
  {
    "name": "Ana Pérez",
    "specialties": ["Mobile"],
    "bio": "Expert in React Native development",
    "is_verified": true,
    "hourly_rate": 100
  },
  {
    "name": "Pedro Sánchez",
    "specialties": ["Python", "Django"],
    "bio": "Backend specialist",
    "is_verified": true,
    "hourly_rate": 60
  },
  {
    "name": "Unverified Dev",
    "specialties": ["Python"],
    "bio": "New developer",
    "is_verified": false,
    "hourly_rate": 40
  }
]
```

### Security Payloads

```json
{
  "sql_injection": [
    "'; DROP TABLE profiles; --",
    "1; SELECT * FROM users",
    "' OR '1'='1"
  ],
  "xss": [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')"
  ]
}
```

---

## 🎯 Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [x] Story refinada con acceptance criteria específicos
- [x] Technical decisions documentadas en story.md
- [ ] All 15 test cases executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium test cases: ≥95% passing
- [ ] Security tests passing (SQL injection, XSS)
- [ ] Performance test passing (<500ms p95)
- [ ] Integration tests passing
- [ ] API contract validation passed
- [ ] Exploratory testing completed
- [ ] Test execution report generated

---

## 📎 Related Documentation

- **Story:** `story.md` (refined with technical specs)
- **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/feature-test-plan.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## 📋 Test Execution Tracking

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

| Priority | Total | Passed | Failed | Blocked |
|----------|-------|--------|--------|---------|
| Critical | 4 | - | - | - |
| High | 7 | - | - | - |
| Medium | 4 | - | - | - |
| **Total** | **15** | - | - | - |

**Bugs Found:**

- [Bug ID 1]: [Descripción breve]
- [Bug ID 2]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

## 📝 Changelog

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-12-07 | QA (AI) | Initial Shift-Left analysis, identified blockers |
| 2.0 | 2025-12-07 | QA (AI) | Re-analysis after story refinement with Dev Lead decisions |

---

**Versión:** 2.0
**Última actualización:** 2025-12-07
**Generado por:** Shift-Left Testing AI (Claude)
