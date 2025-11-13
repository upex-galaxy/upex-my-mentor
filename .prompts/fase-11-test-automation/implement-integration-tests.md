# Prompt: Implement Integration Tests (KATA)

## Contexto
Lee:
- `integration-test-plan.md` (creado previamente)
- `.context/guidelines/tae/kata-architecture.md`
- `.context/guidelines/tae/automation-standards.md`

## Pre-requisitos
- Fase 11.3 completada (integration-test-plan.md)
- KATA framework configurado (setup inicial)

## Tu tarea

Implementar integration tests siguiendo el plan y arquitectura KATA:

### Paso 1: Crear Components (API Wrappers)

```typescript
// tests/integration/api/users/components/userAPI.ts
import { apiClient } from '@/lib/apiClient'

export const userAPI = {
  create: async (userData) => {
    return await apiClient.post('/api/users', userData)
  },

  getById: async (id) => {
    return await apiClient.get(`/api/users/${id}`)
  },

  // ... más métodos
}
```

### Paso 2: Crear Actions (Business Logic)

```typescript
// tests/integration/api/users/actions/createUser.ts
import { userAPI } from '../components/userAPI'
import { expect } from '@playwright/test'

export const createUserAction = async (userData) => {
  const response = await userAPI.create(userData)

  expect(response.status).toBe(201)
  expect(response.data).toHaveProperty('id')

  return response.data
}
```

### Paso 3: Crear Tests

```typescript
// tests/integration/api/users/tests/createUser.test.ts
import { test, expect } from '@playwright/test'
import { createUserAction } from '../actions/createUser'
import { userAPI } from '../components/userAPI'

test.describe('Create User API', () => {
  test('should create user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    }

    const user = await createUserAction(userData)

    expect(user.name).toBe(userData.name)
    expect(user.email).toBe(userData.email)
  })

  // Más tests según el plan...
})
```

## Validación
- ✅ Tests pasan localmente
- ✅ Siguen estructura KATA
- ✅ Cumplen automation-standards.md
- ✅ Integrados en CI/CD

## Output
Tests de integración implementados y funcionando.
