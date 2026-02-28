# E2E Test Automation - Plan

> **Fase**: 1 de 3 (Plan → Coding → Review)
> **Propósito**: Analizar un caso de test documentado y crear un plan de implementación siguiendo la arquitectura KATA.
> **Output**: Plan detallado listo para la fase de Coding.

---

## Carga de Contexto

**Cargar estos archivos antes de proceder:**

1. `.context/guidelines/TAE/kata-ai-index.md` → Patrones core KATA
2. `.context/guidelines/TAE/kata-architecture.md` → Estructura de capas
3. `.context/guidelines/TAE/e2e-testing-patterns.md` → Patrones específicos E2E
4. `.context/guidelines/TAE/automation-standards.md` → Reglas y convenciones de nombres
5. `.context/playwright-automation-system.md` → Overview de arquitectura de código
6. `.context/test-management-system.md` → Configuración TMS (para formato de Test ID)

---

## Input Requerido

Proporcionar el caso de test documentado de la Fase 11 con:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INPUT REQUERIDO DE FASE 11                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Test Case ID: {TEST-XXX}                                                 │
│ 2. Nombre del Test: {Validar <CORE> <CONDITIONAL>}                          │
│ 3. Escenario Gherkin (Given/When/Then con Scenario Outline)                 │
│ 4. Tabla de Variables (con cómo obtener cada variable)                      │
│ 5. Código de Implementación (archivos fuente siendo testeados)              │
│ 6. Test IDs Disponibles (atributos data-testid)                             │
│ 7. Arquitectura (SSR / Client-side / Hybrid)                                │
│ 8. Score de Prioridad/ROI (opcional)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Planificación

### Paso 1: Análisis del Caso de Test

Extraer y documentar:

```markdown
## Análisis del Caso de Test

### Información Básica

- **Test ID**: {TEST-XXX}
- **Nombre**: {nombre del caso de test}
- **Tipo**: E2E (UI + verificación API opcional)
- **Prioridad**: {Critical/High/Medium/Low}

### Desglose Gherkin

| Paso  | Tipo         | Acción               | Esperado             |
| ----- | ------------ | -------------------- | -------------------- |
| Given | Precondición | {qué debe existir}   | {estado}             |
| When  | Acción       | {acción del usuario} | {triggers}           |
| Then  | Assertion    | {verificación}       | {resultado esperado} |

### Variables Identificadas

| Variable  | Tipo   | Cómo Obtener   | Patrón Faker                            |
| --------- | ------ | -------------- | --------------------------------------- |
| {email}   | string | Generar        | faker.internet.email()                  |
| {user_id} | UUID   | API setup / DB | api.users.createSuccessfully()          |
| {amount}  | number | Datos de test  | faker.number.float({min: 1, max: 1000}) |

### Elementos UI Necesarios

| Elemento         | Estrategia de Locator | data-testid | Fallback              |
| ---------------- | --------------------- | ----------- | --------------------- |
| Input de email   | data-testid           | email-input | input[name="email"]   |
| Botón submit     | data-testid           | submit-btn  | button[type="submit"] |
| Mensaje de error | role                  | -           | role="alert"          |
```

---

### Paso 2: Verificación de Componentes Existentes

Buscar en el codebase componentes existentes:

```bash
# Verificar componentes UI existentes
ls tests/components/ui/

# Verificar estructura de fixtures
cat tests/components/UiFixture.ts

# Buscar ATCs similares
grep -r "@atc" tests/components/ui/
```

Documentar hallazgos:

```markdown
## Análisis de Componentes Existentes

### Componentes UI Relevantes Encontrados

| Componente | Archivo                          | ATCs Disponibles                               | ¿Reutilizar?  |
| ---------- | -------------------------------- | ---------------------------------------------- | ------------- |
| LoginPage  | tests/components/ui/LoginPage.ts | loginSuccessfully, loginWithInvalidCredentials | Sí/Parcial/No |

### Componentes API Relevantes Encontrados (para setup)

| Componente | Archivo                         | ATCs Disponibles         | Usar Para  |
| ---------- | ------------------------------- | ------------------------ | ---------- |
| AuthApi    | tests/components/api/AuthApi.ts | authenticateSuccessfully | Auth setup |

### Decisión

- [ ] Crear NUEVO componente: {PageName}Page.ts
- [ ] Extender componente EXISTENTE: {existing}.ts
- [ ] Usar SOLO componentes existentes (no se necesita código nuevo)
```

