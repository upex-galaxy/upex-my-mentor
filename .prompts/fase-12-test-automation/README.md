# Fase 12: Test Automation

## Propósito

Implementar tests automatizados para **ATCs (Acceptance Test Cases)** documentados usando el framework KATA.

**IMPORTANTE:** Esta fase viene DESPUÉS de:

- Fase 10: Exploratory Testing (feature validada)
- Fase 11: Test Documentation (ATCs documentados en Jira)

Solo automatizar funcionalidad que ha sido validada manualmente y documentada.

**Conexión IQL:** Esta fase corresponde a los **Steps 7-10 del Mid-Game Testing** - donde los ATCs se evalúan, automatizan con KATA, verifican en CI, y se aprueban vía PR.

---

## Prerequisitos

- ATCs documentados en Jira (Fase 11 completada)
- ATCs marcados como "automation-candidate" (status CANDIDATE)
- Framework KATA configurado (o usar kata-framework-setup.md)

**Trazabilidad:** Cada ATC usa el decorador `@atc('PROJECT-XXX')` para vincular código con Jira.

---

## CRÍTICO: Leer Guidelines Primero

**Antes de CUALQUIER trabajo de automatización, leer:**

```
.context/guidelines/TAE/
├── KATA-AI-GUIDE.md          # Orientación rápida
├── automation-standards.md    # Reglas y patrones
└── kata-architecture.md       # Estructura de capas
```

---

## Estructura de Esta Fase

```
.prompts/fase-12-test-automation/
├── README.md                    # Este archivo
│
├── e2e/                         # Tests End-to-End (UI)
│   ├── README.md                # Overview de E2E
│   ├── e2e-plan.md              # Fase 1: Planificación
│   ├── e2e-coding.md            # Fase 2: Implementación
│   └── e2e-review.md            # Fase 3: Code Review
│
├── integration/                 # Tests de Integración (API)
│   ├── README.md                # Overview de Integration
│   ├── integration-plan.md      # Fase 1: Planificación
│   ├── integration-coding.md    # Fase 2: Implementación
│   └── integration-review.md    # Fase 3: Code Review
│
└── regression/                  # Ejecución y Reportes
    ├── README.md                # Overview de Regression
    ├── regression-execution.md  # Fase 1: Ejecutar Suite
    ├── regression-analysis.md   # Fase 2: Analizar Resultados
    └── regression-report.md     # Fase 3: Generar Reporte GO/NO-GO
```

---

## Subfases

### E2E Testing (Tests de UI)

Automatización de tests End-to-End que interactúan con la interfaz de usuario.

| Fase | Prompt              | Propósito                                                        |
| ---- | ------------------- | ---------------------------------------------------------------- |
| 1    | `e2e/e2e-plan.md`   | Analizar ATC, identificar componentes, planificar implementación |
| 2    | `e2e/e2e-coding.md` | Implementar componente UI y archivo de test                      |
| 3    | `e2e/e2e-review.md` | Validar cumplimiento KATA y calidad de código                    |

**Ubicación de tests:** `tests/e2e/{feature}/`
**Fixture:** `{ kata }` o `{ ui }`

---

### Integration Testing (Tests de API)

Automatización de tests de integración para endpoints de API.

| Fase | Prompt                              | Propósito                                    |
| ---- | ----------------------------------- | -------------------------------------------- |
| 1    | `integration/integration-plan.md`   | Analizar endpoint, definir ATCs, planificar  |
| 2    | `integration/integration-coding.md` | Implementar componente API y archivo de test |
| 3    | `integration/integration-review.md` | Validar cumplimiento KATA y tipos de retorno |

**Ubicación de tests:** `tests/integration/{resource}/`
**Fixture:** `{ api }`

---

### Regression Testing (Ejecución y Reportes)

Ejecución sistemática de suites de tests y toma de decisiones basada en resultados.

