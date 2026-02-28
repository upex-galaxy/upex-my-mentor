<!-- MANUAL PARA HUMANOS - No es un prompt para IA -->

# Test Automation - Manual

> **Fase:** 12 - Test Automation
> **Tiempo estimado:** 2-4 horas por test (depende de complejidad)
> **Herramientas:** Playwright, TypeScript, KATA Framework

---

## Objetivo

Implementar tests automatizados para los test cases documentados en Jira usando el framework KATA.

**IMPORTANTE:** Esta fase viene DESPUÉS de:

- Fase 10: Exploratory Testing (feature validada)
- Fase 11: Test Documentation (tests documentados con status CANDIDATE)

**Regla de oro:** Solo automatizar funcionalidad que ha sido validada manualmente y documentada.

---

## Conceptos Clave

### 🔑 KATA Architecture

```
Layer 4: Fixtures (TestFixture, ApiFixture, UiFixture)
    └── Dependency injection, test extension
        ↓
Layer 3: Components (AuthApi, LoginPage)
    └── ATCs con @atc decorator
        ↓
Layer 2: Base Classes (ApiBase, UiBase)
    └── HTTP helpers, Playwright helpers
        ↓
Layer 1: TestContext
    └── Configuration, data generation
```

### 🔑 ATC (Atomic Test Component)

Un ATC es un método que representa **UNA única salida esperada** (outcome).

```typescript
@atc('TEST-001')  // Mapea a Jira Test ID
async loginSuccessfully(credentials: LoginData) {
  // Acciones
  await this.page.locator('#email').fill(credentials.email);
  await this.page.locator('#password').fill(credentials.password);
  await this.page.locator('button[type="submit"]').click();

  // Fixed assertions - validan que el ATC tuvo éxito
  await expect(this.page).toHaveURL(/.*dashboard.*/);
}
```

### 🔑 Principios KATA

| Principio            | Descripción                  | ✅ Hacer                        | ❌ No Hacer                            |
| -------------------- | ---------------------------- | ------------------------------- | -------------------------------------- |
| **Unique Output**    | Cada ATC = 1 outcome         | `loginSuccessfully`             | `loginAndDoStuff`                      |
| **Inline Locators**  | Locators dentro del ATC      | `page.locator('#email')`        | `this.emailInput` en propiedad         |
| **No Helpers**       | No wrappear acciones simples | `page.click()` directo          | `clickButton()` helper                 |
| **No ATC calls ATC** | ATCs independientes          | Cada ATC autónomo               | `loginATC()` dentro de `checkoutATC()` |
| **Fixed Assertions** | Assertions dentro del ATC    | `expect().toBeVisible()` en ATC | Assertions solo en test                |

### 🔑 Estructura de Directorios

```
tests/
├── components/
│   ├── api/
│   │   ├── ApiBase.ts        # Base class para API
│   │   ├── AuthApi.ts        # Componente de autenticación
│   │   └── OrdersApi.ts      # Componente de órdenes
│   ├── ui/
│   │   ├── UiBase.ts         # Base class para UI
│   │   ├── LoginPage.ts      # Componente de login
│   │   └── CheckoutPage.ts   # Componente de checkout
│   ├── ApiFixture.ts         # Fixture para tests API
│   ├── UiFixture.ts          # Fixture para tests UI
│   └── TestFixture.ts        # Fixture principal (exporta todo)
├── e2e/
│   └── checkout/
│       └── checkout.test.ts  # Tests E2E
└── integration/
    └── orders/
        └── orders.test.ts    # Tests API
```

---

## Pre-requisitos

- [ ] **Tests documentados en Jira** (Fase 11 completada)
- [ ] **Tests marcados como "automation-candidate"**
- [ ] **KATA Framework configurado** en el proyecto
- [ ] **Guidelines leídas:**
  ```
  .context/guidelines/TAE/KATA-AI-GUIDE.md
  .context/guidelines/TAE/automation-standards.md
  .context/guidelines/TAE/kata-architecture.md
  ```

---

## Paso a Paso

---

## PARTE 1: E2E TEST AUTOMATION (UI Tests)

