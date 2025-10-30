# Component Catalog

**Living Document**: This file is updated by QA engineers as components are implemented.

**Purpose**: Maintain a complete catalog of all KATA components with their ATCs.

---

## How to Use This File

1. **When creating a new component**, add a new section below
2. **List all ATCs** in that component with brief descriptions
3. **Update status** as ATCs are implemented
4. **Keep it current** - this is a living document

---

## API Components

### UsersApi

**File**: `tests/components/api/users_api.ts`
**Purpose**: Manage user-related operations (CRUD, authentication)
**Related Epic**: [Link to PBI epic]
**Status**: 🟢 Complete / 🟡 In Progress / ⚪ Not Started

| ATC Method | Test ID | Description | Status |
|------------|---------|-------------|--------|
| `createUserSuccessfully()` | UPEX-XXX | Creates user with valid data | 🟢 |
| `getUserById()` | UPEX-XXX | Retrieves user by ID | 🟢 |
| `updateUserSuccessfully()` | UPEX-XXX | Updates user with valid data | 🟡 |
| `deleteUserSuccessfully()` | UPEX-XXX | Deletes user and verifies removal | ⚪ |
| `createUserWithInvalidEmail()` | UPEX-XXX | Negative test: invalid email format | ⚪ |
| `getUserWithNonExistentId()` | UPEX-XXX | Negative test: user not found | ⚪ |

**Notes:**
- Uses Supabase Auth for authentication
- All user emails are unique (enforced by DB constraint)
- Cleanup handled by `afterEach` hook

---

### ProductsApi

**File**: `tests/components/api/products_api.ts`
**Purpose**: Manage product catalog (CRUD, search, filtering)
**Related Epic**: [Link to PBI epic]
**Status**: ⚪ Not Started

| ATC Method | Test ID | Description | Status |
|------------|---------|-------------|--------|
| `createProductSuccessfully()` | UPEX-XXX | Creates product with valid data | ⚪ |
| `getProductById()` | UPEX-XXX | Retrieves product by ID | ⚪ |
| `updateProductStock()` | UPEX-XXX | Updates product stock quantity | ⚪ |
| `deleteProductSuccessfully()` | UPEX-XXX | Deletes product | ⚪ |
| `searchProducts()` | UPEX-XXX | Searches products by name/category | ⚪ |
| `filterProductsByPrice()` | UPEX-XXX | Filters products by price range | ⚪ |

**Notes:**
- (Add notes as you implement)

---

### OrdersApi

**File**: `tests/components/api/orders_api.ts`
**Purpose**: Manage order lifecycle (create, update status, cancel)
**Related Epic**: [Link to PBI epic]
**Status**: ⚪ Not Started

| ATC Method | Test ID | Description | Status |
|------------|---------|-------------|--------|
| `createOrderSuccessfully()` | UPEX-XXX | Creates order with items | ⚪ |
| `getOrderById()` | UPEX-XXX | Retrieves order details | ⚪ |
| `updateOrderStatus()` | UPEX-XXX | Updates order status (pending → completed) | ⚪ |
| `cancelOrderSuccessfully()` | UPEX-XXX | Cancels order and updates status | ⚪ |
| `createOrderWithInvalidItems()` | UPEX-XXX | Negative test: invalid product IDs | ⚪ |

**Notes:**
- (Add notes as you implement)

---

## UI Components

### LoginPage

**File**: `tests/components/ui/login_page.ts`
**Purpose**: Handle login functionality and validations
**Related Epic**: [Link to PBI epic]
**Status**: 🟢 Complete / 🟡 In Progress / ⚪ Not Started

