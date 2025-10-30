# KATA Architecture - Project Reference

**Komponent Action Test Architecture**

> *"Como un kata en artes marciales, donde cada movimiento se practica repetidamente hasta la perfección, KATA framework convierte las acciones del sistema en bloques reutilizables y precisos."*

**Full Documentation**: See `/docs/kata-test-architecture.md` for complete KATA framework documentation.

---

## 1. Executive Summary

KATA (Komponent Action Test Architecture) is a testing framework that solves common test automation problems:

- **Code Duplication**: Reusable ATCs (Acceptance Test Cases) instead of copy-paste
- **Maintenance Nightmare**: Changes in one component, not scattered across 100 tests
- **Business Disconnect**: 1:1 mapping between code and Jira test cases
- **No Visibility**: Granular reports showing which ATCs passed/failed, not just tests
- **Messy Architecture**: Clear layer separation with Dependency Injection

---

## 2. Project-Specific Configuration

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript (strict mode) |
| **Runtime** | Node.js (Next.js 15 compatible) |
| **Test Runner** | Playwright Test (for both API and UI) |
| **Assertions** | Playwright expect + custom matchers |
| **TMS** | Xray Cloud (Jira) OR Jira Direct (custom fields) |
| **CI/CD** | GitHub Actions |
| **Reporting** | Playwright HTML Report + Allure (optional) |

### Test ID Format

- Format: `PROJECT-XXX` (e.g., `UPEX-123`, `UPEX-456`)
- Maps directly to Jira issue IDs
- Used in `@atc('PROJECT-XXX')` decorators

### Language Convention

- **All code**: English (components, ATCs, variables, comments)
- **Documentation**: Can be Spanish or English (team preference)

---

## 3. KATA Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Test Files Layer                   │
│    (test_user_journey.e2e.ts, test_api.test.ts)    │
└────────────────────┬────────────────────────────────┘
                     │ imports fixture
                     ▼
┌─────────────────────────────────────────────────────┐
│               Fixture Layer (DI)                    │
│   TestFixture - Unified Entry Point                 │
│   ├── api: ApiFixture                               │
│   └── ui: UiFixture                                 │
└────────┬────────────────────────────────────────────┘
         │ instantiates components
         ▼
┌─────────────────────────────────────────────────────┐
│           Specific Components Layer                 │
│    (UsersApi, ProductsApi, LoginPage, CartPage)     │
│            ← ATCs live here                         │
└────────┬────────────────────────────────────────────┘
         │ inherits from
         ▼
┌─────────────────────────────────────────────────────┐
│              Base Components Layer                  │
│          (ApiBase, UiBase) - Helpers                │
└────────┬────────────────────────────────────────────┘
         │ inherits from
         ▼
