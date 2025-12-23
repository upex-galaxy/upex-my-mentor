# Data-TestID Usage Guidelines

> **Para**: Test Automation Engineers
> **Fase**: 12 (Test Automation)
> **Propósito**: Cómo USAR data-testid en Playwright tests

---

## Propósito

Este documento explica cómo utilizar los `data-testid` existentes en la aplicación para automatización de pruebas con Playwright.

**Nota**: Para cómo CREAR data-testid, ver `../DEV/data-testid-standards.md`.

---

## Prioridad de Locators

En Playwright, seguir esta prioridad al seleccionar elementos:

| Prioridad | Locator       | Cuándo usar                           |
| --------- | ------------- | ------------------------------------- |
| **1**     | `data-testid` | Siempre preferido                     |
| **2**     | `getByRole`   | Elementos semánticos (buttons, links) |
| **3**     | `getByLabel`  | Inputs con label asociado             |
| **4**     | `getByText`   | Contenido visible único               |
| **5**     | CSS/XPath     | Último recurso                        |

**Regla**: Si existe `data-testid`, úsalo. Es el locator más estable y resistente a cambios de UI.

---

## Sintaxis en Playwright

### Selector Básico

```typescript
// ✅ Correcto - Usar getByTestId
const loginButton = page.getByTestId('login-submit-button');

// ✅ También válido - locator con CSS
const loginButton = page.locator('[data-testid="login-submit-button"]');

// ❌ Incorrecto - Usar clase CSS (frágil)
const loginButton = page.locator('.btn-primary');
```

### Dentro de Componentes KATA

```typescript
// En un Page Object o Komponent
export class LoginKomponent {
  readonly page: Page;

  // Locators definidos como propiedades
  readonly emailInput = () => this.page.getByTestId('login-email-input');
  readonly passwordInput = () => this.page.getByTestId('login-password-input');
  readonly submitButton = () => this.page.getByTestId('login-submit-button');
  readonly errorMessage = () => this.page.getByTestId('login-error-message');

  constructor(page: Page) {
    this.page = page;
  }

  // Action que usa los locators
  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }
}
```

---

## Patrones Comunes

### 1. Listas de Elementos

Cuando hay múltiples elementos con el mismo patrón:

```typescript
// En el DOM:
// <div data-testid="product-card">...</div>
// <div data-testid="product-card">...</div>
// <div data-testid="product-card">...</div>

// Obtener todos
const allCards = page.getByTestId('product-card');
const count = await allCards.count();

// Obtener por índice
const firstCard = allCards.nth(0);
const lastCard = allCards.last();

// Iterar
for (const card of await allCards.all()) {
  // hacer algo con cada card
}
```

### 2. Elementos con ID Dinámico

```typescript
// En el DOM:
// <button data-testid="edit-product-123">Edit</button>
// <button data-testid="edit-product-456">Edit</button>

// Selector exacto
const editButton = page.getByTestId('edit-product-123');

// Selector con regex (si el ID es variable)
const editButton = page.locator('[data-testid^="edit-product-"]').first();
```

### 3. Estados de Elementos

```typescript
// Loading state
const loadingSpinner = page.getByTestId('products-loading');
await expect(loadingSpinner).toBeVisible();

// Empty state
const emptyState = page.getByTestId('products-empty-state');
await expect(emptyState).toContainText('No products found');

// Error state
const errorState = page.getByTestId('products-error-state');
await expect(errorState).toBeVisible();
```

### 4. Formularios

```typescript
// Campos
const nameInput = page.getByTestId('form-name-input');
const emailInput = page.getByTestId('form-email-input');

// Validación de errores
const nameError = page.getByTestId('form-name-error');
await expect(nameError).toHaveText('Name is required');

// Submit
const submitButton = page.getByTestId('form-submit-button');
```

---

## Cuando Falta data-testid

### Paso 1: Verificar si Existe

Usar DevTools del navegador:

```javascript
// En Console del navegador
document.querySelectorAll('[data-testid]');
```

### Paso 2: Reportar al Equipo DEV

Si falta un `data-testid` necesario:

