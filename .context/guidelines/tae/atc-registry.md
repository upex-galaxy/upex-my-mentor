# ATC Registry

**Living Document**: This file maintains the complete registry of ATCs with traceability to Jira test cases.

**Purpose**: Provide 1:1 mapping between code ATCs and Jira issues for full traceability.

---

## How to Use This File

1. **Before implementing an ATC**, create corresponding Jira test case
2. **Copy Jira issue key** (e.g., `UPEX-123`)
3. **Register the ATC** in this file with all metadata
4. **Update status** as implementation progresses
5. **Use the Test ID** in `@atc('PROJECT-XXX')` decorator

---

## Registry Format

Each ATC entry contains:
- **Test ID**: Jira issue key (e.g., `UPEX-123`)
- **ATC Method**: Method name in code (e.g., `createUserSuccessfully`)
- **Component**: Which component file contains it
- **Type**: API or UI
- **Priority**: Critical, High, Medium, Low
- **Description**: What the ATC tests
- **Related Story**: Link to user story in PBI
- **Status**: Implementation status
- **Last Executed**: Last test run date
- **Last Result**: Last test result (PASS/FAIL)

---

## API ATCs

### UsersApi

| Test ID | ATC Method | Priority | Description | Related Story | Status | Last Result |
|---------|-----------|----------|-------------|---------------|--------|-------------|
| UPEX-100 | `createUserSuccessfully()` | Critical | Creates user with valid data, validates 201 + user object returned | [STORY-010](link) | 🟢 Complete | ✅ PASS |
| UPEX-101 | `getUserById()` | Critical | Retrieves user by ID, validates 200 + correct data | [STORY-010](link) | 🟢 Complete | ✅ PASS |
| UPEX-102 | `updateUserSuccessfully()` | High | Updates user fields, validates 200 + updated data | [STORY-011](link) | 🟡 In Progress | - |
| UPEX-103 | `deleteUserSuccessfully()` | High | Deletes user, validates 204 + user no longer exists | [STORY-012](link) | ⚪ Not Started | - |
| UPEX-104 | `createUserWithInvalidEmail()` | Medium | Negative: invalid email format, validates 400 error | [STORY-010](link) | ⚪ Not Started | - |
| UPEX-105 | `createUserWithDuplicateEmail()` | Medium | Negative: duplicate email, validates 409 conflict | [STORY-010](link) | ⚪ Not Started | - |
| UPEX-106 | `getUserWithNonExistentId()` | Medium | Negative: user not found, validates 404 error | [STORY-010](link) | ⚪ Not Started | - |
| UPEX-107 | `updateUserWithInvalidData()` | Low | Negative: invalid update fields, validates 400 error | [STORY-011](link) | ⚪ Not Started | - |

---

### ProductsApi

| Test ID | ATC Method | Priority | Description | Related Story | Status | Last Result |
|---------|-----------|----------|-------------|---------------|--------|-------------|
| UPEX-200 | `createProductSuccessfully()` | Critical | Creates product with valid data | [STORY-020](link) | ⚪ Not Started | - |
| UPEX-201 | `getProductById()` | Critical | Retrieves product by ID | [STORY-020](link) | ⚪ Not Started | - |
| UPEX-202 | `updateProductStock()` | High | Updates product stock quantity | [STORY-021](link) | ⚪ Not Started | - |
| UPEX-203 | `deleteProductSuccessfully()` | Medium | Deletes product | [STORY-022](link) | ⚪ Not Started | - |
| UPEX-204 | `searchProducts()` | High | Searches products by keyword | [STORY-023](link) | ⚪ Not Started | - |
| UPEX-205 | `filterProductsByPrice()` | Medium | Filters products by price range | [STORY-023](link) | ⚪ Not Started | - |
| UPEX-206 | `createProductWithInvalidPrice()` | Low | Negative: invalid price (negative), validates 400 | [STORY-020](link) | ⚪ Not Started | - |

---

### OrdersApi

| Test ID | ATC Method | Priority | Description | Related Story | Status | Last Result |
|---------|-----------|----------|-------------|---------------|--------|-------------|
| UPEX-300 | `createOrderSuccessfully()` | Critical | Creates order with items | [STORY-030](link) | ⚪ Not Started | - |
| UPEX-301 | `getOrderById()` | Critical | Retrieves order details | [STORY-030](link) | ⚪ Not Started | - |
| UPEX-302 | `updateOrderStatus()` | High | Updates order status | [STORY-031](link) | ⚪ Not Started | - |
| UPEX-303 | `cancelOrderSuccessfully()` | High | Cancels order | [STORY-032](link) | ⚪ Not Started | - |
| UPEX-304 | `createOrderWithInvalidItems()` | Medium | Negative: invalid product IDs, validates 400 | [STORY-030](link) | ⚪ Not Started | - |
| UPEX-305 | `getOrderWithNonExistentId()` | Low | Negative: order not found, validates 404 | [STORY-030](link) | ⚪ Not Started | - |

---

## UI ATCs

### LoginPage

