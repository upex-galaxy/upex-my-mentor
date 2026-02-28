# Estrategia de Inyección de Dependencias KATA

> **Propósito:** Explica cómo los drivers de Playwright fluyen a través de la arquitectura KATA y por qué este diseño permite un rendimiento óptimo de tests.
>
> **Audiencia:** QA Engineers, Agentes de IA implementando componentes KATA.
>
> **Prerrequisitos:** Leer `kata-fundamentals.md` para la filosofía KATA.

---

## Resumen

KATA utiliza **inyección de dependencias basada en constructor** para propagar los drivers de Playwright (`page` y `request`) a través de la jerarquía de componentes. Este diseño, combinado con la **inicialización lazy de fixtures de Playwright**, asegura:

1. **Tests E2E** comparten el mismo contexto de navegador para operaciones UI y API
2. **Tests solo API** nunca abren un navegador (cero overhead)
3. **Componentes permanecen desacoplados** del sistema de fixtures de Playwright

---

## El Problema que Resuelve

### Anti-Patrón: Acceso Directo a Fixtures

```typescript
// MALO: Componente depende directamente del sistema de fixtures de Playwright
class BookingsPage {
  constructor(private page: Page) {} // ¿De dónde viene page?
}

// El test debe cablear todo manualmente
test('example', async ({ page }) => {
  const bookingsPage = new BookingsPage(page);
  // ¿Qué pasa con las llamadas API? ¿Necesita otra instancia?
});
```

**Problemas:**

- Componentes están acoplados a Playwright
- No hay contexto compartido entre operaciones UI y API
- Los tests se vuelven pesados en boilerplate

### Anti-Patrón: Inyección por Setter

```typescript
// MALO: Patrón setter rompe la inmutabilidad
class ApiClient {
  private request?: APIRequestContext;

  setRequestContext(request: APIRequestContext) {
    this.request = request;
  }
}
```

**Problemas:**

- El objeto puede usarse antes de inicializarse
- El estado mutable complica el debugging
- No hay seguridad en tiempo de compilación

---

## La Solución KATA

### Principio Core: Único Punto de Entrada, Contexto Compartido

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Playwright Test Runner                          │
│                                                                      │
│  ┌─────────┐     ┌─────────┐                                        │
│  │  page   │     │ request │  ← Playwright crea estos de forma lazy │
│  └────┬────┘     └────┬────┘                                        │
│       │               │                                              │
│       └───────┬───────┘                                              │
│               ▼                                                      │
│  ┌────────────────────────┐                                          │
│  │   TestContextOptions   │  ← Interface para pasar drivers         │
│  │  { page?, request? }   │                                          │
│  └───────────┬────────────┘                                          │
│              │                                                       │
└──────────────┼───────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Arquitectura KATA                             │
│                                                                      │
│  Layer 1: TestContext                                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  _page?: Page          (almacenado, no usado directamente)     │  │
│  │  _request?: APIRequestContext                                  │  │
│  │  config, faker, env    (utilidades compartidas)                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│              │ extends                                               │
│              ▼                                                       │
│  Layer 2: Clases Base                                                │
│  ┌────────────────────────┐    ┌────────────────────────┐           │
│  │       UiBase           │    │       ApiBase          │           │
│  │  get page(): Page      │    │  get request(): API... │           │
│  │  (valida + retorna)    │    │  (valida + retorna)    │           │
│  └────────────────────────┘    └────────────────────────┘           │
│              │ extends                    │ extends                  │
│              ▼                            ▼                          │
│  Layer 3: Componentes (ATCs)                                         │
│  ┌────────────────────────┐    ┌────────────────────────┐           │
│  │     LoginPage          │    │     BookingsApi        │           │
│  │     BookingsPage       │    │     InvoicesApi        │           │
│  │  (usa this.page)       │    │  (usa this.request)    │           │
│  └────────────────────────┘    └────────────────────────┘           │
│              │ compuesto por              │ compuesto por            │
│              ▼                            ▼                          │
│  Layer 4: Fixtures                                                   │
│  ┌────────────────────────┐    ┌────────────────────────┐           │
│  │      UiFixture         │    │      ApiFixture        │           │
│  │  .login, .bookings     │    │  .bookings, .invoices  │           │
│  └────────────────────────┘    └────────────────────────┘           │
│              │ combinado en               │                          │
│              └──────────┬─────────────────┘                          │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    FullTestFixture                             │  │
│  │  .ui  → UiFixture                                              │  │
│  │  .api → ApiFixture                                             │  │
│  │  .page → Acceso directo para assertions                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Detalles de Implementación

### 1. Interface TestContextOptions

El puente entre Playwright y KATA:

```typescript
// tests/components/TestContext.ts

export interface TestContextOptions {
  page?: Page;
  request?: APIRequestContext;
  environment?: Environment;
}
```

**¿Por qué opcional (`?`)?**

- Tests de API no necesitan `page`
- Scripts de setup pueden no necesitar `request`
- Flexibilidad para diferentes escenarios de test

### 2. TestContext: La Fundación

```typescript
export class TestContext {
  // Protected: accesible por subclases, no por código externo
  protected readonly _page?: Page;
  protected readonly _request?: APIRequestContext;

  // Utilidades públicas disponibles para todos los componentes
  readonly env: Environment;
  readonly config = config;
  readonly faker = faker;

  constructor(options: TestContextOptions = {}) {
    this._page = options.page;
    this._request = options.request;
    this.env = options.environment ?? env.current;
  }
}
```