| ATC Method | Test ID | Description | Status |
|------------|---------|-------------|--------|
| `loginSuccessfully()` | UPEX-XXX | Login with valid credentials | 🟢 |
| `loginWithInvalidPassword()` | UPEX-XXX | Negative test: wrong password | 🟡 |
| `loginWithInvalidEmail()` | UPEX-XXX | Negative test: invalid email format | ⚪ |
| `logoutSuccessfully()` | UPEX-XXX | Logout and verify redirect | ⚪ |
| `verifyPasswordVisibilityToggle()` | UPEX-XXX | Toggle password visibility | ⚪ |

**Notes:**
- Uses Supabase Auth
- Password visibility toggle is optional (soft-fail)

---

### DashboardPage

**File**: `tests/components/ui/dashboard_page.ts`
**Purpose**: Dashboard interactions and data display
**Related Epic**: [Link to PBI epic]
**Status**: ⚪ Not Started

| ATC Method | Test ID | Description | Status |
|------------|---------|-------------|--------|
| `verifyUserWelcomeMessage()` | UPEX-XXX | Verify welcome message with user name | ⚪ |
| `navigateToProfile()` | UPEX-XXX | Navigate to profile page | ⚪ |
| `navigateToOrders()` | UPEX-XXX | Navigate to orders page | ⚪ |

**Notes:**
- (Add notes as you implement)

---

### CheckoutPage

**File**: `tests/components/ui/checkout_page.ts`
**Purpose**: Checkout flow (cart, shipping, payment)
**Related Epic**: [Link to PBI epic]
**Status**: ⚪ Not Started

| ATC Method | Test ID | Description | Status |
|------------|---------|-------------|--------|
| `addProductToCart()` | UPEX-XXX | Add product to cart | ⚪ |
| `removeProductFromCart()` | UPEX-XXX | Remove product from cart | ⚪ |
| `updateCartQuantity()` | UPEX-XXX | Update item quantity in cart | ⚪ |
| `fillShippingInfo()` | UPEX-XXX | Fill shipping address form | ⚪ |
| `completePurchaseSuccessfully()` | UPEX-XXX | Complete purchase flow | ⚪ |
| `completePurchaseWithInvalidCard()` | UPEX-XXX | Negative test: payment failure | ⚪ |

**Notes:**
- (Add notes as you implement)

---

## Summary Statistics

### Overall Progress

| Metric | Count |
|--------|-------|
| **Total Components** | 6 |
| **Total ATCs** | 23 |
| **Completed ATCs** | 2 (9%) |
| **In Progress ATCs** | 2 (9%) |
| **Not Started ATCs** | 19 (82%) |

### By Component Type

| Type | Components | Completed | In Progress | Not Started |
|------|-----------|-----------|-------------|-------------|
| **API** | 3 | 2 | 2 | 14 |
| **UI** | 3 | 0 | 0 | 7 |

---

## Instructions for QA Team

### Adding a New Component

1. Copy this template:
   ```markdown
   ### ComponentName

   **File**: `tests/components/api/component_name.ts`
   **Purpose**: Brief description
   **Related Epic**: [Link to PBI epic]
   **Status**: ⚪ Not Started

   | ATC Method | Test ID | Description | Status |
   |------------|---------|-------------|--------|
   | `methodName()` | UPEX-XXX | Description | ⚪ |
   ```

2. Add it under the appropriate section (API or UI)

3. Update summary statistics

### Updating Status

- 🟢 **Complete**: ATC implemented, passing, and reviewed
- 🟡 **In Progress**: ATC being implemented or failing
- ⚪ **Not Started**: ATC not yet implemented

### Linking to Jira

Replace `UPEX-XXX` with actual Jira issue keys. Format:
- `UPEX-123` → https://your-domain.atlassian.net/browse/UPEX-123

---

## Maintenance

- **Update frequency**: Weekly or when completing milestones
- **Owner**: QA Lead
- **Reviewers**: All QA team members
- **Last updated**: [Date]

---

## References

- **KATA Architecture**: `kata-architecture.md`
- **Implementation Plan**: `kata-implementation-plan.md`
- **ATC Registry**: `atc-registry.md` (for full test case details)
