# E2E Test Automation - Coding

> **Fase**: 2 de 3 (Plan → Coding → Review)
> **Propósito**: Implementar el componente KATA y archivo de test basado en el plan aprobado.
> **Input**: Plan aprobado de la Fase 1.

---

## Carga de Contexto

**Cargar estos archivos antes de proceder:**

1. `.context/guidelines/TAE/kata-ai-index.md` → Patrones core KATA
2. `.context/guidelines/TAE/typescript-patterns.md` → Convenciones TypeScript
3. `.context/guidelines/TAE/automation-standards.md` → Reglas y estándares
4. `.context/playwright-automation-system.md` → Arquitectura de código

**Opcional (para exploración UI):**

- Usar Playwright MCP (`mcp__playwright__*`) para explorar UI y capturar locators

---

## Input Requerido

1. **Plan Aprobado** de la Fase 1 (`e2e-plan.md`)
2. **Caso de Test Original** (Gherkin de Fase 11)

---

## Flujo de Implementación

### Paso 1: Verificar Prerrequisitos

Antes de codificar, verificar:

```bash
# Verificar si existen las clases base
cat tests/components/ui/UiBase.ts

# Verificar estructura de fixture
cat tests/components/UiFixture.ts

# Verificar import aliases en tsconfig
grep -A 10 '"paths"' tsconfig.json
```

---

### Paso 2: Crear Definiciones de Tipos (si se necesitan)

Si el plan requiere nuevos tipos, agregarlos primero:

```typescript
// tests/data/types.ts

// Agregar nuevo tipo para el componente
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Tipo para parámetros del ATC
export interface CheckoutData {
  productId: string;
  quantity: number;
  shippingAddress: ShippingAddress;
}
```

---

### Paso 3: Implementar Componente UI

Crear el componente KATA siguiendo la estructura de Layer 3:

#### Template de Componente

