Actúa como Senior QA Engineer / Test Automation Standards Lead.

**Input:**
- KATA Architecture: [usar docs/kata-test-architecture.md section 6: "Convenciones de Implementación"]
- KATA Best Practices: [usar docs/kata-test-architecture.md section 7: "Mejores Prácticas"]
- Test Strategy: [usar .context/guidelines/tae/test-strategy.md]
- Project Tech Stack: TypeScript + Playwright + Node.js (Next.js 15)

**Genera archivo: automation-standards.md**

Incluye:

1. **Naming Conventions**

   ### Components
   - **API Components**: `{Resource}Api` format (e.g., `UsersApi`, `ProductsApi`, `OrdersApi`)
   - **UI Components**: `{Page}Page` format (e.g., `LoginPage`, `DashboardPage`, `CheckoutPage`)
   - File naming: `users_api.ts`, `login_page.ts` (snake_case for files)
   - Class naming: `UsersApi`, `LoginPage` (PascalCase for classes)

   ### ATCs (Test Action Methods)
   - Format: `{verb}_{resource}_{scenario}_{condition}`
   - Examples:
     - `createUserSuccessfully(data)`
     - `deleteUserWithInvalidId(id)`
     - `loginWithExpiredCredentials(email, password)`
     - `updateProductPartially(id, fields)`
   - Always use English
   - Always use camelCase for method names
   - Indicate success with `Successfully` suffix
   - Indicate failure scenarios clearly (e.g., `WithInvalidId`, `WithExpiredToken`)

   ### Test Files
   - Unit tests: `*.test.ts` (e.g., `utils.test.ts`)
   - Integration tests: `test_*.ts` (e.g., `test_users_integration.ts`)
   - E2E tests: `test_*.e2e.ts` (e.g., `test_checkout_flow.e2e.ts`)
   - Location: `/tests/integration/` or `/tests/e2e/`

2. **Component Structure**

   ### File Template
   Describe the standard structure for a component file:
   - Imports section (Playwright, decorators, base classes)
   - Class definition with inheritance
   - Locators section (for UI components only)
   - ATCs section (public methods with @atc decorator)
   - Private helpers section (if needed)
   - Order: alphabetical by ATC name

   ### Order of Methods
   - Constructor first
   - ATCs (public methods) alphabetically
   - Private helpers last

3. **Test Structure (AAA Pattern)**

   All ATCs must follow Arrange-Act-Assert:
   - **ARRANGE**: Prepare data, preconditions, setup state
   - **ACT**: Execute the main action (API call, UI interaction)
   - **ASSERT**: Fixed assertions that validate the action succeeded

   Rules:
   - Always comment AAA sections clearly
   - Keep arrange minimal (move complex setup to fixtures/factories)
   - Act should be a single logical operation
   - Assert must have clear error messages

4. **Docstrings**

   All ATCs must have docstrings with:
   - Brief description of what the ATC does
   - `@param` tags for each parameter
   - `@returns` tag for return value
   - `@throws` tag if applicable
   - List of "Fixed Validations" performed

   Example format:
   ```typescript
   /**
    * ATC: Create user with valid data
    *
    * @param name - User full name
    * @param email - Unique email address
    * @param password - Password (min 8 characters)
    * @returns Created user object with ID
    *
    * Fixed Validations:
    * - Response status 201
    * - User object contains ID
    * - Email matches input
    */
   ```

5. **Type Hints**

   - Always use strict TypeScript types
   - No `any` type (use `unknown` if truly unknown)
   - Define interfaces for API responses
   - Use union types for status codes
   - Example: `status: 200 | 201 | 400 | 401 | 500`

6. **Assertions**

   ### Fixed Assertions (Inside ATCs)
   Use fixed assertions to validate that the ATC itself worked:
   - HTTP status codes (expect 200, 201, 400, etc.)
   - Required fields present (expect user to have `id`, `email`)
   - Data types correct (expect `typeof user.id === 'number'`)
   - Business rules met (expect `order.total > 0`)

   Guidelines:
   - Always include descriptive error messages
   - Use expect().toBe() for primitives
   - Use expect().toEqual() for objects
   - Use expect().toContain() for arrays
   - Use custom matchers for common patterns

   ### Test-Level Assertions (In Test Files)
   Use test-level assertions to validate the result of COMBINING multiple ATCs:
   - Validate final system state after a flow
   - Validate relationships between data from different ATCs
   - Validate business logic that spans multiple actions

7. **Error Handling**

   - Wrap risky operations in try-catch
   - Re-throw errors after logging
   - Use custom error classes (ApiError, UiError)
   - Log errors with context (request body, current URL, etc.)
   - Never swallow errors silently

8. **Code Quality**

   ### Linting
   - Tool: ESLint with TypeScript plugin
   - Config: Extend recommended rules
   - Run: On every commit (pre-commit hook)

   ### Type Checking
   - Tool: TypeScript compiler (tsc)
   - Mode: Strict mode enabled
   - Run: In CI pipeline before tests

   ### Coverage
   - Tool: Istanbul / c8 (built into Vitest)
   - Threshold: Minimum 80% for unit tests
   - Report: Generate HTML report, upload to CI artifacts

9. **Test Independence**

   Rules to ensure tests don't depend on each other:
   - Each test creates its own test data
   - Use unique identifiers (UUIDs, timestamps)
   - Clean up after tests (delete created resources)
   - Don't rely on execution order
   - Use beforeEach / afterEach for setup/teardown
   - Avoid shared mutable state

10. **Code Review Checklist**

    For reviewers, verify:
    - [ ] ATC names follow naming conventions
    - [ ] All ATCs have @atc decorator with correct test ID
    - [ ] Docstrings are complete and accurate
    - [ ] AAA pattern is followed
    - [ ] Fixed assertions have descriptive error messages
    - [ ] No hardcoded values (use config, env vars, or parameters)
    - [ ] No code duplication (extract to helpers if repeated)
    - [ ] TypeScript types are explicit (no `any`)
    - [ ] Test is independent (doesn't rely on other tests)
    - [ ] Logging is informative (enough to debug failures)
    - [ ] Soft-fail is used appropriately (only for non-critical validations)
    - [ ] Test data is cleaned up (no pollution)
    - [ ] CI pipeline passes (linting, type checking, tests)

**Formato:** Markdown estructurado, listo para copiar a .context/guidelines/tae/automation-standards.md

**Restricciones:**
- Be PRESCRIPTIVE: Clear rules, not suggestions
- Include examples: Show right and wrong ways
- NO full code snippets: Only method signatures and patterns
- Focus on TypeScript: Syntax and conventions specific to TS
- Enforceable: Rules that can be checked in code review
- Keep concise: 3-4 pages maximum
