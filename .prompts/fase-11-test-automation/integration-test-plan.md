# Prompt: Plan de Integration Tests (basado en KATA)

## Contexto
Lee:
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/story.md`
- `.context/PBI/epics/EPIC-XXX/stories/STORY-XXX/test-cases.md` (Fase 5)
- `.context/guidelines/tae/kata-architecture.md`

## Tu tarea

Crear plan de integration tests siguiendo arquitectura KATA:

### 1. Identificar endpoints a testear
Basarte en test-cases.md de la story.
Listar todos los requests API involucrados.

### 2. Diseñar tests según KATA

```typescript
// Estructura KATA para integration tests
tests/
└── integration/
    └── api/
        └── users/
            ├── components/      // Componentes reutilizables
            │   └── userAPI.ts   // Wrapper del API
            ├── actions/         // Acciones de negocio
            │   └── createUser.ts
            └── tests/           // Tests concretos
                └── createUser.test.ts
```

### 3. Especificar cada test

Para cada test case:

```markdown
#### Test: [Nombre del test]

**Given:** [Precondiciones]
**When:** [Acción]
**Then:** [Validaciones]

**KATA Structure:**
- Component: [userAPI.ts]
- Action: [createUser.ts]
- Test: [createUser.test.ts]
```

## Output
Plan markdown con estructura KATA y lista de tests a implementar.
