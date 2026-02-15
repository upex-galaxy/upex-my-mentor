# Integration Test Automation - Plan

> **Fase**: 1 de 3 (Plan → Coding → Review)
> **Propósito**: Analizar un caso de test de API documentado y crear un plan de implementación siguiendo la arquitectura KATA.
> **Output**: Plan detallado listo para la fase de Coding.

---

## Carga de Contexto

**Cargar estos archivos antes de proceder:**

1. `.context/guidelines/TAE/kata-ai-index.md` → Patrones core KATA
2. `.context/guidelines/TAE/kata-architecture.md` → Estructura de capas
3. `.context/guidelines/TAE/api-testing-patterns.md` → Patrones específicos de API
4. `.context/guidelines/TAE/typescript-patterns.md` → Convenciones TypeScript
5. `.context/playwright-automation-system.md` → Overview de arquitectura
6. `.context/test-management-system.md` → Configuración TMS

**Opcional (para exploración de API):**

- Usar OpenAPI MCP (`mcp__openapi__*`) si está disponible
- Usar DBHub MCP (`mcp__dbhub__*`) para verificar datos

---

## Input Requerido

Proporcionar el caso de test de API documentado de la Fase 11 con:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INPUT REQUERIDO DE FASE 11                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Test Case ID: {TEST-XXX}                                                 │
│ 2. Nombre del Test: {Validar <CORE> <CONDITIONAL>}                          │
│ 3. Detalles del Endpoint API:                                               │
│    - Método HTTP: GET/POST/PUT/PATCH/DELETE                                 │
│    - Endpoint: /api/v1/resource                                             │
│    - Request Body (si aplica)                                               │
│    - Response Esperado (código de estado, estructura del body)              │
│ 4. Escenario Gherkin (Given/When/Then)                                      │
│ 5. Tabla de Variables (con cómo obtener cada variable)                      │
│ 6. Requisitos de Autenticación                                              │
│ 7. Score de Prioridad/ROI (opcional)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Planificación

### Paso 1: Análisis del Caso de Test de API

Extraer y documentar:

````markdown
## Análisis del Caso de Test de API

### Información Básica

- **Test ID**: {TEST-XXX}
- **Nombre**: {nombre del caso de test}
- **Tipo**: Integration (solo API)
- **Prioridad**: {Critical/High/Medium/Low}

### Detalles del Endpoint API

| Atributo       | Valor                             |
| -------------- | --------------------------------- |
| Método         | GET / POST / PUT / PATCH / DELETE |
| Endpoint       | `/api/v1/{resource}`              |
| Auth Requerido | Sí (Bearer) / No                  |
| Content-Type   | application/json                  |

### Análisis del Request

**Path Parameters** (si hay):
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| {id} | string (UUID) | Identificador del recurso |

**Query Parameters** (si hay):
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Paginación |
| limit | number | No | Items por página |

**Request Body** (si POST/PUT/PATCH):

```json
{
  "campo1": "valor1",
  "campo2": "valor2"
}
```
````

### Response Esperado

**Caso de Éxito (2xx)**:
| Atributo | Esperado |
|----------|----------|
| Status Code | 200 / 201 / 204 |
| Estructura del Body | Ver abajo |

```json
{
  "id": "uuid",
  "campo1": "valor",
  "createdAt": "ISO-8601"
}
```

**Casos de Error**:
| Escenario | Status | Response de Error |
|-----------|--------|-------------------|
| No encontrado | 404 | `{ "error": "Resource not found" }` |
| Input inválido | 400 | `{ "error": "Validation failed", "details": [...] }` |
| No autorizado | 401 | `{ "error": "Unauthorized" }` |

### Variables Identificadas

| Variable  | Tipo   | Cómo Obtener | Patrón Faker                                |
| --------- | ------ | ------------ | ------------------------------------------- |
| {user_id} | UUID   | API setup    | `await api.users.createSuccessfully()`      |
| {email}   | string | Generar      | `faker.internet.email()`                    |
| {token}   | string | Auth setup   | `await api.auth.authenticateSuccessfully()` |

````

---

### Paso 2: Verificación de Componentes Existentes

Buscar en el codebase componentes existentes:

