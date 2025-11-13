# Prompt: Implement E2E Tests (KATA)

## Contexto
Lee:
- `e2e-test-plan.md` (creado previamente)
- `.context/guidelines/tae/kata-architecture.md`
- `.context/guidelines/tae/automation-standards.md`

## Pre-requisitos
- Fase 11.5 completada (e2e-test-plan.md)
- Playwright configurado
- KATA framework configurado

## Tu tarea

Implementar E2E tests siguiendo el plan y arquitectura KATA:

### Paso 1: Crear Components (Page Objects)

```typescript
// tests/e2e/user-management/components/loginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign in' })
  }

  async goto() {
    await this.page.goto('/login')
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  async submit() {
    await this.submitButton.click()
  }
}
```

### Paso 2: Crear Actions (User Flows)

```typescript
// tests/e2e/user-management/actions/login.ts
import { Page, expect } from '@playwright/test'
import { LoginPage } from '../components/loginPage'

export const loginAction = async (page: Page, email: string, password: string) => {
  const loginPage = new LoginPage(page)

  await loginPage.goto()
  await loginPage.fillEmail(email)
  await loginPage.fillPassword(password)
  await loginPage.submit()

  // Validar que login fue exitoso
  await expect(page).toHaveURL(/\/dashboard|\/home/)
}
```

### Paso 3: Crear Tests

```typescript
// tests/e2e/user-management/tests/userRegistration.test.ts
import { test, expect } from '@playwright/test'
import { loginAction } from '../actions/login'

test.describe('User Registration Flow', () => {
  test('should register and login successfully', async ({ page }) => {
    // Usar actions para flujo completo
    await loginAction(page, 'newuser@example.com', 'password123')

    // Validaciones
    await expect(page.getByText('Welcome')).toBeVisible()
  })

  // Más tests según el plan...
})
```

## Validación
- ✅ Tests pasan localmente
- ✅ Tests pasan en staging (CI/CD)
- ✅ Siguen estructura KATA
- ✅ Cumplen automation-standards.md
- ✅ Screenshots on failure configurados

## Output
Tests E2E implementados y funcionando en pipeline.