| Fase | Prompt                               | Propósito                                |
| ---- | ------------------------------------ | ---------------------------------------- |
| 1    | `regression/regression-execution.md` | Disparar workflow y monitorear ejecución |
| 2    | `regression/regression-analysis.md`  | Analizar resultados y clasificar fallos  |
| 3    | `regression/regression-report.md`    | Generar reporte de calidad GO/NO-GO      |

**Workflows disponibles:**

- `regression.yml` - Suite completa
- `smoke.yml` - Tests críticos
- `sanity.yml` - Tests específicos

---

## Flujo de Trabajo 3-Fases

Para E2E e Integration, cada automatización sigue el flujo:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE 3 FASES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

     ATC documentado           Plan aprobado             Tests pasan
     (de Fase 11)              (contexto cargado)        (código validado)
          │                         │                         │
          ▼                         ▼                         ▼
    ┌──────────┐              ┌──────────┐              ┌──────────┐
    │  PLAN    │─────────────▶│  CODING  │─────────────▶│  REVIEW  │
    │ (Fase 1) │              │ (Fase 2) │              │ (Fase 3) │
    └──────────┘              └──────────┘              └──────────┘
         │                         │                         │
         ▼                         ▼                         ▼
    • Cargar contexto         • Crear tipos             • Verificar KATA
    • Analizar ATC            • Implementar componente  • Validar calidad
    • Identificar Layer 3     • Registrar en fixture    • Ejecutar tests
    • Planificar ATCs         • Crear archivo de test   • Aprobar/Corregir
```

---

## Arquitectura KATA Overview

```
Layer 4: Fixtures (TestFixture, ApiFixture, UiFixture)
    └── Dependency injection, extensión de tests
        ↓
Layer 3: Components (AuthApi, LoginPage)
    └── ATCs con decorador @atc('PROJECT-XXX') ← Trazabilidad Jira
        ↓
Layer 2: Base Classes (ApiBase, UiBase)
    └── HTTP helpers, Playwright helpers
        ↓
Layer 1: TestContext
    └── Configuración, generación de datos
```

**Flujo IQL completo:**

```
ATP (Fase 5) → ATCs en Jira (Fase 11) → KATA Scripts (Fase 12)
                                              ↓
                                    @atc('PROJECT-XXX')
```

---

## Principios KATA Clave

| Principio                  | Descripción                                     |
| -------------------------- | ----------------------------------------------- |
| **Unique Output**          | Cada ATC representa UN resultado esperado único |
| **Inline Locators**        | Locators definidos EN el ATC, no separados      |
| **No Unnecessary Helpers** | No wrappear acciones simples de Playwright      |
| **Fixed Assertions**       | Assertions dentro de ATCs validan éxito         |
| **Import Aliases**         | Siempre usar `@components/`, `@utils/`, etc.    |

---

## Cuándo Usar Cada Subfase

| Escenario                         | Prompts a Usar                                |
| --------------------------------- | --------------------------------------------- |
| Automatizar nuevo test E2E        | `e2e/` (Plan → Coding → Review)               |
| Automatizar nuevo test de API     | `integration/` (Plan → Coding → Review)       |
| Ejecutar regression pre-release   | `regression/` (Execution → Analysis → Report) |
| Health check rápido               | `regression/regression-execution.md` (smoke)  |
| Investigar fallos de CI           | `regression/regression-analysis.md`           |
| Generar reporte para stakeholders | `regression/regression-report.md`             |

---

## Output de Esta Fase

- ATCs implementados siguiendo estándares KATA
- Archivos de test en directorios apropiados
- Componentes registrados en fixtures
- Tests pasando en pipeline CI/CD
- ATCs de Jira marcados como "Automated"
- Reportes de regression con decisiones GO/NO-GO

**Estado IQL:** Al completar esta fase, los ATCs transitan a status AUTOMATED en Jira (Step 10 del Mid-Game).

---

## Documentación Relacionada

- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
- **Fase Anterior:** `.prompts/fase-11-test-documentation/`
- **Docs de Automation:** `docs/testing/automation/`