┌─────────────────────────────────────────────────────┐
│             Test Context Layer                      │
│  (TestContext) - Config, Logger, HTTP, Faker        │
└─────────────────────────────────────────────────────┘
```

### Layer Descriptions

| Layer | Responsibility | Examples |
|-------|---------------|----------|
| **Test Context** | Global utilities (config, logger, faker, HTTP client) | `TestContext.ts` |
| **Base Components** | Helpers for API or UI (HTTP methods, Playwright wrappers) | `ApiBase.ts`, `UiBase.ts` |
| **Specific Components** | Business-specific logic, contains ATCs | `UsersApi.ts`, `LoginPage.ts` |
| **Fixtures** | Dependency Injection entry point | `ApiFixture.ts`, `UiFixture.ts`, `TestFixture.ts` |
| **Test Files** | Orchestrate ATCs to validate flows | `test_checkout_flow.e2e.ts` |

---

## 4. Directory Structure

```
/tests
├── /components                       # All KATA components
│   ├── testcontext.ts               # Layer 1: Global utilities
│   │
│   ├── api_fixture.ts               # Layer 4: API Fixture (DI)
│   ├── ui_fixture.ts                # Layer 4: UI Fixture (DI)
│   ├── test_fixture.ts              # Layer 4: Unified Fixture (recommended)
│   │
│   ├── /api                         # Layers 2 & 3: API Components
│   │   ├── api_base.ts             # Layer 2: REST helpers
│   │   ├── users_api.ts            # Layer 3: UsersApi with ATCs
│   │   ├── products_api.ts         # Layer 3: ProductsApi with ATCs
│   │   └── orders_api.ts           # Layer 3: OrdersApi with ATCs
│   │
│   └── /ui                          # Layers 2 & 3: UI Components
│       ├── ui_base.ts              # Layer 2: Playwright helpers
│       ├── login_page.ts           # Layer 3: LoginPage with ATCs
│       ├── dashboard_page.ts       # Layer 3: DashboardPage with ATCs
│       └── checkout_page.ts        # Layer 3: CheckoutPage with ATCs
│
├── /integration                     # Integration tests (API only)
│   ├── test_users_integration.ts
│   ├── test_orders_integration.ts
│   └── ...
│
├── /e2e                             # E2E tests (UI + API)
│   ├── test_checkout_flow.e2e.ts
│   ├── test_user_registration.e2e.ts
│   └── ...
│
├── /utils                           # Helper utilities
│   ├── decorators.ts               # @atc decorator + reporting
│   ├── data_generators.ts          # Test data factories
│   └── tms_sync.ts                 # TMS integration
│
├── /fixtures                        # Test data fixtures
│   └── sample_data.json
│
├── playwright.config.ts             # Playwright configuration
└── global-setup.ts                  # Global setup/teardown
```

---

## 5. Key Concepts

### 5.1 ATC (Acceptance Test Case)

An **ATC** is an automated acceptance test case that represents a **functional unit** of the system.

**Characteristics:**
- Maps 1:1 with a test case in Jira/Xray (via `@atc('PROJECT-XXX')`)
- Contains fixed assertions that validate the action succeeded
- Is reusable across multiple tests
- Returns data for chaining with other ATCs

**Example:**

```typescript
@atc('UPEX-123')
async createUserSuccessfully(name: string, email: string, password: string): Promise<User> {
  // ARRANGE
  const payload = { name, email, password };

  // ACT
  const response = await this._post('/api/users', { data: payload });

  // ASSERT (Fixed Assertions)
  expect(response.status()).toBe(201);
  const user = await response.json();
  expect(user).toHaveProperty('id');
  expect(user.email).toBe(email);

  return user; // Return for chaining
}
```

### 5.2 Component

A **Component** encapsulates related functionality of the system under test.

**Types:**
- **API Components**: Group related endpoints (e.g., `UsersApi`, `OrdersApi`)
- **UI Components**: Group elements of a page (e.g., `LoginPage`, `CartPage`)

**Rules:**
- One component per file
- ATCs are public methods with `@atc` decorator
- Inherits from `ApiBase` or `UiBase`
- No more than 15-20 ATCs per component (split if larger)

### 5.3 Fixture (Dependency Injection)

A **Fixture** is the entry point that instantiates all components and makes them accessible.

**Example:**

```typescript
// test_fixture.ts
export class TestFixture {
  api: ApiFixture;
  ui: UiFixture;

