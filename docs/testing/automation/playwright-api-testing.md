# Testing API Automatizado con Playwright

Esta guía explica cómo implementar tests de API automatizados siguiendo la arquitectura KATA del proyecto.

---

## Arquitectura KATA para Testing de API

### Estructura de Capas

```
Layer 5: Archivos de Test (tests/integration/*.spec.ts)
    |
Layer 4: Fixture (ApiFixture - inyección de dependencias)
    |
Layer 3: Componentes API (OrdersApi, ProductsApi, UsersApi)
    |
Layer 2: ApiBase (helpers HTTP genéricos)
    |
Layer 1: TestContext (configuración, logger, cliente HTTP)
```

### Estructura de Directorios

```
tests/
|-- components/
|   |-- api/                    # Layer 3: Componentes API
|   |   |-- base/
|   |   |   +-- api-base.ts     # Layer 2: Clase base
|   |   |-- auth-api.ts         # Autenticación
|   |   |-- users-api.ts        # Usuarios
|   |   |-- products-api.ts     # Productos
|   |   |-- orders-api.ts       # Órdenes
|   |   |-- reviews-api.ts      # Reseñas
|   |   +-- index.ts            # Exports
|   +-- preconditions/
|       +-- auth-precondition.ts
|-- fixtures/
|   +-- api-fixture.ts          # Layer 4: Fixture
|-- integration/                 # Layer 5: Archivos de test
|   |-- auth.spec.ts
|   |-- users.spec.ts
|   |-- products.spec.ts
|   |-- orders.spec.ts
|   +-- reviews.spec.ts
|-- data/
|   +-- fixtures/
|       +-- test-users.ts       # Datos de test
+-- utils/
    +-- test-context.ts         # Layer 1: Contexto
```

---

## Layer 1: Test Context

```typescript
// tests/utils/test-context.ts
import { APIRequestContext } from '@playwright/test';

export interface TestConfig {
  baseUrl: string;
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  projectRef: string;
  testUsers: {
    customer: { email: string; password: string };
    admin: { email: string; password: string };
  };
}

export const testConfig: TestConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  projectRef: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || '',
  testUsers: {
    customer: {
      email: process.env.TEST_USER_EMAIL || 'test.customer@example.com',
      password: process.env.TEST_USER_PASSWORD || 'Customer123!',
    },
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'test.admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
    },
  },
};

export class TestContext {
  constructor(
    public readonly request: APIRequestContext,
    public readonly config: TestConfig = testConfig
  ) {}

  log(message: string) {
    console.log(`[TEST] ${new Date().toISOString()} - ${message}`);
  }
}
```

---

## Layer 2: API Base

```typescript
// tests/components/api/base/api-base.ts
import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { TestContext, testConfig } from '../../../utils/test-context';

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export class ApiBase {
  protected context: TestContext;
  protected request: APIRequestContext;
  protected baseUrl: string;
  protected authToken: string | null = null;

  constructor(context: TestContext) {
    this.context = context;
    this.request = context.request;
    this.baseUrl = context.config.supabaseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      apikey: testConfig.supabaseAnonKey,
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/rest/v1${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await this.request.get(url.toString(), {
      headers: this.getHeaders(),
    });

    return this.parseResponse<T>(response);
  }

  protected async post<T>(
    endpoint: string,
    data: unknown,
    options?: { returnRepresentation?: boolean }
  ): Promise<ApiResponse<T>> {
    const headers = this.getHeaders();
    if (options?.returnRepresentation) {
      headers['Prefer'] = 'return=representation';
    }

    const response = await this.request.post(`${this.baseUrl}/rest/v1${endpoint}`, {
      headers,
      data,
    });

    return this.parseResponse<T>(response);
  }

  protected async patch<T>(
    endpoint: string,
    data: unknown,
    options?: { returnRepresentation?: boolean }
  ): Promise<ApiResponse<T>> {
    const headers = this.getHeaders();
    if (options?.returnRepresentation) {
      headers['Prefer'] = 'return=representation';
    }

    const response = await this.request.patch(`${this.baseUrl}/rest/v1${endpoint}`, {
      headers,
      data,
    });

    return this.parseResponse<T>(response);
  }

  protected async delete(endpoint: string): Promise<ApiResponse<void>> {
    const response = await this.request.delete(`${this.baseUrl}/rest/v1${endpoint}`, {
      headers: this.getHeaders(),
    });

    return {
      status: response.status(),
      data: undefined as void,
      headers: this.extractHeaders(response),
    };
  }

  private async parseResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    let data: T;
    try {
      data = await response.json();
    } catch {
      data = {} as T;
    }

    return {
      status: response.status(),
      data,
      headers: this.extractHeaders(response),
    };
  }

  private extractHeaders(response: APIResponse): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headersArray().forEach(({ name, value }) => {
      headers[name.toLowerCase()] = value;
    });
    return headers;
  }
}
```

---

## Layer 3: Componentes API (ATCs)

### Auth API

```typescript
// tests/components/api/auth-api.ts
import { expect } from '@playwright/test';
import { ApiBase } from './base/api-base';

/**
 * @atc AUTH-001
 * Login con email y password
 */
async login(email: string, password: string): Promise<AuthenticatedUser> {
  this.context.log(`Logging in as ${email}`);

  const response = await this.request.post(
    `${this.baseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: testConfig.supabaseAnonKey, 'Content-Type': 'application/json' },
      data: { email, password },
    }
  );

  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.access_token).toBeDefined();

  this.setAuthToken(data.access_token);

  return {
    token: data.access_token,
    userId: data.user.id,
    email: data.user.email,
    role: data.user.user_metadata.role,
  };
}
```

---

## Layer 4: API Fixture

```typescript
// tests/fixtures/api-fixture.ts
import { test as base, APIRequestContext } from '@playwright/test';
import { TestContext, testConfig } from '../utils/test-context';
import { AuthApi } from '../components/api/auth-api';
import { UsersApi } from '../components/api/users-api';
import { OrdersApi } from '../components/api/orders-api';