```bash
# Verificar componentes API existentes
ls tests/components/api/

# Verificar estructura de fixtures
cat tests/components/ApiFixture.ts

# Buscar ATCs similares
grep -r "@atc" tests/components/api/

# Verificar tipos existentes
grep -r "interface.*Response" tests/data/types.ts
````

Documentar hallazgos:

```markdown
## Análisis de Componentes Existentes

### Componentes API Relevantes Encontrados

| Componente | Archivo                          | ATCs Disponibles         | ¿Reutilizar?         |
| ---------- | -------------------------------- | ------------------------ | -------------------- |
| AuthApi    | tests/components/api/AuthApi.ts  | authenticateSuccessfully | Sí (para auth setup) |
| UsersApi   | tests/components/api/UsersApi.ts | createUserSuccessfully   | Sí/Parcial/No        |

### Tipos Existentes Encontrados

| Tipo          | Archivo             | ¿Reutilizar? |
| ------------- | ------------------- | ------------ |
| TokenResponse | tests/data/types.ts | Sí           |
| UserPayload   | tests/data/types.ts | Sí           |

### Decisión

- [ ] Crear NUEVO componente: {Resource}Api.ts
- [ ] Extender componente EXISTENTE: {existing}.ts
- [ ] Usar SOLO componentes existentes (no se necesita código nuevo)
```

---

### Paso 3: Plan de Definiciones de Tipos

Planificar todos los tipos TypeScript necesarios:

````markdown
## Plan de Definiciones de Tipos

### Tipos de Request (Payload)

```typescript
// Para requests POST/PUT/PATCH
export interface Create{Resource}Payload {
  campo1: string;
  campo2: number;
  // ... basado en spec de API
}

export interface Update{Resource}Payload {
  campo1?: string;  // Opcional para actualización parcial
  campo2?: number;
}
```
````

### Tipos de Response

```typescript
// Response de éxito
export interface {Resource}Response {
  id: string;
  campo1: string;
  campo2: number;
  createdAt: string;
  updatedAt: string;
}

