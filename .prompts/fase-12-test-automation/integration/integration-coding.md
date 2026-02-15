# Integration Test Automation - Coding

> **Fase**: 2 de 3 (Plan → Coding → Review)
> **Propósito**: Implementar el componente API y archivo de test basado en el plan aprobado.
> **Input**: Plan aprobado de la Fase 1.

---

## Carga de Contexto

**Cargar estos archivos antes de proceder:**

1. `.context/guidelines/TAE/kata-ai-index.md` → Patrones core KATA
2. `.context/guidelines/TAE/typescript-patterns.md` → Convenciones TypeScript
3. `.context/guidelines/TAE/api-testing-patterns.md` → Patrones de API
4. `.context/playwright-automation-system.md` → Arquitectura de código

---

## Input Requerido

1. **Plan Aprobado** de la Fase 1 (`integration-plan.md`)
2. **Caso de Test Original** (Spec de API de Fase 11)

---

## Flujo de Implementación

### Paso 1: Verificar Prerrequisitos

Antes de codificar, verificar:

```bash
# Verificar si existen las clases base
cat tests/components/api/ApiBase.ts

# Verificar estructura de fixture
cat tests/components/ApiFixture.ts

# Verificar import aliases
grep -A 10 '"paths"' tsconfig.json

# Verificar tipos existentes
cat tests/data/types.ts
```

---

### Paso 2: Crear Definiciones de Tipos

Agregar todos los tipos necesarios para el componente API:

```typescript
// tests/data/types.ts

// ============================================================================
// TIPOS DE {RESOURCE}
// ============================================================================

/**
 * Payload para crear un nuevo {resource}
 * Usado en POST /api/v1/{resources}
 */
export interface Create{Resource}Payload {
  name: string;
  email: string;
  roleId: number;
  metadata?: Record<string, unknown>;
}

/**
 * Payload para actualizar un {resource}
 * Usado en PUT/PATCH /api/v1/{resources}/{id}
 */
export interface Update{Resource}Payload {
  name?: string;
  email?: string;
  roleId?: number;
}

/**
 * Response de endpoints de {resource}
 */
export interface {Resource}Response {
  id: string;
  name: string;
  email: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response de lista con paginación
 */
export interface {Resource}ListResponse {
  data: {Resource}Response[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response de error de API estándar
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, string[]>;
}
```

---

### Paso 3: Implementar Componente API

Crear el componente KATA API siguiendo la estructura de Layer 3:

#### Template de Componente

