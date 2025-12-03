# Prompt: Smoke Tests Post-Deploy

## Contexto
Tests automáticos que corren después de cada deploy a producción.

## Tu tarea
Crear smoke tests con Playwright que validen:

```typescript
// tests/smoke/production.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Production Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto(process.env.PRODUCTION_URL)
    await expect(page).toHaveTitle(/.*/)
  })

  test('API health check', async ({ request }) => {
    const response = await request.get(`${process.env.PRODUCTION_URL}/api/health`)
    expect(response.status()).toBe(200)
  })

  test('authentication works', async ({ page }) => {
    // Basic auth flow
  })
})
```

## Ejecutar en CI/CD
```yaml
# .github/workflows/smoke-tests.yml
on:
  deployment_status:

jobs:
  smoke-tests:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright test tests/smoke/
```

## Output
- Smoke tests ejecutándose post-deploy
- Alertas si fallan