```typescript
// tests/components/ui/{PageName}Page.ts

import type { TestContextOptions } from '@components/TestContext';
import { expect } from '@playwright/test';
import { UiBase } from '@ui/UiBase';
import { atc } from '@utils/decorators';

// ============================================================================
// DEFINICIONES DE TIPOS
// ============================================================================

export interface {TypeName} {
  email: string;
  password: string;
  // Agregar campos basados en variables del caso de test
}

// ============================================================================
// IMPLEMENTACIÓN DEL COMPONENTE
// ============================================================================

/**
 * {PageName}Page - Componente UI para {descripción del feature}
 *
 * Layer: 3 (Componente de Dominio)
 * Extiende: UiBase
 *
 * ATCs:
 * - {TEST-XXX}: {atcName}() - {descripción}
 */
export class {PageName}Page extends UiBase {
  // ==========================================================================
  // LOCATORS COMPARTIDOS (usados en 2+ ATCs)
  // ==========================================================================

  /**
   * Extraer locator SOLO si se usa en múltiples ATCs.
   * De lo contrario, mantener locators inline en métodos ATC.
   */
  private readonly submitButton = () => this.page.locator('[data-testid="submit-btn"]');

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================

  constructor(options: TestContextOptions) {
    super(options);
  }

  // ==========================================================================
  // NAVEGACIÓN
  // ==========================================================================

  /**
   * Navegar a la página.
   * Llamar ANTES de ATCs que requieren navegación.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.buildUrl('/{route}'));
    await this.page.waitForLoadState('networkidle');
  }

  // ==========================================================================
  // ATCs (Acceptance Test Cases)
  // ==========================================================================

  /**
   * {TEST-XXX}: {Descripción de lo que valida este ATC}
   *
   * Precondiciones:
   * - Llamar goto() antes de este ATC
   * - El usuario puede necesitar estar autenticado (ver archivo de test)
   *
   * Assertions Fijas:
   * - {assertion 1}
   * - {assertion 2}
   */
  @atc('{TEST-XXX}')
  async {atcName}(data: {TypeName}): Promise<void> {
    // -------------------------------------------------------------------------
    // ACCIÓN: Llenar campos del formulario
    // -------------------------------------------------------------------------
    await this.page.locator('[data-testid="email-input"]').fill(data.email);
    await this.page.locator('[data-testid="password-input"]').fill(data.password);

    // -------------------------------------------------------------------------
    // ACCIÓN: Enviar formulario
    // -------------------------------------------------------------------------
    await this.submitButton().click();

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS: Validar resultado esperado
    // -------------------------------------------------------------------------
    await expect(this.page).toHaveURL(/.*dashboard.*/);
    await expect(this.page.locator('[data-testid="welcome-message"]')).toBeVisible();
  }

  /**
   * {TEST-YYY}: Validar error cuando {condición negativa}
   *
   * Precondiciones:
   * - Llamar goto() antes de este ATC
   *
   * Assertions Fijas:
   * - Se muestra mensaje de error
   * - URL permanece en la misma página
   */
  @atc('{TEST-YYY}')
  async {atcName}WithInvalid{X}(data: {TypeName}): Promise<void> {
    // -------------------------------------------------------------------------
    // ACCIÓN: Llenar formulario con datos inválidos
    // -------------------------------------------------------------------------
    await this.page.locator('[data-testid="email-input"]').fill(data.email);
    await this.page.locator('[data-testid="password-input"]').fill(data.password);

    // -------------------------------------------------------------------------
    // ACCIÓN: Enviar formulario
    // -------------------------------------------------------------------------
    await this.submitButton().click();

    // -------------------------------------------------------------------------
    // ASSERTIONS FIJAS: Validar estado de error
    // -------------------------------------------------------------------------
    await expect(this.page.locator('[role="alert"]')).toBeVisible();
    await expect(this.page).toHaveURL(/.*login.*/); // Permanece en misma página
  }

  // ==========================================================================
  // HELPERS PRIVADOS (si se necesitan)
  // ==========================================================================

  /**
   * Helper para llenar campos comunes del formulario.
   * Usar cuando el mismo patrón de llenado se usa en múltiples ATCs.
   * NO es un método público - solo se usa internamente.
   */
  private async fillLoginForm(data: {TypeName}): Promise<void> {
    await this.page.locator('[data-testid="email-input"]').fill(data.email);
    await this.page.locator('[data-testid="password-input"]').fill(data.password);
  }
}
```

---

### Paso 4: Registrar Componente en Fixture

Agregar el nuevo componente a `UiFixture.ts`:

```typescript
// tests/components/UiFixture.ts

import type { TestContextOptions } from '@components/TestContext';
import { UiBase } from '@ui/UiBase';

// Importar componentes existentes
import { LoginPage } from '@ui/LoginPage';
// Agregar nuevo import
import { {PageName}Page } from '@ui/{PageName}Page';

export class UiFixture extends UiBase {
  // Componentes existentes
  public readonly login: LoginPage;

  // Agregar nuevo componente
  public readonly {pageName}: {PageName}Page;

  constructor(options: TestContextOptions) {
    super(options);

    // Inicializar componentes existentes
    this.login = new LoginPage(options);

    // Inicializar nuevo componente
    this.{pageName} = new {PageName}Page(options);
  }
}
```

---

### Paso 5: Implementar Archivo de Test

Crear el archivo de test siguiendo patrones KATA:

#### Template de Archivo de Test