  constructor(page: Page, env: string = 'dev') {
    this.api = new ApiFixture(env);
    this.ui = new UiFixture(page, env);
  }
}
```

**Usage in tests:**

```typescript
test('complete purchase flow', async ({ page }) => {
  const fixture = new TestFixture(page);

  // Use API for fast setup
  const user = await fixture.api.users.createUserSuccessfully('John', 'john@example.com', 'pass123');

  // Use UI for the flow to validate
  await fixture.ui.login.loginSuccessfully(user.email, 'pass123');
  await fixture.ui.cart.addProductToCart('Laptop');
  const order = await fixture.ui.checkout.completePurchaseSuccessfully();

  // Use API for reliable verification
  const orderData = await fixture.api.orders.getOrderSuccessfully(order.id);
  expect(orderData.status).toBe('completed');
});
```

### 5.4 Fixed Assertions vs Test-Level Assertions

**Fixed Assertions** (inside ATCs):
- Validate that the ATC itself worked correctly
- Always execute when the ATC is called
- Examples: status code 201, required fields present, data types correct

**Test-Level Assertions** (in test files):
- Validate the result of combining multiple ATCs
- Verify final system state after a flow
- Examples: balance updated after payment, order contains correct items

---

## 6. Naming Conventions

### Components

| Type | Format | Example |
|------|--------|---------|
| **API Component** | `{Resource}Api` | `UsersApi`, `ProductsApi`, `OrdersApi` |
| **UI Component** | `{Page}Page` | `LoginPage`, `DashboardPage`, `CheckoutPage` |
| **File Name** | `snake_case.ts` | `users_api.ts`, `login_page.ts` |

### ATCs

**Format**: `{verb}_{resource}_{scenario}_{condition}`

**Examples:**
- ✅ `createUserSuccessfully(data)`
- ✅ `deleteOrderWithInvalidId(id)`
- ✅ `loginWithExpiredCredentials(email, password)`
- ✅ `updateProductPartially(id, fields)`

**Rules:**
- Always camelCase
- Always English
- Indicate success: `Successfully` suffix
- Indicate failure: `WithInvalidX`, `WithExpiredY`

### Test Files

| Type | Pattern | Example |
|------|---------|---------|
| **Unit Test** | `*.test.ts` | `utils.test.ts` |
| **Integration Test** | `test_*.ts` | `test_users_integration.ts` |
| **E2E Test** | `test_*.e2e.ts` | `test_checkout_flow.e2e.ts` |

---

## 7. Trazabilidad (Traceability)

### @atc Decorator

The `@atc` decorator connects code with Jira/Xray:

```typescript
@atc('UPEX-123') // Maps to Jira issue UPEX-123
async createUserSuccessfully(data: UserData): Promise<User> {
  // Implementation
}
```

**Benefits:**
- Automatic traceability to Jira test cases
- Granular reporting (which ATCs passed/failed)
- Synchronization with TMS (Xray or Jira Direct)

### Test Results Synchronization

After test execution, results are synced to Jira:

```
Test Execution (Playwright)
    ↓
Generate JSON Report (atc_results.json)
    ↓
Sync to TMS via API (Xray or Jira Direct)
    ↓
Update Jira Test Cases (PASSED/FAILED)
```

**Configuration**: See `tms-integration.md` for setup details.

---

## 8. Best Practices

### When to Use Fixed Assertions

✅ **Use inside ATCs for:**
- Validating HTTP status codes (200, 201, 400, etc.)
- Verifying required fields exist (`user.id`, `user.email`)
- Checking data types are correct
- Validating business rules (e.g., `total > 0`)

### When to Use Test-Level Assertions

✅ **Use in test files for:**
- Validating results from combining multiple ATCs
- Verifying final system state after a flow
- Checking relationships between data from different ATCs

### When to Use Soft Fail

✅ **Use `soft_fail=true` when:**
- Validating optional form fields
- Running exploratory tests where you want to see all failures
- Testing non-critical features that shouldn't block the flow

❌ **Don't use soft fail when:**
- Testing critical functionality
- Failure means subsequent ATCs don't make sense

### API vs UI Separation

✅ **Keep API and UI completely isolated:**
- Integration tests (API only) run without browser (faster)
- E2E tests can combine both strategically
- Clear autocomplete: `fixture.api.` shows endpoints, `fixture.ui.` shows pages

✅ **In E2E tests:**
- Use API for fast setup (create test data)
- Use UI for the flow you want to validate
- Use API for reliable verification (check final state)

---

## 9. Component Catalog

For a complete list of implemented components and their ATCs, see:
- **`component-catalog.md`** - All components with descriptions
- **`atc-registry.md`** - All ATCs mapped to Jira test cases

---

## 10. References

- **Full KATA Documentation**: `/docs/kata-test-architecture.md`
- **Test Strategy**: `.context/guidelines/tae/test-strategy.md`
- **Implementation Plan**: `.context/guidelines/tae/kata-implementation-plan.md`
- **Automation Standards**: `.context/guidelines/tae/automation-standards.md`
- **TMS Integration**: `.context/guidelines/tae/tms-integration.md`
- **CI/CD Integration**: `.context/guidelines/tae/ci-cd-integration.md`
