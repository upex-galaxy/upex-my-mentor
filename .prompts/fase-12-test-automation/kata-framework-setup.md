# KATA Framework Setup

> Initial setup or refactoring of the KATA test automation framework.

---

## Purpose

Set up the KATA (Komponent Action Test Architecture) framework for a project, or refactor an existing test automation structure to follow KATA principles.

**Use this prompt when:**
- Starting test automation in a new project
- Migrating existing tests to KATA architecture
- Evaluating current framework against KATA standards

**Prerequisites:**
- Project uses TypeScript
- Playwright installed (or will be)
- Bun runtime (recommended) or Node.js

---

## Workflow

### Phase 0: Framework Detection

**First, check if test automation already exists:**

```
Check for:
├── tests/ directory
├── playwright.config.ts
├── tests/components/ (KATA-like structure)
├── Any *.test.ts files
└── package.json test scripts
```

**Based on findings, ask user:**

```
I detected the following in your project:

[Detection results]

Would you like to:
1. Set up KATA from scratch (new project, no existing tests)
2. Refactor existing tests to KATA architecture
3. Evaluate current setup against KATA standards
4. Just show me the KATA structure (no changes)
```

---

### Option 1: Setup from Scratch

**For projects without test automation:**

#### Step 1: Install Dependencies

```bash
# Core dependencies
bun add -d @playwright/test

# Install browsers
bun run playwright install

# Optional: Allure reporting
bun add -d allure-playwright allure-commandline
```

#### Step 2: Create Directory Structure

```
project-root/
├── config/
│   └── variables.ts           # Environment configuration
│
├── tests/
│   ├── components/            # KATA Layers
│   │   ├── TestContext.ts    # Layer 1: Base utilities
│   │   ├── ApiFixture.ts     # Layer 4: API DI container
│   │   ├── UiFixture.ts      # Layer 4: UI DI container
│   │   ├── TestFixture.ts    # Layer 4: Test extension
│   │   │
│   │   ├── api/              # Layers 2-3: API
│   │   │   ├── ApiBase.ts   # Layer 2: HTTP helpers
│   │   │   └── AuthApi.ts   # Layer 3: Auth component
│   │   │
│   │   ├── ui/               # Layers 2-3: UI
│   │   │   ├── UiBase.ts    # Layer 2: Playwright helpers
│   │   │   └── LoginPage.ts # Layer 3: Example component
│   │   │
│   │   └── preconditions/    # Reusable flows
│   │       └── AuthFlows.ts
│   │
│   ├── e2e/                  # E2E Tests
│   │   └── auth/
│   │       └── login.test.ts
│   │
│   ├── integration/          # API Tests
│   │   └── auth/
│   │       └── auth.test.ts
│   │
│   ├── data/                 # Test data
│   │   ├── fixtures/
│   │   └── uploads/
│   │
│   ├── utils/
│   │   ├── decorators.ts     # @atc decorator
│   │   └── tmsSync.ts        # TMS integration (optional)
│   │
│   ├── globalSetup.ts
│   └── globalTeardown.ts
│
├── playwright.config.ts
└── tsconfig.json
```

#### Step 3: Configure TypeScript Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./tests/*"],
      "@components/*": ["./tests/components/*"],
      "@config/*": ["./config/*"],
      "@utils/*": ["./tests/utils/*"],
      "@data/*": ["./tests/data/*"],
      "@api/*": ["./api/*"]
    },
    "strict": false,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### Step 4: Configure Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { config, env } from './config/variables';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!env.isCI,
  retries: 0,  // KATA: Investigate failures, don't mask them
  workers: env.isCI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

#### Step 5: Create Base Files

**Generate the core KATA files:**
- TestContext.ts
- ApiBase.ts
- UiBase.ts
- ApiFixture.ts
- UiFixture.ts
- TestFixture.ts
- decorators.ts
- variables.ts

**Reference:** `.context/guidelines/tae/kata-implementation-plan.md`

#### Step 6: Add Package Scripts

```json
// package.json
{
  "scripts": {
    "test": "playwright test",
    "test:e2e": "playwright test tests/e2e",
    "test:integration": "playwright test tests/integration",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report"
  }
}
```

---

### Option 2: Refactor Existing Tests

**For projects with existing test automation:**

#### Step 1: Analyze Current Structure

```
Assess:
├── Current test organization
├── Page Object patterns used
├── Helper methods and utilities
├── Fixture/setup patterns
└── Assertion patterns
```

#### Step 2: Compare with KATA

| Aspect              | Current        | KATA Standard       | Action Needed      |
| ------------------- | -------------- | ------------------- | ------------------ |
| Directory structure | ?              | `tests/components/` | Reorganize         |
| Locator storage     | Separate file? | Inline in ATCs      | Refactor           |
| Helper methods      | Many?          | Only when complex   | Remove unnecessary |
| Assertions          | Where?         | Fixed inside ATCs   | Move to ATCs       |
| Imports             | Relative?      | Aliases only        | Update             |

#### Step 3: Migration Plan

```
Priority order:
1. Set up directory structure (non-breaking)
2. Create base classes (ApiBase, UiBase)
3. Create fixtures (ApiFixture, UiFixture, TestFixture)
4. Migrate one component as pilot
5. Validate pilot works
6. Migrate remaining components
7. Update test files
8. Remove old structure
```

#### Step 4: Pros/Cons Assessment

**Present to user:**

```markdown
## Migration Assessment

### Pros of migrating to KATA:
- Clearer test organization
- Better traceability (ATCs → Jira)
- Reduced maintenance (inline locators)
- Type-safe API testing
- Consistent patterns across team

### Cons of migrating:
- Initial refactoring effort: ~[X] hours
- Team learning curve
- Temporary dual structure during migration

### Recommendation:
[Based on codebase analysis]
```

---

### Option 3: Evaluate Current Setup

**For assessment without changes:**

```markdown
## KATA Compliance Evaluation

### Directory Structure
- [ ] Uses `tests/components/` hierarchy
- [ ] Separates E2E and Integration tests
- [ ] Has dedicated fixtures directory

### Locator Management
- [ ] Locators inline in ATCs (not separate files)
- [ ] No unnecessary locator abstractions
- [ ] Uses `data-testid` where appropriate

### ATC Patterns
- [ ] ATCs have `@atc` decorator
- [ ] Each ATC = unique expected output
- [ ] Fixed assertions inside ATCs
- [ ] ATCs don't call other ATCs

### Code Quality
- [ ] Uses import aliases (no relative imports)
- [ ] Type-safe API methods
- [ ] No `any` types

### Score: [X/15] compliance
```

---

## KATA Guidelines Reference

**Always read before implementation:**

| Document                      | Purpose                     |
| ----------------------------- | --------------------------- |
| `KATA-AI-GUIDE.md`            | Quick orientation for AI    |
| `automation-standards.md`     | Rules and conventions       |
| `kata-architecture.md`        | Layer structure             |
| `kata-implementation-plan.md` | Full implementation details |

**Location:** `.context/guidelines/tae/`

---

## Output

Depending on selected option:
- **Setup:** Complete KATA framework ready for use
- **Refactor:** Migration plan with pros/cons
- **Evaluate:** Compliance report with recommendations

---

## Post-Setup Checklist

- [ ] Directory structure created
- [ ] TypeScript aliases configured
- [ ] Playwright configured
- [ ] Base classes created
- [ ] Fixtures created
- [ ] `@atc` decorator implemented
- [ ] Sample test working
- [ ] Package scripts added
- [ ] `.env.example` created