```typescript
// tests/e2e/{feature}/{feature}.test.ts

import { expect } from '@playwright/test';
import { test } from '@TestFixture';
import type { {TypeName} } from '@ui/{PageName}Page';

// ============================================================================
// SUITE DE TESTS: {Nombre del Feature}
// ============================================================================

test.describe('{Nombre del Feature}', () => {
  // ==========================================================================
  // FÁBRICA DE DATOS DE TEST
  // ==========================================================================

  /**
   * Generar datos de test usando Faker.
   * Llamar en cada test para asegurar datos únicos.
   */
  const createValidData = (): {TypeName} => ({
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    // Usar TestContext.data.createXxx() si está disponible
  });

  const createInvalidData = (): {TypeName} => ({
    email: 'invalid-email',
    password: 'short',
  });

  // ==========================================================================
  // TESTS: Happy Path
  // ==========================================================================

  test('debería {acción} exitosamente @regression @{feature}', async ({ ui }) => {
    // -------------------------------------------------------------------------
    // ARRANGE: Preparar datos de test
    // -------------------------------------------------------------------------
    const data = createValidData();

    // -------------------------------------------------------------------------
    // ACT: Navegar y ejecutar ATC
    // -------------------------------------------------------------------------
    await ui.{pageName}.goto();
    await ui.{pageName}.{atcName}(data);

    // -------------------------------------------------------------------------
    // ASSERT: Assertions opcionales a nivel de test (más allá de assertions del ATC)
    // -------------------------------------------------------------------------
    // El ATC ya valida las assertions primarias
    // Agregar assertions específicas del test aquí si se necesitan
  });

  // ==========================================================================
  // TESTS: Edge Cases / Negativos
  // ==========================================================================

  test('debería mostrar error con {campo} inválido @regression @{feature}', async ({ ui }) => {
    // -------------------------------------------------------------------------
    // ARRANGE
    // -------------------------------------------------------------------------
    const data = createInvalidData();

    // -------------------------------------------------------------------------
    // ACT
    // -------------------------------------------------------------------------
    await ui.{pageName}.goto();
    await ui.{pageName}.{atcName}WithInvalid{X}(data);

    // -------------------------------------------------------------------------
    // ASSERT: Assertions adicionales de caso negativo
    // -------------------------------------------------------------------------
    // El ATC valida que se muestra el error
  });

  // ==========================================================================
  // TESTS: Con API Setup (Híbrido)
  // ==========================================================================

  test('debería {acción} con datos existentes @regression', async ({ test: fixture }) => {
    const { api, ui } = fixture;

    // -------------------------------------------------------------------------
    // ARRANGE: Crear datos via API (setup rápido)
    // -------------------------------------------------------------------------
    const [, createdResource] = await api.{resource}.createSuccessfully({
      // Datos del recurso
    });

    // -------------------------------------------------------------------------
    // ACT: Verificar via UI
    // -------------------------------------------------------------------------
    await ui.{pageName}.goto();
    await ui.{pageName}.view{Resource}Successfully(createdResource.id);

    // -------------------------------------------------------------------------
    // ASSERT
    // -------------------------------------------------------------------------
    // El ATC maneja las assertions
  });
});
```

---

### Paso 6: Ejecutar y Validar

Ejecutar el test para verificar la implementación:

```bash
# Ejecutar archivo de test específico
bun run test tests/e2e/{feature}/{feature}.test.ts

# Ejecutar con modo UI para debugging
bun run test:ui --grep "{nombre del test}"

# Ejecutar con trace para debugging detallado
bun run test --trace on tests/e2e/{feature}/{feature}.test.ts
```

---

## Checklist de Calidad de Código

Antes de completar la fase de Coding, verificar:

### Calidad del Componente

- [ ] Extiende `UiBase` correctamente
- [ ] Constructor acepta `TestContextOptions`
- [ ] Decorator `@atc` con Test ID correcto
- [ ] Locators son inline (a menos que se compartan en 2+ ATCs)
- [ ] Assertions fijas dentro del ATC (no solo en test)
- [ ] Sin `waitForTimeout()` - usar condiciones de espera apropiadas
- [ ] Import aliases usados (`@ui/`, `@utils/`, etc.)

### Calidad del Archivo de Test

- [ ] Importa `test` desde `@TestFixture`
- [ ] Datos de test generados frescos (no hardcodeados)
- [ ] Estructura ARRANGE-ACT-ASSERT
- [ ] Tags apropiados (`@regression`, `@smoke`, etc.)
- [ ] Cada test es independiente (sin estado compartido)
- [ ] Nombres de test descriptivos

### Seguridad de Tipos

- [ ] Todos los parámetros tienen tipos TypeScript
- [ ] Tipos de retorno especificados en métodos
- [ ] Sin tipos `any`
- [ ] Tipos exportados para uso en archivo de test