> **Para tests que interactúan con la interfaz de usuario.**

### Paso 1.1: Entender el Test Case

**Leer el test documentado en Jira y extraer:**

| Elemento      | Qué Buscar                           |
| ------------- | ------------------------------------ |
| Test name     | Summary del issue                    |
| Preconditions | Given (en Gherkin) o Precondiciones  |
| Steps         | When (en Gherkin) o pasos            |
| Assertions    | Then (en Gherkin) o Expected Results |
| Test Data     | Datos específicos mencionados        |

**Ejemplo:**

```gherkin
Feature: User Login

@critical @regression
Scenario: Successful login with valid credentials
  Given I am on the login page
  When I enter email "user@example.com"
  And I enter password "Password123!"
  And I click the submit button
  Then I should be redirected to the dashboard
  And I should see a welcome message
```

### Paso 1.2: Identificar Locators

**Abrir DevTools (F12) y encontrar locators para cada elemento:**

| Elemento       | Método de Búsqueda                        | Prioridad         |
| -------------- | ----------------------------------------- | ----------------- |
| `data-testid`  | `[data-testid="x"]`                       | 1️⃣ Mejor          |
| `id`           | `#email`                                  | 2️⃣ Bueno          |
| `role + text`  | `getByRole('button', { name: 'Submit' })` | 3️⃣ Bueno          |
| `CSS selector` | `button[type="submit"]`                   | 4️⃣ OK             |
| `XPath`        | `//button[text()='Submit']`               | 5️⃣ Último recurso |

**Documentar locators:**

```markdown
## Locators para LoginPage

| Elemento        | Locator                                        |
| --------------- | ---------------------------------------------- |
| Email input     | `#email` o `[data-testid="email-input"]`       |
| Password input  | `#password` o `[data-testid="password-input"]` |
| Submit button   | `button[type="submit"]`                        |
| Success message | `[data-testid="welcome-message"]`              |
```

### Paso 1.3: Decidir Arquitectura

**Preguntas a responder:**

1. **¿Existe el componente UI?** (ej: `LoginPage.ts`)
   - SÍ → Agregar nuevo ATC al componente existente
   - NO → Crear nuevo componente

2. **¿El ATC ya existe?**
   - SÍ → Reutilizar
   - NO → Crear nuevo ATC

3. **¿Es un flujo reutilizable?**
   - SÍ (2+ tests lo usan) → Considerar módulo de Preconditions
   - NO → Mantener en test file

### Paso 1.4: Implementar UI Component

**Crear/modificar archivo de componente:**

```typescript
// tests/components/ui/LoginPage.ts

/**
 * KATA Framework - Layer 3: Login Page Component
 */
import { expect, type Page } from '@playwright/test';
import { UiBase } from '@components/ui/UiBase';
import { atc } from '@utils/decorators';
import type { Environment } from '@config/variables';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export class LoginPage extends UiBase {
  constructor(page: Page, environment?: Environment) {
    super(page, environment);
  }

  async goto() {
    await this.page.goto(this.buildUrl('/login'));
  }

  /**
   * ATC: Login exitoso con credenciales válidas
   * Expected: Usuario es redirigido al dashboard
   */
  @atc('TEST-001') // ← ID del test en Jira
  async loginSuccessfully(credentials: LoginCredentials) {
    await this.goto();

    // Locators INLINE - no en propiedades separadas
    await this.page.locator('#email').fill(credentials.email);
    await this.page.locator('#password').fill(credentials.password);
    await this.page.locator('button[type="submit"]').click();

    // Fixed assertions - validan que el ATC tuvo éxito
    await expect(this.page).toHaveURL(/.*dashboard.*/);
    await expect(this.page.locator('[data-testid="welcome-message"]')).toBeVisible();
  }

  /**
   * ATC: Error de login con password incorrecto
   * Expected: Mensaje de error visible
   */
  @atc('TEST-002')
  async loginWithInvalidPassword(credentials: LoginCredentials) {
    await this.goto();

    await this.page.locator('#email').fill(credentials.email);
    await this.page.locator('#password').fill(credentials.password);
    await this.page.locator('button[type="submit"]').click();

    // Fixed assertions - validan error esperado
    await expect(this.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid credentials'
    );
  }
}
```

### Paso 1.5: Registrar en Fixture

**Agregar componente a UiFixture.ts:**

```typescript
// tests/components/UiFixture.ts