interface ApiFixture {
  context: TestContext;
  auth: AuthApi;
  users: UsersApi;
  orders: OrdersApi;
}

export const test = base.extend<ApiFixture>({
  context: async ({ request }, use) => {
    const context = new TestContext(request, testConfig);
    await use(context);
  },

  auth: async ({ context }, use) => {
    const auth = new AuthApi(context);
    await use(auth);
  },

  users: async ({ context }, use) => {
    const users = new UsersApi(context);
    await use(users);
  },

  orders: async ({ context }, use) => {
    const orders = new OrdersApi(context);
    await use(orders);
  },
});

export { expect } from '@playwright/test';
```

---

## Layer 5: Archivos de Test

### Tests de Auth

```typescript
// tests/integration/auth.spec.ts
import { test, expect } from '../fixtures/api-fixture';

test.describe('Authentication API', () => {
  test('AUTH-001: Login con credenciales válidas', async ({ auth }) => {
    const user = await auth.loginAsCustomer();

    expect(user.token).toBeDefined();
    expect(user.email).toContain('@');
    expect(user.role).toBe('customer');
  });

  test('AUTH-002: Login con credenciales inválidas debe fallar', async ({ auth }) => {
    await expect(auth.login('invalid@email.com', 'wrongpassword')).rejects.toThrow();
  });
});
```

### Tests de Orders

```typescript
// tests/integration/orders.spec.ts
import { test, expect } from '../fixtures/api-fixture';

test.describe('Orders API', () => {
  test('ORDER-001: Obtener mis órdenes', async ({ auth, orders }) => {
    const user = await auth.loginAsCustomer();
    orders.setAuthToken(user.token);

    const myOrders = await orders.getMyOrders(user.userId);

    // Todas las órdenes deben pertenecer a este usuario
    myOrders.forEach(order => {
      expect(order.user_id).toBe(user.userId);
    });
  });

  test('ORDER-002: Crear y eliminar orden pendiente', async ({ auth, orders }) => {
    const customer = await auth.loginAsCustomer();
    orders.setAuthToken(customer.token);

    // Crear orden
    const order = await orders.createOrder({
      user_id: customer.userId,
      total: 99.99,
      shipping_address: {
        street: '123 Test Street',
        city: 'Test City',
        zip: '12345',
      },
    });

    expect(order.status).toBe('pending');

    // Cleanup: eliminar la orden pendiente
    await orders.deletePendingOrder(order.id);
  });

  test('ORDER-003: No puede ver órdenes de otro usuario (RLS)', async ({ auth, orders }) => {
    const customer = await auth.loginAsCustomer();
    orders.setAuthToken(customer.token);

    // Usar un user ID falso
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const otherOrders = await orders.attemptViewOtherOrders(fakeUserId);

    // RLS debe retornar array vacío
    expect(otherOrders.length).toBe(0);
  });
});
```

---

## Ejecutar Tests

### Comandos

```bash
# Todos los tests de integration
bun run test:integration

# Test específico
bun run test tests/integration/auth.spec.ts

# Con UI mode (debug)
bun run test:debug

# Generar reporte
bun run test:report
```

### Variables de Entorno

Crear `.env.test`:

```bash
NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}
TEST_USER_EMAIL={{TEST_USER_EMAIL}}
TEST_USER_PASSWORD={{TEST_USER_PASSWORD}}
TEST_ADMIN_EMAIL={{TEST_ADMIN_EMAIL}}
TEST_ADMIN_PASSWORD={{TEST_ADMIN_PASSWORD}}
```

---

## Buenas Prácticas

### 1. Compartir Token Entre Componentes

```typescript
test('Flujo completo', async ({ auth, orders, reviews }) => {
  const user = await auth.loginAsCustomer();

  // Compartir token con todos los componentes
  orders.setAuthToken(user.token);
  reviews.setAuthToken(user.token);

  // Ahora ambos pueden hacer requests autenticados
});
```

### 2. Limpieza de Datos de Test

```typescript
test('Crear y limpiar', async ({ auth, orders }) => {
  const user = await auth.loginAsCustomer();
  orders.setAuthToken(user.token);

  const order = await orders.createOrder({ ... });

  // Assertions del test...

  // Cleanup
  await orders.deletePendingOrder(order.id);
});
```

### 3. Usar test.describe para Agrupar

```typescript
test.describe('Como Customer', () => {
  test.beforeEach(async ({ auth, orders }) => {
    const user = await auth.loginAsCustomer();
    orders.setAuthToken(user.token);
  });

  test('puede ver sus órdenes', async ({ orders }) => {
    // Ya autenticado
  });
});
```

---

## Resumen

| Layer       | Responsabilidad                                   |
| ----------- | ------------------------------------------------- |
| **Layer 1** | Configuración global y contexto                   |
| **Layer 2** | Helpers HTTP genéricos (get, post, patch, delete) |
| **Layer 3** | ATCs específicos del dominio con assertions       |
| **Layer 4** | Fixture que inyecta dependencias                  |
| **Layer 5** | Tests que componen ATCs                           |

Esta arquitectura permite:

- Reusabilidad de código
- Trazabilidad a casos de test
- Assertions que garantizan calidad
- Fácil mantenimiento y extensión
