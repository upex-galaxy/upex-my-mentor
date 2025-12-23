# Fase 12: Test Automation

## Purpose

Implement automated tests for documented test cases using the KATA framework.

**IMPORTANT:** This phase comes AFTER:

- Fase 10: Exploratory Testing (feature validated)
- Fase 11: Test Documentation (tests documented in Jira)

Only automate functionality that has been validated manually and documented.

---

## Prerequisites

- Tests documented in Jira (Fase 11 completed)
- Tests marked as "automation-candidate"
- KATA framework configured (or use kata-framework-setup.md)

---

## CRITICAL: Read Guidelines First

**Before ANY automation work, read:**

```
.context/guidelines/TAE/
├── KATA-AI-GUIDE.md          # Quick orientation
├── automation-standards.md    # Rules and patterns
└── kata-architecture.md       # Layer structure
```

---

## Prompts in This Phase

| Prompt                           | Purpose                                 |
| -------------------------------- | --------------------------------------- |
| `../kata-framework-setup.md`     | Initial setup or refactoring (one-time) |
| `automation-e2e-test.md`         | Implement E2E (UI) test automation      |
| `automation-integration-test.md` | Implement API test automation           |

---

## Execution Flow

```
Test marked "automation-candidate" (from Fase 11)
        ↓
Framework exists?
    └── NO  → ../kata-framework-setup.md
    └── YES → Continue
        ↓
What type of test?
    └── E2E (UI) → automation-e2e-test.md
    └── API → automation-integration-test.md
        ↓
Implement ATC following KATA standards
        ↓
Create/update test file
        ↓
Register component in fixture
        ↓
Run and validate
        ↓
Update Jira: Test Status = "Automated"
```

---

## KATA Architecture Overview

```
Layer 4: Fixtures (TestFixture, ApiFixture, UiFixture)
    └── Dependency injection, test extension
        ↓
Layer 3: Components (AuthApi, LoginPage)
    └── ATCs with @atc decorator
        ↓
Layer 2: Base Classes (ApiBase, UiBase)
    └── HTTP helpers, Playwright helpers
        ↓
Layer 1: TestContext
    └── Configuration, data generation
```

---

## Key KATA Principles

| Principle                  | Description                                     |
| -------------------------- | ----------------------------------------------- |
| **Unique Output**          | Each ATC represents ONE unique expected outcome |
| **Inline Locators**        | Locators defined IN the ATC, not separately     |
| **No Unnecessary Helpers** | Don't wrap single Playwright actions            |
| **Fixed Assertions**       | Assertions inside ATCs validate success         |
| **Import Aliases**         | Always use `@components/`, `@utils/`, etc.      |

---

## Test Types

### E2E Tests (UI)

- Location: `tests/e2e/{feature}/`
- Fixture: `{ kata }` or `{ ui }`
- Uses UI components (e.g., `LoginPage`)

### Integration Tests (API)

- Location: `tests/integration/{resource}/`
- Fixture: `{ api }`
- Uses API components (e.g., `AuthApi`)

---

## Output

- ATCs implemented following KATA standards
- Test files in appropriate directories
- Components registered in fixtures
- Tests passing in CI/CD pipeline
- Jira tests marked as "Automated"

---

## Related Documentation

- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
- **Previous Phase:** `.prompts/fase-11-test-documentation/`