import { LoginPage } from '@components/ui/LoginPage';
import { CheckoutPage } from '@components/ui/CheckoutPage';

export class UiFixture extends UiBase {
  readonly login: LoginPage; // ← Agregar
  readonly checkout: CheckoutPage;

  constructor(page: Page, environment?: Environment) {
    super(page, environment);
    this.login = new LoginPage(page, environment); // ← Inicializar
    this.checkout = new CheckoutPage(page, environment);
  }
}
```

### Paso 1.6: Implementar Test File

```typescript
// tests/e2e/auth/login.test.ts

import { test, expect } from '@components/TestFixture';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials @critical', async ({ kata }) => {
    // ARRANGE - Test data
    const credentials = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    // ACT - Usar ATC
    await kata.ui.login.loginSuccessfully(credentials);

    // ASSERT - Assertions adicionales a nivel de test (si necesario)
    // Nota: La mayoría de assertions deben estar en el ATC
  });

  test('should show error with invalid password @high', async ({ kata }) => {
    // ARRANGE
    const invalidCredentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    // ACT
    await kata.ui.login.loginWithInvalidPassword(invalidCredentials);
  });
});
```

### Paso 1.7: Ejecutar y Validar

```bash
# Ejecutar test específico
bun run test tests/e2e/auth/login.test.ts

# Ejecutar con UI (debug)
bun run test tests/e2e/auth/login.test.ts --headed

# Ejecutar con trace
bun run test tests/e2e/auth/login.test.ts --trace on
```

---

## PARTE 2: API TEST AUTOMATION (Integration Tests)

> **Para tests que validan endpoints de API directamente.**

### Paso 2.1: Entender el API Test

**Extraer del test case:**

| Elemento        | Qué Buscar                      |
| --------------- | ------------------------------- |
| HTTP Method     | GET, POST, PUT, PATCH, DELETE   |
| Endpoint        | `/api/orders`, `/api/users/:id` |
| Request Payload | Body esperado                   |
| Response        | Estructura de respuesta         |
| Status Code     | 200, 201, 400, etc.             |
| Auth            | ¿Requiere token?                |

### Paso 2.2: Definir Types

```typescript
// En el componente o importar de @api/types

export interface CreateOrderPayload {
  productId: string;
  quantity: number;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
}

export interface OrderResponse {
  id: string;
  status: 'pending' | 'confirmed' | 'shipped';
  total: number;
  createdAt: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
```

### Paso 2.3: Implementar API Component

```typescript
// tests/components/api/OrdersApi.ts

/**
 * KATA Framework - Layer 3: Orders API Component
 */
import { expect, type APIResponse } from '@playwright/test';
import { ApiBase } from '@components/api/ApiBase';
import { atc } from '@utils/decorators';
import type { Environment } from '@config/variables';

// Types
export interface CreateOrderPayload { ... }
export interface OrderResponse { ... }
export interface ErrorResponse { ... }

export class OrdersApi extends ApiBase {
  constructor(environment?: Environment) {
    super(environment);
  }

  /**
   * ATC: Crear orden exitosamente
   * Returns: [APIResponse, OrderResponse, CreateOrderPayload]
   */
  @atc('TEST-010')
  async createOrderSuccessfully(
    payload: CreateOrderPayload
  ): Promise<[APIResponse, OrderResponse, CreateOrderPayload]> {
    const [response, body, sentPayload] = await this.apiPOST<
      OrderResponse,
      CreateOrderPayload
    >(
      '/orders',
      payload,
    );

    // Fixed assertions
    expect(response.status()).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.status).toBe('pending');

    return [response, body, sentPayload];
  }