```typescript
// tests/components/api/{Resource}Api.ts

import type { APIResponse } from '@playwright/test';
import type { TestContextOptions } from '@components/TestContext';
import { expect } from '@playwright/test';
import { ApiBase } from '@api/ApiBase';
import { atc } from '@utils/decorators';

// ============================================================================
// IMPORTS/EXPORTS DE TIPOS
// ============================================================================

import type {
  Create{Resource}Payload,
  Update{Resource}Payload,
  {Resource}Response,
  {Resource}ListResponse,
  ApiErrorResponse,
} from '@data/types';

// Re-exportar para conveniencia del archivo de test
export type {
  Create{Resource}Payload,
  Update{Resource}Payload,
  {Resource}Response,
};

// ============================================================================
// IMPLEMENTACIÓN DEL COMPONENTE
// ============================================================================

/**
 * {Resource}Api - Componente API para endpoints de {resource}
 *
 * Layer: 3 (Componente de Dominio)
 * Extiende: ApiBase
 * Base URL: /api/v1/{resources}
 *
 * ATCs:
 * - {TEST-001}: create{Resource}Successfully() - Crear nuevo recurso
 * - {TEST-002}: get{Resource}Successfully() - Obtener recurso individual
 * - {TEST-003}: update{Resource}Successfully() - Actualizar recurso
 * - {TEST-004}: delete{Resource}Successfully() - Eliminar recurso
 * - {TEST-005}: get{Resource}WithNonExistentId() - Caso 404
 */
export class {Resource}Api extends ApiBase {
  // ==========================================================================
  // CONFIGURACIÓN
  // ==========================================================================

  /** Endpoint base para este recurso */
  private readonly baseEndpoint = '/api/v1/{resources}';

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================

  constructor(options: TestContextOptions) {
    super(options);
  }

  // ==========================================================================
  // ATCs: CASOS DE ÉXITO
  // ==========================================================================

  /**
   * {TEST-001}: Crear un nuevo {resource}
   *
   * POST /api/v1/{resources}
   *
   * Assertions Fijas:
   * - Status code es 201 Created
   * - Response body contiene id
   * - Response refleja valores del payload
   */
  @atc('{TEST-001}')
  async create{Resource}Successfully(
    payload: Create{Resource}Payload
  ): Promise<[APIResponse, {Resource}Response, Create{Resource}Payload]> {
    // REQUEST
    const [response, body] = await this.apiPOST<{Resource}Response, Create{Resource}Payload>(
      this.baseEndpoint,
      payload
    );

    // ASSERTIONS FIJAS
    expect(response.status()).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.name).toBe(payload.name);
    expect(body.email).toBe(payload.email);

    return [response, body, payload];
  }

  /**
   * {TEST-002}: Obtener un {resource} individual por ID
   *
   * GET /api/v1/{resources}/{id}
   *
   * Assertions Fijas:
   * - Status code es 200 OK
   * - Response body contiene campos esperados
   */
  @atc('{TEST-002}')
  async get{Resource}Successfully(
    id: string
  ): Promise<[APIResponse, {Resource}Response]> {
    // REQUEST
    const [response, body] = await this.apiGET<{Resource}Response>(
      `${this.baseEndpoint}/${id}`
    );

    // ASSERTIONS FIJAS
    expect(response.status()).toBe(200);
    expect(body.id).toBe(id);
    expect(body.name).toBeDefined();

    return [response, body];
  }

  /**
   * {TEST-003}: Obtener todos los {resources} con paginación
   *
   * GET /api/v1/{resources}?page=1&limit=10
   */
  @atc('{TEST-003}')
  async getAll{Resources}Successfully(
    params?: { page?: number; limit?: number }
  ): Promise<[APIResponse, {Resource}ListResponse]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = queryParams.toString()
      ? `${this.baseEndpoint}?${queryParams}`
      : this.baseEndpoint;

    const [response, body] = await this.apiGET<{Resource}ListResponse>(endpoint);

    expect(response.status()).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toBeDefined();

    return [response, body];
  }

  /**
   * {TEST-004}: Actualizar un {resource} existente
   *
   * PUT /api/v1/{resources}/{id}
   */
  @atc('{TEST-004}')
  async update{Resource}Successfully(
    id: string,
    payload: Update{Resource}Payload
  ): Promise<[APIResponse, {Resource}Response, Update{Resource}Payload]> {
    const [response, body] = await this.apiPUT<{Resource}Response, Update{Resource}Payload>(
      `${this.baseEndpoint}/${id}`,
      payload
    );

    expect(response.status()).toBe(200);
    expect(body.id).toBe(id);
    if (payload.name) expect(body.name).toBe(payload.name);

    return [response, body, payload];
  }

  /**
   * {TEST-005}: Eliminar un {resource}
   *
   * DELETE /api/v1/{resources}/{id}
   */
  @atc('{TEST-005}')
  async delete{Resource}Successfully(
    id: string
  ): Promise<[APIResponse, void]> {
    const [response] = await this.apiDELETE(`${this.baseEndpoint}/${id}`);

    expect([200, 204]).toContain(response.status());

    return [response, undefined];
  }

  // ==========================================================================
  // ATCs: CASOS DE ERROR
  // ==========================================================================

  /**
   * {TEST-006}: Intentar obtener {resource} inexistente
   *
   * GET /api/v1/{resources}/{non-existent-id}
   */
  @atc('{TEST-006}')
  async get{Resource}WithNonExistentId(
    id: string
  ): Promise<[APIResponse, ApiErrorResponse]> {
    const [response, body] = await this.apiGET<ApiErrorResponse>(
      `${this.baseEndpoint}/${id}`
    );

    expect(response.status()).toBe(404);
    expect(body.error).toBeDefined();

    return [response, body];
  }

  /**
   * {TEST-007}: Intentar crear con payload inválido
   *
   * POST /api/v1/{resources} con datos inválidos
   */
  @atc('{TEST-007}')
  async create{Resource}WithInvalidPayload(
    payload: Partial<Create{Resource}Payload>
  ): Promise<[APIResponse, ApiErrorResponse, Partial<Create{Resource}Payload>]> {
    const [response, body] = await this.apiPOST<ApiErrorResponse, Partial<Create{Resource}Payload>>(
      this.baseEndpoint,
      payload
    );

    expect(response.status()).toBe(400);
    expect(body.error).toBeDefined();

    return [response, body, payload];
  }
}
```

---

### Paso 4: Registrar Componente en Fixture

Agregar el nuevo componente a `ApiFixture.ts`:

```typescript
// tests/components/ApiFixture.ts

import type { TestContextOptions } from '@components/TestContext';
import { ApiBase } from '@api/ApiBase';

// Importar componentes existentes
import { AuthApi } from '@api/AuthApi';
// Agregar nuevo import
import { {Resource}Api } from '@api/{Resource}Api';

export class ApiFixture extends ApiBase {
  // Componentes existentes
  public readonly auth: AuthApi;

  // Agregar nuevo componente
  public readonly {resource}: {Resource}Api;

  constructor(options: TestContextOptions) {
    super(options);

    // Inicializar componentes existentes
    this.auth = new AuthApi(options);

    // Inicializar nuevo componente
    this.{resource} = new {Resource}Api(options);
  }
}
```

---

### Paso 5: Implementar Archivo de Test

Crear el archivo de test siguiendo patrones KATA:

