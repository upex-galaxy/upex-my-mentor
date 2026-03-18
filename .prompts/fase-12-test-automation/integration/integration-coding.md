# Integration Test Automation - Coding

> **Fase**: 2 de 3 (Plan → Coding → Review)
> **Propósito**: Implementar el componente API y archivo de test basado en el plan aprobado.
> **Input**: Plan aprobado de la Fase 1.

---

## Carga de Contexto

**Cargar estos archivos antes de proceder:**

1. `qa/.context/guidelines/TAE/kata-ai-index.md` → Patrones core KATA
2. `qa/.context/guidelines/TAE/typescript-patterns.md` → Convenciones TypeScript
3. `qa/.context/guidelines/TAE/api-testing-patterns.md` → Patrones de API
4. `qa/.context/guidelines/TAE/playwright-automation-system.md` → Arquitectura de código

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
cat qa/tests/components/api/ApiBase.ts

# Verificar estructura de fixture
cat qa/tests/components/ApiFixture.ts

# Verificar import aliases
grep -A 10 '"paths"' qa/tsconfig.json

# Verificar tipos existentes
cat qa/tests/data/types.ts
```

---

### Paso 2: Crear Definiciones de Tipos

Agregar todos los tipos necesarios para el componente API:

```typescript
// qa/tests/data/types.ts

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

Crear el componente KATA API siguiendo estructura de Layer 3:

#### Template de Componente

