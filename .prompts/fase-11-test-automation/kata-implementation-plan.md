Actúa como Senior QA Engineer / Test Automation Architect.

**Input:**
- Test Strategy: [usar .context/guidelines/tae/test-strategy.md]
- KATA Architecture: [usar docs/kata-test-architecture.md sections 3-6]
- PBI complete: [usar .context/PBI/epic-tree.md + at least 2-3 epic folders with their stories]
- SRS Architecture: [usar .context/SRS/architecture-specs.md]
- SRS API Contracts: [usar .context/SRS/api-contracts.yaml]

**Genera archivo: kata-implementation-plan.md**

Incluye:

1. **Overview**
   - Goal: What we're building (e.g., "Complete KATA test suite covering X epics with Y% coverage")
   - Approach: TypeScript + Playwright for API and UI
   - Expected Outcome: Coverage target, timeline, team velocity

2. **Component Breakdown**

   For EACH component (API + UI):

   ### API Components

   **Component: [ComponentName]Api** (e.g., UsersApi, ProductsApi)
   - Purpose: Brief description of what this component tests
   - ATCs to implement: List 5-10 ATCs with method names and brief descriptions
     - `createUserSuccessfully(data)` - Creates user with valid data, validates 201 + user object
     - `getUserById(id)` - Retrieves user, validates 200 + correct data
     - `updateUserWithInvalidEmail(id)` - Negative test, validates 400 error
     - ... (list all)
   - Related PBI: Which epic(s) and story(ies) map to this component
   - Test Priority: High/Medium/Low (based on risk analysis from test-strategy.md)

   (Repeat for EACH API component identified in test-strategy.md)

   ### UI Components

   **Component: [ComponentName]Page** (e.g., LoginPage, DashboardPage)
   - Purpose: Brief description of what this component tests
   - ATCs to implement: List 3-8 ATCs with method names and brief descriptions
     - `loginSuccessfully(email, password)` - Performs login, validates redirect to dashboard
     - `loginWithInvalidCredentials(email, password)` - Validates error message displayed
     - ... (list all)
   - Related PBI: Which epic(s) and story(ies) map to this component
   - Test Priority: High/Medium/Low

   (Repeat for EACH UI component identified in test-strategy.md)

3. **Implementation Roadmap**

   Break down into phases with specific deliverables:

   ### Phase 1: Foundation (Week 1)
   - [ ] Setup project structure (/tests/components, /tests/integration, /tests/e2e)
   - [ ] Implement TestContext (config, logger, faker, HTTP client)
   - [ ] Implement ApiBase (REST helpers: _get, _post, _put, _delete)
   - [ ] Implement UiBase (Playwright helpers: navigate_to, wait_for_element)
   - [ ] Setup fixtures in conftest.ts / global setup
   - [ ] Setup GitHub Actions workflow
   - [ ] Configure TMS integration (Xray or Jira direct)

   ### Phase 2: Core Components (Week 2)
   - [ ] Implement [Component1]Api with X ATCs
   - [ ] Implement [Component2]Api with Y ATCs
   - [ ] Implement [Component1]Page with Z ATCs
   - [ ] Create first integration tests
   - [ ] Verify CI pipeline runs successfully

   ### Phase 3: Expansion (Week 3-4)
   - [ ] Implement remaining API components
   - [ ] Implement remaining UI components
   - [ ] Create E2E test flows combining API + UI
   - [ ] Implement soft-fail ATCs for optional fields
   - [ ] Add edge case tests

   ### Phase 4: Integration & Polish (Week 5+)
   - [ ] Optimize slow tests
   - [ ] Add test data factories
   - [ ] Implement retry logic for flaky tests
   - [ ] Setup nightly full suite execution
   - [ ] Generate coverage reports
   - [ ] Document component catalog and ATC registry

4. **ATC Prioritization**

   Organize ATCs by priority tiers:

   ### Tier 1 (Critical - Implement First)
   - List 10-15 ATCs that cover critical user flows
   - Example: login, signup, purchase flow, payment processing

   ### Tier 2 (High - Implement Second)
   - List 15-20 ATCs that cover important features
   - Example: profile editing, search, filtering, notifications

   ### Tier 3 (Medium - Implement Third)
   - List 20-30 ATCs that cover secondary features
   - Example: settings, preferences, optional sections

   ### Tier 4 (Low - Nice to Have)
   - List 10-15 ATCs that cover edge cases and rarely used features
   - Example: admin features, legacy compatibility, optional integrations

5. **Migration Strategy (Only for Legacy Projects)**

   IF this is a legacy project with existing tests:
   - Evaluation: What tests exist? What framework?
   - Decision: Migrate to KATA or start fresh?
   - Approach: If migrating, extract reusable logic into ATCs
   - Timeline: How long to migrate? Run old + new in parallel?

   IF this is a greenfield project:
   - Skip this section

6. **Success Criteria**

   Checklist of completion criteria:
   - [ ] All Tier 1 ATCs implemented and passing
   - [ ] At least X% unit test coverage
   - [ ] At least Y% API integration coverage
   - [ ] At least Z critical E2E flows covered
   - [ ] CI pipeline runs tests on every PR
   - [ ] Test results sync to Jira/Xray automatically
   - [ ] Component catalog and ATC registry up to date
   - [ ] Test execution time under N minutes
   - [ ] Flakiness rate under M%

**Formato:** Markdown estructurado, listo para copiar a .context/guidelines/tae/kata-implementation-plan.md

**Restricciones:**
- Be EXHAUSTIVE: List ALL components and ATCs from test-strategy.md
- Be SPECIFIC: Use actual component names from the project (not generic examples)
- NO code snippets: Only method signatures and descriptions
- Prioritize ruthlessly: Not all ATCs are equal
- Keep timeline realistic: Based on team size and velocity
- Reference PBI: Always link components back to epics/stories