```typescript
// tests/integration/{resource}/{resource}.test.ts

import { expect } from '@playwright/test';
import { test } from '@TestFixture';
import { faker } from '@faker-js/faker';
import type { Create{Resource}Payload } from '@api/{Resource}Api';

// ============================================================================
// SUITE DE TESTS: {Resource} API
// ============================================================================

test.describe('{Resource} API', () => {
  // ==========================================================================
  // SETUP
  // ==========================================================================

  test.beforeEach(async ({ api }) => {
    // Autenticar antes de cada test
    await api.auth.authenticateSuccessfully({
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });
  });

  // ==========================================================================
  // FÁBRICA DE DATOS DE TEST
  // ==========================================================================

  const createValidPayload = (): Create{Resource}Payload => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    roleId: faker.number.int({ min: 1, max: 5 }),
  });

  // ==========================================================================
  // TESTS: CRUD Operations
  // ==========================================================================

  test('debería crear {resource} exitosamente @integration @{resource}', async ({ api }) => {
    // ARRANGE
    const payload = createValidPayload();

    // ACT
    const [response, body, sentPayload] = await api.{resource}.create{Resource}Successfully(payload);

    // ASSERT (opcional - más allá de assertions del ATC)
    expect(body.name).toBe(sentPayload.name);
    expect(body.email).toBe(sentPayload.email);
  });

  test('debería obtener {resource} por ID @integration @{resource}', async ({ api }) => {
    // ARRANGE: Crear primero
    const payload = createValidPayload();
    const [, created] = await api.{resource}.create{Resource}Successfully(payload);

    // ACT
    const [, retrieved] = await api.{resource}.get{Resource}Successfully(created.id);

    // ASSERT
    expect(retrieved.id).toBe(created.id);
    expect(retrieved.name).toBe(created.name);
  });

  test('debería actualizar {resource} @integration @{resource}', async ({ api }) => {
    // ARRANGE
    const [, created] = await api.{resource}.create{Resource}Successfully(createValidPayload());
    const updatePayload = { name: faker.person.fullName() };

    // ACT
    const [, updated] = await api.{resource}.update{Resource}Successfully(created.id, updatePayload);

    // ASSERT
    expect(updated.name).toBe(updatePayload.name);
  });

  test('debería eliminar {resource} @integration @{resource}', async ({ api }) => {
    // ARRANGE
    const [, created] = await api.{resource}.create{Resource}Successfully(createValidPayload());

    // ACT
    await api.{resource}.delete{Resource}Successfully(created.id);

    // ASSERT: Verificar que ya no existe
    await api.{resource}.get{Resource}WithNonExistentId(created.id);
  });

  // ==========================================================================
  // TESTS: Casos de Error
  // ==========================================================================

  test('debería retornar 404 para ID inexistente @integration @{resource}', async ({ api }) => {
    // ARRANGE
    const nonExistentId = faker.string.uuid();

    // ACT & ASSERT (el ATC contiene las assertions)
    await api.{resource}.get{Resource}WithNonExistentId(nonExistentId);
  });

  test('debería retornar 400 para payload inválido @integration @{resource}', async ({ api }) => {
    // ARRANGE: Payload inválido (falta email)
    const invalidPayload = { name: faker.person.fullName() };

    // ACT & ASSERT
    await api.{resource}.create{Resource}WithInvalidPayload(invalidPayload);
  });
});
```

---

### Paso 6: Ejecutar y Validar

Ejecutar el test para verificar la implementación:

```bash
# Ejecutar archivo de test específico
bun run test tests/integration/{resource}/{resource}.test.ts

# Ejecutar solo tests de integration
bun run test --project=integration

# Ver output detallado
bun run test --reporter=list tests/integration/{resource}/
```

---

## Checklist de Calidad de Código

### Calidad del Componente

- [ ] Extiende `ApiBase` correctamente
- [ ] Constructor acepta `TestContextOptions`
- [ ] Decorator `@atc` con Test ID correcto
- [ ] Tipos de retorno son tuplas correctas
- [ ] Assertions fijas dentro del ATC
- [ ] Import aliases usados

### Calidad del Archivo de Test

- [ ] Importa `test` desde `@TestFixture`
- [ ] Setup de auth en `beforeEach`
- [ ] Datos generados con Faker
- [ ] Estructura ARRANGE-ACT-ASSERT
- [ ] Tags apropiados

---

## Checklist de Output

Después de completar la fase de Coding:

- [ ] Componente API creado: `tests/components/api/{Resource}Api.ts`
- [ ] Tipos definidos: `tests/data/types.ts`
- [ ] Componente registrado en: `tests/components/ApiFixture.ts`
- [ ] Archivo de test creado: `tests/integration/{resource}/{resource}.test.ts`
- [ ] Test pasa localmente: `bun run test <archivo-de-test>`
- [ ] Sin errores TypeScript: `bun run type-check`

---

## Siguiente Paso

Una vez que la implementación esté completa y los tests pasen:

→ **Proceder a**: `integration-review.md` (Fase 3)