  /**
   * ATC: Crear orden con datos inválidos (test negativo)
   * Returns: [APIResponse, ErrorResponse, CreateOrderPayload]
   */
  @atc('TEST-011')
  async createOrderWithInvalidData(
    payload: CreateOrderPayload
  ): Promise<[APIResponse, ErrorResponse, CreateOrderPayload]> {
    const [response, body, sentPayload] = await this.apiPOST<
      ErrorResponse,
      CreateOrderPayload
    >(
      '/orders',
      payload,
    );

    // Fixed assertions - expect 400 error
    expect(response.status()).toBe(400);
    expect(body.error).toBeDefined();

    return [response, body, sentPayload];
  }

  /**
   * ATC: Obtener orden por ID
   */
  @atc('TEST-012')
  async getOrderSuccessfully(
    orderId: string
  ): Promise<[APIResponse, OrderResponse]> {
    const [response, body] = await this.apiGET<OrderResponse>(
      `/orders/${orderId}`
    );

    expect(response.status()).toBe(200);
    expect(body.id).toBe(orderId);

    return [response, body];
  }
}
```

### Paso 2.4: Registrar en ApiFixture

```typescript
// tests/components/ApiFixture.ts

import { AuthApi } from '@components/api/AuthApi';
import { OrdersApi } from '@components/api/OrdersApi';

export class ApiFixture extends TestContext {
  readonly auth: AuthApi;
  readonly orders: OrdersApi; // ← Agregar

  constructor(environment?: Environment) {
    super(environment);
    this.auth = new AuthApi(environment);
    this.orders = new OrdersApi(environment); // ← Inicializar
  }
}
```

### Paso 2.5: Implementar Test File

```typescript
// tests/integration/orders/orders.test.ts

import { test, expect } from '@components/TestFixture';

test.describe('Orders API', () => {
  test.beforeEach(async ({ api }) => {
    // Autenticar antes de cada test
    await api.auth.signInSuccessfully({
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });
  });

  test('should create order successfully @critical', async ({ api }) => {
    // ARRANGE
    const orderData = {
      productId: 'prod-123',
      quantity: 2,
      shippingAddress: {
        street: '123 Main St',
        city: 'Test City',
        zipCode: '12345',
      },
    };

    // ACT
    const [response, order, payload] = await api.orders.createOrderSuccessfully(orderData);

    // ASSERT adicionales
    expect(order.total).toBeGreaterThan(0);
  });

  test('should reject order with negative quantity @high', async ({ api }) => {
    // ARRANGE - Datos inválidos
    const invalidData = {
      productId: 'prod-123',
      quantity: -1,  // Inválido
      shippingAddress: { ... },
    };

    // ACT
    const [response, error] = await api.orders.createOrderWithInvalidData(invalidData);

    // ASSERT
    expect(error.message).toContain('quantity');
  });
});
```

### Paso 2.6: Ejecutar y Validar

```bash
# Ejecutar tests de integración
bun run test tests/integration/orders/orders.test.ts

# Ejecutar todos los tests de API
bun run test tests/integration/
```

---

## API Testing Patterns (Referencia Rápida)

### GET Request

```typescript
@atc('TEST-001')
async getUserSuccessfully(id: string): Promise<[APIResponse, UserResponse]> {
  const [response, body] = await this.apiGET<UserResponse>(`/users/${id}`);

  expect(response.status()).toBe(200);
  expect(body.id).toBe(id);

  return [response, body];
}
```

### POST Request

```typescript
@atc('TEST-002')
async createUserSuccessfully(
  payload: CreateUserPayload
): Promise<[APIResponse, UserResponse, CreateUserPayload]> {
  const [response, body, sentPayload] = await this.apiPOST<
    UserResponse,
    CreateUserPayload
  >('/users', payload);

  expect(response.status()).toBe(201);
  expect(body.id).toBeDefined();

  return [response, body, sentPayload];
}
```

### PUT/PATCH Request

```typescript
@atc('TEST-003')
async updateUserSuccessfully(
  id: string,
  payload: UpdateUserPayload
): Promise<[APIResponse, UserResponse, UpdateUserPayload]> {
  const [response, body, sentPayload] = await this.apiPUT<
    UserResponse,
    UpdateUserPayload
  >(`/users/${id}`, payload);

  expect(response.status()).toBe(200);

  return [response, body, sentPayload];
}
```

### DELETE Request

```typescript
@atc('TEST-004')
async deleteUserSuccessfully(id: string): Promise<[APIResponse, void]> {
  const [response] = await this.apiDELETE<void>(`/users/${id}`);

  expect(response.status()).toBe(204);

  return [response, undefined as void];
}
```

---

## PARTE 3: Actualizar Jira

> **Después de automatizar, actualizar el status del test en Jira.**

### Paso 3.1: Cambiar Status

1. Abrir el Test en Jira
2. Transitar: `CANDIDATE → AUTOMATED`
3. Agregar label: `automated`

### Paso 3.2: Agregar Comentario

```
Test automatizado en:
- Archivo: tests/e2e/auth/login.test.ts
- Componente: LoginPage.ts
- ATC: loginSuccessfully

