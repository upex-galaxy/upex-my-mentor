# OpenAPI con Zod: Guía Completa para API Contract Testing

> Una guía didáctica sobre OpenAPI, zod-to-openapi, y cómo usarlos para testing de APIs en proyectos TypeScript/Next.js.

---

## Tabla de Contenidos

1. [¿Qué es OpenAPI?](#qué-es-openapi)
2. [¿Por qué Zod + OpenAPI?](#por-qué-zod--openapi)
3. [Arquitectura de la Solución](#arquitectura-de-la-solución)
4. [Tipos TypeScript para Testing](#tipos-typescript-para-testing)
5. [Testing en Repositorios Separados](#testing-en-repositorios-separados)
6. [Flujo de Trabajo Recomendado](#flujo-de-trabajo-recomendado)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## ¿Qué es OpenAPI?

OpenAPI (anteriormente conocido como Swagger) es una **especificación estándar** para describir APIs REST de manera legible por máquinas y humanos.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ¿QUÉ ES OPENAPI?                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   OpenAPI es como un "contrato" que describe tu API:                        │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      openapi.json                                   │   │
│   │                                                                     │   │
│   │   • Endpoints disponibles (/api/checkout/session, etc.)             │   │
│   │   • Métodos HTTP (GET, POST, PATCH, DELETE)                         │   │
│   │   • Parámetros requeridos y opcionales                              │   │
│   │   • Estructura del request body                                     │   │
│   │   • Estructura del response body                                    │   │
│   │   • Códigos de error posibles                                       │   │
│   │   • Autenticación requerida                                         │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   BENEFICIOS:                                                               │
│   ✅ Documentación siempre actualizada                                      │
│   ✅ Generación de clientes (SDKs) automática                              │
│   ✅ Validación de requests/responses                                       │
│   ✅ Testing automatizado basado en el spec                                │
│   ✅ Interoperabilidad con herramientas (Postman, MCP, etc.)               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Ejemplo de OpenAPI Spec

```yaml
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0

paths:
  /api/checkout/session:
    post:
      summary: Create checkout session
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                booking_id:
                  type: string
                  format: uuid
              required: [booking_id]
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  checkout_url:
                    type: string
                  session_id:
                    type: string
```

---

## ¿Por qué Zod + OpenAPI?

El problema tradicional es que la documentación de la API se desincroniza del código:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROBLEMA: DOCUMENTACIÓN MANUAL                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FLUJO TRADICIONAL (❌ Propenso a errores):                                │
│                                                                             │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────────────────┐  │
│   │   Código     │      │  Escribir    │      │   openapi.yaml           │  │
│   │   route.ts   │ ──── │  manualmente │ ───► │   (se desactualiza!)     │  │
│   └──────────────┘      └──────────────┘      └──────────────────────────┘  │
│                                                                             │
│   • Desarrollador cambia el código                                          │
│   • Olvida actualizar la documentación                                      │
│   • QA testea con spec incorrecto                                          │
│   • Errores en producción 💥                                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FLUJO CON ZOD-TO-OPENAPI (✅ Siempre sincronizado):                       │
│                                                                             │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────────────────┐  │
│   │  Zod Schema  │      │  Generación  │      │   OpenAPI Spec           │  │
│   │  (código)    │ ───► │  automática  │ ───► │   (siempre correcto!)    │  │
│   └──────────────┘      └──────────────┘      └──────────────────────────┘  │
│         │                                                                   │
│         │                                                                   │
│         ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │  TypeScript  │  ← El mismo schema genera TIPOS y DOCUMENTACIÓN         │
│   │  Types       │                                                          │
│   └──────────────┘                                                          │
│                                                                             │
│   • Cambias el schema Zod                                                   │
│   • Tipos TypeScript se actualizan automáticamente                         │
│   • OpenAPI spec se regenera automáticamente                               │
│   • QA siempre tiene la documentación correcta ✓                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Una Sola Fuente de Verdad

```typescript
// ✅ Este schema Zod es la ÚNICA fuente de verdad
const CreateCheckoutSessionSchema = z
  .object({
    booking_id: z.string().uuid(),
  })
  .openapi('CreateCheckoutSessionRequest');

// Genera automáticamente:
// 1. Tipo TypeScript: type CreateCheckoutSessionRequest = { booking_id: string }
// 2. OpenAPI Schema: { type: 'object', properties: { booking_id: { type: 'string', format: 'uuid' } } }
// 3. Validación en runtime: schema.parse(requestBody)
```

---

## Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA ZOD-TO-OPENAPI                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   src/lib/openapi/                                                          │
│   │                                                                         │
│   ├── registry.ts          ← Configuración central OpenAPI                 │
│   │   • Seguridad (cookieAuth, apiKeyAuth)                                 │
│   │   • Metadatos (título, versión, descripción)                           │
│   │   • Función generateOpenAPIDocument()                                  │
│   │                                                                         │
│   ├── schemas/                                                              │
│   │   ├── common.ts        ← Tipos reutilizables                           │
│   │   │   • UUIDSchema, TimestampSchema, ErrorResponseSchema               │
│   │   │                                                                     │
│   │   ├── checkout.ts      ← Schemas de /api/checkout/*                    │
│   │   │   • CreateCheckoutSessionRequestSchema                             │
│   │   │   • CreateCheckoutSessionResponseSchema                            │
│   │   │   • registry.registerPath(...)  ← Registra el endpoint             │
│   │   │                                                                     │
│   │   ├── bookings.ts      ← Schemas de /api/bookings/*                    │
│   │   ├── stripe.ts        ← Schemas de /api/stripe/*                      │
│   │   ├── mentors.ts       ← Schemas de /api/mentors/*                     │
│   │   ├── messages.ts      ← Schemas de /api/messages/*                    │
│   │   ├── users.ts         ← Schemas de /api/users/*                       │
│   │   ├── system.ts        ← Schemas de /api/cron/*, /api/email/*          │
│   │   │                                                                     │
│   │   └── index.ts         ← Exporta todos los schemas                     │
│   │                                                                         │
│   └── index.ts             ← Entry point principal                         │
│       • Importa todos los schemas                                          │
│       • Exporta generateOpenAPIDocument()                                  │
│       • Exporta todos los tipos                                            │
│                                                                             │
│   src/app/api/openapi/                                                      │
│   │                                                                         │
│   └── route.ts             ← GET /api/openapi                              │
│       • Genera el spec dinámicamente                                       │
│       • Retorna JSON con CORS headers                                      │
│                                                                             │
│   src/app/api-docu/                                                         │
│   │                                                                         │
│   ├── page.tsx             ← Página de documentación                       │
│   ├── redoc-viewer.tsx     ← Componente Redoc                              │
│   └── api-doc-selector.tsx ← Selector Next.js / Supabase                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE GENERACIÓN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. DEFINICIÓN                                                             │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  const Schema = z.object({                                         │    │
│   │    booking_id: z.string().uuid()                                   │    │
│   │  }).openapi('CreateCheckoutSessionRequest')                        │    │
│   │                                                                    │    │
│   │  registry.registerPath({                                           │    │
│   │    method: 'post',                                                 │    │
│   │    path: '/checkout/session',                                      │    │
│   │    request: { body: { schema: Schema } },                          │    │
│   │    responses: { 200: { schema: ResponseSchema } }                  │    │
│   │  })                                                                │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│   2. GENERACIÓN (en /api/openapi)                                          │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  const document = generateOpenAPIDocument()                        │    │
│   │  // Retorna objeto OpenAPI 3.0 completo                            │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│   3. CONSUMO                                                               │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │  • Redoc UI (/api-docu) → Documentación interactiva               │    │
│   │  • Postman → Importar collection automáticamente                   │    │
│   │  • MCP OpenAPI Server → Exponer endpoints como tools              │    │
│   │  • openapi-typescript → Generar tipos para testing                │    │
│   │  • Playwright → Validar responses contra el schema                │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tipos TypeScript para Testing

Esta es una de las preguntas más importantes: **¿Cómo obtener tipos TypeScript para testing automatizado?**

### Opción 1: Importar Tipos Directamente (Mismo Repositorio)

Cuando el código de testing está en el mismo repositorio que la aplicación:

```typescript
// tests/integration/checkout.spec.ts

// Importar tipos directamente desde los schemas
import type { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse } from '@/lib/openapi';

test('Create checkout session', async ({ request }) => {
  // TypeScript conoce la estructura exacta del request
  const requestBody: CreateCheckoutSessionRequest = {
    booking_id: '550e8400-e29b-41d4-a716-446655440000',
  };

  const response = await request.post('/api/checkout/session', {
    data: requestBody,
  });

  // TypeScript conoce la estructura exacta del response
  const data: CreateCheckoutSessionResponse = await response.json();

  // Autocompletado funciona perfectamente
  expect(data.checkout_url).toContain('stripe.com');
  expect(data.session_id).toBeDefined();
});
```

### Opción 2: Generar Tipos desde OpenAPI (Repositorio Separado)

Cuando el código de testing está en un repositorio diferente, puedes generar tipos desde el OpenAPI spec.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 GENERACIÓN DE TIPOS DESDE OPENAPI                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Herramienta: openapi-typescript                                           │
│   Instalación: npm install -D openapi-typescript                           │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  # Generar tipos desde URL del spec                                 │   │
│   │  npx openapi-typescript http://localhost:3000/api/openapi \         │   │
│   │    --output ./src/types/api.d.ts                                    │   │
│   │                                                                     │   │
│   │  # O desde archivo local                                            │   │
│   │  npx openapi-typescript ./openapi.json --output ./src/types/api.d.ts│   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Resultado: src/types/api.d.ts                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  export interface paths {                                           │   │
│   │    "/checkout/session": {                                           │   │
│   │      post: {                                                        │   │
│   │        requestBody: {                                               │   │
│   │          content: {                                                 │   │
│   │            "application/json": {                                    │   │
│   │              booking_id: string;                                    │   │
│   │            }                                                        │   │
│   │          }                                                          │   │
│   │        };                                                           │   │
│   │        responses: {                                                 │   │
│   │          200: {                                                     │   │
│   │            content: {                                               │   │
│   │              "application/json": {                                  │   │
│   │                checkout_url: string;                                │   │
│   │                session_id: string;                                  │   │
│   │              }                                                      │   │
│   │            }                                                        │   │
│   │          }                                                          │   │
│   │        }                                                            │   │
│   │      }                                                              │   │
│   │    }                                                                │   │
│   │  }                                                                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Uso de Tipos Generados en Tests

```typescript
// tests/api/checkout.spec.ts

import type { paths } from '@/types/api';

// Extraer tipos específicos
type CreateCheckoutRequest =
  paths['/checkout/session']['post']['requestBody']['content']['application/json'];

type CreateCheckoutResponse =
  paths['/checkout/session']['post']['responses']['200']['content']['application/json'];

test('Create checkout session', async ({ request }) => {
  const body: CreateCheckoutRequest = {
    booking_id: '550e8400-e29b-41d4-a716-446655440000',
  };

  const response = await request.post('/api/checkout/session', { data: body });
  const data: CreateCheckoutResponse = await response.json();

  // TypeScript valida que estás accediendo a propiedades correctas
  expect(data.checkout_url).toBeDefined();
});
```

---

## Testing en Repositorios Separados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  ESCENARIO: REPOSITORIOS SEPARADOS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐          ┌─────────────────────┐                  │
│   │   REPO: app         │          │   REPO: qa-tests    │                  │
│   │   (desarrollo)      │          │   (automatización)  │                  │
│   │                     │          │                     │                  │
│   │   • Next.js app     │          │   • Playwright      │                  │
│   │   • Zod schemas     │          │   • API tests       │                  │
│   │   • OpenAPI spec    │          │   • E2E tests       │                  │
│   │                     │          │                     │                  │
│   │   GET /api/openapi  │◀─────────│   ¿Cómo obtener     │                  │
│   │   (endpoint)        │          │   los tipos?        │                  │
│   └─────────────────────┘          └─────────────────────┘                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SOLUCIÓN: Pipeline de Generación de Tipos                                │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                                                                   │     │
│   │   1. CI/CD del repo app publica OpenAPI spec                      │     │
│   │      → Artifact en GitHub Release                                 │     │
│   │      → O endpoint público /api/openapi                            │     │
│   │                                                                   │     │
│   │   2. Repo qa-tests tiene script de sincronización                 │     │
│   │      ┌─────────────────────────────────────────────────────────┐  │     │
│   │      │  # package.json                                         │  │     │
│   │      │  {                                                      │  │     │
│   │      │    "scripts": {                                         │  │     │
│   │      │      "sync-types": "npx openapi-typescript              │  │     │
│   │      │        https://staging.myapp.com/api/openapi            │  │     │
│   │      │        --output ./src/types/api.d.ts"                   │  │     │
│   │      │    }                                                    │  │     │
│   │      │  }                                                      │  │     │
│   │      └─────────────────────────────────────────────────────────┘  │     │
│   │                                                                   │     │
│   │   3. Ejecutar antes de tests                                      │     │
│   │      ┌─────────────────────────────────────────────────────────┐  │     │
│   │      │  # CI pipeline                                          │  │     │
│   │      │  - run: npm run sync-types                              │  │     │
│   │      │  - run: npm run test                                    │  │     │
│   │      └─────────────────────────────────────────────────────────┘  │     │
│   │                                                                   │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estrategias para Sincronización

#### Estrategia 1: Fetch Dinámico (Recomendada)

```typescript
// scripts/sync-api-types.ts
import { execSync } from 'child_process';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Generar tipos desde el spec
execSync(`npx openapi-typescript ${API_URL}/api/openapi --output ./src/types/api.d.ts`, {
  stdio: 'inherit',
});

console.log('✅ API types synchronized');
```

#### Estrategia 2: Git Submodule

```bash
# El repo de QA incluye el spec como submodule
git submodule add https://github.com/org/app.git specs/app

# Script que genera tipos desde el spec local
npx openapi-typescript ./specs/app/public/openapi.json --output ./src/types/api.d.ts
```

#### Estrategia 3: NPM Package

```bash
# El repo de desarrollo publica un package con los tipos
npm publish @myorg/api-types

# El repo de QA lo instala
npm install @myorg/api-types

# Uso
import type { CreateCheckoutRequest } from '@myorg/api-types'
```

---

## Flujo de Trabajo Recomendado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DESARROLLO CON OPENAPI                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FASE 1: Desarrollo                                                        │
│   ────────────────────                                                      │
│                                                                             │
│   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐          │
│   │  1. Diseñar   │      │  2. Crear     │      │  3. Implementar│         │
│   │     endpoint  │ ───► │     schema    │ ───► │     route.ts  │          │
│   │     (spec)    │      │     Zod       │      │               │          │
│   └───────────────┘      └───────────────┘      └───────────────┘          │
│                                                                             │
│   FASE 2: Documentación (automática)                                        │
│   ──────────────────────────────────                                        │
│                                                                             │
│   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐          │
│   │  4. Commit    │      │  5. OpenAPI   │      │  6. Tipos     │          │
│   │     código    │ ───► │     se genera │ ───► │     TypeScript│          │
│   │               │      │     automático│      │     exportados│          │
│   └───────────────┘      └───────────────┘      └───────────────┘          │
│                                                                             │
│   FASE 3: Testing                                                           │
│   ───────────────                                                           │
│                                                                             │
│   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐          │
│   │  7. QA usa    │      │  8. Tests     │      │  9. CI/CD     │          │
│   │     tipos     │ ───► │     Playwright│ ───► │     valida    │          │
│   │     generados │      │     tipados   │      │     todo      │          │
│   └───────────────┘      └───────────────┘      └───────────────┘          │
│                                                                             │
│   BENEFICIOS:                                                               │
│   ✅ Tipos siempre sincronizados con el código                             │
│   ✅ Errores detectados en compilación, no en runtime                      │
│   ✅ Autocompletado en el IDE para requests y responses                    │
│   ✅ Documentación siempre actualizada                                      │
│   ✅ Tests más robustos y mantenibles                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Preguntas Frecuentes

### 1. ¿Qué pasa si un desarrollador cambia el schema?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│   ESCENARIO: Desarrollador agrega campo obligatorio                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ANTES:                                                                    │
│   const Schema = z.object({ booking_id: z.string() })                       │
│                                                                             │
│   DESPUÉS:                                                                  │
│   const Schema = z.object({                                                 │
│     booking_id: z.string(),                                                 │
│     user_email: z.string().email()  ← NUEVO campo obligatorio              │
│   })                                                                        │
│                                                                             │
│   ¿QUÉ PASA?                                                                │
│                                                                             │
│   1. OpenAPI spec se actualiza automáticamente                              │
│   2. Si usas tipos generados (openapi-typescript):                          │
│      - Al regenerar, el tipo cambia                                        │
│      - TypeScript marca ERROR en tests que no incluyen user_email          │
│      - ✅ DETECTAS EL PROBLEMA ANTES DE EJECUTAR TESTS                     │
│                                                                             │
│   3. Si usas tipos importados del mismo repo:                               │
│      - El tipo ya cambió en el mismo commit                                │
│      - TypeScript marca ERROR inmediatamente                               │
│      - ✅ DETECTAS EL PROBLEMA EN EL MISMO PR                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. ¿Cómo validar que el response real cumple el schema?

```typescript
// Puedes usar Zod para validar en runtime
import { CreateCheckoutSessionResponseSchema } from '@/lib/openapi';

test('Response matches schema', async ({ request }) => {
  const response = await request.post('/api/checkout/session', {
    data: { booking_id: 'uuid' },
  });

  const data = await response.json();

  // Zod valida que el response cumple el schema
  const result = CreateCheckoutSessionResponseSchema.safeParse(data);

  if (!result.success) {
    console.error('Schema validation failed:', result.error.format());
  }

  expect(result.success).toBe(true);
});
```

### 3. ¿Cómo manejar versiones de la API?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VERSIONADO DE API                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   OPCIÓN 1: Versión en URL                                                  │
│   /api/v1/checkout/session                                                  │
│   /api/v2/checkout/session                                                  │
│                                                                             │
│   OPCIÓN 2: Versión en Header                                               │
│   X-API-Version: 2024-01-01                                                 │
│                                                                             │
│   OPCIÓN 3: Semantic Versioning en OpenAPI                                  │
│   openapi: 3.0.3                                                            │
│   info:                                                                     │
│     version: 2.1.0  ← MAJOR.MINOR.PATCH                                    │
│                                                                             │
│   RECOMENDACIÓN:                                                            │
│   • Para breaking changes: incrementar MAJOR version                       │
│   • Mantener compatibilidad hacia atrás cuando sea posible                 │
│   • Documentar cambios en CHANGELOG                                        │
│   • Generar tipos para cada versión si necesario                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. ¿Cómo integrar con MCP para testing con IA?

```json
{
  "mcpServers": {
    "nextjs-api": {
      "command": "npx",
      "args": ["-y", "@ivotoby/openapi-mcp-server", "--tools", "dynamic"],
      "env": {
        "API_BASE_URL": "http://localhost:3000/api",
        "OPENAPI_SPEC_PATH": "http://localhost:3000/api/openapi",
        "API_HEADERS": "X-API-Key:dev-api-key"
      }
    }
  }
}
```

La IA ahora puede:

- Ver todos los endpoints disponibles
- Conocer los parámetros requeridos
- Ejecutar requests correctamente formateados
- Entender las respuestas esperadas

### 5. ¿Qué herramientas puedo usar con el OpenAPI spec?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA OPENAPI                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DOCUMENTACIÓN                                                             │
│   ├── Redoc          → Documentación estática elegante                     │
│   ├── Swagger UI     → Documentación interactiva con "Try it"              │
│   └── Stoplight      → Documentación colaborativa                          │
│                                                                             │
│   TESTING                                                                   │
│   ├── Postman        → Importar collection desde spec                      │
│   ├── Insomnia       → Importar collection desde spec                      │
│   ├── Dredd          → Contract testing automático                         │
│   └── Prism          → Mock server desde spec                              │
│                                                                             │
│   GENERACIÓN DE CÓDIGO                                                      │
│   ├── openapi-typescript     → Tipos TypeScript                            │
│   ├── openapi-generator      → SDKs en múltiples lenguajes                │
│   └── orval                  → Cliente React Query/Axios                   │
│                                                                             │
│   IA/AUTOMATION                                                             │
│   ├── MCP OpenAPI Server     → Exponer endpoints como tools               │
│   └── LangChain              → Herramientas para agentes                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Resumen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PUNTOS CLAVE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. ZOD ES LA FUENTE DE VERDAD                                             │
│      • Define schemas una vez                                               │
│      • Genera tipos TypeScript automáticamente                              │
│      • Genera OpenAPI spec automáticamente                                  │
│      • Valida requests en runtime                                           │
│                                                                             │
│   2. OPENAPI HABILITA TODO EL ECOSISTEMA                                   │
│      • Documentación siempre actualizada                                    │
│      • Importación en Postman/Insomnia                                      │
│      • Testing con MCP/IA                                                   │
│      • Generación de tipos para repos separados                            │
│                                                                             │
│   3. TIPOS = DETECCIÓN TEMPRANA DE ERRORES                                  │
│      • TypeScript detecta breaking changes                                  │
│      • Errores en compilación, no en runtime                               │
│      • Tests más robustos y mantenibles                                    │
│                                                                             │
│   4. FLUJO RECOMENDADO                                                      │
│      • Mismo repo: importar tipos directamente                             │
│      • Repos separados: generar tipos desde spec                           │
│      • CI/CD: regenerar tipos antes de tests                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujos Relacionados

Este documento cubre el **Flujo B: Generar OpenAPI desde Zod**. Existen otros flujos para trabajar con OpenAPI:

| Flujo               | Cuando usarlo                             | Documento                                                      |
| ------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| **sync-openapi.ts** | Backend externo tiene el spec (otro repo) | [sync-openapi-guide.md](../../workflows/sync-openapi-guide.md) |
| **Zod-to-OpenAPI**  | Tu defines schemas con Zod (este doc)     | Este documento                                                 |
| **MCP OpenAPI**     | Testing con AI usando cualquier spec      | [mcp-openapi.md](../database-guide/mcp-openapi.md)             |

---

## Recursos Adicionales

- [zod-to-openapi GitHub](https://github.com/asteasolutions/zod-to-openapi)
- [openapi-typescript GitHub](https://github.com/drwpow/openapi-typescript)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [Redoc Documentation](https://redocly.com/docs/redoc/)
- [Zod Documentation](https://zod.dev/)