```typescript
// qa/tests/components/api/{Resource}Api.ts

import type { APIResponse } from '@playwright/test';
import type { TestContextOptions } from '@components/TestContext';
import { expect } from '@playwright/test';
import { ApiBase } from '@api/ApiBase';
import { atc } from '@utils/decorators';

// ============================================================================
// IMPORTS/EXPORTS DE TIPOS
// ============================================================================

// Importar tipos del archivo central de tipos
import type {
  Create{Resource}Payload,
  Update{Resource}Payload,
  {Resource}Response,
  {Resource}ListResponse,
  ApiErrorResponse,
} from '@data/types';

// Re-exportar para conveniencia en archivo de test
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
   *
   * @param payload - Datos para crear el recurso
   * @returns Tupla de [response, body, payload]
   */
  @atc('{TEST-001}')
  async create{Resource}Successfully(
    payload: Create{Resource}Payload
  ): Promise<[APIResponse, {Resource}Response, Create{Resource}Payload]> {
    // -------------------------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------------------------
    const [response, body] = await this.apiPOST<{Resource}Response, Create{Resource}Payload>(
      this.baseEndpoint,
      payload
    );

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
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
   *
   * @param id - Identificador del recurso
   * @returns Tupla de [response, body]
   */
  @atc('{TEST-002}')
  async get{Resource}Successfully(
    id: string
  ): Promise<[APIResponse, {Resource}Response]> {
    // -------------------------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------------------------
    const [response, body] = await this.apiGET<{Resource}Response>(
      `${this.baseEndpoint}/${id}`
    );

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(200);
    expect(body.id).toBe(id);
    expect(body.name).toBeDefined();
    expect(body.email).toBeDefined();

    return [response, body];
  }

  /**
   * {TEST-003}: Obtener todos los {resources} con paginación
   *
   * GET /api/v1/{resources}?page=1&limit=10
   *
   * Assertions Fijas:
   * - Status code es 200 OK
   * - Response contiene array de datos
   * - Info de paginación presente
   *
   * @param params - Parámetros de query (page, limit)
   * @returns Tupla de [response, body]
   */
  @atc('{TEST-003}')
  async getAll{Resources}Successfully(
    params?: { page?: number; limit?: number }
  ): Promise<[APIResponse, {Resource}ListResponse]> {
    // -------------------------------------------------------------------------
    // CONSTRUIR QUERY STRING
    // -------------------------------------------------------------------------
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const endpoint = queryParams.toString()
      ? `${this.baseEndpoint}?${queryParams}`
      : this.baseEndpoint;

    // -------------------------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------------------------
    const [response, body] = await this.apiGET<{Resource}ListResponse>(endpoint);

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBeGreaterThanOrEqual(1);

    return [response, body];
  }

  /**
   * {TEST-004}: Actualizar un {resource} existente
   *
   * PUT /api/v1/{resources}/{id}
   *
   * Assertions Fijas:
   * - Status code es 200 OK
   * - Response refleja valores actualizados
   *
   * @param id - Identificador del recurso
   * @param payload - Datos de actualización
   * @returns Tupla de [response, body, payload]
   */
  @atc('{TEST-004}')
  async update{Resource}Successfully(
    id: string,
    payload: Update{Resource}Payload
  ): Promise<[APIResponse, {Resource}Response, Update{Resource}Payload]> {
    // -------------------------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------------------------
    const [response, body] = await this.apiPUT<{Resource}Response, Update{Resource}Payload>(
      `${this.baseEndpoint}/${id}`,
      payload
    );

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(200);
    expect(body.id).toBe(id);
    if (payload.name) expect(body.name).toBe(payload.name);
    if (payload.email) expect(body.email).toBe(payload.email);

    return [response, body, payload];
  }

  /**
   * {TEST-005}: Eliminar un {resource}
   *
   * DELETE /api/v1/{resources}/{id}
   *
   * Assertions Fijas:
   * - Status code es 204 No Content O 200 OK
   *
   * @param id - Identificador del recurso
   * @returns Tupla de [response, void]
   */
  @atc('{TEST-005}')
  async delete{Resource}Successfully(
    id: string
  ): Promise<[APIResponse, void]> {
    // -------------------------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------------------------
    const [response] = await this.apiDELETE(`${this.baseEndpoint}/${id}`);

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
    expect([200, 204]).toContain(response.status());

    return [response, undefined];
  }

  // ==========================================================================
  // ATCs: CASOS DE ERROR
  // ==========================================================================

  /**
   * {TEST-006}: Intentar obtener {resource} inexistente
   *
   * GET /api/v1/{resources}/{id-inexistente}
   *
   * Assertions Fijas:
   * - Status code es 404 Not Found
   * - Mensaje de error presente
   *
   * @param id - ID de recurso inexistente
   * @returns Tupla de [response, errorBody]
   */
  @atc('{TEST-006}')
  async get{Resource}WithNonExistentId(
    id: string
  ): Promise<[APIResponse, ApiErrorResponse]> {
    // -------------------------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------------------------
    const [response, body] = await this.apiGET<ApiErrorResponse>(
      `${this.baseEndpoint}/${id}`
    );

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(404);
    expect(body.error).toBeDefined();

    return [response, body];
  }

  /**
   * {TEST-007}: Intentar crear con payload inválido
   *
   * POST /api/v1/{resources} con datos inválidos
   *
   * Assertions Fijas:
   * - Status code es 400 Bad Request
   * - Errores de validación presentes
   *
   * @param payload - Datos de payload inválidos
   * @returns Tupla de [response, errorBody, payload]
   */
  @atc('{TEST-007}')
  async create{Resource}WithInvalidPayload(
    payload: Partial<Create{Resource}Payload>
  ): Promise<[APIResponse, ApiErrorResponse, Partial<Create{Resource}Payload>]> {
    // -------------------------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------------------------
    const [response, body] = await this.apiPOST<ApiErrorResponse, Partial<Create{Resource}Payload>>(
      this.baseEndpoint,
      payload
    );

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(400);
    expect(body.error).toBeDefined();

    return [response, body, payload];
  }

  /**
   * {TEST-008}: Intentar acceso no autorizado
   *
   * GET /api/v1/{resources} sin token de auth
   *
   * Nota: Llamar clearAuthToken() antes de este ATC
   *
   * Assertions Fijas:
   * - Status code es 401 Unauthorized
   *
   * @returns Tupla de [response, errorBody]
   */
  @atc('{TEST-008}')
  async get{Resources}Unauthorized(): Promise<[APIResponse, ApiErrorResponse]> {
    // -------------------------------------------------------------------------
    // REQUEST (sin auth - debe llamar clearAuthToken antes)
    // -------------------------------------------------------------------------
    const [response, body] = await this.apiGET<ApiErrorResponse>(this.baseEndpoint);

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(401);
    expect(body.error).toBeDefined();

    return [response, body];
  }
}
```

