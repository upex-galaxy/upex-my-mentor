# Fase 10: Exploratory Testing

## Purpose

Execute manual exploratory testing to validate functionality and discover defects BEFORE investing in test automation.

**Why exploratory testing first:**

- Rapid feedback (minutes vs hours)
- Finds bugs that automated tests miss
- Validates features before automating
- Shift-left = feedback as early as possible

---

## The Trifuerza of Testing

This phase supports **complete feature validation** through three testing layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIFUERZA TESTING                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     UI      │  │     API     │  │     DB      │         │
│  │  Testing    │  │  Testing    │  │  Testing    │         │
│  │             │  │             │  │             │         │
│  │ Playwright  │  │  Postman/   │  │   DBHub     │         │
│  │    MCP      │  │ OpenAPI MCP │  │    MCP      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  exploratory-    exploratory-     exploratory-              │
│  test.md         api-test.md      db-test.md                │
└─────────────────────────────────────────────────────────────┘
```

**Choose based on feature type:**

| Feature Type         | Recommended Testing            |
| -------------------- | ------------------------------ |
| UI-focused feature   | UI → API → DB                  |
| API-first feature    | API → DB → UI (if applicable)  |
| Data-focused feature | DB → API → UI (if applicable)  |
| Full-stack feature   | All three (Trifuerza completa) |

---

## Prerequisites

- Feature deployed to staging
- User Story in "Ready For QA" status
- Test cases from Shift-Left Testing (or Acceptance Criteria)
- MCPs configured for the testing layer(s) needed

---

## Prompts in This Phase

| Order | Prompt                    | Purpose                                        | MCP Required     |
| ----- | ------------------------- | ---------------------------------------------- | ---------------- |
| 1     | `smoke-test.md`           | Quick validation that deployment is functional | playwright       |
| 2a    | `exploratory-test.md`     | Deep UI exploration                            | playwright       |
| 2b    | `exploratory-api-test.md` | Deep API exploration                           | postman, openapi |
| 2c    | `exploratory-db-test.md`  | Deep database verification                     | dbhub            |
| 3     | `bug-report.md`           | Report defects found (conditional)             | atlassian        |

**Note:** 2a, 2b, 2c can be executed in any order or combination based on feature needs.

---

## Execution Flow

```
US Status: Ready For QA
        ↓
[1] Smoke Test (5-10 min)
    └── FAILED? → Report blocker, STOP
        ↓
[2] Exploratory Testing (choose based on feature)
    │
    ├── [2a] UI Testing (exploratory-test.md)
    │   └── Uses Playwright MCP for UI exploration
    │   └── Validates user experience
    │
    ├── [2b] API Testing (exploratory-api-test.md)
    │   └── Uses Postman/OpenAPI MCP
    │   └── Validates backend contracts, auth, RLS
    │
    └── [2c] DB Testing (exploratory-db-test.md)
        └── Uses DBHub MCP for SQL verification
        └── Validates data integrity, constraints, triggers
        ↓
[3] Bug Report (if issues found)
    └── Use bug-report.md for each issue
    └── Report to Jira (with human confirmation)
        ↓
Decision: PASSED or FAILED?
    └── PASSED → Transition US to "QA Approved"
    └── FAILED → Wait for fixes, re-test
```

---

## Tools Required

| MCP             | Purpose                                   | Prompt(s)          |
| --------------- | ----------------------------------------- | ------------------ |
| `playwright`    | UI exploration, screenshots, interactions | smoke, exploratory |
| `postman`       | API collections, authenticated flows      | exploratory-api    |
| `openapi` (api) | API endpoint exploration                  | exploratory-api    |
| `dbhub` (sql)   | SQL queries, data verification            | exploratory-db     |
| `atlassian`     | Bug creation, story transitions           | bug-report         |

---

## Output

- Smoke test results (PASSED/FAILED)
- Exploratory session notes (UI, API, DB as applicable)
- RLS policy verification results (if API tested)
- Data integrity verification results (if DB tested)
- Bugs reported in Jira (if any)
- US transitioned to appropriate status

---

## When to Use Each Testing Layer

### UI Testing (`exploratory-test.md`)

- User-facing features
- Form validations visible to user
- Navigation and workflows
- Visual/UX issues

### API Testing (`exploratory-api-test.md`)

- Endpoints without UI yet
- Authentication/authorization logic
- RLS policy verification
- API contracts and error handling
- Backend business logic

### DB Testing (`exploratory-db-test.md`)

- Data created by API/UI operations
- Trigger and constraint verification
- Complex calculations
- Data migrations
- Bulk operations

---

## Recommended Combinations

### Full-Stack Feature (Complete Trifuerza)

```
1. API Testing → Verify backend works
2. DB Testing → Verify data is correct
3. UI Testing → Verify user experience
```

### Backend-Only Feature

```
1. API Testing → Verify endpoints
2. DB Testing → Verify data integrity
(No UI testing needed)
```

### Data Migration/Report Feature

```
1. DB Testing → Verify data transformation
2. API Testing → Verify reporting endpoints
(UI testing if report has UI)
```

---

## Next Phase

If exploratory testing **PASSED**:

- Proceed to **Fase 11: Test Documentation**
- Document test cases in Jira
- Identify automation candidates

---

## Related Documentation

- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
- **API Testing Guide:** `docs/testing/api-guide/`
- **Database Testing Guide:** `docs/testing/database-guide/`
