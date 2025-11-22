# Prompt: Plan de E2E Tests (basado en KATA)

## Contexto
Lee:
- `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/story.md`
- `.context/PBI/epics/EPIC-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/stories/STORY-{PROJECT_KEY}-{ISSUE_NUM}-{nombre}/test-cases.md`
- Resultados de exploratory testing (Fase 10)
- `.context/guidelines/tae/kata-architecture.md`

## Tu tarea

Crear plan de E2E tests siguiendo arquitectura KATA:

### 1. Identificar flujos a automatizar
- Basarte en exploratory findings
- Priorizar happy paths y casos críticos

### 2. Diseñar tests según KATA

```typescript
// Estructura KATA para E2E tests
tests/
└── e2e/
    └── user-management/
        ├── components/      // Page Objects (componentes UI)
        │   ├── loginPage.ts
        │   └── dashboardPage.ts
        ├── actions/         // Flujos de usuario
        │   ├── login.ts
        │   └── createProfile.ts
        └── tests/           // Tests concretos
            └── userRegistration.test.ts
```

### 3. Especificar cada test

```markdown
#### E2E Test: [Nombre del test]

**Scenario:** [Descripción del flujo]

**Steps (usando actions):**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Expected results:**
- [ ] [Validación 1]
- [ ] [Validación 2]

**KATA Structure:**
- Components: [loginPage, dashboardPage]
- Actions: [login, createProfile]
- Test: [userRegistration.test.ts]
```

## Output
Plan markdown con estructura KATA y lista de tests E2E a implementar.