---

### Paso 4: Registrar Componente en Fixture

Agregar el nuevo componente a `ApiFixture.ts`:

```typescript
// qa/tests/components/ApiFixture.ts

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

#### Template de Archivo de Test

```typescript
// qa/tests/integration/{resource}/{resource}.test.ts

import { expect } from '@playwright/test';
import { test } from '@TestFixture';
import { faker } from '@faker-js/faker';
import type {
  Create{Resource}Payload,
  Update{Resource}Payload,
  {Resource}Response,
} from '@api/{Resource}Api';

// ============================================================================
// SUITE DE TESTS: {Resource} API
// ============================================================================

test.describe('{Resource} API', () => {
  // ==========================================================================
  // SETUP DE AUTENTICACIÓN
  // ==========================================================================

  /**
   * Autenticar antes de cada test.
   * Usa credenciales de variables de entorno.
   */
  test.beforeEach(async ({ api }) => {
    await api.auth.authenticateSuccessfully({
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });
  });

  // ==========================================================================
  // FÁBRICAS DE DATOS DE TEST
  // ==========================================================================

  /**
   * Generar payload de creación válido usando Faker.
   * Llamar fresco en cada test para datos únicos.
   */
  const createValidPayload = (): Create{Resource}Payload => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    roleId: faker.number.int({ min: 1, max: 5 }),
  });

  /**
   * Generar payload de actualización con datos parciales.
   */
  const createUpdatePayload = (): Update{Resource}Payload => ({
    name: faker.person.fullName(),
  });

  /**
   * Generar payload inválido para tests negativos.
   */
  const createInvalidPayload = (): Partial<Create{Resource}Payload> => ({
    name: '', // Nombre vacío debería fallar validación
    email: 'not-an-email', // Formato de email inválido
  });

  // ==========================================================================
  // TESTS: CREATE (POST)
  // ==========================================================================

  test('debería crear {resource} exitosamente @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ARRANGE
    // -------------------------------------------------------------------------
    const payload = createValidPayload();

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response, body, sentPayload] = await api.{resource}.create{Resource}Successfully(payload);

    // -------------------------------------------------------------------------
    // ASSERT (opcional - más allá de assertions del ATC)
    // -------------------------------------------------------------------------
    expect(body.name).toBe(sentPayload.name);
    expect(body.email).toBe(sentPayload.email);
  });

  test('debería fallar al crear con payload inválido @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ARRANGE
    // -------------------------------------------------------------------------
    const invalidPayload = createInvalidPayload();

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response, errorBody] = await api.{resource}.create{Resource}WithInvalidPayload(invalidPayload);

    // -------------------------------------------------------------------------
    // ASSERT
    // -------------------------------------------------------------------------
    expect(errorBody.error).toBeDefined();
  });

  // ==========================================================================
  // TESTS: READ (GET)
  // ==========================================================================

  test('debería obtener {resource} por ID @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ARRANGE: Crear recurso primero
    // -------------------------------------------------------------------------
    const [, created] = await api.{resource}.create{Resource}Successfully(createValidPayload());

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response, body] = await api.{resource}.get{Resource}Successfully(created.id);

    // -------------------------------------------------------------------------
    // ASSERT
    // -------------------------------------------------------------------------
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(created.name);
  });

  test('debería retornar 404 para {resource} inexistente @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ARRANGE
    // -------------------------------------------------------------------------
    const nonExistentId = faker.string.uuid();

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response, errorBody] = await api.{resource}.get{Resource}WithNonExistentId(nonExistentId);

    // -------------------------------------------------------------------------
    // ASSERT
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(404);
  });

  test('debería obtener todos los {resources} con paginación @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response, body] = await api.{resource}.getAll{Resources}Successfully({
      page: 1,
      limit: 10,
    });

    // -------------------------------------------------------------------------
    // ASSERT
    // -------------------------------------------------------------------------
    expect(body.data).toBeDefined();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(10);
  });

  // ==========================================================================
  // TESTS: UPDATE (PUT/PATCH)
  // ==========================================================================

  test('debería actualizar {resource} exitosamente @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ARRANGE: Crear recurso primero
    // -------------------------------------------------------------------------
    const [, created] = await api.{resource}.create{Resource}Successfully(createValidPayload());
    const updatePayload = createUpdatePayload();

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response, updated] = await api.{resource}.update{Resource}Successfully(
      created.id,
      updatePayload
    );

    // -------------------------------------------------------------------------
    // ASSERT
    // -------------------------------------------------------------------------
    expect(updated.name).toBe(updatePayload.name);
    expect(updated.id).toBe(created.id); // ID sin cambios
  });

  // ==========================================================================
  // TESTS: DELETE
  // ==========================================================================

  test('debería eliminar {resource} exitosamente @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ARRANGE: Crear recurso para eliminar
    // -------------------------------------------------------------------------
    const [, created] = await api.{resource}.create{Resource}Successfully(createValidPayload());

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response] = await api.{resource}.delete{Resource}Successfully(created.id);

    // -------------------------------------------------------------------------
    // ASSERT: Verificar eliminación
    // -------------------------------------------------------------------------
    const [getResponse] = await api.{resource}.get{Resource}WithNonExistentId(created.id);
    expect(getResponse.status()).toBe(404);
  });

  // ==========================================================================
  // TESTS: AUTORIZACIÓN
  // ==========================================================================

  test('debería retornar 401 sin autenticación @integration @{resource}', async ({ api }) => {
    // -------------------------------------------------------------------------
    // ARRANGE: Limpiar token de auth
    // -------------------------------------------------------------------------
    api.clearAuthToken();

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    const [response, errorBody] = await api.{resource}.get{Resources}Unauthorized();

    // -------------------------------------------------------------------------
    // ASSERT
    // -------------------------------------------------------------------------
    expect(response.status()).toBe(401);
  });
});
```

---

### Paso 6: Ejecutar y Validar

Ejecutar el test para verificar la implementación:

```bash
# Ejecutar archivo de test específico
cd qa && bun run test tests/integration/{resource}/{resource}.test.ts