---

### Paso 3: Decisión de Arquitectura

Determinar la arquitectura KATA:

```markdown
## Decisión de Arquitectura

### Ubicación del Componente

- **Layer**: 3 (Componente de Dominio)
- **Tipo**: Componente UI
- **Archivo**: `tests/components/ui/{PageName}Page.ts`
- **Extiende**: `UiBase`

### Fixture a Usar

| Opción     | Cuándo Usar                 | Seleccionado |
| ---------- | --------------------------- | ------------ |
| `{ ui }`   | Testing solo UI             | [ ]          |
| `{ test }` | API setup + verificación UI | [ ]          |

### Estrategia de Precondiciones

| Precondición        | Estrategia | Implementación                        |
| ------------------- | ---------- | ------------------------------------- |
| Usuario autenticado | API setup  | `api.auth.authenticateSuccessfully()` |
| Datos existen       | API create | `api.resource.createSuccessfully()`   |
| Navegación          | Acción UI  | `page.goto(url)`                      |

### ¿Se Necesita Módulo Flow?

- [ ] No - Test simple, sin setup reutilizable
- [ ] Sí - Crear `{Domain}Flows.ts` para setup reutilizable
```

---

### Paso 4: Diseño de ATC

Diseñar los ATCs a implementar:

````markdown
## Diseño de ATC

### ATC Principal

| Atributo       | Valor                                                    |
| -------------- | -------------------------------------------------------- |
| **Nombre**     | `{verb}{Resource}Successfully` o `{verb}With{Condition}` |
| **Test ID**    | `{TEST-XXX}`                                             |
| **Parámetros** | `(data: {TypeName}): Promise<void>`                      |
| **Retorna**    | `Promise<void>`                                          |

**Firma del Método:**

```typescript
@atc('{TEST-XXX}')
async {methodName}(data: {TypeName}): Promise<void>
```
````

**Assertions Fijas (dentro del ATC):**

1. `await expect(this.page).toHaveURL(/.*{expected-pattern}.*/)`
2. `await expect(this.page.locator('[data-testid="..."]')).toBeVisible()`
3. `await expect(this.page.locator('[data-testid="..."]')).toHaveText('{expected}')`

### Locators a Usar

| Elemento     | Locator                                            | ¿Compartido?          |
| ------------ | -------------------------------------------------- | --------------------- |
| Campo email  | `this.page.locator('[data-testid="email-input"]')` | No (inline)           |
| Botón submit | `this.submitButton()`                              | Sí (usado en 2+ ATCs) |

### Locators Compartidos (si hay)

```typescript
// Extraer a propiedad del constructor si se usa en 2+ ATCs
private readonly submitButton = () => this.page.locator('[data-testid="submit-btn"]');
```

````

---

### Paso 5: Diseño del Archivo de Test

Diseñar la estructura del archivo de test:

```markdown
## Diseño del Archivo de Test

### Ubicación del Archivo
`tests/e2e/{feature}/{feature}.test.ts`

### Estructura del Test
```typescript
import { test, expect } from '@TestFixture';
import type { {TypeName} } from '@ui/{PageName}Page';

test.describe('{Nombre del Feature}', () => {
  test('{descripción del test} @{tag1} @{tag2}', async ({ ui }) => {
    // ARRANGE
    const data: {TypeName} = {
      // Datos de test via Faker o fixtures
    };

    // ACT
    await ui.{component}.{atcMethod}(data);

    // ASSERT (opcional - assertions a nivel de test más allá del ATC)
    // await expect(...).toBe(...);
  });
});
````

### Tags a Aplicar

- [ ] `@regression` - Incluir en suite de regresión
- [ ] `@smoke` - Incluir en smoke tests
- [ ] `@critical` - Test de alta prioridad
- [ ] `@{feature}` - Tag específico del feature

````

---

### Paso 6: Registro en Fixture

Planificar el registro del componente:

```markdown
## Registro en Fixture

### Registro de Nuevo Componente
Si se crea un nuevo componente, agregar a `UiFixture.ts`:

```typescript
// Import
import { {PageName}Page } from '@ui/{PageName}Page';