1. **Crear issue en Jira** con:
   - Componente afectado
   - Página/ruta donde está
   - Elemento que necesita testid
   - Sugerencia de nombre siguiendo `data-testid-standards.md`

2. **Formato de solicitud**:

```markdown
## Solicitud de data-testid

**Componente:** LoginForm
**Ruta:** /auth/login
**Elemento:** Botón de submit del formulario

**data-testid sugerido:** `login-submit-button`

**Razón:** Necesario para automatizar test de login E2E
```

### Paso 3: Workaround Temporal

Si urgente y no puede esperar:

```typescript
// ⚠️ TEMPORAL - Usar fallback menos estable
const submitButton = page.getByRole('button', { name: 'Login' });

// Agregar comentario para futuro refactor
// TODO: Cambiar a getByTestId('login-submit-button') cuando DEV agregue el testid
```

---

## Anti-Patterns

### NO Hacer

```typescript
// ❌ Selectores basados en clases CSS
page.locator('.btn-primary');

// ❌ Selectores basados en estructura DOM
page.locator('div > form > button:last-child');

// ❌ Selectores por texto que cambia
page.getByText('Iniciar Sesión'); // puede cambiar a 'Login'

// ❌ Hardcodear índices sin razón
page.locator('[data-testid="card"]').nth(2); // ¿por qué el tercero?

// ❌ Mezclar selectores CSS con data-testid
page.locator('.container [data-testid="button"]');
```

### SÍ Hacer

```typescript
// ✅ Usar data-testid directo
page.getByTestId('login-submit-button');

// ✅ Usar getByRole para elementos semánticos sin testid
page.getByRole('button', { name: /submit/i });

// ✅ Encadenar con filter cuando necesario
page.getByTestId('product-card').filter({ hasText: 'iPhone' });

// ✅ Usar locator descriptivo
const specificCard = page.getByTestId('product-card-iphone-15');
```

---

## Integración con KATA

### En Komponents

Los Komponents encapsulan locators:

```typescript
// components/LoginKomponent.ts
import { Locator, Page } from '@playwright/test';

export class LoginKomponent {
  private readonly page: Page;

  // Locators como propiedades privadas
  private readonly _emailInput: Locator;
  private readonly _passwordInput: Locator;
  private readonly _submitButton: Locator;
  private readonly _errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this._emailInput = page.getByTestId('login-email-input');
    this._passwordInput = page.getByTestId('login-password-input');
    this._submitButton = page.getByTestId('login-submit-button');
    this._errorMessage = page.getByTestId('login-error-message');
  }

  // Actions expuestas públicamente
  async fillEmail(email: string) {
    await this._emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this._passwordInput.fill(password);
  }

  async submit() {
    await this._submitButton.click();
  }

  async getErrorText(): Promise<string> {
    return this._errorMessage.textContent() ?? '';
  }
}
```

### En Tests

Los tests usan Komponents, no locators directos:

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginKomponent } from '../components/LoginKomponent';

test('login with valid credentials', async ({ page }) => {
  await page.goto('/login');

  const login = new LoginKomponent(page);

  await login.fillEmail('user@example.com');
  await login.fillPassword('Password123!');
  await login.submit();

  await expect(page).toHaveURL('/dashboard');
});
```

---

## Debugging

### Encontrar Elementos por data-testid

```bash
# En Playwright Inspector (UI Mode)
npx playwright test --ui

# En Debug Mode
npx playwright test --debug
```

### Listar Todos los data-testid en una Página

```typescript
// Script de utilidad
test('list all testids', async ({ page }) => {
  await page.goto('/login');

  const testIds = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid]');
    return Array.from(elements).map(el => ({
      testId: el.getAttribute('data-testid'),
      tagName: el.tagName,
      text: el.textContent?.slice(0, 50),
    }));
  });

  console.table(testIds);
});
```

---

## Ver También

- `../DEV/data-testid-standards.md` - Cómo DEV crea los data-testid
- `./automation-standards.md` - Estándares generales de automatización
- `./kata-framework.md` - Arquitectura KATA
- `../MCP/playwright.md` - Uso de Playwright MCP

---

**Última actualización**: 2025-12-21