# Ejecutar con output verbose
cd qa && bun run test --reporter=list tests/integration/{resource}/{resource}.test.ts

# Ejecutar solo test específico
cd qa && bun run test --grep "debería crear {resource}" tests/integration/{resource}/
```

---

## Checklist de Calidad de Código

Antes de completar la fase de Coding, verificar:

### Calidad del Componente

- [ ] Extiende `ApiBase` correctamente
- [ ] Constructor acepta `TestContextOptions`
- [ ] Decorator `@atc` con Test ID correcto
- [ ] Retorna tupla: `[APIResponse, TBody]` o `[APIResponse, TBody, TPayload]`
- [ ] Assertions fijas dentro del ATC
- [ ] Generics type-safe en métodos de API
- [ ] Import aliases usados (`@api/`, `@utils/`, etc.)

### Calidad del Archivo de Test

- [ ] Importa `test` desde `@TestFixture`
- [ ] `beforeEach` con autenticación (si necesario)
- [ ] Datos de test generados frescos (Faker)
- [ ] Estructura ARRANGE-ACT-ASSERT
- [ ] Tags apropiados (`@integration`, `@{resource}`)
- [ ] Cada test es independiente

### Seguridad de Tipos

- [ ] Tipos de request definidos (Payload)
- [ ] Tipos de response definidos
- [ ] Tipo de error response definido
- [ ] Tipos exportados para uso en archivo de test
- [ ] Sin tipos `any`

---

## Patrones Comunes de Implementación

### Uso de Métodos API

```typescript
// GET - Retorna [response, body]
const [response, body] = await this.apiGET<{Resource}Response>(endpoint);