// Response de lista (para GET all)
export interface {Resource}ListResponse {
  data: {Resource}Response[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Response de error
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}
```

### Dónde Definir

- [ ] En archivo del componente (si es específico de este componente)
- [ ] En `tests/data/types.ts` (si se comparte entre componentes)

````

---

### Paso 4: Decisión de Arquitectura

Determinar la arquitectura KATA:

```markdown
## Decisión de Arquitectura

### Ubicación del Componente
- **Layer**: 3 (Componente de Dominio)
- **Tipo**: Componente API
- **Archivo**: `tests/components/api/{Resource}Api.ts`
- **Extiende**: `ApiBase`

### Fixture
- **Usar**: Fixture `{ api }` (no se necesita browser)
- **Registro**: Agregar a `ApiFixture.ts`

### Estrategia de Autenticación
| Estrategia | Cuándo Usar | Implementación |
|------------|-------------|----------------|
| Setup en test | Token fresco por test | `beforeEach` con `api.auth.authenticateSuccessfully()` |
| Estado almacenado | Reutilizar token entre tests | Cargar desde `.auth/api-state.json` |
| Sin auth | Endpoints públicos | Omitir setup de auth |

### Dependencias
| Dependencia | Propósito | Implementación |
|-------------|-----------|----------------|
| Token de auth | Requests autenticados | Via `ApiBase.setAuthToken()` |
| Datos de test | Valores dinámicos | Via `DataFactory` o Faker |
| Recurso relacionado | Foreign key | Crear via API primero |
````

---

### Paso 5: Diseño de ATC

Diseñar los ATCs a implementar:

````markdown
## Diseño de ATC

### ATC para Caso de Éxito

| Atributo        | Valor                             |
| --------------- | --------------------------------- |
| **Nombre**      | `{verb}{Resource}Successfully`    |
| **Test ID**     | `{TEST-XXX}`                      |
| **Método HTTP** | GET / POST / PUT / PATCH / DELETE |
| **Retorna**     | Tupla (ver abajo)                 |

**Firma del Método:**

```typescript
// GET/DELETE: Retorna [APIResponse, TBody]
@atc('{TEST-XXX}')
async get{Resource}Successfully(id: string): Promise<[APIResponse, {Resource}Response]>

// POST/PUT/PATCH: Retorna [APIResponse, TBody, TPayload]
@atc('{TEST-XXX}')
async create{Resource}Successfully(
  payload: Create{Resource}Payload
): Promise<[APIResponse, {Resource}Response, Create{Resource}Payload]>
```
````

**Assertions Fijas:**

1. `expect(response.status()).toBe(200)` // o 201, 204
2. `expect(body.id).toBeDefined()`
3. `expect(body.campo1).toBe(payload.campo1)` // verificación de eco

### ATC para Caso de Error (si aplica)

| Atributo            | Valor                                                             |
| ------------------- | ----------------------------------------------------------------- |
| **Nombre**          | `{verb}{Resource}WithInvalid{X}` o `{verb}{Resource}Unauthorized` |
| **Test ID**         | `{TEST-YYY}`                                                      |
| **Status Esperado** | 400 / 401 / 404                                                   |

**Firma del Método:**

```typescript
@atc('{TEST-YYY}')
async get{Resource}WithNonExistentId(
  id: string
): Promise<[APIResponse, ApiErrorResponse]>
```

**Assertions Fijas:**

1. `expect(response.status()).toBe(404)`
2. `expect(body.error).toBeDefined()`

````

---

### Paso 6: Diseño del Archivo de Test

Diseñar la estructura del archivo de test:

```markdown
## Diseño del Archivo de Test

### Ubicación del Archivo
`tests/integration/{resource}/{resource}.test.ts`

### Estructura del Test
```typescript
import { test, expect } from '@TestFixture';
import type { Create{Resource}Payload } from '@api/{Resource}Api';

test.describe('{Resource} API', () => {
  // Setup de auth (si se necesita)
  test.beforeEach(async ({ api }) => {
    await api.auth.authenticateSuccessfully({
      email: process.env.TEST_USER_EMAIL!,
      password: process.env.TEST_USER_PASSWORD!,
    });
  });

  test('debería crear {resource} exitosamente @integration @{resource}', async ({ api }) => {
    // ARRANGE
    const payload: Create{Resource}Payload = {
      campo1: faker.lorem.word(),
      campo2: faker.number.int({ min: 1, max: 100 }),
    };

    // ACT
    const [response, body, sentPayload] = await api.{resource}.create{Resource}Successfully(payload);

    // ASSERT (opcional - más allá de assertions del ATC)
    expect(body.campo1).toBe(sentPayload.campo1);
  });
});
````

### Tags a Aplicar

- [ ] `@integration` - Test de API
- [ ] `@regression` - Incluir en suite de regresión
- [ ] `@smoke` - Incluir en smoke tests
- [ ] `@{resource}` - Tag específico del recurso

````

---

### Paso 7: Registro en Fixture

Planificar el registro del componente:

```markdown
## Registro en Fixture

### Registro de Nuevo Componente
Agregar a `ApiFixture.ts`:

```typescript
// Import
import { {Resource}Api } from '@api/{Resource}Api';

// En constructor
this.{resource} = new {Resource}Api(options);

// Agregar propiedad
public readonly {resource}: {Resource}Api;
````

### Exports de Tipos

Exportar tipos del componente:

```typescript
// En {Resource}Api.ts - exportar para uso en archivo de test
export type {
  Create{Resource}Payload,
  {Resource}Response,
} from '@data/types';

// O definir y exportar inline
export interface Create{Resource}Payload { ... }
```

````

---

## Template de Output del Plan

Generar un documento de plan final:

```markdown
# Plan de Implementación: {TEST-XXX}

## Resumen
| Atributo | Valor |
|----------|-------|
| Test Case ID | {TEST-XXX} |
| Nombre del Test | {nombre} |
| Método API | GET / POST / PUT / PATCH / DELETE |
| Endpoint | `/api/v1/{resource}` |
| Componente | {Resource}Api.ts |
| Acción | CREAR / EXTENDER / REUTILIZAR |
| Nombre del ATC | `{methodName}` |
| Archivo de Test | tests/integration/{resource}/{resource}.test.ts |
| Fixture | `{ api }` |

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `tests/components/api/{Resource}Api.ts` | CREAR | Nuevo componente API |
| `tests/components/ApiFixture.ts` | MODIFICAR | Registrar componente |
| `tests/integration/{resource}/{resource}.test.ts` | CREAR | Archivo de test |
| `tests/data/types.ts` | MODIFICAR | Agregar definiciones de tipos |

## Definiciones de Tipos

### Tipos de Request
```typescript
export interface Create{Resource}Payload {
  // campos...
}
````

### Tipos de Response

```typescript
export interface {Resource}Response {
  // campos...
}
```

## Plan de Implementación del ATC

### {methodName}

- **Decorator**: `@atc('{TEST-XXX}')`
- **Método**: `api{METHOD}<TBody, TPayload>(endpoint, payload?)`
- **Retorna**: `[APIResponse, {Resource}Response, Create{Resource}Payload]`
- **Assertions**:
  - `expect(response.status()).toBe(201)`
  - `expect(body.id).toBeDefined()`

## Estrategia de Datos de Test

| Variable     | Fuente    | Patrón                                 |
| ------------ | --------- | -------------------------------------- |
| {campo1}     | Faker     | `faker.lorem.word()`                   |
| {campo2}     | Faker     | `faker.number.int({min: 1, max: 100})` |
| {related_id} | API Setup | `api.{related}.createSuccessfully()`   |

## Autenticación

| Enfoque              | Implementación                                         |
| -------------------- | ------------------------------------------------------ |
| Setup por test       | `beforeEach` con `api.auth.authenticateSuccessfully()` |
| Propagación de token | Auto-cargado desde `.auth/api-state.json`              |

## Dependencias

- [ ] Componente de auth: `AuthApi` (para token)
- [ ] Recurso relacionado: `{Related}Api` (para foreign keys)
- [ ] Archivo de tipos: `tests/data/types.ts`

---

**Listo para Fase 2: Coding**

```

---

## Checklist de Validación

Antes de proceder a la fase de Coding, verificar:

- [ ] Endpoint API completamente documentado (método, path, params, body)
- [ ] Tipos de request/response diseñados
- [ ] Códigos de estado esperados identificados (éxito y error)
- [ ] Componentes existentes verificados (evitar duplicación)
- [ ] Decisión de arquitectura tomada (componente, fixture)
- [ ] ATC diseñado con tipo de retorno apropiado (tupla)
- [ ] Assertions definidas (status, validación de body)
- [ ] Ubicación del archivo de test determinada
- [ ] Estrategia de autenticación decidida
- [ ] Generación de datos de test planificada (patrones Faker)

---

## Patrones Comunes

### Patrones de Tipo de Retorno

| Método HTTP | Tipo de Retorno | Ejemplo |
|-------------|-----------------|---------|
| GET (single) | `[APIResponse, TBody]` | `[response, user]` |
| GET (list) | `[APIResponse, TBody[]]` | `[response, users]` |
| POST | `[APIResponse, TBody, TPayload]` | `[response, created, payload]` |
| PUT/PATCH | `[APIResponse, TBody, TPayload]` | `[response, updated, payload]` |
| DELETE | `[APIResponse, void]` | `[response, _]` |

### Convenciones de Nombres

| Operación | Patrón de Nombre del ATC | Ejemplo |
|-----------|--------------------------|---------|
| Create | `create{Resource}Successfully` | `createUserSuccessfully()` |
| Read | `get{Resource}Successfully` | `getUserSuccessfully()` |
| Update | `update{Resource}Successfully` | `updateUserSuccessfully()` |
| Delete | `delete{Resource}Successfully` | `deleteUserSuccessfully()` |
| List | `getAll{Resources}Successfully` | `getAllUsersSuccessfully()` |
| Not found | `get{Resource}WithNonExistentId` | `getUserWithNonExistentId()` |
| Invalid | `create{Resource}WithInvalidPayload` | `createUserWithInvalidPayload()` |

### Patrones de Assertions

| Qué Verificar | Patrón |
|---------------|--------|
| Código de estado | `expect(response.status()).toBe(200)` |
| Campo existe | `expect(body.id).toBeDefined()` |
| Valor de campo | `expect(body.email).toBe(payload.email)` |
| Longitud de array | `expect(body.data).toHaveLength(10)` |
| Mensaje de error | `expect(body.error).toContain('not found')` |

---

## Siguiente Paso

Una vez que el plan esté completo y validado:

→ **Proceder a**: `integration-coding.md` (Fase 2)
```