// En constructor
this.{pageName} = new {PageName}Page(options);

// Agregar propiedad
public readonly {pageName}: {PageName}Page;
````

### Export de Tipos

Exportar tipos del componente para uso en tests:

```typescript
// En {PageName}Page.ts
export interface {TypeName} {
  // ...campos
}

// O re-exportar desde archivo de tipos
export type { {TypeName} } from '@data/types';
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
| Componente | {PageName}Page.ts |
| Acción | CREAR / EXTENDER / REUTILIZAR |
| Nombre del ATC | {methodName} |
| Archivo de Test | tests/e2e/{feature}/{feature}.test.ts |
| Fixture | { ui } / { test } |

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `tests/components/ui/{PageName}Page.ts` | CREAR | Nuevo componente UI |
| `tests/components/UiFixture.ts` | MODIFICAR | Registrar componente |
| `tests/e2e/{feature}/{feature}.test.ts` | CREAR | Archivo de test |
| `tests/data/types.ts` | MODIFICAR | Agregar definiciones de tipos |

## Plan de Implementación del ATC

### {methodName}
- **Decorator**: `@atc('{TEST-XXX}')`
- **Parámetros**: `data: {TypeName}`
- **Pasos**:
  1. Navegar a {url}
  2. Llenar {campo} con `data.{propiedad}`
  3. Click en {botón}
  4. Verificar {resultado esperado}
- **Assertions**:
  - `expect(page).toHaveURL(...)`
  - `expect(element).toBeVisible()`

## Estrategia de Datos de Test

| Variable | Fuente | Patrón |
|----------|--------|--------|
| {var1} | Faker | `faker.{method}()` |
| {var2} | API Setup | `api.{component}.{method}()` |

## Precondiciones

| Precondición | Método |
|--------------|--------|
| Usuario logueado | `ui.login.loginSuccessfully(credentials)` O storageState |
| Datos existen | `api.{resource}.createSuccessfully(data)` |

## Dependencias

- [ ] Componente existente: {nombre}
- [ ] Componente API para setup: {nombre}
- [ ] Módulo flow: {nombre} (si aplica)

---

**Listo para Fase 2: Coding**
````

---

## Checklist de Validación

Antes de proceder a la fase de Coding, verificar:

- [ ] Caso de test completamente analizado (desglose Gherkin completo)
- [ ] Variables mapeadas a patrones Faker o métodos de setup
- [ ] Componentes existentes verificados (sin trabajo duplicado)
- [ ] Decisión de arquitectura tomada (componente, fixture, layer)
- [ ] ATC diseñado con convención de nombres apropiada
- [ ] Assertions definidas (qué valida el ATC)
- [ ] Estrategia de locators determinada (data-testid preferido)
- [ ] Ubicación del archivo de test determinada
- [ ] Registro en fixture planificado
- [ ] Estrategia de precondiciones definida (API setup vs UI flow)

---

## Patrones Comunes

### Convenciones de Nombres

| Escenario      | Patrón de Nombre del ATC       | Ejemplo                         |
| -------------- | ------------------------------ | ------------------------------- |
| Caso exitoso   | `{verb}{Resource}Successfully` | `loginSuccessfully()`           |
| Input inválido | `{verb}With{Invalid}{X}`       | `loginWithInvalidCredentials()` |
| Estado vacío   | `view{Resource}EmptyState`     | `viewBookingsEmptyState()`      |
| No encontrado  | `{verb}WithNonExistent{X}`     | `getBookingWithNonExistentId()` |

### Prioridad de Locators

1. `data-testid` (preferido)
2. `role` + nombre accesible
3. `aria-label`
4. Selector CSS (último recurso)

### Tipos de Assertions

| Qué Verificar         | Método Playwright                    |
| --------------------- | ------------------------------------ |
| URL cambió            | `expect(page).toHaveURL(/pattern/)`  |
| Elemento visible      | `expect(locator).toBeVisible()`      |
| Contenido de texto    | `expect(locator).toHaveText('...')`  |
| Cantidad de elementos | `expect(locator).toHaveCount(n)`     |
| Valor de input        | `expect(locator).toHaveValue('...')` |

---

## Siguiente Paso

Una vez que el plan esté completo y validado:

→ **Proceder a**: `e2e-coding.md` (Fase 2)