// POST - Retorna [response, body] pero ATC retorna [response, body, payload]
const [response, body] = await this.apiPOST<{Resource}Response, CreatePayload>(
  endpoint,
  payload
);

// PUT - Igual que POST
const [response, body] = await this.apiPUT<{Resource}Response, UpdatePayload>(
  endpoint,
  payload
);

// PATCH - Igual que PUT
const [response, body] = await this.apiPATCH<{Resource}Response, PartialPayload>(
  endpoint,
  payload
);

// DELETE - Usualmente sin body
const [response] = await this.apiDELETE(endpoint);
```

### Encadenar Operaciones (en tests)

```typescript
test('debería encadenar operaciones', async ({ api }) => {
  // Crear → Actualizar → Verificar
  const [, created] = await api.resource.createSuccessfully(data);
  const [, updated] = await api.resource.updateSuccessfully(created.id, updates);
  const [, fetched] = await api.resource.getSuccessfully(created.id);

  expect(fetched.name).toBe(updates.name);
});
```

### Testing con Recursos Relacionados

```typescript
test('debería crear con foreign key', async ({ api }) => {
  // Primero crear recurso relacionado
  const [, relatedResource] = await api.related.createSuccessfully(relatedData);

  // Luego crear recurso principal con foreign key
  const payload = {
    ...createValidPayload(),
    relatedId: relatedResource.id,
  };

  const [, created] = await api.resource.createSuccessfully(payload);
  expect(created.relatedId).toBe(relatedResource.id);
});
```

---

## Anti-Patrones a Evitar

### ❌ Incorrecto: Falta Tupla de Retorno

```typescript
@atc('TEST-001')
async createResource(payload) {
  const response = await this.apiPOST(endpoint, payload);
  return response; // Falta formato de tupla
}
```

### ✅ Correcto: Tupla de Retorno Apropiada

```typescript
@atc('TEST-001')
async createResourceSuccessfully(
  payload: CreatePayload
): Promise<[APIResponse, ResourceResponse, CreatePayload]> {
  const [response, body] = await this.apiPOST<ResourceResponse, CreatePayload>(
    endpoint,
    payload
  );
  expect(response.status()).toBe(201);
  return [response, body, payload];
}
```

### ❌ Incorrecto: Faltan Generics de Tipo

```typescript
const [response, body] = await this.apiGET(endpoint); // Sin tipo = any
```

### ✅ Correcto: Generics Type-Safe

```typescript
const [response, body] = await this.apiGET<ResourceResponse>(endpoint);
```

### ❌ Incorrecto: Datos de Test Hardcodeados

```typescript
const payload = {
  email: 'test@example.com', // ¡Hardcodeado!
  id: '123e4567-e89b-12d3-a456-426614174000', // ¡UUID hardcodeado!
};
```

### ✅ Correcto: Datos de Test Dinámicos

```typescript
const payload = {
  email: faker.internet.email(),
  id: faker.string.uuid(),
};
```

---

## Checklist de Output

Después de completar la fase de Coding:

- [ ] Componente API creado: `qa/tests/components/api/{Resource}Api.ts`
- [ ] Componente registrado en: `qa/tests/components/ApiFixture.ts`
- [ ] Archivo de test creado: `qa/tests/integration/{resource}/{resource}.test.ts`
- [ ] Tipos definidos: `qa/tests/data/types.ts`
- [ ] Test pasa localmente: `cd qa && bun run test <archivo-de-test>`
- [ ] Sin errores TypeScript: `cd qa && bun run type-check`
- [ ] Linting pasa: `cd qa && bun run lint`

---

## Siguiente Paso

Una vez que la implementación esté completa y los tests pasen:

→ **Proceder a**: `integration-review.md` (Fase 3)