| Test ID | ATC Method | Priority | Description | Related Story | Status | Last Result |
|---------|-----------|----------|-------------|---------------|--------|-------------|
| UPEX-400 | `loginSuccessfully()` | Critical | Login with valid credentials, redirects to dashboard | [STORY-040](link) | 🟢 Complete | ✅ PASS |
| UPEX-401 | `loginWithInvalidPassword()` | High | Negative: wrong password, shows error message | [STORY-040](link) | 🟡 In Progress | ❌ FAIL |
| UPEX-402 | `loginWithInvalidEmail()` | High | Negative: invalid email format, shows error | [STORY-040](link) | ⚪ Not Started | - |
| UPEX-403 | `logoutSuccessfully()` | Medium | Logout, redirects to login page | [STORY-041](link) | ⚪ Not Started | - |
| UPEX-404 | `verifyPasswordVisibilityToggle()` | Low | Toggle password visibility (soft-fail) | [STORY-040](link) | ⚪ Not Started | - |

---

### DashboardPage

| Test ID | ATC Method | Priority | Description | Related Story | Status | Last Result |
|---------|-----------|----------|-------------|---------------|--------|-------------|
| UPEX-500 | `verifyUserWelcomeMessage()` | Medium | Verify welcome message with user name | [STORY-050](link) | ⚪ Not Started | - |
| UPEX-501 | `navigateToProfile()` | Medium | Navigate to profile page | [STORY-051](link) | ⚪ Not Started | - |
| UPEX-502 | `navigateToOrders()` | Medium | Navigate to orders page | [STORY-052](link) | ⚪ Not Started | - |

---

### CheckoutPage

| Test ID | ATC Method | Priority | Description | Related Story | Status | Last Result |
|---------|-----------|----------|-------------|---------------|--------|-------------|
| UPEX-600 | `addProductToCart()` | Critical | Add product to cart | [STORY-060](link) | ⚪ Not Started | - |
| UPEX-601 | `removeProductFromCart()` | High | Remove product from cart | [STORY-061](link) | ⚪ Not Started | - |
| UPEX-602 | `updateCartQuantity()` | High | Update item quantity in cart | [STORY-062](link) | ⚪ Not Started | - |
| UPEX-603 | `fillShippingInfo()` | High | Fill shipping address form | [STORY-063](link) | ⚪ Not Started | - |
| UPEX-604 | `completePurchaseSuccessfully()` | Critical | Complete purchase flow | [STORY-064](link) | ⚪ Not Started | - |
| UPEX-605 | `completePurchaseWithInvalidCard()` | Medium | Negative: payment failure, shows error | [STORY-064](link) | ⚪ Not Started | - |

---

## Statistics

### Overall Progress

| Metric | Count |
|--------|-------|
| **Total ATCs Registered** | 29 |
| **Completed** | 2 (7%) |
| **In Progress** | 2 (7%) |
| **Not Started** | 25 (86%) |
| **Pass Rate** | 50% (1/2 executed) |

### By Priority

| Priority | Total | Completed | In Progress | Not Started |
|----------|-------|-----------|-------------|-------------|
| **Critical** | 8 | 2 | 0 | 6 |
| **High** | 10 | 0 | 2 | 8 |
| **Medium** | 8 | 0 | 0 | 8 |
| **Low** | 3 | 0 | 0 | 3 |

### By Type

| Type | Total | Completed | Pass Rate |
|------|-------|-----------|-----------|
| **API** | 21 | 2 | 100% |
| **UI** | 8 | 0 | - |

---

## Status Legend

### Implementation Status
- 🟢 **Complete**: ATC implemented, reviewed, and stable
- 🟡 **In Progress**: ATC being implemented or has known issues
- ⚪ **Not Started**: ATC not yet implemented

### Test Results
- ✅ **PASS**: Last execution passed
- ❌ **FAIL**: Last execution failed
- ⚠️ **FLAKY**: Intermittent failures (needs investigation)
- `-` **Not Executed**: ATC not yet run

---

## Priority Definitions

| Priority | Definition | Example |
|----------|-----------|---------|
| **Critical** | Core functionality, must work for product to be usable | Login, create order, payment |
| **High** | Important features, significant impact if broken | Search, filters, profile update |
| **Medium** | Secondary features, moderate impact | Dashboard widgets, optional fields |
| **Low** | Nice-to-have features, minimal impact | UI animations, soft-fail validations |

---

## Instructions for QA Team

### Creating a New ATC Entry

1. **Create Jira test case** first:
   - Go to Jira → Create → Issue Type: Test (Xray) or Task (Jira Direct)
   - Fill in test details
   - Copy issue key (e.g., `UPEX-123`)

2. **Add entry to this file**:
   ```markdown
   | UPEX-XXX | `methodName()` | Priority | Description | [STORY-XXX](link) | ⚪ Not Started | - |
   ```

3. **Implement ATC** in code:
   ```typescript
   @atc('UPEX-XXX') // Use the same Test ID
   async methodName() {
     // Implementation
   }
   ```

4. **Update status** as you progress

### Updating Test Results

After each test run:
1. Update **Last Executed** date
2. Update **Last Result** (PASS/FAIL)
3. If flaky, mark as ⚠️ and create bug ticket

### Linking to Stories

Replace `[STORY-XXX](link)` with actual story links:
- Format: `[STORY-010](https://your-domain.atlassian.net/browse/UPEX-10)`

---

## Maintenance

- **Update frequency**: After each test run (automated via TMS sync)
- **Manual updates**: When adding/removing ATCs
- **Owner**: QA Lead
- **Last updated**: [Date]

---

## References

- **Component Catalog**: `component-catalog.md` (high-level overview)
- **KATA Architecture**: `kata-architecture.md`
- **TMS Integration**: `tms-integration.md` (auto-sync setup)
- **Jira Project**: https://your-domain.atlassian.net/browse/UPEX