**Decisiones de Diseño Clave:**

- `_page` y `_request` son **protected**: Solo las clases base los exponen via getters
- `readonly`: Inmutable después de construcción
- `options = {}`: Objeto vacío por defecto permite instanciación sin argumentos

### 3. Clases Base: Acceso Validado

```typescript
// tests/components/ui/UiBase.ts

export class UiBase extends TestContext {
  constructor(options: TestContextOptions) {
    super(options);
  }

  get page(): Page {
    if (!this._page) {
      throw new Error(
        'Page no está disponible. Asegúrate de usar el fixture `ui` ' +
          'o pasar { page } en TestContextOptions.'
      );
    }
    return this._page;
  }
}
```

```typescript
// tests/components/api/ApiBase.ts

export class ApiBase extends TestContext {
  constructor(options: TestContextOptions) {
    super(options);
  }

  get request(): APIRequestContext {
    if (!this._request) {
      throw new Error(
        'Request context no está disponible. Asegúrate de usar el fixture `api` ' +
          'o pasar { request } en TestContextOptions.'
      );
    }
    return this._request;
  }
}
```

**¿Por qué getters en lugar de acceso directo a propiedades?**

1. **Validación en runtime**: Mensajes de error claros cuando hay mala configuración
2. **Encapsulación**: Código externo no puede setear estas propiedades
3. **Narrowing de tipo**: El tipo de retorno es `Page`, no `Page | undefined`

---

## Inicialización Lazy de Fixtures de Playwright

### Cómo Funciona

De la [documentación de Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures):

> "Los fixtures se crean bajo demanda. Solo los fixtures que realmente requiere un test son creados."

Esto significa:

```typescript
// Este test NUNCA abre un navegador
test('API test', async ({ api }) => {
  // Solo `request` es inicializado, no `page`
  await api.bookings.getAll();
});

// Este test abre un navegador
test('E2E test', async ({ ui }) => {
  // Tanto `page` como `request` son inicializados
  await ui.login.authenticate(user, password);
});
```

**Impacto en Rendimiento:**

- Tests de API: ~50ms de startup (sin navegador)
- Tests de UI: ~2-5s de startup (lanzamiento del navegador)

---

## Buenas Prácticas

### HACER: Pasar Opciones a Través de Constructores

```typescript
// Componente siempre recibe opciones en constructor
export class BookingsPage extends UiBase {
  constructor(options: TestContextOptions) {
    super(options);
  }
}
```

### NO HACER: Crear Componentes Sin Contexto

```typescript
// MALO: ¿De dónde vendrá page?
const bookings = new BookingsPage();
```

### HACER: Usar el Fixture Apropiado

```typescript
// Test de API → usar fixture `api`
test('get bookings', async ({ api }) => {
  await api.bookings.getAll();
});

// Test E2E → usar fixture `ui`
test('view bookings page', async ({ ui }) => {
  await ui.bookings.navigateTo();
});

// Test híbrido → usar fixture `test`
test('create via API, verify via UI', async ({ test: fixture }) => {
  const booking = await fixture.api.bookings.create(data);
  await fixture.ui.bookings.verifyExists(booking.id);
});
```

### NO HACER: Solicitar Fixtures No Usados

```typescript
// MALO: Solicita page pero nunca lo usa
test('API only', async ({ ui }) => {
  // ui solicita page!
  await ui.request.get('/api/bookings'); // Solo usa request
});

// BUENO: Usar fixture api para tests solo API
test('API only', async ({ api }) => {
  await api.bookings.getAll();
});
```

---

## Solución de Problemas

### Error: "Page is not available"

**Causa**: Usando componente UI sin `page` en opciones.

**Solución**: Usar fixture `ui` o `test` en lugar de `api`.

### Error: "Request context is not available"

**Causa**: Usando componente API sin `request` en opciones.

**Solución**: Asegurarse de usar fixture `api`, `ui`, o `test`.

### El Navegador Se Abre para Tests de API

**Causa**: El fixture está solicitando `page` aunque el test no lo use.

**Verificar**: Tu definición de fixture en TestFixture.ts.

---

## Resumen

| Principio                     | Implementación                                   |
| ----------------------------- | ------------------------------------------------ |
| **Única fuente de verdad**    | Playwright crea drivers una vez                  |
| **Inyección por constructor** | Opciones pasadas en instanciación                |
| **Inmutabilidad**             | Propiedades `readonly`, sin setters              |
| **Acceso validado**           | Getters con chequeos en runtime                  |
| **Inicialización lazy**       | Solo los fixtures solicitados son creados        |
| **Contexto compartido**       | Mismo objeto de opciones a todos los componentes |

---

## Documentos Relacionados

| Documento           | Ubicación                                              | Propósito                                     |
| ------------------- | ------------------------------------------------------ | --------------------------------------------- |
| KATA Fundamentals   | `/docs/testing/test-architecture/kata-fundamentals.md` | Filosofía KATA y diseño de componentes        |
| KATA Architecture   | `/.context/guidelines/TAE/kata-architecture.md`        | Estructura de capas y referencia del proyecto |
| TypeScript Patterns | `/.context/guidelines/TAE/typescript-patterns.md`      | Patrones de código y principios DRY           |
| KATA AI Guide       | `/.context/guidelines/TAE/KATA-AI-GUIDE.md`            | Referencia rápida para agentes de IA          |