---

## Patrones Comunes de Implementación

### Esperar Respuesta de API

```typescript
// Esperar a que se complete una llamada API específica
const responsePromise = this.page.waitForResponse(
  response => response.url().includes('/api/endpoint') && response.status() === 200
);
await this.submitButton().click();
await responsePromise;
```

### Interceptar y Validar Respuesta

```typescript
// Usando helper UiBase.interceptResponse
const { responseBody, status } = await this.interceptResponse<RequestType, ResponseType>({
  urlPattern: /\/api\/endpoint/,
  action: async () => {
    await this.submitButton().click();
  },
});

expect(status).toBe(200);
expect(responseBody.success).toBe(true);
```

### Manejar Modales/Diálogos

```typescript
// Esperar modal e interactuar
await expect(this.page.locator('[data-testid="confirm-modal"]')).toBeVisible();
await this.page.locator('[data-testid="confirm-btn"]').click();
await expect(this.page.locator('[data-testid="confirm-modal"]')).not.toBeVisible();
```

### Contenido Dinámico

```typescript
// Esperar a que cargue la lista
await this.page.waitForSelector('[data-testid="item-list"] [data-testid="item"]');
const items = this.page.locator('[data-testid="item-list"] [data-testid="item"]');
await expect(items).toHaveCount(expectedCount);
```

### Formulario con Múltiples Pasos

```typescript
// Paso 1
await this.page.locator('[data-testid="step-1-field"]').fill(data.step1Value);
await this.page.locator('[data-testid="next-btn"]').click();

// Esperar paso 2
await expect(this.page.locator('[data-testid="step-2-form"]')).toBeVisible();

// Paso 2
await this.page.locator('[data-testid="step-2-field"]').fill(data.step2Value);
await this.page.locator('[data-testid="submit-btn"]').click();
```

---

## Anti-Patrones a Evitar

### ❌ Incorrecto: ATC de Interacción Simple

```typescript
// Esto NO es un ATC - es solo un click
@atc('TEST-001')
async clickSubmit() {
  await this.page.click('#submit');
}
```

### ✅ Correcto: Caso de Test Completo

```typescript
// Flujo completo con assertions
@atc('TEST-001')
async submitFormSuccessfully(data: FormData) {
  await this.page.fill('#email', data.email);
  await this.page.fill('#name', data.name);
  await this.page.click('#submit');
  await expect(this.page).toHaveURL(/.*success.*/);
}
```

### ❌ Incorrecto: Esperas Hardcodeadas

```typescript
await this.page.waitForTimeout(3000); // Nunca hacer esto
```

### ✅ Correcto: Esperas Basadas en Condiciones

```typescript
await this.page.waitForSelector('[data-loaded="true"]');
await this.page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
```

### ❌ Incorrecto: ATC Llamando a ATC

```typescript
@atc('TEST-001')
async checkoutFlow() {
  await this.loginSuccessfully(creds); // ¡Otro ATC!
  await this.addToCartSuccessfully(product); // ¡Otro ATC!
}
```

### ✅ Correcto: Usar Módulo Flows

```typescript
// En archivo de test
const flows = new CheckoutFlows(ui);
await flows.setupAuthenticatedUserWithCart(creds, product);
await ui.checkout.completeCheckoutSuccessfully();
```

---

## Checklist de Output

Después de completar la fase de Coding:

- [ ] Componente UI creado: `tests/components/ui/{PageName}Page.ts`
- [ ] Componente registrado en: `tests/components/UiFixture.ts`
- [ ] Archivo de test creado: `tests/e2e/{feature}/{feature}.test.ts`
- [ ] Tipos definidos (si nuevos): `tests/data/types.ts`
- [ ] Test pasa localmente: `bun run test <archivo-de-test>`
- [ ] Sin errores TypeScript: `bun run type-check`
- [ ] Linting pasa: `bun run lint`

---

## Siguiente Paso

Una vez que la implementación esté completa y los tests pasen:

→ **Proceder a**: `e2e-review.md` (Fase 3)
