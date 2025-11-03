Actúa como Senior QA Engineer / Test Architect.

**Input:**
- PRD completo: [usar todos los archivos de .context/PRD/]
- SRS completo: [usar todos los archivos de .context/SRS/]
- PBI epic-tree: [usar .context/PBI/epic-tree.md]
- KATA Architecture: [usar docs/kata-test-architecture.md sections 1-7]
- Tech Stack: TypeScript + Playwright + Node.js (Next.js 15), Supabase (PostgreSQL), Vercel, GitHub Actions

**Genera archivo: test-strategy.md**

Incluye:

1. **Executive Summary**
   - Objective: Overall testing goal for this project
   - Approach: Brief description of KATA framework adoption
   - Quality Gates: Entry/exit criteria for releases

2. **Scope**
   - In Scope: What will be tested (epics, features, flows)
   - Out of Scope: What won't be tested (deprecated features, third-party integrations, etc.)

3. **Test Levels**

   For each level define:
   - Coverage Goal (%): Target coverage percentage
   - Framework: Tool to use (Vitest, Playwright, etc.)
   - Scope: What to test at this level
   - Execution: When/where tests run (local, CI, nightly)

   Levels to cover:
   - Unit Testing
   - Integration Testing (API)
   - E2E Testing (UI + API flows)

4. **Test Architecture (KATA)**

   - Components API: List API components needed based on PBI epics (e.g., UsersApi, ProductsApi, OrdersApi)
   - Components UI: List UI components needed based on app pages (e.g., LoginPage, DashboardPage, CheckoutPage)
   - Fixture Strategy: Describe ApiFixture, UiFixture, TestFixture approach
   - ATC Strategy: How to prioritize which ATCs to implement first (critical flows, high-risk areas)

5. **Test Data Management**
   - Data Sources: Where test data comes from (fixtures, factories, Supabase seeding)
   - Data Isolation: How to prevent test data conflicts
   - Data Cleanup: Strategy for cleaning up after tests
   - Sensitive Data: How to handle credentials, PII

6. **Test Environments**

   For each environment:
   - Local: Setup requirements
   - Staging: CI/CD integration
   - Production: Smoke tests only (if applicable)

7. **Execution Strategy**

   Define what runs when:
   - On Commit (local): Fast unit tests + linting
   - On Pull Request (CI): Unit + Integration tests
   - Nightly (CI): Full E2E suite
   - On Release (CI): Smoke tests + critical E2E flows

8. **Reporting & Metrics**
   - Metrics to Track: Test pass rate, coverage %, execution time, flakiness rate
   - Reporting Tools: Playwright HTML Report, Allure, or custom dashboards
   - Alerts: When to notify team (failures, coverage drops)

9. **Test Management System (TMS)**
   - Tool: Xray Cloud (Jira) OR Jira Direct with custom fields (budget-dependent)
   - Sync: Automatic sync of test results via decorators
   - Mapping: Test IDs follow PROJECT-XXX format (e.g., UPEX-123)

10. **CI/CD Integration**
    - Tool: GitHub Actions
    - Workflow: Parallel execution, matrix strategy per browser
    - Parallelization: How tests are distributed
    - Artifacts: Screenshots, videos, traces on failure

11. **Implementation Timeline**

    Break down into weeks:
    - Week 1: Setup (TestContext, Base Components, CI pipeline)
    - Week 2: Core Components (critical API + UI components)
    - Week 3-4: Expand Coverage (remaining components, edge cases)
    - Week 5+: Maintenance (refactor, optimize, CI improvements)

12. **Risks & Mitigations**

    List 3-5 risks with mitigations:
    - Risk 1: [e.g., Flaky E2E tests]
      - Mitigation: [e.g., Implement proper waits, retry logic, test isolation]

    - Risk 2: [e.g., Test data conflicts in parallel execution]
      - Mitigation: [e.g., Unique data per test, database isolation]

    - Risk 3: [e.g., Slow test execution blocking CI]
      - Mitigation: [e.g., Parallelize tests, optimize slow tests, run E2E nightly only]

**Formato:** Markdown estructurado, listo para copiar a .context/guidelines/tae/test-strategy.md

**Restricciones:**
- Be SPECIFIC: Reference actual epics/features from the PBI
- NO generic examples: Use project-specific component names
- NO code snippets: Only strategy and decisions
- Keep concise: 3-5 pages maximum
- Prioritize: Focus on MVP scope from PRD