Ejecutar: bun run test tests/e2e/auth/login.test.ts
```

---

## Checklist de KATA Compliance

### Para cada ATC:

- [ ] Tiene decorator `@atc('TEST-XXX')` con ID de Jira
- [ ] Representa UN único expected outcome
- [ ] Locators son INLINE (no en propiedades)
- [ ] NO hay helper methods para acciones simples
- [ ] NO llama a otros ATCs
- [ ] Tiene Fixed Assertions que validan éxito
- [ ] Usa import aliases (`@components/`, `@utils/`)

### Para cada Component:

- [ ] Extiende la base correcta (`UiBase` o `ApiBase`)
- [ ] Está registrado en el Fixture correspondiente
- [ ] Tiene tipos definidos para inputs/outputs

### Para cada Test File:

- [ ] Importa desde `@components/TestFixture`
- [ ] Usa fixtures `{ kata }` o `{ api }`
- [ ] Tiene tags de prioridad (`@critical`, `@high`, etc.)
- [ ] Sigue estructura AAA (Arrange-Act-Assert)

---

## Troubleshooting

| Problema                               | Causa                       | Solución                         |
| -------------------------------------- | --------------------------- | -------------------------------- |
| "Cannot find module '@components/...'" | Import alias no configurado | Verificar `tsconfig.json` paths  |
| "Locator timeout"                      | Elemento no visible         | Verificar locator, agregar wait  |
| "Test failed: assertion"               | Expected no coincide        | Revisar valores esperados        |
| "401 Unauthorized"                     | Token expirado/faltante     | Verificar auth en beforeEach     |
| "Component not in fixture"             | No registrado               | Agregar a UiFixture o ApiFixture |

---

## Comandos Útiles

```bash
# Ejecutar un test específico
bun run test tests/e2e/auth/login.test.ts

# Ejecutar con UI visible (debug)
bun run test tests/e2e/auth/login.test.ts --headed

# Ejecutar con trace para debugging
bun run test tests/e2e/auth/login.test.ts --trace on

# Ejecutar solo tests con tag
bun run test --grep @critical

# Ejecutar todos los E2E
bun run test tests/e2e/

# Ejecutar todos los API
bun run test tests/integration/

# Generar reporte
bun run test --reporter=html

# Ver último reporte
bun run playwright show-report
```

---

## Checklist Final

### Implementación

- [ ] Test case leído y entendido
- [ ] Locators identificados
- [ ] Component creado/modificado
- [ ] ATC implementado con @atc decorator
- [ ] Component registrado en Fixture
- [ ] Test file creado
- [ ] Test ejecuta y pasa

### KATA Compliance

- [ ] Unique Output por ATC
- [ ] Locators INLINE
- [ ] Fixed Assertions en ATC
- [ ] Import aliases usados
- [ ] No helper methods innecesarios

### Post-Implementación

- [ ] Jira actualizado (status: AUTOMATED)
- [ ] Label `automated` agregado
- [ ] Comentario con path del archivo
- [ ] Test incluido en CI/CD

---

**Versión:** 1.0
**Última actualización:** 2025-12-30
